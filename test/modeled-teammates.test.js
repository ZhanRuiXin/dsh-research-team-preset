/**
 * Regression tests for the restart bug: after DSH reopens, every teammate
 * inherited the Lead route until the settings page was saved once.
 *
 * The route lookup used to read only the in-process store that the host
 * settings plugin fills. A modeled spawn that ran while that store was still
 * empty resolved no route, spawned without agent options, and inherited the
 * Lead route with nothing in the result saying why. These tests drive the real
 * `apply()` with the store untouched, so only the settings file can supply the
 * routes.
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const home = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-test-'))
process.env.DSH_HOME = home

const { matchRoleName, modelForRole } = await import('../plugin/settings-store.js')
const { readRouteTable, settingsPath, SETTINGS_FILE_NAME } = await import('../plugin/settings-file.js')
const { apply } = await import('../plugin/modeled-teammates.js')

const ROUTES = {
  advisor: { provider: 'openai-codex', model: 'gpt-6-astra', reasoningEffort: 'high' },
  designer: { provider: 'commandcode', model: 'deepseek-v4.1-flash', reasoningEffort: 'max' },
  researcher: { provider: 'commandcode', model: 'deepseek-v4.1-flash', reasoningEffort: 'high' },
  data: { provider: 'commandcode', model: 'deepseek-v4.1-flash', reasoningEffort: 'high' },
  builder: { provider: 'commandcode', model: 'deepseek-v4.1-flash', reasoningEffort: 'max' },
  runner: { provider: 'commandcode', model: 'deepseek-v4.1-flash', reasoningEffort: 'high' },
  reviewer: { provider: 'commandcode', model: 'deepseek-v4.1-flash', reasoningEffort: 'max' },
  writer: { provider: 'commandcode', model: 'deepseek-v4.1-flash', reasoningEffort: 'max' }
}

function writeSettingsFile(body, { bom = false } = {}) {
  const file = settingsPath()
  const json = typeof body === 'string' ? body : JSON.stringify(body)
  fs.writeFileSync(file, bom ? `\ufeff${json}` : json)
  return file
}

function v2File(routes = ROUTES) {
  return { version: 2, activeProfileId: 'p-test', profiles: [{ id: 'p-test', name: 'GPT + Deepseek', roles: routes }] }
}

/** Fake Cordis context that records tool definitions, spawn activations, sandbox events, and guards. */
function fakeContext({ defaultMode = 'workspace-write', leadMode } = {}) {
  const tools = {}
  const activations = []
  const events = []
  const guards = []
  const sessions = new Map()
  const sessionFor = (id) => {
    if (!sessions.has(id)) {
      sessions.set(id, {
        id,
        append(type, data) {
          events.push({ id, type, data })
        }
      })
    }
    return sessions.get(id)
  }
  const ctx = {
    logger: { info() {}, warn() {} },
    tools: {
      register(definition) {
        tools[definition.name] = definition
        return () => { delete tools[definition.name] }
      },
      guard(guard) {
        guards.push(guard)
        return () => {}
      }
    },
    agents: {
      get(id) {
        return { session: sessionFor(id) }
      }
    },
    sandboxPolicy: {
      defaultMode,
      resolve({ session } = {}) {
        return { mode: leadMode ?? defaultMode, ...(session === undefined ? {} : { sessionId: session.id }) }
      },
      overrideOf() {
        return undefined
      }
    },
    subagents: {
      async startActivation(spec) {
        activations.push(spec)
        return { childId: 'child-1', name: spec.name ?? 'agent-1' }
      }
    }
  }
  apply(ctx, { enabled: true, freshProvider: 'spawn', forkProvider: 'fork' })
  return { ctx, tools, activations, events, guards }
}

const agent = { id: 'lead-agent' }

test('settings file supplies the route while the in-process store is empty', () => {
  writeSettingsFile(v2File())
  // The store was never filled by the host settings plugin in this process.
  assert.equal(modelForRole('advisor'), undefined)
  const table = readRouteTable()
  assert.equal(table.error, undefined)
  assert.equal(table.profile, 'GPT + Deepseek')
  assert.deepEqual(table.routes.advisor, ROUTES.advisor)
})

