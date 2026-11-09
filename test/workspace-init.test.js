/**
 * `research_workspace_init` is the only durable-tracking bootstrap the preset
 * tells a session to run, so two properties matter across sessions: the
 * scaffold appears once, and a second call never overwrites the record a
 * previous session left behind.
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
    const plan = fs.readFileSync(path.join(dir, 'worklog', 'PLAN.md'), 'utf8')
    assert.match(plan, /objective: settle the pilot question/)
    assert.ok(fs.existsSync(path.join(dir, 'worklog', 'INDEX.md')))
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('a second call reports the existing scaffold and never overwrites it', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-worklog-'))
  try {
    await initWorkspace(dir, 'first objective')
    const planPath = path.join(dir, 'worklog', 'PLAN.md')
    const indexPath = path.join(dir, 'worklog', 'INDEX.md')
    fs.writeFileSync(planPath, '# PLAN - edited by a later session\n', 'utf8')
    fs.writeFileSync(indexPath, '| id | title |\n', 'utf8')

    const second = await initWorkspace(dir, 'second objective')
    assert.deepEqual(second.created, [])
    assert.ok(second.notes.includes('worklog: PLAN.md and INDEX.md already present'))
    assert.equal(fs.readFileSync(planPath, 'utf8'), '# PLAN - edited by a later session\n')
    assert.equal(fs.readFileSync(indexPath, 'utf8'), '| id | title |\n')
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
