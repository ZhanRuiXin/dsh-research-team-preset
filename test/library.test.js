import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { createLibraryClient, itemKey, noteHtml, LibraryError, apply as applyLibrary } from '../plugin/library.js'

const SERVER = 'sPMHtLD6HHBd'

function jsonResponse(status, body, headers = {}) {
  const payload = body === undefined || status === 204 ? null : JSON.stringify(body)
  return new Response(payload, {
    status,
    headers: { 'content-type': 'application/json', 'zotero-server-id': SERVER, ...headers }
  })
}

function recorder(routes) {
  const calls = []
  const fetchImpl = async (url, init = {}) => {
    const pathname = new URL(url).pathname + new URL(url).search
    const key = `${init.method ?? 'GET'} ${pathname}`
    calls.push({ method: init.method ?? 'GET', pathname, headers: init.headers ?? {}, body: init.body })
    const route = routes[key]
    if (route === undefined) throw new Error(`unexpected request ${key}`)
    return typeof route === 'function' ? route(init) : route
  }
  return { calls, fetchImpl }
}

test('noteHtml escapes text, keeps paragraphs and lists', () => {
  assert.equal(noteHtml('Hello <x> & "y"'), '<p>Hello &lt;x&gt; &amp; &quot;y&quot;</p>')
  assert.equal(noteHtml('one\n\ntwo'), '<p>one</p><p>two</p>')
  assert.equal(noteHtml('- a\n- b'), '<ul><li>a</li><li>b</li></ul>')
  assert.equal(noteHtml('# Title'), '<h1>Title</h1>')
})

test('itemKey accepts keys, refs and URLs', () => {
  assert.equal(itemKey('ABCD1234'), 'ABCD1234')
  assert.equal(itemKey('zotero://user/0/item/ABCD1234'), 'ABCD1234')
  assert.equal(itemKey('http://zotero.org/users/0/items/ABCD1234'), 'ABCD1234')
  assert.equal(itemKey('nope'), '')
})

test('status reports the server id and library version from headers', async () => {
  const { fetchImpl } = recorder({
    'GET /api/users/0/items?limit=1': jsonResponse(200, [], {
      'zotero-api-version': '3',
      'zotero-schema-version': '44',
      'last-modified-version': '3009',
      'total-results': '545'
    })
  })
  const client = createLibraryClient({ fetch: fetchImpl })
  const state = await client.status()
  assert.equal(state.reachable, true)
  assert.equal(state.serverId, SERVER)
  assert.equal(state.apiVersion, '3')
  assert.equal(state.lastModifiedVersion, 3009)
  assert.equal(state.totalResults, 545)
})

test('create authorizes with the server id and posts the item array', async () => {
  const { calls, fetchImpl } = recorder({
    'GET /api/users/0/items?limit=1': jsonResponse(200, []),
    'POST /api/local/authorize': jsonResponse(200, { key: 'KEY1', remember: false }),
    'POST /api/users/0/items': jsonResponse(200, { successful: { 0: { key: 'NEWKEY01', version: 17 } }, failed: {} })
  })
  const client = createLibraryClient({ fetch: fetchImpl })
  const created = await client.create({ itemType: 'journalArticle', title: 'A paper' })
  assert.deepEqual(created, { key: 'NEWKEY01', version: 17 })
  const auth = calls.find((call) => call.pathname === '/api/local/authorize')
  assert.equal(auth.headers['Zotero-Server-ID'], SERVER)
  assert.deepEqual(JSON.parse(auth.body), { appName: 'DSH research preset' })
  const post = calls.find((call) => call.method === 'POST' && call.pathname === '/api/users/0/items')
  assert.equal(post.headers['Zotero-API-Key'], 'KEY1')
  assert.equal(post.headers['Zotero-Server-ID'], SERVER)
  assert.deepEqual(JSON.parse(post.body), [{ itemType: 'journalArticle', title: 'A paper' }])
})

test('A single-use key consumed by a 401 is replaced once', async () => {
  let writeCount = 0
  const { calls, fetchImpl } = recorder({
    'GET /api/users/0/items?limit=1': jsonResponse(200, []),
    'POST /api/local/authorize': () => jsonResponse(200, { key: `KEY${writeCount + 1}`, remember: false }),
    'POST /api/users/0/items': () => {
      writeCount += 1
      return writeCount === 1
        ? jsonResponse(401, { error: 'key consumed' })
        : jsonResponse(200, { successful: { 0: { key: 'NEWKEY01', version: 2 } }, failed: {} })
    }
  })
  const client = createLibraryClient({ fetch: fetchImpl })
  const created = await client.create({ itemType: 'note', note: '<p>x</p>' })
  assert.equal(created.key, 'NEWKEY01')
  assert.equal(calls.filter((call) => call.pathname === '/api/local/authorize').length, 2)
  assert.equal(writeCount, 2)
})

test('tags read, merge and patch under the item version', async () => {
  const { calls, fetchImpl } = recorder({
    'GET /api/users/0/items/ABCD1234': jsonResponse(200, { key: 'ABCD1234', version: 5, data: { key: 'ABCD1234', version: 5, itemType: 'journalArticle', tags: [{ tag: 'old' }] } }),
    'GET /api/users/0/items?limit=1': jsonResponse(200, []),
    'POST /api/local/authorize': jsonResponse(200, { key: 'KEY1', remember: false }),
    'PATCH /api/users/0/items/ABCD1234': jsonResponse(204, undefined, { 'last-modified-version': '6' })
  })
  const client = createLibraryClient({ fetch: fetchImpl })
  const result = await client.tags('ABCD1234', ['new'], ['old'])
  assert.equal(result.changed, true)
  assert.deepEqual(result.tags, ['new'])
  const patch = calls.find((call) => call.method === 'PATCH')
  assert.deepEqual(JSON.parse(patch.body), { tags: [{ tag: 'new' }] })
  assert.equal(patch.headers['If-Unmodified-Since-Version'], '5')
})

test('a denied authorization surfaces as LIBRARY_DENIED', async () => {
  const { fetchImpl } = recorder({
    'GET /api/users/0/items?limit=1': jsonResponse(200, []),
    'POST /api/local/authorize': jsonResponse(403, { denied: true })
  })
  const client = createLibraryClient({ fetch: fetchImpl })
  await assert.rejects(
    () => client.create({ itemType: 'note', note: '<p>x</p>' }),
    (error) => error instanceof LibraryError && error.code === 'LIBRARY_DENIED'
  )
})

test('dryRun create performs no network request and writes no log', async () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'research-library-'))
  let registered = null
  const ctx = {
    tools: {
      register(definition) {
        registered = definition
        return () => {}
      }
    }
  }
  applyLibrary(ctx)
  const result = await registered.execute(
    { op: 'create', dryRun: true, data: { itemType: 'journalArticle', title: 'A paper' } },
    { agent: { session: { id: 's1', header: { cwd } } } }
  )
  assert.equal(result.dryRun, true)
  assert.equal(fs.existsSync(path.join(cwd, '.research', 'library-log.jsonl')), false)
})