test('a modeled spawn resolves the file route and injects agentOptions', async () => {
  writeSettingsFile(v2File())
  const { tools, activations } = fakeContext()
  const tool = tools.spawn_teammate_with_model
  assert.ok(tool, 'spawn_teammate_with_model is registered')

  const result = await tool.execute(
    { name: 'ELHA-R advisor', description: 'Senior advisor', prompt: 'Review the design.' },
    { agent }
  )

  assert.equal(result.routeSource, 'file')
  assert.equal(result.role, 'advisor')
  assert.deepEqual(result.requestedModel, ROUTES.advisor)
  assert.equal(result.diagnostics, undefined)
  assert.equal(result.member.model, 'gpt-6-astra')
  assert.equal(activations.length, 1)
  assert.deepEqual(activations[0].agentOptions, ROUTES.advisor)
  assert.equal(activations[0].name, 'elha-r-advisor')
  assert.equal(result.member.name, 'elha-r-advisor')
})

test('a reserved or unusable name falls back to the host default', async () => {
  writeSettingsFile(v2File())
  const { tools, activations } = fakeContext()
  const result = await tools.spawn_teammate_with_model.execute(
    { name: 'Lead', description: 'Reserved name', prompt: 'Go.' },
    { agent }
  )
  assert.equal('name' in activations[0], false)
  assert.equal(result.member.name, 'agent-1')
})

test('an explicit model overrides the configured route', async () => {
  writeSettingsFile(v2File())
  const { tools, activations } = fakeContext()
  const result = await tools.spawn_teammate_with_model.execute(
    {
      name: 'advisor',
      description: 'Probe',
      prompt: 'Check the route.',
      model: { provider: 'deepseek', model: 'deepseek-v4.1-flash', reasoningEffort: 'medium' }
    },
    { agent }
  )
  assert.equal(result.routeSource, 'explicit')
  assert.deepEqual(result.requestedModel, { provider: 'deepseek', model: 'deepseek-v4.1-flash', reasoningEffort: 'medium' })
  assert.deepEqual(activations[0].agentOptions, result.requestedModel)
})

test('an unconfigured role inherits but says so in diagnostics', async () => {
  writeSettingsFile(v2File({ advisor: ROUTES.advisor }))
  const { tools, activations } = fakeContext()
  const result = await tools.spawn_teammate_with_model.execute(
    { name: 'builder', description: 'Implement', prompt: 'Build it.' },
    { agent }
  )
  assert.equal(result.requestedModel, undefined)
  assert.equal(result.role, 'builder')
  assert.equal(result.routeSource, undefined)
  assert.ok(Array.isArray(result.diagnostics))
  assert.match(result.diagnostics[0], /no route configured for role "builder"/)
  assert.match(result.diagnostics[0], /inherits the Lead route/)
  assert.equal(activations[0].agentOptions, undefined)
})

test('a name outside the standard roster reports the roster', async () => {
  writeSettingsFile(v2File())
  const { tools } = fakeContext()
  const result = await tools.spawn_teammate_with_model.execute(
    { name: 'probe-med', description: 'Probe', prompt: 'Probe.' },
    { agent }
  )
  assert.equal(result.role, undefined)
  assert.match(result.diagnostics[0], /not one of the standard roles/)
})

test('a broken settings file is reported instead of silently inheriting', async () => {
  writeSettingsFile('{ not json')
  const { tools } = fakeContext()
  const result = await tools.spawn_teammate_with_model.execute(
    { name: 'advisor', description: 'Advise', prompt: 'Advise.' },
    { agent }
  )
  assert.equal(result.requestedModel, undefined)
  assert.match(result.diagnostics[0], /not valid JSON/)
})

test('a byte-order mark does not empty every route', () => {
  writeSettingsFile(v2File(), { bom: true })
  const table = readRouteTable()
  assert.equal(table.error, undefined)
  assert.deepEqual(table.routes.writer, ROUTES.writer)
})

test('a legacy { roles } file still resolves routes', () => {
  writeSettingsFile({ roles: { advisor: { provider: 'openai-codex', model: 'gpt-6-astra', reasoningEffort: 'max' } } })
  const table = readRouteTable()
  assert.equal(table.error, undefined)
  assert.deepEqual(table.routes.advisor, { provider: 'openai-codex', model: 'gpt-6-astra', reasoningEffort: 'max' })
})

test('a missing settings file is a reported gap, not a throw', () => {
  const file = path.join(home, SETTINGS_FILE_NAME)
  if (fs.existsSync(file)) fs.rmSync(file)
  const table = readRouteTable()
  assert.equal(Object.keys(table.routes).length, 0)
  assert.match(table.error, /is missing/)
})

