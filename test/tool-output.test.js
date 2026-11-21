import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  appendDecision,
  appendEvidence,
  claimItem,
  decideItem,
  gateItem,
  listDesigns,
  readDesign,
  saveDesign,
  upsertItem,
  writePlan,
  worklogSummary
} from '../plugin/worklog.js'
import {
  arrangeArchitectureCard,
  buildPanelState,
  checkArchitectureCard,
  finishRun,
  listArchitectureCards,
  registerRun,
  saveArchitectureCard,
  startRun,
  worklogItem
} from '../plugin/index.js'
import { literaturePayload, upsertCategory, upsertLiteratureEntry } from '../plugin/literature.js'

// Mirrors @deepseek-ai/dsh-typert-protocol isRemoteJsonValue: a tool output that
// nests undefined, NaN, -0, a non-plain prototype or an array hole is rejected by
// the host before the model ever sees it, so keep that rule in the tests.
function isRemoteJsonValue(value) {
  return visit(value, new Set())
}

function visit(value, ancestors) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value) && !Object.is(value, -0)
  if (typeof value !== 'object') return false
  if (ancestors.has(value)) return false
  ancestors.add(value)
  try {
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype || Reflect.ownKeys(value).length !== value.length + 1) return false
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index) || !visit(value[index], ancestors)) return false
      }
      return true
    }
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return false
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== 'string') return false
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor?.enumerable !== true || !visit(Reflect.get(value, key), ancestors)) return false
    }
    return true
  } finally {
    ancestors.delete(value)
  }
}

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-lossless-'))
}

test('worklog results survive the host JSON rule, including internal steps', () => {
  const root = tempRoot()
  upsertItem(root, { id: 'gated-1', title: 'Gated item', kind: 'gated' })
  upsertItem(root, { id: 'step-1', title: 'Internal step', kind: 'internal', parent: 'gated-1' })
  const results = {
    createdInternal: upsertItem(root, { id: 'step-2', title: 'Another step', kind: 'internal' }),
    updatedInternal: upsertItem(root, { id: 'step-1', status: 'in_progress', next: 'do it' }),
    updatedGated: upsertItem(root, { id: 'gated-1', status: 'in_progress' }),
    internalView: worklogItem(root, 'step-1'),
    gatedView: worklogItem(root, 'gated-1'),
    missingView: worklogItem(root, 'nope'),
    claimed: claimItem(root, { id: 'step-1', owner: 'builder' }),
    gated: (() => {
      upsertItem(root, { id: 'gated-1', status: 'in_review', evidence: ['bench/run.log'] })
      return gateItem(root, { id: 'gated-1', evidence: ['bench/run.log'] })
    })(),
    decided: decideItem(root, { id: 'gated-1', decision: 'accept' }),
    plan: writePlan(root, { objective: 'Obj' }),
    summary: worklogSummary(root),
    decision: appendDecision(root, { decision: 'Use A', by: 'lead' }),
    evidence: appendEvidence(root, { claim: 'A is better', source: 'bench', location: 'table 1' }),
    design: (() => {
      saveDesign(root, { id: 'd1', title: 'Design' })
      return readDesign(root, 'd1')
    })(),
    designs: listDesigns(root)
  }
  for (const [name, value] of Object.entries(results)) {
    assert.equal(isRemoteJsonValue(value), true, `${name} is not lossless JSON: ${JSON.stringify(value)?.slice(0, 200)}`)
  }
})

test('panel, architecture, experiment and literature payloads survive the host JSON rule', () => {
  const root = tempRoot()
  upsertItem(root, { id: 'step-1', title: 'Step', kind: 'internal' })
  const saved = saveArchitectureCard(root, {
    id: 'card-1',
    title: 'Flow',
    description: 'A flow',
    group: 'method',
    nodes: [
      { id: 'a', label: 'Input', kind: 'input', x: 40, y: 60 },
      { id: 'b', label: 'Model', kind: 'module', x: 260, y: 160 }
    ]
  })
  registerRun(root, { run: 'r1', question: 'Does it work?', decisionRule: 'AP up' })
  startRun(root, { run: 'r1' })
  finishRun(root, { run: 'r1', state: 'completed' })
  upsertCategory(root, { label: 'Related work' })
  upsertLiteratureEntry(root, { key: 'ABCDEFGH', category: 'Related work', title: 'Paper', note: '# note' })
  const payloads = {
    panel: buildPanelState(root),
    savedCard: saved,
    checked: checkArchitectureCard(saved.card ?? saved),
    arranged: arrangeArchitectureCard(saved.card ?? saved),
    cards: listArchitectureCards(root),
    literature: literaturePayload(root)
  }
  for (const [name, value] of Object.entries(payloads)) {
    assert.equal(isRemoteJsonValue(value), true, `${name} is not lossless JSON: ${JSON.stringify(value)?.slice(0, 200)}`)
  }
})
