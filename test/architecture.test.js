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
  setArchitectureArchived,
  setRunApproval,
  teamRoster,
  writeExperimentSettings
} from '../plugin/index.js'
import { upsertItem, writePlan } from '../plugin/worklog.js'

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
    description: '方法总览',
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
  assert.equal(card.description, '方法总览')
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

test('setArchitectureArchived retires a card, keeps it readable and restores it', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'research-team-archive-'))
  const saved = saveArchitectureCard(root, {
    id: 'pipeline',
    title: 'Pipeline',
    nodes: [{ id: 'n1', label: 'input', x: 20, y: 40 }]
  })
  assert.equal(saved.archived, false)

  const retired = setArchitectureArchived(root, saved.id, true)
  assert.equal(retired.archived, true)
  assert.equal(readArchitectureCard(root, saved.id).archived, true)
  assert.equal(listArchitectureCards(root)[0].archived, true)

  // saving the card again must not drop the archive flag
  const touched = saveArchitectureCard(root, { ...readArchitectureCard(root, saved.id), description: 'kept' })
  assert.equal(touched.archived, true)

  const restored = setArchitectureArchived(root, saved.id, false)
  assert.equal(restored.archived, false)
  assert.equal(readArchitectureCard(root, saved.id).archived, false)

  assert.match(setArchitectureArchived(root, 'missing', true).error, /No architecture card/)
  assert.match(setArchitectureArchived(root, '../escape', true).error, /id must match/)
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

