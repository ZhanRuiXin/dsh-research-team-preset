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

/** Fake Cordis context that records tool definitions and spawn activations. */
function fakeContext() {
  const tools = {}
  const activations = []
  const ctx = {
    logger: { info() {}, warn() {} },
    tools: {
      register(definition) {
        tools[definition.name] = definition
        return () => { delete tools[definition.name] }
      }
    },
    subagents: {
      async startActivation(spec) {
        activations.push(spec)
        return { id: 'child-1' }
      }
    },
    agentTeams: {
      async spawnTeammate(agent, request) {
        await ctx.subagents.startActivation({
          delivery: 'parent',
          provider: request.provider,
          label: request.description,
          request: { prompt: request.prompt, parent: agent, signal: request.signal }
        })
        const spec = activations[activations.length - 1]
        return {
          name: request.name,
          status: 'running',
          provider: request.provider,
          context: request.context,
          model: spec.request.agentOptions?.model,
          target: 'teammate:child-1'
        }
      }
    }
  }
  apply(ctx, { enabled: true, freshProvider: 'spawn', forkProvider: 'fork' })
  return { ctx, tools, activations }
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
  assert.deepEqual(activations[0].request.agentOptions, ROUTES.advisor)
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
  assert.deepEqual(activations[0].request.agentOptions, result.requestedModel)
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
  assert.equal(activations[0].request.agentOptions, undefined)
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
