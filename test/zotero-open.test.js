import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { isZoteroItemKey, openZoteroItem, zoteroItemUrl } from '../plugin/index.js'

test('the Zotero item URL is built from a validated key', () => {
  assert.equal(zoteroItemUrl('abcd1234'), 'zotero://select/library/items/ABCD1234')
  assert.equal(isZoteroItemKey('abcd1234'), true)
  assert.equal(isZoteroItemKey('ABCD12345'), false)
  assert.equal(isZoteroItemKey('abc'), false)
  assert.equal(isZoteroItemKey(''), false)
})

test('opening an item hands the fixed link to a detached system command', () => {
  const calls = []
  const result = openZoteroItem('abcd1234', (command, argv, options) => {
    calls.push({ command, argv, options })
    return { unref: () => calls.push('unref') }
  })
  assert.equal(result.ok, true)
  assert.equal(result.url, 'zotero://select/library/items/ABCD1234')
  assert.equal(calls.length, 2)
  const call = calls[0]
  assert.equal(call.options.detached, true)
  assert.equal(call.options.stdio, 'ignore')
  assert.equal(call.argv[call.argv.length - 1], 'zotero://select/library/items/ABCD1234')
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

test('a failing spawn reports the error instead of throwing', () => {
  const result = openZoteroItem('abcd1234', () => {
    throw new Error('no handler')
  })
  assert.equal(result.ok, false)
  assert.match(result.error, /no handler/)
})
