import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apply } from '../plugin/index.js'
import { apply as applyTeammates } from '../plugin/modeled-teammates.js'
import { apply as applyLibrary } from '../plugin/library.js'
import { apply as applyLiterature } from '../plugin/literature.js'

// The host types tool output as ContentBlock[]: every tool result is fed to
// dsh-spill-policy and the PTC commit path, which call `content.some(...)`.
// A render that returns a bare string either degrades to an error result or,
// on the PTC path, takes the whole host down with
// "parked.result.content.some is not a function". Keep every registered
// render returning blocks.
function fakeContext(bucket, overrides = {}) {
  return {
    systemPrompt: {
      section: () => () => {},
      context: () => () => {},
      getSectionOrder: () => 10,
      getContextOrder: () => 200
    },
    tools: {
      register(definition) {
        bucket.push(definition)
        return () => {}
      }
    },
    workspaceRegistry: { resolveByPath: async () => undefined, resolve: async () => undefined },
    agents: { get: () => undefined },
    webServer: { register: () => () => {} },
    effect: (run) => {
      try {
        const dispose = run()
        return typeof dispose === 'function' ? dispose : () => {}
      } catch (error) {
        return () => {}
      }
    },
    get: () => undefined,
    inject: (names, register) => register({}),
    skills: { registerProvider: () => {} },
    on: () => () => {},
    sessions: { get: () => undefined },
    logger: { warn: () => {}, info: () => {}, error: () => {} },
    ...overrides
  }
}

function assertBlocks(definition, value) {
  let blocks
  try {
    blocks = definition.output.render({}, value)
  } catch (error) {
    assert.fail(`${definition.name} render threw for ${JSON.stringify(value)}: ${error.message}`)
  }
  assert.ok(Array.isArray(blocks), `${definition.name} render must return an array, got ${typeof blocks}`)
  for (const block of blocks) {
    assert.equal(block.type, 'text', `${definition.name} block type`)
    assert.equal(typeof block.text, 'string', `${definition.name} block text`)
  }
}

test('every preset tool renders content blocks', () => {
  const tools = []
  apply(fakeContext(tools))
  applyTeammates(fakeContext(tools), { enabled: false })
  applyLibrary(fakeContext(tools))
  applyLiterature(fakeContext(tools))
  assert.ok(tools.length >= 12, `expected the preset tools, found ${tools.length}`)
  for (const definition of tools) {
    assert.equal(typeof definition.output?.render, 'function', `${definition.name} declares output.render`)
    assertBlocks(definition, {})
    assertBlocks(definition, { error: 'boom' })
  }
})

test('research_experiment executes and renders blocks', async () => {
  const fs = await import('node:fs')
  const os = await import('node:os')
  const path = await import('node:path')
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-render-'))
  const tools = []
  apply(fakeContext(tools))
  const tool = tools.find((entry) => entry.name === 'research_experiment')
  assert.ok(tool, 'research_experiment is registered')
  const value = await tool.execute({ op: 'list' }, { agent: { session: { header: { cwd } } } })
  const blocks = tool.output.render({}, value)
  assert.ok(Array.isArray(blocks))
  assert.equal(blocks[0].type, 'text')
  assert.match(blocks[0].text, /research_experiment/)
})
