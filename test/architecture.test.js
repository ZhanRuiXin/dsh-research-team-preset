import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  buildPanelState,
  finishRun,
  registerRun,
  startRun,
  listArchitectureCards,
  normalizeArchitectureCard,
  readArchitectureCard,
  readExperimentSettings,
  sanitizeCardId,
  saveArchitectureCard,
  setRunApproval,
  teamRoster,
  writeExperimentSettings
} from '../plugin/index.js'

function makeRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'research-team-arch-'))
  fs.mkdirSync(path.join(root, 'worklog'), { recursive: true })
  fs.writeFileSync(path.join(root, 'worklog', 'PLAN.md'), [
    '# PLAN',
    '',
    '- objective: Prove the lattice representation transfers across datasets',
    '- milestone: E2 reproduction',
    '- blocked: none',
    '- next: align the fourth seed'
  ].join('\n'))
  fs.writeFileSync(path.join(root, 'worklog', 'INDEX.md'), [
    '| id | title | owner | status | updated | next |',
    '| --- | --- | --- | --- | --- | --- |',
    '| e2 | E2 reproduction | runner | in_progress | 2026-11-10 | fourth seed |',
    '| e3 | E3 ablation | designer | todo | 2026-11-09 | draft the protocol |'
  ].join('\n'))
  return root
}

test('sanitizeCardId accepts simple ids and rejects paths', () => {
  assert.equal(sanitizeCardId('mec-lattice'), 'mec-lattice')
  assert.equal(sanitizeCardId(' MEC_Lattice '), 'mec_lattice')
  assert.equal(sanitizeCardId('../escape'), undefined)
  assert.equal(sanitizeCardId(''), undefined)
})

test('normalizeArchitectureCard clamps geometry and drops dangling edges', () => {
  const card = normalizeArchitectureCard({
    id: 'method',
    title: 'Method',
    canvas: { width: 99999, height: 10 },
    nodes: [
      { id: 'input', label: 'vitals', x: -50, y: 10, w: 1, h: 9999 },
      { id: 'encoder', label: 'lattice encoder', x: 200, y: 40 }
    ],
    edges: [
      { from: 'input', to: 'encoder' },
      { from: 'input', to: 'missing' }
    ]
  })

  assert.equal(card.id, 'method')
  assert.equal(card.version, 1)
  assert.equal(card.canvas.width, 4000)
  assert.equal(card.canvas.height, 200)
  assert.equal(card.nodes[0].x, 0)
  assert.equal(card.nodes[0].w, 60)
  assert.equal(card.nodes[0].h, 240)
  assert.equal(card.edges.length, 1)
})

test('normalizeArchitectureCard rejects an empty or malformed card', () => {
  assert.match(normalizeArchitectureCard({ id: 'x', nodes: [] }).error, /at least one node/)
  assert.match(normalizeArchitectureCard({ id: 'bad id', nodes: [] }).error, /id must match/)
  assert.match(normalizeArchitectureCard({
    id: 'x',
    nodes: [{ id: 'a' }, { id: 'a' }]
  }).error, /duplicate node id/)
})

test('saveArchitectureCard versions, rejects a stale write and round-trips', () => {
  const root = makeRoot()
  const first = saveArchitectureCard(root, {
    id: 'method',
    title: 'Method',
    nodes: [{ id: 'input', label: 'vitals', x: 40, y: 40 }, { id: 'encoder', label: 'encoder', x: 240, y: 40 }],
    edges: [{ from: 'input', to: 'encoder' }]
  })

  assert.equal(first.version, 1)
  const stored = readArchitectureCard(root, 'method')
  assert.equal(stored.id, 'method')
  assert.equal(stored.nodes.length, 2)
  assert.equal(listArchitectureCards(root).length, 1)

  const second = saveArchitectureCard(root, {
    ...stored,
    notes: [{ text: 'does this layer keep the mask?', targets: ['encoder'] }]
  }, 1)
  assert.equal(second.version, 2)
  assert.equal(second.notes.length, 1)

  const stale = saveArchitectureCard(root, { ...stored, nodes: stored.nodes }, 1)
  assert.match(stale.error, /version conflict/)
  assert.equal(readArchitectureCard(root, 'method').version, 2)
})

test('buildPanelState reads the worklog, design docs and architecture cards', () => {
  const root = makeRoot()
  fs.mkdirSync(path.join(root, 'docs', 'design'), { recursive: true })
  fs.writeFileSync(path.join(root, 'docs', 'design', 'e2.md'), [
    '# E2',
    '',
    '## Question',
    '',
    'Does the lattice representation transfer to the second cohort?'
  ].join('\n'))
  saveArchitectureCard(root, {
    id: 'method',
    title: 'Method',
    nodes: [{ id: 'input', label: 'vitals' }]
  })

  const state = buildPanelState(root)
  assert.equal(state.worklog.objective, 'Prove the lattice representation transfers across datasets')
  assert.equal(state.worklog.milestone, 'E2 reproduction')
  assert.equal(state.cards.length, 2)
  assert.equal(state.cards[0].id, 'e2')
  assert.equal(state.cards[0].status, 'in_progress')
  assert.equal(state.designs.length, 1)
  assert.match(state.designs[0].question, /transfer/)
  assert.equal(state.architectures.length, 1)
  assert.equal(state.architectures[0].id, 'method')
})

