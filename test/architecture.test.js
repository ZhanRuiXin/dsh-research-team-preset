import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  buildPanelState,
  listArchitectureCards,
  normalizeArchitectureCard,
  readArchitectureCard,
  sanitizeCardId,
  saveArchitectureCard
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
  assert.equal(card.canvas.height, 240)
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