test('buildPanelState only lists directories that carry a run manifest', () => {
  const root = makeRoot()
  const runs = path.join(root, 'runs')
  fs.mkdirSync(runs, { recursive: true })
  fs.writeFileSync(path.join(runs, '.gitignore'), '*.log\n')
  fs.mkdirSync(path.join(runs, 'blocked'), { recursive: true })
  fs.mkdirSync(path.join(runs, 'reviewer', 'notes'), { recursive: true })
  fs.writeFileSync(path.join(runs, 'notes.txt'), 'scratch\n')
  fs.mkdirSync(path.join(runs, 'exp-ok'), { recursive: true })
  fs.writeFileSync(path.join(runs, 'exp-ok', 'manifest.json'), JSON.stringify({ status: 'planned' }))

  const state = buildPanelState(root)
  assert.equal(state.runs.length, 1)
  assert.equal(state.runs[0].name, 'exp-ok')
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

test('teamRoster reports the Lead and continuable children with their work item', async () => {
  const ctx = {
    agents: {
      get: (id) => (id === 's-1'
        ? { id: 's-1', status: 'running', options: { model: 'deepseek/deepseek-v4.1-flash', reasoningEffort: 'high' } }
        : id === 's-builder'
          ? { id: 's-builder', status: 'inactive' }
          : undefined)
    },
    subagents: {
      rootOf: () => ({ id: 's-1' }),
      listDescendants: async () => ([
        { id: 's-builder', path: 'builder', label: 'implementation', mode: 'continuable' },
        { id: 's-legacy-0', mode: 'continuable' },
        { id: 's-custom', path: 'elha-r-advisor', label: 'custom teammate', mode: 'continuable' },
        { id: 's-nested', path: 'builder/checker', label: 'nested probe', mode: 'continuable' },
        { id: 's-mnemom', path: 'mnemom-run-v1-1150abcdef', label: 'mnemom run', mode: 'continuable' },
        { id: 's-broken', kind: 'diagnostic', reason: 'corrupt', mode: 'continuable' },
        { id: 's-oneshot', mode: 'one-shot', label: 'probe' }
      ])
    },
    sessionQuery: {
      observeSession: async () => ({
        events: [
          { type: 'team/member', data: { version: 2, member: { id: 's-legacy-0', name: 'data', description: 'Dataset audit', provider: 'spawn', context: 'fresh', phase: 'active' } } },
          { type: 'team/member', data: { version: 2, member: { id: 's-legacy-1', name: 'researcher', description: 'Literature search', provider: 'spawn', context: 'fresh', phase: 'active' } } }
        ]
      })
    }
  }
  const items = [
    { id: 'task-3', title: '编码器脚手架', owner: 'builder', status: 'in_progress' },
    { id: 'task-4', title: '基准生成器', owner: 'designer', status: 'todo' }
  ]
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'research-team-roster-'))
  fs.mkdirSync(path.join(root, '.research', 'team'), { recursive: true })
  fs.writeFileSync(path.join(root, '.research', 'team', 'members.jsonl'), `${JSON.stringify({ id: 's-custom', name: 'elha-r-advisor' })}\n`)
  const roster = await teamRoster(ctx, 's-1', items, root)
  assert.equal(roster.length, 5)
  assert.equal(roster[0].name, 'lead')
  assert.equal(roster[0].role, 'lead')
  assert.equal(roster[0].status, 'running')
  assert.equal(roster[0].model, 'deepseek/deepseek-v4.1-flash')
  assert.equal(roster[0].effort, 'high')
  assert.deepEqual(roster[1], {
    id: 's-builder',
    name: 'builder',
    role: 'teammate',
    status: 'inactive',
    description: 'implementation',
    model: '',
    effort: '',
    modelSource: 'unknown',
    item: { id: 'task-3', title: '编码器脚手架', status: 'in_progress', updated: undefined, next: undefined }
  })
  assert.equal(roster[2].name, 'data')
  assert.equal(roster[2].legacy, true)
  assert.equal(roster[2].description, 'Dataset audit')
  assert.equal(roster[3].name, 'elha-r-advisor')
  assert.equal(roster[3].legacy, undefined)
  assert.equal(roster[3].description, 'custom teammate')
  assert.equal(roster[4].name, 'researcher')
  assert.equal(roster[4].legacy, true)
  assert.equal(roster[4].description, 'Literature search')
  assert.equal(roster.some((row) => row.name.includes('mnemom')), false)
  assert.equal(roster.some((row) => row.name.includes('/')), false)
  assert.equal((await teamRoster(ctx, 'missing', items)).length, 0)
  assert.equal((await teamRoster({}, 's-1', items)).length, 0)
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

test('architecture cards keep the group the project defines', () => {
  const root = makeRoot()
  const saved = saveArchitectureCard(root, {
    id: 'train-flow',
    title: '训练流程',
    description: '从数据到损失的每一步',
    group: '  训练  ',
    nodes: [{ id: 'data', label: '数据', kind: 'input', x: 40, y: 40 }, { id: 'loss', label: '损失', kind: 'loss', x: 240, y: 40 }],
    edges: [{ from: 'data', to: 'loss' }]
  })
  assert.equal(saved.group, '训练')
  const listed = listArchitectureCards(root)
  assert.equal(listed.find((card) => card.id === 'train-flow').group, '训练')

  const plain = saveArchitectureCard(root, {
    id: 'plain-flow',
    nodes: [{ id: 'one', label: '一步' }]
  })
  assert.equal(plain.group, '架构')

  const long = saveArchitectureCard(root, {
    id: 'long-group',
    group: 'x'.repeat(60),
    nodes: [{ id: 'one', label: '一步' }]
  })
  assert.equal(long.group.length, 24)
  assert.equal(long.group, 'x'.repeat(24))
})

test('the panel summarises work items and counts the finished ones', () => {
  const root = makeRoot()
  writePlan(root, { objective: 'test objective', milestone: 'M1', next: 'write the panel' })
  upsertItem(root, { id: 'alpha', title: 'Alpha', owner: 'lead', status: 'in_progress', next: 'do alpha' })
  upsertItem(root, { id: 'beta', title: 'Beta', owner: 'builder', status: 'blocked', blocked: 'waiting for the data sample' })
  upsertItem(root, { id: 'gamma', title: 'Gamma', owner: 'lead', status: 'done', by: 'user' })

  const state = buildPanelState(root)
  assert.equal(state.itemsTotal, 3)
  assert.equal(state.finishedItems, 1)
  const alpha = state.cards.find((entry) => entry.id === 'alpha')
  assert.equal(alpha.status, 'in_progress')
  assert.equal(alpha.next, 'do alpha')
  const beta = state.cards.find((entry) => entry.id === 'beta')
  assert.equal(beta.status, 'blocked')
  assert.match(beta.blocked, /data sample/)
  assert.equal(beta.checklistTotal, 0)
  assert.equal(state.cards.find((entry) => entry.id === 'gamma').status, 'done')
})


test('deliverables resolve to openable files and http links', () => {
  const root = makeRoot()
  fs.mkdirSync(path.join(root, 'reports'), { recursive: true })
  fs.writeFileSync(path.join(root, 'reports', 'e2.md'), '# E2 report\n')
  upsertItem(root, {
    id: 'e2',
    title: 'E2 report',
    owner: 'writer',
    status: 'todo',
    deliverables: [
      { label: 'E2 report', path: 'reports/e2.md' },
      { label: 'Missing', path: 'reports/missing.md' },
      { label: 'Upstream', url: 'https://example.org/paper' },
      { label: 'Escape', path: '../outside.md' }
    ]
  })
  const state = buildPanelState(root)
  const files = state.cards.find((entry) => entry.id === 'e2').deliverables
  assert.equal(files.length, 4)
  assert.equal(files[0].exists, true)
  assert.ok(files[0].url.startsWith('file://'))
  assert.equal(files[1].exists, false)
  assert.equal(files[1].url, '')
  assert.equal(files[2].kind, 'url')
  assert.equal(files[2].url, 'https://example.org/paper')
  assert.equal(files[3].exists, false)
  assert.equal(files[3].url, '')
})
