/**
 * Optional modeled-teammate submodule (toggleable).
 *
 * The host Agent Teams tool `spawn_teammate` creates a child through
 * `ctx.agentTeams.spawnTeammate`, which calls `ctx.subagents.startActivation`
 * without per-child `agentOptions`; the child therefore inherits the Lead's
 * provider/model/reasoning effort.
 *
 * This module adds `spawn_teammate_with_model` and, only for the duration of
 * that tool's team spawn, injects `request.agentOptions` into
 * `subagents.startActivation`. AsyncLocalStorage scopes the override to the
 * calling Lead's spawn, so other team/subagent activations pass through
 * unchanged. The official agent-team package is not modified.
 *
 * Route lookup reads the settings file itself (`plugin/settings-file.js`) and
 * only falls back to the in-process store the host settings plugin fills. The
 * store alone used to be the single source, so any boot where it was still
 * empty made every teammate silently inherit the Lead route.
 *
 * This is an internal-service wrapper and deliberately opt-in
 * (`config.enabled === true`). If a DSH upgrade changes the activation shape,
 * the tool reports a clear error and the rest of the preset keeps working.
 */

import { AsyncLocalStorage } from 'node:async_hooks'
import { ROLE_NAMES, matchRoleName, modelForRole } from './settings-store.js'
import { readRouteTable } from './settings-file.js'

export const name = 'research-modeled-teammates'

export const inject = ['tools', 'subagents', 'agentTeams', 'agents']

const modeledSpawn = new AsyncLocalStorage()
const patches = new WeakMap()

/** Roles whose teammate session runs read-only unless the Lead asks otherwise. */
const READ_ONLY_ROLES = new Set(['advisor', 'reviewer'])

/** Tools that can change project files; consulted only when the sandbox override is missing. */
const FILE_WRITE_TOOLS = new Set([
  'write', 'edit', 'ops_write_file', 'ops_edit_file', 'ops_replace', 'ops_copy', 'ops_move', 'ops_remove',
  'bash', 'ops_bash', 'pwsh', 'terminal_send', 'research_workspace_init'
])

/** Resolve the permission a spawn should enforce. */
function permissionFor(role, requested) {
  if (requested === 'read-only' || requested === 'workspace-write') return requested
  return role !== undefined && READ_ONLY_ROLES.has(role) ? 'read-only' : 'workspace-write'
}

function defaultModeOf(ctx) {
  try {
    const mode = ctx.sandboxPolicy?.defaultMode
    return typeof mode === 'string' ? mode : undefined
  } catch {
    return undefined
  }
}

function overrideModeOf(ctx, session) {
  try {
    const mode = ctx.sandboxPolicy?.overrideOf?.(session)
    return typeof mode === 'string' ? mode : undefined
  } catch {
    return undefined
  }
}

/**
 * Record a sandbox mode on one child session. The session log is the store —
 * `sandbox/mode` is the documented write path — so the mode survives a restart
 * and applies to every confined call the child makes afterwards. The child may
 * still be provisioning when the spawn returns, so resolve it with a bounded
 * poll instead of assuming it is already registered.
 */
