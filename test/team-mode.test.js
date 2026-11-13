import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

process.env.DSH_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-teammode-'))
const workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-teammode-cwd-'))

const { apply: applyPanel } = await import('../plugin/index.js')
const { apply: applySpawn } = await import('../plugin/modeled-teammates.js')

function makeTeams() {
  const calls = []
  return {
    enabled: false,
    calls,
    isEnabled() {
      return this.enabled
    },
    async setEnabled(agent, value) {
      this.enabled = value
      calls.push({ id: agent.id, value })
    }
  }
}

function baseCtx(teams, handlers) {
  const tools = {}
  const agent = {
    id: 's1',
    session: { header: { agentPreset: 'research-team', origin: 'startup', cwd: workdir }, append() {} }
  }
  const ctx = {
    systemPrompt: { section() { return () => {} } },
    tools: {
      register(definition) {
        tools[definition.name] = definition
        return () => {}
      },
      guard() {
        return () => {}
      }
    },
    workspaceRegistry: { async resolveByPath() { return undefined } },
    agents: { get: (id) => (id === 's1' ? agent : undefined) },
    webServer: { register() { return () => {} } },
    subagents: {
      async startActivation(spec) {
        return { childId: 'child-1', name: spec.name ?? 'agent-1' }
      }
    },
    sandboxPolicy: {
      defaultMode: 'workspace-write',
      overrideOf() { return undefined },
      resolve() { return { mode: 'workspace-write' } }
    },
    on(event, fn) {
      handlers.set(event, fn)
      return () => {}
    },
    get(name) {
      return name === 'agentTeams' ? teams : undefined
    }
  }
  return { ctx, tools, agent }
}

test('a Research Team session turns team collaboration on', async () => {
  const teams = makeTeams()
  const handlers = new Map()
  const { ctx, agent } = baseCtx(teams, handlers)
  applyPanel(ctx)
  const handler = handlers.get('agent/created')
  assert.equal(typeof handler, 'function')
  handler({ agent })
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.deepEqual(teams.calls, [{ id: 's1', value: true }])
})

test('other presets and subagent sessions are left alone', async () => {
  const teams = makeTeams()
  const handlers = new Map()
  const { ctx } = baseCtx(teams, handlers)
  applyPanel(ctx)
  const handler = handlers.get('agent/created')
  handler({ agent: { id: 'other', session: { header: { agentPreset: 'plain', origin: 'startup' } } } })
  handler({ agent: { id: 'child', session: { header: { agentPreset: 'research-team', origin: 'subagent' } } } })
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.deepEqual(teams.calls, [])
})

test('the spawn tool turns team collaboration on before it activates', async () => {
  const teams = makeTeams()
  const handlers = new Map()
  const { ctx, tools, agent } = baseCtx(teams, handlers)
  applySpawn(ctx, { enabled: true, freshProvider: 'spawn', forkProvider: 'fork' })
  const result = await tools.spawn_teammate_with_model.execute(
    { name: 'researcher', description: 'Literature search', prompt: 'Draft the evidence table.' },
    { agent, signal: new AbortController().signal }
  )
  assert.deepEqual(teams.calls, [{ id: 's1', value: true }])
  assert.equal(result.member.id, 'child-1')
})

test('selecting the preset after creation turns team collaboration on', async () => {
  const teams = makeTeams()
  const handlers = new Map()
  const { ctx } = baseCtx(teams, handlers)
  applyPanel(ctx)
  handlers.get('agent-preset/selected')('s1', 'research-team')
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.deepEqual(teams.calls, [{ id: 's1', value: true }])
})

test('the first research_project call enables team collaboration as well', async () => {
  const teams = makeTeams()
  const handlers = new Map()
  const { ctx, tools, agent } = baseCtx(teams, handlers)
  applyPanel(ctx)
  await tools.research_project.execute({}, { agent })
  assert.deepEqual(teams.calls, [{ id: 's1', value: true }])
})
