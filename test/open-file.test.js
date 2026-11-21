import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { deliveryNeedsNativeOpen, openProjectFile } from '../plugin/index.js'

function rootWith(name, body = 'x') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-open-file-'))
  fs.mkdirSync(path.join(root, 'reports'), { recursive: true })
  fs.writeFileSync(path.join(root, 'reports', name), body)
  return root
}

test('a delivered file opens through the default application', () => {
  const root = rootWith('paper.pdf')
  const calls = []
  const result = openProjectFile(root, 'reports/paper.pdf', (command, argv, options) => {
    calls.push({ command, argv, options })
    return { unref: () => calls.push('unref') }
  })
  assert.equal(result.ok, true)
  assert.equal(result.path, 'reports/paper.pdf')
  assert.equal(calls.length, 2)
  const call = calls[0]
  assert.equal(call.options.detached, true)
  assert.equal(call.options.stdio, 'ignore')
  assert.ok(call.argv[call.argv.length - 1].endsWith('paper.pdf'))
  if (process.platform === 'win32') {
    assert.match(path.basename(call.command), /^rundll32\.exe$/i)
    assert.equal(call.argv[0], 'url.dll,FileProtocolHandler')
  } else if (process.platform === 'darwin') {
    assert.equal(call.command, 'open')
  } else {
    assert.match(path.basename(call.command), /^(xdg-open|gio)$/)
  }
  assert.equal(calls[1], 'unref')
})

test('a path outside the project is refused before any spawn', () => {
  const root = rootWith('paper.pdf')
  const result = openProjectFile(root, '../secrets.txt', () => {
    throw new Error('must not spawn')
  })
  assert.equal(result.ok, false)
  assert.match(result.error, /inside the project/)
})

test('a missing file reports instead of opening', () => {
  const root = rootWith('paper.pdf')
  const result = openProjectFile(root, 'reports/missing.pdf', () => {
    throw new Error('must not spawn')
  })
  assert.equal(result.ok, false)
  assert.match(result.error, /not found/)
})

test('a directory is refused', () => {
  const root = rootWith('paper.pdf')
  const result = openProjectFile(root, 'reports', () => {
    throw new Error('must not spawn')
  })
  assert.equal(result.ok, false)
  assert.match(result.error, /not a file/)
})

test('binary deliverables go to the OS instead of a preview tab', () => {
  assert.equal(deliveryNeedsNativeOpen('reports/paper.pdf'), true)
  assert.equal(deliveryNeedsNativeOpen('reports/SLIDES.PPTX'), true)
  assert.equal(deliveryNeedsNativeOpen('reports/table.csv'), false)
  assert.equal(deliveryNeedsNativeOpen('notes.md'), false)
})