async function applySandboxMode(ctx, sessionId, mode, signal) {
  if (typeof sessionId !== 'string' || sessionId === '') {
    return { applied: false, mode, reason: 'the spawn result carried no child session id' }
  }
  let get
  try {
    get = ctx.agents?.get
  } catch {
    get = undefined
  }
  if (typeof get !== 'function') return { applied: false, mode, reason: 'the agents service is unavailable' }
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (signal !== undefined && signal.aborted === true) return { applied: false, mode, reason: 'the spawn was aborted' }
    let child
    try {
      child = get.call(ctx.agents, sessionId)
    } catch {
      child = undefined
    }
    const session = child === null || child === undefined ? undefined : child.session
    if (session !== undefined && typeof session.append === 'function') {
      try {
        if (overrideModeOf(ctx, session) === mode) return { applied: true, mode, already: true }
        session.append('sandbox/mode', { mode })
        return { applied: true, mode }
      } catch (error) {
        return { applied: false, mode, reason: messageFrom(error) }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  return { applied: false, mode, reason: `child session ${sessionId} was not resolvable in time` }
}

/**
 * Apply the requested permission to a freshly spawned child. The deployment
 * default needs no event; any other mode is recorded on the child's session.
 * When that record cannot be written for a read-only teammate, the tools guard
 * still refuses its file-writing tools, so the envelope holds either way.
 */
async function applyPermission(ctx, sessionId, mode, signal, readOnlySessions) {
  if (mode === 'read-only' && typeof sessionId === 'string') readOnlySessions.add(sessionId)
  const resolved = defaultModeOf(ctx)
  if (resolved !== undefined && resolved === mode) return { mode, applied: true, already: true }
  const result = await applySandboxMode(ctx, sessionId, mode, signal)
  if (mode === 'read-only' && result.applied === false) return { ...result, enforcedBy: 'tool-guard' }
  return result
}

function messageFrom(error) {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Wrap one subagent service's startActivation. The wrapper reads the
 * AsyncLocalStorage store and injects agentOptions only into the
 * `delivery: "parent"` activation whose parent is the calling Lead.
 */
function patchStartActivation(service) {
  if (service === undefined || typeof service.startActivation !== 'function') {
    throw new Error('subagents.startActivation is not available')
  }
  const existing = patches.get(service)
  if (existing !== undefined) return existing

  const original = service.startActivation
  const wrapped = function (spec) {
    const store = modeledSpawn.getStore()
    if (store !== undefined && spec !== null && typeof spec === 'object' && spec.delivery === 'parent') {
      const parent = spec.request === undefined ? undefined : spec.request.parent
      const sameParent = parent === store.caller ||
        (parent !== undefined && store.caller !== undefined && parent.id !== undefined && parent.id === store.caller.id)
      if (sameParent) {
        return original.call(this, {
          ...spec,
          request: {
            ...spec.request,
            agentOptions: {
              ...(spec.request.agentOptions === undefined ? {} : spec.request.agentOptions),
              ...store.agentOptions
            }
          }
        })
      }
    }
    return original.apply(this, arguments)
  }

  const hadOwn = Object.prototype.hasOwnProperty.call(service, 'startActivation')

  // Cordis wraps every Service instance in a traceable proxy (the Service
  // constructor stamps a tracker symbol), and reading a function property
  // returns a fresh shadow-method proxy every time. An identity check such as
  // `service.startActivation === wrapped` therefore can never pass. Assign
  // through the proxy (its `set` forwards onto the real instance) and verify
  // the own data descriptor instead, which is stable.
  const install = (holder) => {
    try {
      holder.startActivation = wrapped
    } catch {
      return false
    }
    const descriptor = Object.getOwnPropertyDescriptor(holder, 'startActivation')
    return descriptor !== undefined && descriptor.value === wrapped
  }

  let target = service
  if (!install(service)) {
    const proto = Object.getPrototypeOf(service)
    const protoMethod = proto === null ? undefined : proto.startActivation
    if (typeof protoMethod !== 'function') {
      throw new Error('subagents.startActivation is not writable')
    }
    if (!install(proto)) {
      throw new Error('subagents.startActivation patch did not take effect (the service method may be shadowed or non-writable)')
    }
    target = proto
  }

  const restore = () => {
    if (patches.get(service) !== restore) return
    patches.delete(service)
    if (target === service) {
      if (hadOwn) service.startActivation = original
      else delete service.startActivation
    } else if (Object.getOwnPropertyDescriptor(target, 'startActivation')?.value === wrapped) {
      target.startActivation = original
    }
  }
  patches.set(service, restore)
  return restore
}

function readModel(args) {
  const model = args === null || args === undefined ? undefined : args.model
  if (model === null || typeof model !== 'object' || Array.isArray(model)) {
    throw new Error('model must be an object: { provider, model, reasoningEffort? }')
  }
  const provider = typeof model.provider === 'string' ? model.provider.trim() : ''
  const id = typeof model.model === 'string' ? model.model.trim() : ''
  if (provider === '' || id === '') {
    throw new Error('model.provider and model.model are required')
  }
  const out = { provider, model: id }
  if (model.reasoningEffort !== undefined) {
    if (typeof model.reasoningEffort !== 'string' || model.reasoningEffort.trim() === '') {
      throw new Error('model.reasoningEffort must be a non-empty string when provided')
    }
    out.reasoningEffort = model.reasoningEffort.trim()
  }
  return out
}

/** Drop the bookkeeping `role` field before a route becomes spawn options. */
function spawnOptions(route) {
  const options = { provider: route.provider, model: route.model }
  if (route.reasoningEffort !== undefined) options.reasoningEffort = route.reasoningEffort
  return options
}

/**
 * Resolve the configured route for a teammate name: the in-process store
 * first (it is current after a settings-page save), then the settings file
 * itself. A name that matches no standard role, or a role with no configured
 * provider/model, yields no route plus a diagnostic that the spawn result
 * carries, so an inheritance is never silent.
 */
function resolveConfiguredRoute(name) {
  const role = matchRoleName(name)
  if (role === undefined) {
    return {
      role: undefined,
      diagnostics: [
        `"${name}" is not one of the standard roles (${ROLE_NAMES.join(', ')}), so it inherits the Lead route.`
      ]
    }
  }
  const fromStore = modelForRole(role)
  if (fromStore !== undefined) {
    return { role, route: spawnOptions(fromStore), source: 'store' }
  }
  const table = readRouteTable()
  const route = table.routes[role]
  if (route !== undefined) {
    return { role, route: spawnOptions(route), source: 'file' }
  }
  const profile = table.profile === undefined ? 'the active profile' : `profile "${table.profile}"`
  const reason = table.error === undefined
    ? `no route configured for role "${role}" in ${profile}`
    : table.error
  return {
    role,
    diagnostics: [
      `${reason}; the teammate inherits the Lead route. Configure the role in Plugins → Research Team settings, or pass model.`
    ]
  }
}

function describeRequested(requested) {
  if (requested === undefined) return 'requested=inherit (Lead route)'
  const effort = requested.reasoningEffort === undefined ? '' : ` effort=${requested.reasoningEffort}`
  return `requested=${requested.provider}/${requested.model}${effort}`
}

function render(value) {
  const member = value === null || value === undefined ? undefined : value.member
  if (member === null || member === undefined || typeof member !== 'object') {
    return [{ type: 'text', text: 'Teammate creation returned no roster row.' }]
  }
  const head = [`Created teammate "${String(member.name)}"`]
  if (member.status !== undefined) head.push(`status=${String(member.status)}`)
  if (member.model !== undefined) head.push(`model=${String(member.model)}`)
  const parts = [head.join(' '), describeRequested(value.requestedModel)]
  if (typeof value.role === 'string') parts.push(`role=${value.role}`)
  if (typeof value.routeSource === 'string' && value.routeSource !== 'explicit') {
    parts.push(`route-source=${value.routeSource}`)
  }
  if (value.warning !== undefined) parts.push(`WARNING: ${String(value.warning)}`)
  if (Array.isArray(value.diagnostics) && value.diagnostics.length > 0) {
    for (const note of value.diagnostics) parts.push(`note: ${String(note)}`)
  }
  return [{ type: 'text', text: parts.join('\n') }]
}

function renderRoutes(value) {
  const lines = []
  if (value === null || typeof value !== 'object') {
    return [{ type: 'text', text: 'No Research Team model routes are configured.' }]
  }
  const profile = value.profile === undefined ? 'unknown profile' : `profile "${String(value.profile)}"`
  lines.push(`Research Team model routes (${profile})`)
  if (value.file !== undefined) lines.push(`settings file: ${String(value.file)}`)
  const routes = value.routes !== null && typeof value.routes === 'object' ? value.routes : {}
  for (const role of ROLE_NAMES) {
    const route = routes[role]
    if (route === undefined) {
      lines.push(`${role}: inherit (Lead route)`)
      continue
    }
    const effort = route.reasoningEffort === undefined ? '' : ` effort=${String(route.reasoningEffort)}`
    lines.push(`${role}: ${String(route.provider)}/${String(route.model)}${effort}`)
  }
  if (typeof value.error === 'string') lines.push(`note: ${value.error}`)
  return [{ type: 'text', text: lines.join('\n') }]
}

export function apply(ctx, config = {}) {
  if (config.enabled !== true) return () => {}

  const freshProvider = typeof config.freshProvider === 'string' && config.freshProvider !== ''
    ? config.freshProvider
    : 'spawn'
  const forkProvider = typeof config.forkProvider === 'string' && config.forkProvider !== ''
    ? config.forkProvider
    : 'fork'

  let disposePatch = () => {}
  let patchError
  try {
    disposePatch = patchStartActivation(ctx.subagents)
  } catch (error) {
    patchError = messageFrom(error)
    ctx.logger?.warn?.(`research-modeled-teammates: ${patchError}`)
  }

  // Make the boot-time state visible in the log: a session opened before the
  // settings page was ever saved used to inherit every role silently.
  try {
    const table = readRouteTable()
    const configured = Object.keys(table.routes)
    const profile = table.profile === undefined ? 'no profile' : `profile "${table.profile}"`
    ctx.logger?.info?.(
      `research-modeled-teammates: ${configured.length}/${ROLE_NAMES.length} role routes resolved (${profile})` +
      (configured.length > 0 ? `: ${configured.join(', ')}` : '') +
      (table.error === undefined ? '' : `; ${table.error}`)
    )
  } catch (error) {
    ctx.logger?.warn?.(`research-modeled-teammates: route self-check failed: ${messageFrom(error)}`)
  }

  // Belt to the sandbox-mode braces: if a read-only session's `sandbox/mode`
  // event could not be written (or a host build ignores it), refuse the file
  // writing tools for that session instead of leaving the envelope advisory.
  const readOnlySessions = new Set()
  const disposeGuard = typeof ctx.tools.guard === 'function'
    ? ctx.tools.guard((execution) => {
        const session = execution === null || execution === undefined || execution.agent === undefined
          ? undefined
          : execution.agent.session
        if (session === undefined || typeof session.id !== 'string' || !readOnlySessions.has(session.id)) return undefined
        if (typeof execution.name !== 'string' || !FILE_WRITE_TOOLS.has(execution.name)) return undefined
        if (overrideModeOf(ctx, session) === 'read-only') return undefined
        return `this teammate is read-only: "${execution.name}" cannot modify files. Report what needs to change instead of retrying with another write tool.`
      })
    : () => {}

  const disposeRoutesTool = ctx.tools.register({
    name: 'research_team_routes',
    description:
      'Read the per-role default provider/model configured for the Research Team in the Plugins page. Read-only. Call it before spawning teammates when you need to know which route a role will get, instead of guessing provider or model names.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render(_args, value) {
        return renderRoutes(value)
      }
    },
    async execute() {
      const table = readRouteTable()
      return {
        profile: table.profile,
        activeProfileId: table.activeProfileId,
        file: table.file,
        routes: table.routes,
        ...(table.error === undefined ? {} : { error: table.error })
      }
    }
  })

  const disposeTool = ctx.tools.register({
    name: 'spawn_teammate_with_model',
    description:
      'Create one named, durable teammate on the route configured for its role in the Plugins page (Omit model to use that configured default; this is not the same as spawn_teammate). Pass model {provider, model, reasoningEffort} to override. If the role has no configured route, the teammate inherits the Lead route and the result says so in diagnostics. The advisor and reviewer roles spawn read-only; pass permission to override.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Unique lower-kebab-case teammate name; include the role, e.g. "advisor" or "ELHA-R advisor".' },
        description: { type: 'string', description: 'Short description of the delegated responsibility.' },
        prompt: { type: 'string', description: 'Complete initial task for the teammate.' },
        context: { type: 'string', enum: ['fresh', 'fork'], description: 'Start mode; defaults to fresh.' },
        model: {
          type: 'object',
          description: 'Optional route override: { provider, model, reasoningEffort? }.',
          properties: {
            provider: { type: 'string' },
            model: { type: 'string' },
            reasoningEffort: { type: 'string' }
          },
          required: ['provider', 'model'],
          additionalProperties: false
        },
        permission: {
          type: 'string',
          enum: ['read-only', 'workspace-write'],
          description: 'Sandbox permission for the teammate session. Defaults to read-only for the advisor and reviewer roles and workspace-write for every other role; pass a value only to override that default.'
        }
      },
      required: ['name', 'description', 'prompt'],
      additionalProperties: false
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render(_args, value) {
        return render(value)
      }
    },
    async execute(args, exec) {
      if (patchError !== undefined) {
        throw new Error(`spawn_teammate_with_model is unavailable: ${patchError}`)
      }
      const agent = exec === null || exec === undefined ? undefined : exec.agent
      if (agent === undefined) {
        throw new Error('spawn_teammate_with_model requires a calling agent')
      }
      const context = args.context === 'fork' ? 'fork' : 'fresh'
      const explicit = args.model === undefined ? undefined : readModel(args)
      const resolved = explicit === undefined
        ? resolveConfiguredRoute(args.name)
        : { role: matchRoleName(args.name), route: explicit, source: 'explicit' }
      const requestedModel = resolved.route
      const provider = context === 'fork' ? forkProvider : freshProvider
      const signal = exec.signal === undefined ? new AbortController().signal : exec.signal
      const spawn = () =>
        ctx.agentTeams.spawnTeammate(agent, {
          name: args.name,
          description: args.description,
          prompt: [{ type: 'text', text: args.prompt }],
          context,
          provider,
          signal
        })
      const member = requestedModel === undefined
        ? await spawn()
        : await modeledSpawn.run({ caller: agent, agentOptions: requestedModel }, spawn)
      const view = member !== null && typeof member === 'object' && member.member !== undefined ? member.member : member
      const sessionId = view !== null && typeof view === 'object' && typeof view.id === 'string' ? view.id : undefined
      const permission = permissionFor(resolved.role, args.permission)
      const permissionResult = await applyPermission(ctx, sessionId, permission, signal, readOnlySessions)
      let warning
      if (requestedModel !== undefined && typeof member?.model === 'string' && member.model !== requestedModel.model) {
        warning = `requested model ${requestedModel.model} but roster reports ${member.model}; the activation patch may be incompatible with this DSH build.`
      }
      return {
        member,
        ...(sessionId === undefined ? {} : { sessionId }),
        permission: permissionResult,
        ...(requestedModel === undefined ? {} : { requestedModel }),
        ...(resolved.role === undefined ? {} : { role: resolved.role }),
        ...(resolved.source === undefined ? {} : { routeSource: resolved.source }),
        ...(resolved.diagnostics === undefined ? {} : { diagnostics: resolved.diagnostics }),
        ...(warning === undefined ? {} : { warning })
      }
    }
  })

  return () => {
    disposeGuard()
    readOnlySessions.clear()
    disposeTool()
    disposeRoutesTool()
    disposePatch()
  }
}
