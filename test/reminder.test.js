import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { apply, buildReminder, REMINDER_CONTEXT, REMINDER_ORDER } from '../plugin/reminder.js'
import { upsertItem, writePlan } from '../plugin/worklog.js'

function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-reminder-'))
  fs.mkdirSync(path.join(root, '.research', 'architecture'), { recursive: true })
  return root
}

function card(root, name, value) {
  fs.writeFileSync(path.join(root, '.research', 'architecture', name), JSON.stringify(value))
}

function run(root, id, value) {
  const dir = path.join(root, '.research', 'runs', id)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(value))
}

test('the reminder lists open items, live cards and unfinished runs', () => {
  const root = project()
  writePlan(root, { objective: 'Ship the calibration study', milestone: 'pilot' })
  upsertItem(root, { id: 'fix-bug', title: 'Fix the loader', status: 'in_progress', owner: 'builder', kind: 'internal' })
  upsertItem(root, { id: 'blocked-run', title: 'Run the sweep', status: 'blocked', blocked: 'waiting on data', owner: 'runner' })
  upsertItem(root, { id: 'finished', title: 'Old thing', status: 'done' })
  card(root, 'm1.json', { id: 'm1', title: 'Method overview', group: '方法', version: 3, archived: false })
  card(root, 'm2.json', { id: 'm2', title: 'Retired', group: '方法', version: 1, archived: true })
  run(root, 'run-a', { state: 'running' })
  run(root, 'run-b', { state: 'completed' })
  const text = buildReminder(root)
  assert.match(text, /Research ledger reminder/)
  assert.match(text, /Ship the calibration study/)
  assert.match(text, /fix-bug Fix the loader \(in_progress, builder\)/)
  assert.match(text, /blocked-run .*waiting on data/)
  assert.match(text, /Method overview/)
  assert.match(text, /run-a running/)
  assert.doesNotMatch(text, /Old thing/)
  assert.doesNotMatch(text, /Retired/)
  assert.doesNotMatch(text, /run-b/)
})

test('a project without a ledger has no reminder', () => {
  const root = project()
  assert.equal(buildReminder(root), '')
})

test('the context resolves the project from the assembling agent', () => {
  const root = project()
  writePlan(root, { objective: 'Enough' })
  const entries = []
  const ctx = {
    get: () => undefined,
    inject: (names, register) => register({ systemPrompt: { context: (entry) => entries.push(entry) } })
  }
  apply(ctx)
  assert.equal(entries.length, 1)
  assert.equal(entries[0].name, REMINDER_CONTEXT)
  assert.equal(entries[0].order, REMINDER_ORDER)
  const text = entries[0].text({ agent: { session: { header: { cwd: root } } } })
  assert.match(text, /Enough/)
  assert.equal(entries[0].text({}), '')
})
