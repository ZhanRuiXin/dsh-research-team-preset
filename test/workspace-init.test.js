/**
 * `research_workspace_init` is the only durable-tracking bootstrap the preset
 * tells a session to run, so two properties matter across sessions: the
 * scaffold appears once, and a second call never overwrites the stored record.
 *
 * The stored record is `.research/worklog/plan.json`; `worklog/PLAN.md` and
 * `worklog/INDEX.md` are generated views, so they may be rewritten at any time.
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const { initWorkspace } = await import('../plugin/index.js')

test('initWorkspace creates the worklog scaffold and seeds the objective', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-worklog-'))
  try {
    const result = await initWorkspace(dir, 'settle the pilot question')
    assert.ok(result.created.includes('worklog/PLAN.md'), `created: ${result.created.join(', ')}`)
    assert.ok(result.created.includes('worklog/INDEX.md'), `created: ${result.created.join(', ')}`)
    assert.ok(fs.existsSync(path.join(dir, '.research', 'worklog', 'plan.json')))
    const plan = fs.readFileSync(path.join(dir, 'worklog', 'PLAN.md'), 'utf8')
    assert.match(plan, /objective: settle the pilot question/)
    assert.ok(fs.existsSync(path.join(dir, 'worklog', 'INDEX.md')))
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('a second call keeps the stored plan and does not reset it', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-worklog-'))
  try {
    await initWorkspace(dir, 'first objective')
    const planFile = path.join(dir, '.research', 'worklog', 'plan.json')
    const before = fs.readFileSync(planFile, 'utf8')

    const second = await initWorkspace(dir, 'second objective')
    assert.deepEqual(second.created, [])
    assert.ok(second.notes.includes('worklog: PLAN.md and INDEX.md already present'))
    assert.equal(fs.readFileSync(planFile, 'utf8'), before)
    assert.match(fs.readFileSync(path.join(dir, 'worklog', 'PLAN.md'), 'utf8'), /objective: first objective/)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('initWorkspace imports a legacy markdown worklog once', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-worklog-'))
  try {
    fs.mkdirSync(path.join(dir, 'worklog'), { recursive: true })
    fs.writeFileSync(path.join(dir, 'worklog', 'PLAN.md'), '# PLAN\n\n- objective: legacy goal\n- milestone: M1\n- next: write the gate\n', 'utf8')
    fs.writeFileSync(
      path.join(dir, 'worklog', 'INDEX.md'),
      '| id | title | owner | status | updated | next |\n| --- | --- | --- | --- | --- | --- |\n| t-abc | gate one | lead | in_progress | 2026-11-01 | finish it |\n',
      'utf8'
    )

    const result = await initWorkspace(dir, 'ignored')
    assert.ok(result.created.includes('worklog/PLAN.md'))
    const items = fs.readdirSync(path.join(dir, '.research', 'worklog', 'items'))
    assert.deepEqual(items, ['t-abc.json'])
    const item = JSON.parse(fs.readFileSync(path.join(dir, '.research', 'worklog', 'items', 't-abc.json'), 'utf8'))
    assert.equal(item.owner, 'lead')
    assert.equal(item.kind, 'gated')
    assert.match(fs.readFileSync(path.join(dir, 'worklog', 'PLAN.md'), 'utf8'), /objective: legacy goal/)
    assert.ok(fs.existsSync(path.join(dir, '.research', 'worklog', 'legacy', 'INDEX.md')))
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
