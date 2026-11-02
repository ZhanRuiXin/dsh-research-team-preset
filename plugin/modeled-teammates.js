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
 * This is an internal-service wrapper and deliberately opt-in
 * (`config.enabled === true`). If a DSH upgrade changes the activation shape,
 * the tool reports a clear error and the rest of the preset keeps working.
 */

import { AsyncLocalStorage } from 'node:async_hooks'
import { modelForRole } from './settings-store.js'

export const name = 'research-modeled-teammates'

export const inject = ['tools', 'subagents', 'agentTeams']

const modeledSpawn = new AsyncLocalStorage()
const patches = new WeakMap()

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

function render(value) {
  const member = value === null || value === undefined ? undefined : value.member
  const requested = value === null || value === undefined ? undefined : value.requestedModel
  if (member === null || member === undefined || typeof member !== 'object') {
    return [{ type: 'text', text: 'Teammate creation returned no roster row.' }]
  }
  const head = [`Created teammate "${String(member.name)}"`]
  if (member.status !== undefined) head.push(`status=${String(member.status)}`)
  if (member.model !== undefined) head.push(`model=${String(member.model)}`)
  const requestedLine = requested === undefined
    ? 'requested=inherit (Lead route)'
    : `requested=${requested.provider}/${requested.model}${requested.reasoningEffort === undefined ? '' : ` effort=${requested.reasoningEffort}`}`
  const warning = value.warning === undefined ? '' : `\nWARNING: ${String(value.warning)}`
  return [{ type: 'text', text: `${head.join(' ')}\n${requestedLine}${warning}` }]
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

  const disposeTool = ctx.tools.register({
    name: 'spawn_teammate_with_model',
    description:
      'Create one named, durable teammate. Lead-only. Omit model to use the default route configured for this role in the Plugins page; pass model {provider, model, reasoningEffort} to override. Without a default or override, the teammate inherits the Lead route.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Unique lower-kebab-case teammate name.' },
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
        }
      },
      required: ['name', 'description', 'prompt'],
      additionalProperties: false
    },
    output: {
      schema: {},
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
      const requestedModel = explicit === undefined ? modelForRole(args.name) : explicit
      const provider = context === 'fork' ? forkProvider : freshProvider
      const signal = exec.signal === undefined ? new AbortController().signal : exec.signal
      const spawn = () =>
        ctx.agentTeams.spawnTeammate(agent, {
          name: args.name,
          description: args.description,
          prompt: args.prompt,
          context,
          provider,
          signal
        })
      const member = requestedModel === undefined
        ? await spawn()
        : await modeledSpawn.run({ caller: agent, agentOptions: requestedModel }, spawn)
      let warning
      if (requestedModel !== undefined && typeof member?.model === 'string' && member.model !== requestedModel.model) {
        warning = `requested model ${requestedModel.model} but roster reports ${member.model}; the activation patch may be incompatible with this DSH build.`
      }
      return {
        member,
        ...(requestedModel === undefined ? {} : { requestedModel }),
        ...(warning === undefined ? {} : { warning })
      }
    }
  })

  return () => {
    disposeTool()
    disposePatch()
  }
}
