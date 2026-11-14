/**
 * The nine role briefs are built-in skills: one provider serves
 * `research-role-<role>`, the catalog description says when to load it, and the
 * body is the brief the model gets back from the `skill` tool.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

const roles = await import('../plugin/roles.js')

function registerProvider() {
  let factory
  const ctx = {
    skills: {
      registerProvider(create) {
        factory = create
        return () => {}
      }
    }
  }
  roles.apply(ctx)
  assert.equal(typeof factory, 'function', 'apply registers a provider factory')
  return factory()
}

test('the provider lists one skill per role with a load-when description', async () => {
  const provider = await registerProvider()
  const candidates = await provider.list()
  assert.equal(provider.name, 'research-team-roles')
  assert.equal(candidates.length, 9)
  assert.deepEqual(candidates.map(candidate => candidate.name), roles.ROLES.map(role => `research-role-${role}`))
  for (const candidate of candidates) {
    assert.equal(candidate.provider, 'research-team-roles')
    assert.equal(candidate.invocation.modelInvocable, true)
    assert.match(candidate.description, /role brief for the \w+ role\. Load it when/)
    assert.ok(Number.isFinite(candidate.rank))
  }
})

test('each candidate returns its own brief body and nothing repeats the core ledger', async () => {
  const provider = await registerProvider()
  const candidates = await provider.list()
  const contents = new Set()
  for (const candidate of candidates) {
    const definition = await provider.get(candidate)
    assert.ok(definition, `${candidate.name} resolves`)
    assert.equal(definition.name, candidate.name)
    assert.match(definition.content, /^You are /)
    assert.ok(!definition.content.includes('## Coordination ledger'), `${candidate.name} repeats the core ledger`)
    assert.ok(!contents.has(definition.content), `${candidate.name} duplicates another brief`)
    contents.add(definition.content)
  }
})

test('an unknown skill name resolves to nothing', async () => {
  const provider = await registerProvider()
  const found = await provider.get({ name: 'research-role-historian' })
  assert.equal(found, undefined)
})