test('buildPanelState reads experiment approval, elapsed time and newest-first order', () => {
  const root = makeRoot()
  const runs = path.join(root, 'runs')
  for (const name of ['exp-old', 'exp-new']) {
    fs.mkdirSync(path.join(runs, name), { recursive: true })
  }
  fs.writeFileSync(path.join(runs, 'exp-old', 'manifest.json'), JSON.stringify({
    status: 'done',
    seeds: '4/4',
    startedAt: '2026-11-09T00:00:00.000Z',
    finishedAt: '2026-11-09T02:00:00.000Z',
    approval: { state: 'approved' }
  }))
  fs.writeFileSync(path.join(runs, 'exp-new', 'manifest.json'), JSON.stringify({
    status: 'running',
    seeds: '1/4',
    startedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString()
  }))

  const state = buildPanelState(root)
  assert.equal(state.experimentSettings.approval, 'required')
  assert.equal(state.runs.length, 2)
  assert.equal(state.runs[0].name, 'exp-new')
  assert.equal(state.runs[0].running, true)
  assert.equal(state.runs[0].approval, 'pending')
  assert.ok(state.runs[0].elapsedMs >= 64 * 60 * 1000)
  assert.equal(state.runs[1].name, 'exp-old')
  assert.equal(state.runs[1].approval, 'approved')
  assert.equal(state.runs[1].elapsedMs, 2 * 60 * 60 * 1000)
})

test('experiment settings and run approval persist to disk', () => {
  const root = makeRoot()
  fs.mkdirSync(path.join(root, 'runs', 'exp-1'), { recursive: true })
  fs.writeFileSync(path.join(root, 'runs', 'exp-1', 'manifest.json'), JSON.stringify({ status: 'planned' }))

  assert.equal(readExperimentSettings(root).approval, 'required')
  writeExperimentSettings(root, { approval: 'auto' })
  assert.equal(readExperimentSettings(root).approval, 'auto')
  assert.equal(buildPanelState(root).runs[0].approval, 'auto')

  setRunApproval(root, 'exp-1', 'approved')
  const stored = JSON.parse(fs.readFileSync(path.join(root, 'runs', 'exp-1', 'manifest.json'), 'utf8'))
  assert.equal(stored.approval.state, 'approved')
  assert.equal(stored.approval.by, 'user')
  assert.match(setRunApproval(root, '../escape', 'approved').error, /invalid run id/)
  assert.match(setRunApproval(root, 'missing', 'approved').error, /no manifest/)
})

test('teamRoster reports members and the work item each owns', () => {
  const members = [
    { id: 's-lead', name: 'lead', role: 'lead', status: 'running', model: 'deepseek/deepseek-v4.1-flash' },
    { id: 's-builder', name: 'builder', role: 'teammate', status: 'inactive' }
  ]
  const ctx = {
    agents: { get: (id) => (id === 's-1' ? { id: 's-1' } : undefined) },
    agentTeams: { listMembers: (agent) => (agent.id === 's-1' ? members : []) }
  }
  const items = [
    { id: 'task-3', title: '编码器脚手架', owner: 'builder', status: 'in_progress' },
    { id: 'task-4', title: '基准生成器', owner: 'designer', status: 'todo' }
  ]
  const roster = teamRoster(ctx, 's-1', items)
  assert.equal(roster.length, 2)
  assert.deepEqual(roster[1], {
    id: 's-builder',
    name: 'builder',
    role: 'teammate',
    status: 'inactive',
    description: '',
    model: '',
    item: { id: 'task-3', title: '编码器脚手架', status: 'in_progress' }
  })
  assert.equal(teamRoster(ctx, 'missing', items).length, 0)
  assert.equal(teamRoster({}, 's-1', items).length, 0)
})

test('experiments move through the lifecycle through the tool functions', () => {
  const root = makeRoot()
  const registered = registerRun(root, {
    run: 'exp-1',
    question: 'does the gate improve DICE',
    seeds: '4',
    budget: '2 GPU-hours',
    decisionRule: 'kill below 0.88 at the pilot'
  })
  assert.equal(registered.state, 'awaiting_approval')
  assert.match(registerRun(root, { run: 'exp-1' }).error, /already exists/)
  assert.match(startRun(root, { run: 'exp-1' }).error, /needs the user's approval/)

  setRunApproval(root, 'exp-1', 'approved')
  assert.equal(buildPanelState(root).runs[0].state, 'approved')

  assert.equal(startRun(root, { run: 'exp-1' }).state, 'running')
  const running = buildPanelState(root).runs[0]
  assert.equal(running.running, true)
  assert.equal(running.state, 'running')

  assert.equal(finishRun(root, { run: 'exp-1', state: 'stopped', reason: 'kill criterion hit' }).state, 'stopped')
  const stopped = buildPanelState(root).runs[0]
  assert.equal(stopped.state, 'stopped')
  assert.equal(stopped.running, false)
  assert.equal(stopped.reason, 'kill criterion hit')
  assert.match(startRun(root, { run: 'exp-1' }).error, /already stopped/)
  assert.match(finishRun(root, { run: 'missing', state: 'completed' }).error, /no manifest/)
  assert.match(finishRun(root, { run: 'exp-1', state: 'nonsense' }).error, /must be completed, stopped or failed/)
})