test('descriptive teammate names still match their role', () => {
  assert.equal(matchRoleName('advisor'), 'advisor')
  assert.equal(matchRoleName('ELHA-R advisor'), 'advisor')
  assert.equal(matchRoleName('advisor-hi'), 'advisor')
  assert.equal(matchRoleName('senior_reviewer'), 'reviewer')
  assert.equal(matchRoleName('data-audit'), 'data')
  assert.equal(matchRoleName('builder'), 'builder')
  assert.equal(matchRoleName('probe-med'), undefined)
  assert.equal(matchRoleName(''), undefined)
  assert.equal(matchRoleName(undefined), undefined)
})

test('research_team_routes reports the configured table', async () => {
  writeSettingsFile(v2File())
  const { tools } = fakeContext()
  const value = await tools.research_team_routes.execute({}, { agent })
  assert.equal(value.profile, 'GPT + Deepseek')
  assert.equal(value.activeProfileId, 'p-test')
  assert.deepEqual(value.routes.advisor, ROUTES.advisor)
  assert.equal(value.error, undefined)
  const rendered = tools.research_team_routes.output.render({}, value)
  assert.match(rendered[0].text, /advisor: openai-codex\/gpt-6-astra effort=high/)
})

test('the advisor spawns read-only and records the sandbox mode on the child session', async () => {
  writeSettingsFile(v2File())
  const { tools, events, guards } = fakeContext()
  const result = await tools.spawn_teammate_with_model.execute(
    { name: 'advisor', description: 'Senior advisor', prompt: 'Review the design.' },
    { agent }
  )

  assert.equal(result.sessionId, 'child-1')
  assert.equal(result.permission.mode, 'read-only')
  assert.equal(result.permission.applied, true)
  assert.deepEqual(events, [{ id: 'child-1', type: 'sandbox/mode', data: { mode: 'read-only' } }])

  assert.equal(guards.length, 1)
  const guard = guards[0]
  assert.match(guard({ agent: { session: { id: 'child-1' } }, name: 'write' }), /read-only/)
  assert.match(guard({ agent: { session: { id: 'child-1' } }, name: 'bash' }), /read-only/)
  assert.equal(guard({ agent: { session: { id: 'child-1' } }, name: 'read_file' }), undefined)
  assert.equal(guard({ agent: { session: { id: 'child-2' } }, name: 'write' }), undefined)
})

test('an explicit permission overrides the role default', async () => {
  writeSettingsFile(v2File())
  const { tools, events, guards } = fakeContext({ defaultMode: 'read-only' })
  const result = await tools.spawn_teammate_with_model.execute(
    { name: 'advisor', description: 'Probe', prompt: 'Edit the fixture.', permission: 'workspace-write' },
    { agent }
  )

  assert.equal(result.permission.mode, 'workspace-write')
  assert.deepEqual(events, [{ id: 'child-1', type: 'sandbox/mode', data: { mode: 'workspace-write' } }])
  assert.equal(guards[0]({ agent: { session: { id: 'child-1' } }, name: 'write' }), undefined)
})

test('a role at the deployment default needs no sandbox event', async () => {
  writeSettingsFile(v2File())
  const { tools, events } = fakeContext()
  const result = await tools.spawn_teammate_with_model.execute(
    { name: 'builder', description: 'Implement', prompt: 'Build it.' },
    { agent }
  )

  assert.equal(result.permission.mode, 'workspace-write')
  assert.equal(result.permission.already, true)
  assert.deepEqual(events, [])
})

test("a non-read-only role inherits the Lead's sandbox mode", async () => {
  writeSettingsFile(v2File())
  const { tools, events } = fakeContext({ defaultMode: 'workspace-write', leadMode: 'danger-full-access' })
  const result = await tools.spawn_teammate_with_model.execute(
    { name: 'builder', description: 'Implement', prompt: 'Build it.' },
    { agent }
  )

  assert.equal(result.permission.mode, 'danger-full-access')
  assert.deepEqual(events, [{ id: 'child-1', type: 'sandbox/mode', data: { mode: 'danger-full-access' } }])
})

test('the advisor stays read-only even when the Lead has broader access', async () => {
  writeSettingsFile(v2File())
  const { tools, events } = fakeContext({ defaultMode: 'workspace-write', leadMode: 'danger-full-access' })
  const result = await tools.spawn_teammate_with_model.execute(
    { name: 'advisor', description: 'Senior advisor', prompt: 'Review the design.' },
    { agent }
  )

  assert.equal(result.permission.mode, 'read-only')
  assert.deepEqual(events, [{ id: 'child-1', type: 'sandbox/mode', data: { mode: 'read-only' } }])
})
