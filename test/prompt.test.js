/**
 * The persona split: a shared core every member loads, plus one brief per
 * role. These tests pin the contract the two preset rows rely on — the
 * member persona must not carry any role's duties, and the loader must
 * register the prefix section for the configured role.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

const { PERSONA_PREFIX_SECTION, ROLES, apply, corePrompt, personaFor, rolePrompt } = await import('../plugin/prompt.js')

test('the member persona is the shared core without a role brief', () => {
  const core = corePrompt()
  const member = personaFor('member')
  assert.equal(member, core)
  assert.match(member, /^You are running in Research Team Mode/)
  assert.doesNotMatch(member, /You are the Team Lead/)
  assert.doesNotMatch(member, /You are the advisor/)
  assert.match(member, /## Coordination ledger/)
  assert.match(member, /## Experiment admission/)
})

test('the lead persona composes the core and the lead brief', () => {
  const lead = personaFor('lead')
  const core = corePrompt()
  assert.match(lead, /^You are running in Research Team Mode/)
  assert.match(lead, /You are the Team Lead/)
  assert.ok(lead.length > core.length + 5000, 'the lead brief must add substantial guidance')
})

test('every role has its own brief and none duplicates the shared core', () => {
  const seen = new Set()
  for (const role of ROLES) {
    const text = rolePrompt(role)
    assert.match(text, /^You are /, `${role} brief must open with a role statement`)
    assert.ok(!text.includes('## Coordination ledger'), `${role} brief must not repeat the core ledger`)
    assert.ok(!seen.has(text), `${role} brief duplicates another role`)
    seen.add(text)
  }
  assert.equal(ROLES.length, 9)
})

test('an unknown role is reported instead of made up', () => {
  assert.throws(() => rolePrompt('historian'), /unknown research-team role "historian"/)
  assert.throws(() => rolePrompt(undefined), /unknown research-team role "undefined"/)
})

test('apply registers the deployment persona prefix for the configured role', () => {
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
  apply(ctx, { role: 'member' })
  const prefix = sections.find((section) => section.name === PERSONA_PREFIX_SECTION)
  const suffix = sections.find((section) => section.name === 'deployment:persona-suffix')
  assert.ok(prefix, 'the prefix section is registered')
  assert.ok(suffix, 'the empty suffix section shadows the deployment suffix')
  assert.equal(prefix.order, 10)
  assert.equal(prefix.interpolate, false)
  assert.equal(prefix.text, corePrompt())
  assert.equal(suffix.order, 11)
  assert.equal(suffix.text, '')
})
