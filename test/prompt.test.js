/**
 * The preset persona: one shared core for the Lead and every teammate. Role
 * duties are built-in skills (see roles.test.js), not prompt sections, so this
 * row must never grow a role-specific API again.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

const prompt = await import('../plugin/prompt.js')

test('the persona is the shared core with no role duties baked in', () => {
  const core = prompt.corePrompt()
  assert.match(core, /^You are running in Research Team Mode/)
  assert.doesNotMatch(core, /You are the Team Lead/)
  assert.doesNotMatch(core, /You are the advisor/)
  assert.match(core, /## Coordination ledger/)
  assert.match(core, /## Experiment admission/)
  assert.match(core, /research-role-lead/)
  assert.ok(core.length > 15000 && core.length < 30000, `core is ${core.length} chars`)
})

test('the row exposes no role-specific persona API', () => {
  assert.equal(prompt.personaFor, undefined)
  assert.equal(prompt.rolePrompt, undefined)
  assert.equal(prompt.ROLES, undefined)
})

test('apply registers the core prefix and an empty suffix that shadows the deployment persona', () => {
  const sections = []
  const ctx = {
    effect(fn) {
      fn()
    },
    systemPrompt: {
      getSectionOrder(name) {
        if (name === 'DEPLOYMENT_PERSONA_PREFIX') return 10
        if (name === 'DEPLOYMENT_PERSONA_SUFFIX') return 11
        assert.fail('unexpected section order name: ' + name)
      },
      section(definition) {
        sections.push(definition)
        return () => {}
      }
    }
  }
  prompt.apply(ctx)
  const prefix = sections.find(section => section.name === prompt.PERSONA_PREFIX_SECTION)
  const suffix = sections.find(section => section.name === 'deployment:persona-suffix')
  assert.ok(prefix, 'the prefix section is registered')
  assert.ok(suffix, 'the empty suffix lands after the deployment persona')
  assert.equal(prefix.order, 10)
  assert.equal(prefix.interpolate, false)
  assert.equal(prefix.text, prompt.corePrompt())
  assert.equal(suffix.order, 11)
  assert.equal(suffix.text, '')
})
