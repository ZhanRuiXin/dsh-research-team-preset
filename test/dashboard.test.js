import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { buildDashboardState, dashboardProject } from '../plugin/index.js'
import { saveArchitectureCard, setArchitectureArchived } from '../plugin/index.js'
import { upsertItem, writePlan } from '../plugin/worklog.js'

function sandbox() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'research-team-dashboard-'))
}

test('dashboardProject summarises one project and buildDashboardState lists every workspace', async () => {
  const base = sandbox()
  const alpha = path.join(base, 'alpha')
  const beta = path.join(base, 'beta')
  fs.mkdirSync(alpha, { recursive: true })
  fs.mkdirSync(beta, { recursive: true })

  writePlan(alpha, { objective: 'Anchor waveform events', milestone: 'M5', next: 'freeze v1.6' })
  const saved = upsertItem(alpha, {
    id: 't-alpha-one',
    title: 'Review the literature',
    owner: 'lead',
    status: 'in_review',
    kind: 'gated'
  })
  assert.equal(saved.error, undefined)

  const runDir = path.join(alpha, 'runs', 'exp-alpha')
  fs.mkdirSync(runDir, { recursive: true })
  fs.writeFileSync(path.join(runDir, 'manifest.json'), JSON.stringify({
    startedAt: '2026-11-12T01:00:00.000Z',
    seeds: '42',
    budget: '2h',
    state: 'running'
  }), 'utf8')

  const card = saveArchitectureCard(alpha, {
    id: 'method',
    title: 'Method',
    kind: 'method',
    canvas: { width: 520, height: 300 },
    nodes: [{ id: 'n1', label: 'input', kind: 'input', x: 20, y: 20 }],
    edges: []
  })
  assert.equal(card.error, undefined)
  const archived = setArchitectureArchived(alpha, 'method', true)
  assert.equal(archived.error, undefined)

  const project = dashboardProject(alpha, { id: 'ws-alpha', title: 'Alpha', path: alpha })
  assert.equal(project.initialized, true)
  assert.equal(project.title, 'Alpha')
  assert.equal(project.objective, 'Anchor waveform events')
  assert.equal(project.milestone, 'M5')
  assert.equal(project.counts.in_review, 1)
  assert.equal(project.inReview.length, 1)
  assert.equal(project.inReview[0].id, 't-alpha-one')
  assert.equal(project.experiments.running, 1)
  assert.equal(project.experiments.total, 1)
  assert.equal(project.architectures.total, 1)
  assert.equal(project.architectures.archived, 1)
  assert.notEqual(project.updated, '')

  const state = await buildDashboardState({
    workspaceRegistry: {
      list: () => [
        { id: 'ws-alpha', title: 'Alpha', path: alpha },
        { id: 'ws-beta', title: 'Beta', path: beta }
      ]
    }
  })
  assert.equal(state.projects.length, 2)
  const names = state.projects.map((entry) => entry.title).sort()
  assert.deepEqual(names, ['Alpha', 'Beta'])
  const empty = state.projects.find((entry) => entry.title === 'Beta')
  assert.equal(empty.initialized, false)
  assert.equal(empty.counts.todo, 0)
  fs.rmSync(base, { recursive: true, force: true })
})

test('buildDashboardState tolerates a missing registry and unreadable projects', async () => {
  assert.deepEqual(await buildDashboardState({}), { projects: [] })
  const state = await buildDashboardState({
    workspaceRegistry: {
      list: () => [{ id: 'broken', title: 'Broken', path: path.join(os.tmpdir(), 'research-team-missing-xyz') }]
    }
  })
  assert.equal(state.projects.length, 1)
  assert.equal(state.projects[0].initialized, false)
})
