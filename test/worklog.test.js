/**
 * The worklog store: JSON is the machine state, markdown is a generated view.
 * These tests hold the parts tools depend on: status rules, claim ownership,
 * the generated views, and the append-only logs.
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const {
  appendDecision,
  appendEvidence,
  claimItem,
  decideItem,
  gateItem,
  listDecisions,
  listEvidence,
  listItems,
  readDesign,
  saveDesign,
  upsertItem
} = await import('../plugin/worklog.js')

function project(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-store-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  return dir
}

test('an item moves through todo, claim and gate with generated views', (t) => {
  const dir = project(t)
  const created = upsertItem(dir, { id: 't-gate1', title: 'Pilot gate', owner: 'lead', next: 'run the pilot' })
  assert.equal(created.created, true)
  assert.equal(created.item.status, 'todo')

  const claimed = claimItem(dir, { id: 't-gate1', owner: 'builder' })
  assert.equal(claimed.item.owner, 'builder')
  assert.equal(claimed.item.status, 'in_progress')

  const gated = gateItem(dir, {
    id: 't-gate1',
    summary: 'pilot finished',
    base: 'aaa111',
    head: 'bbb222',
    evidence: ['reports/pilot.md'],
    checklist: [{ text: 'pilot ran', done: true, note: 'one seed' }]
  })
  assert.equal(gated.item.status, 'in_review')
  assert.equal(gated.item.head, 'bbb222')

  const index = fs.readFileSync(path.join(dir, 'worklog', 'INDEX.md'), 'utf8')
  assert.match(index, /\| t-gate1 \| Pilot gate \| builder \| in_review \|/)
  const card = fs.readFileSync(path.join(dir, 'worklog', 't-gate1.md'), 'utf8')
  assert.match(card, /- owner: builder/)
  assert.match(card, /- \[x\] pilot ran — one seed/)
  assert.match(card, /reports\/pilot\.md/)
  const item = JSON.parse(fs.readFileSync(path.join(dir, '.research', 'worklog', 'items', 't-gate1.json'), 'utf8'))
  assert.equal(item.status, 'in_review')
})

test('claim refuses to take over another owner', (t) => {
  const dir = project(t)
  upsertItem(dir, { id: 'task-1', title: 'step', owner: 'data', status: 'in_progress' })
  const result = claimItem(dir, { id: 'task-1', owner: 'builder' })
  assert.match(result.error, /owned by data/)
})

test('done needs the user, and unknown statuses are rejected', (t) => {
  const dir = project(t)
  upsertItem(dir, { id: 'task-2', title: 'step' })
  assert.match(upsertItem(dir, { id: 'task-2', status: 'done', by: 'user' }).error, /cannot move "task-2" from todo to done/)
  const gated = gateItem(dir, { id: 'task-2', evidence: ['reports/step.md'] })
  assert.equal(gated.item.status, 'in_review')
  assert.match(upsertItem(dir, { id: 'task-2', status: 'done' }).error, /done belongs to the user/)
  const accepted = upsertItem(dir, { id: 'task-2', status: 'done', by: 'user' })
  assert.equal(accepted.item.status, 'done')
  assert.match(upsertItem(dir, { id: 'task-2', status: 'finished' }).error, /status must be one of/)
})

test('status moves follow the transition table and leave a history', (t) => {
  const dir = project(t)
  upsertItem(dir, { id: 'task-5', title: 'step' })
  assert.match(upsertItem(dir, { id: 'task-5', status: 'blocked' }).error, /blocked needs a reason/)
  const blocked = upsertItem(dir, { id: 'task-5', status: 'blocked', blocked: 'waiting for the data sample' })
  assert.equal(blocked.item.status, 'blocked')
  assert.match(upsertItem(dir, { id: 'task-5', status: 'in_review' }).error, /cannot move "task-5" from blocked to in_review/)
  const running = upsertItem(dir, { id: 'task-5', status: 'in_progress' })
  assert.equal(running.item.status, 'in_progress')
  assert.deepEqual(running.item.history.map((entry) => `${entry.from}->${entry.to}`), ['todo->blocked', 'blocked->in_progress'])
  assert.match(upsertItem(dir, { id: 'task-5', status: 'done', by: 'user' }).error, /cannot move "task-5" from in_progress to done/)
})

test('a gate refuses to run without evidence', (t) => {
  const dir = project(t)
  upsertItem(dir, { id: 't-gate2', title: 'Gate', owner: 'lead', status: 'in_progress' })
  assert.match(gateItem(dir, { id: 't-gate2' }).error, /a gate needs evidence/)
  const ok = gateItem(dir, { id: 't-gate2', checklist: [{ text: 'ran', done: true, note: 'seed 42' }] })
  assert.equal(ok.item.status, 'in_review')
})

test('decisions render into PLAN and evidence into docs/evidence.md', (t) => {
  const dir = project(t)
  appendDecision(dir, { decision: 'drop variant C', reason: 'no effect', commit: 'abc1234' })
  appendDecision(dir, { decision: 'keep the pilot' })
  const plan = fs.readFileSync(path.join(dir, 'worklog', 'PLAN.md'), 'utf8')
  assert.match(plan, /drop variant C \(no effect, abc1234\)/)
  assert.match(plan, /keep the pilot/)
  assert.equal(listDecisions(dir).length, 2)

  appendEvidence(dir, { claim: 'paired ECG raises AUC', source: 'doi:10.1/x', locator: 'Table 3', strength: 'moderate' })
  assert.equal(listEvidence(dir).length, 1)
  const evidence = fs.readFileSync(path.join(dir, 'docs', 'evidence.md'), 'utf8')
  assert.match(evidence, /paired ECG raises AUC/)
  assert.match(evidence, /Table 3/)
})

test('design records keep their machine fields and create the document once', (t) => {
  const dir = project(t)
  const saved = saveDesign(dir, {
    id: 'anchor-migration',
    title: 'Anchor migration',
    question: 'does R-peak timing transfer across leads?',
    hypotheses: ['timing transfers', 'amplitude does not'],
    metrics: ['F1'],
    budget: '40 GPU-hours'
  })
  assert.equal(saved.status, 'draft')
  assert.match(fs.readFileSync(path.join(dir, 'docs', 'design', 'anchor-migration.md'), 'utf8'), /## Question/)

  const updated = saveDesign(dir, { id: 'anchor-migration', status: 'active' })
  assert.equal(updated.question, 'does R-peak timing transfer across leads?')
  assert.equal(updated.status, 'active')
  assert.equal(readDesign(dir, 'anchor-migration').metrics[0], 'F1')
})

test('items list in status order and legacy rows are readable without JSON', (t) => {
  const dir = project(t)
  upsertItem(dir, { id: 'task-3', title: 'todo one' })
  upsertItem(dir, { id: 'task-4', title: 'running one', owner: 'lead', status: 'in_progress' })
  const ids = listItems(dir).map((item) => item.id)
  assert.deepEqual(ids, ['task-4', 'task-3'])

  const legacy = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-legacy-'))
  t.after(() => fs.rmSync(legacy, { recursive: true, force: true }))
  fs.mkdirSync(path.join(legacy, 'worklog'), { recursive: true })
  fs.writeFileSync(
    path.join(legacy, 'worklog', 'INDEX.md'),
    '| id | title | owner | status | updated | next |\n| --- | --- | --- | --- | --- | --- |\n| t-old | old gate | lead | blocked | 2026-10-01 | unblock |\n',
    'utf8'
  )
  const rows = listItems(legacy)
  assert.equal(rows[0].id, 't-old')
  assert.equal(rows[0].status, 'blocked')
})

test('only the user accepts a gated item, and a return sends it back with the reason', (t) => {
  const dir = project(t)
  upsertItem(dir, { id: 't-accept', title: 'Acceptance', owner: 'builder' })
  claimItem(dir, { id: 't-accept', owner: 'builder' })
  gateItem(dir, { id: 't-accept', evidence: ['README diff checked'] })

  const early = decideItem(dir, { id: 't-accept', decision: 'accept' })
  assert.equal(early.error, undefined)
  assert.equal(early.item.status, 'done')
  assert.equal(early.item.by, undefined)

  const again = decideItem(dir, { id: 't-accept', decision: 'accept' })
  assert.match(again.error, /only an item in in_review/)

  upsertItem(dir, { id: 't-send', title: 'Returned', owner: 'builder' })
  claimItem(dir, { id: 't-send', owner: 'builder' })
  gateItem(dir, { id: 't-send', evidence: ['numbers reproduced'] })
  const back = decideItem(dir, { id: 't-send', decision: 'return', reason: '缺少对照基线' })
  assert.equal(back.item.status, 'in_progress')
  assert.equal(back.item.next, '缺少对照基线')
  assert.deepEqual(back.item.history.at(-1).to, 'in_progress')
})


test('an item keeps its deliverables and drops empty entries', (t) => {
  const dir = project(t)
  upsertItem(dir, {
    id: 't-files',
    title: 'Report',
    owner: 'writer',
    deliverables: [
      { label: 'E2 report', path: 'reports/e2.md' },
      { label: '', path: '' },
      { label: 'Upstream', url: 'https://example.org/paper' }
    ]
  })
  const item = listItems(dir).find((entry) => entry.id === 't-files')
  assert.equal(item.deliverables.length, 2)
  assert.equal(item.deliverables[0].label, 'E2 report')
  assert.equal(item.deliverables[0].path, 'reports/e2.md')
  assert.equal(item.deliverables[1].url, 'https://example.org/paper')
})
