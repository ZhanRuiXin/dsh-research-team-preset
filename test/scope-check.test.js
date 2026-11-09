/**
 * `research_scope_check` is the handoff gate for the role write envelope: a
 * change outside the owning role's scope fails the check, so it cannot ride
 * into review unnoticed. These tests cover the envelope table directly; the
 * tool only adds the git diff around it.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

const { apply, checkScope, WRITE_ENVELOPES } = await import('../plugin/index.js')

test('a builder change inside src/configs/tests passes', () => {
  const value = checkScope('builder', ['src/model.py', 'configs/pilot.yaml', 'tests/test_model.py'])
  assert.equal(value.ok, true)
  assert.deepEqual(value.violations, [])
  assert.equal(value.allowed.length, 3)
})

test('a change outside the envelope fails and names the file', () => {
  const value = checkScope('builder', ['src/model.py', 'paper/main.tex'])
  assert.equal(value.ok, false)
  assert.deepEqual(value.violations, ['paper/main.tex'])
  assert.deepEqual(value.allowed, ['src/model.py'])
})

test('advisor and reviewer have no write scope at all', () => {
  for (const role of ['advisor', 'reviewer']) {
    const value = checkScope(role, ['notes/idea.md'])
    assert.equal(value.ok, false)
    assert.deepEqual(value.violations, ['notes/idea.md'])
    assert.deepEqual(value.envelope, [])
  }
})

test('the Lead is unrestricted', () => {
  const value = checkScope('lead', ['anything/at/all.txt'])
  assert.equal(value.ok, true)
  assert.equal(value.envelope, null)
})

test('a project can replace the envelope table', () => {
  const value = checkScope('builder', ['experiments/pilot.py'], { builder: ['experiments/'] })
  assert.equal(value.ok, true)
})

test('an unknown role is an error, not a pass', () => {
  const value = checkScope('probe', ['src/model.py'])
  assert.match(value.error, /unknown role "probe"/)
  assert.match(value.error, /expected one of/)
})

test('the default table keeps every standard role', () => {
  assert.deepEqual(
    Object.keys(WRITE_ENVELOPES).sort(),
    ['advisor', 'builder', 'data', 'designer', 'lead', 'researcher', 'reviewer', 'runner', 'writer']
  )
})

test('the plugin registers research_scope_check and reports a failing handoff', async () => {
  const tools = {}
  const ctx = {
    systemPrompt: {
      section() {
        return () => {}
      }
    },
    tools: {
      register(definition) {
        tools[definition.name] = definition
        return () => {}
      }
    },
    workspaceRegistry: {
      async resolveByPath() {
        return undefined
      }
    }
  }
  apply(ctx)
  const tool = tools.research_scope_check
  assert.ok(tool, 'research_scope_check is registered')

  const value = await tool.execute(
    { role: 'builder', paths: ['src/model.py', 'paper/main.tex'] },
    { agent: { session: { header: { cwd: process.cwd() } } } }
  )
  assert.equal(value.ok, false)
  assert.deepEqual(value.violations, ['paper/main.tex'])

  const rendered = tool.output.render({}, value)
  assert.match(rendered[0].text, /Scope check for builder: FAIL/)
  assert.match(rendered[0].text, /outside envelope: paper\/main\.tex/)
})
