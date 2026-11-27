import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  GRANT_RECORD,
  configureLibraryStore,
  createLibraryClient,
  itemKey,
  libraryClient,
  noteHtml,
  LibraryError,
  apply as applyLibrary
} from '../plugin/library.js'

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
    const exact = routes[key]
    if (exact !== undefined) return typeof exact === 'function' ? exact(init) : exact
    const pattern = Object.keys(routes).find((candidate) => candidate.startsWith('~') && new RegExp(candidate.slice(1)).test(key))
    if (pattern === undefined) throw new Error(`unexpected request ${key}`)
    const matched = routes[pattern]
    return typeof matched === 'function' ? matched(init) : matched
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
  assert.equal(state.keyCached, false)
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

function fakeCredentials(initial = {}) {
  const records = new Map(Object.entries(initial))
  return {
    records,
    async readRecord(key) {
      return records.get(key)
    },
    async modifyRecord(key, mutate) {
      const current = records.get(key)
      const next = await mutate(current)
      if (next === undefined) return current
      records.set(key, next)
      return next
    }
  }
}

test('a grant stored in the host credentials service is reused by the next client', async () => {
  const credentials = fakeCredentials()
  let authorized = 0
  const routes = {
    'GET /api/users/0/items?limit=1': () => jsonResponse(200, []),
    'POST /api/local/authorize': () => {
      authorized += 1
      return jsonResponse(200, { key: 'KEY1', remember: true })
    },
    'POST /api/users/0/items': () => jsonResponse(200, { successful: { 0: { key: 'NEWKEY01', version: 2 } }, failed: {} })
  }
  const first = createLibraryClient({ fetch: recorder(routes).fetchImpl, keyFile: false, credentials })
  await first.create({ itemType: 'note', note: '<p>a</p>' })
  const record = credentials.records.get(GRANT_RECORD)
  assert.equal(record.kind, 'grant')
  assert.equal(record.payload.key, 'KEY1')
  assert.equal(record.payload.serverId, SERVER)
  assert.equal(record.payload.appName, 'DSH research preset')
  const secondCalls = recorder(routes)
  const second = createLibraryClient({ fetch: secondCalls.fetchImpl, keyFile: false, credentials })
  await second.create({ itemType: 'note', note: '<p>b</p>' })
  assert.equal(authorized, 1)
  const post = secondCalls.calls.find((call) => call.method === 'POST' && call.pathname === '/api/users/0/items')
  assert.equal(post.headers['Zotero-API-Key'], 'KEY1')
  const status = await second.status()
  assert.equal(status.keyCached, true)
  assert.equal(status.keyStore, 'credentials')
})

test('a rejected stored grant is tombstoned before a new authorization', async () => {
  const credentials = fakeCredentials({ [GRANT_RECORD]: { kind: 'grant', payload: { key: 'STALE', serverId: SERVER } } })
  let authorized = 0
  const { fetchImpl } = recorder({
    'GET /api/users/0/items?limit=1': jsonResponse(200, []),
    'POST /api/local/authorize': () => {
      authorized += 1
      return jsonResponse(200, { key: 'FRESH', remember: true })
    },
    'POST /api/users/0/items': (init) =>
      init.headers['Zotero-API-Key'] === 'FRESH'
        ? jsonResponse(200, { successful: { 0: { key: 'NEWKEY02', version: 2 } }, failed: {} })
        : jsonResponse(401, { error: 'API key required' })
  })
  const client = createLibraryClient({ fetch: fetchImpl, keyFile: false, credentials })
  await client.create({ itemType: 'note', note: '<p>c</p>' })
  assert.equal(authorized, 1)
  assert.equal(credentials.records.get(GRANT_RECORD).payload.key, 'FRESH')
})

test('the credentials service is picked up even when it mounts after apply', async () => {
  const credentials = fakeCredentials()
  let service
  configureLibraryStore({ ctx: { get: (name) => (name === 'credentials' ? service : undefined) } })
  try {
    service = credentials
    const { fetchImpl } = recorder({
      'GET /api/users/0/items?limit=1': jsonResponse(200, []),
      'POST /api/local/authorize': () => jsonResponse(200, { key: 'LAZY', remember: true }),
      'POST /api/users/0/items': () => jsonResponse(200, { successful: { 0: { key: 'NEWKEY03', version: 2 } }, failed: {} })
    })
    const client = createLibraryClient({ fetch: fetchImpl, keyFile: false })
    await client.create({ itemType: 'note', note: '<p>d</p>' })
    assert.equal(credentials.records.get(GRANT_RECORD).payload.key, 'LAZY')
  } finally {
    configureLibraryStore({})
  }
})

test('a remembered key is reused by the next client instead of asking again', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-zotero-key-'))
  const keyFile = path.join(dir, 'key.json')
  let authorized = 0
  const routes = {
    'GET /api/users/0/items?limit=1': () => jsonResponse(200, []),
    'POST /api/local/authorize': () => {
      authorized += 1
      return jsonResponse(200, { key: 'KEY1', remember: true })
    },
    'POST /api/users/0/items': () => jsonResponse(200, { successful: { 0: { key: 'NEWKEY01', version: 2 } }, failed: {} })
  }
  const first = createLibraryClient({ fetch: recorder(routes).fetchImpl, keyFile })
  await first.create({ itemType: 'note', note: '<p>a</p>' })
  const secondCalls = recorder(routes)
  const second = createLibraryClient({ fetch: secondCalls.fetchImpl, keyFile })
  await second.create({ itemType: 'note', note: '<p>b</p>' })
  assert.equal(authorized, 1)
  const post = secondCalls.calls.find((call) => call.method === 'POST' && call.pathname === '/api/users/0/items')
  assert.equal(post.headers['Zotero-API-Key'], 'KEY1')
})

test('a rejected stored key is replaced and the new key is stored', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-zotero-key-'))
  const keyFile = path.join(dir, 'key.json')
  fs.writeFileSync(keyFile, JSON.stringify({ baseUrl: 'http://127.0.0.1:23119/api', serverId: SERVER, key: 'STALE' }))
  let authorized = 0
  const { fetchImpl } = recorder({
    'GET /api/users/0/items?limit=1': jsonResponse(200, []),
    'POST /api/local/authorize': () => {
      authorized += 1
      return jsonResponse(200, { key: 'FRESH', remember: true })
    },
    'POST /api/users/0/items': (init) =>
      init.headers['Zotero-API-Key'] === 'FRESH'
        ? jsonResponse(200, { successful: { 0: { key: 'NEWKEY01', version: 2 } }, failed: {} })
        : jsonResponse(401, { error: 'stale key' })
  })
  const client = createLibraryClient({ fetch: fetchImpl, keyFile })
  const created = await client.create({ itemType: 'note', note: '<p>x</p>' })
  assert.equal(created.key, 'NEWKEY01')
  assert.equal(authorized, 1)
  assert.equal(JSON.parse(fs.readFileSync(keyFile, 'utf8')).key, 'FRESH')
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


test('search sends pagination and scope parameters', async () => {
  const { fetchImpl } = recorder({
    'GET /api/users/0/items?limit=25&start=50&q=vesicle&tag=todo&collection=COLL0001&qmode=titleCreatorYear&sort=dateModified': jsonResponse(
      200,
      [{ key: 'ABCD1234', data: { itemType: 'journalArticle', title: 'A paper', DOI: '10.1/x' } }],
      { 'total-results': '7' }
    )
  })
  const client = createLibraryClient({ fetch: fetchImpl })
  const result = await client.search('vesicle', {
    limit: 25,
    offset: 50,
    tag: 'todo',
    collection: 'COLL0001',
    qmode: 'titleCreatorYear',
    sort: 'dateModified'
  })
  assert.equal(result.total, 7)
  assert.equal(result.offset, 50)
  assert.equal(result.items.length, 1)
  assert.equal(result.items[0].doi, '10.1/x')
})

test('export asks for a bibliography format for the given keys', async () => {
  const { calls, fetchImpl } = recorder({
    'GET /api/users/0/items?format=bibtex&itemkey=ABCD1234': new Response('@article{ABCD1234, title={A paper}}', {
      status: 200,
      headers: { 'content-type': 'application/x-bibtex', 'zotero-server-id': SERVER }
    })
  })
  const client = createLibraryClient({ fetch: fetchImpl })
  const result = await client.export(['ABCD1234'], 'bibtex')
  assert.equal(result.format, 'bibtex')
  assert.match(result.text, /@article\{ABCD1234/)
  assert.equal(calls[0].pathname, '/api/users/0/items?format=bibtex&itemkey=ABCD1234')
})

test('attach uploads a stored file through the three-phase flow', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'research-attach-'))
  const file = path.join(dir, 'paper.pdf')
  fs.writeFileSync(file, 'PDFDATA')
  const md5 = createHash('md5').update('PDFDATA').digest('hex')
  const { calls, fetchImpl } = recorder({
    'GET /api/users/0/items?limit=1': () => jsonResponse(200, []),
    'POST /api/local/authorize': () => jsonResponse(200, { key: 'KEY1', remember: false }),
    'POST /api/users/0/items': jsonResponse(200, { successful: { 0: { key: 'ATTACH01', version: 9 } }, failed: {} }),
    '~^POST /api/users/0/items/ATTACH01/file\\?md5=': jsonResponse(200, {
      url: '/api/local/uploads/UP1',
      uploadKey: 'UP1',
      contentType: 'application/pdf'
    }),
    'POST /api/local/uploads/UP1': jsonResponse(201, undefined),
    '~^POST /api/users/0/items/ATTACH01/file\\?upload=UP1$': jsonResponse(204, undefined, { 'last-modified-version': '10' })
  })
  const client = createLibraryClient({ fetch: fetchImpl })
  const attached = await client.attach('ABCD1234', file)
  assert.equal(attached.key, 'ATTACH01')
  assert.equal(attached.uploaded, true)
  assert.equal(attached.bytes, 7)
  assert.equal(attached.version, 10)
  const opened = calls.find((call) => call.pathname.includes('md5='))
  assert.match(opened.pathname, new RegExp(`md5=${md5}`))
  assert.match(opened.pathname, /filename=paper\.pdf/)
  assert.match(opened.pathname, /filesize=7/)
  const upload = calls.find((call) => call.pathname === '/api/local/uploads/UP1')
  assert.equal(String(upload.body), 'PDFDATA')
  assert.equal(upload.headers['Content-Type'], 'application/pdf')
  const created = JSON.parse(calls.find((call) => call.method === 'POST' && call.pathname === '/api/users/0/items').body)
  assert.equal(created[0].itemType, 'attachment')
  assert.equal(created[0].parentItem, 'ABCD1234')
  assert.equal(created[0].linkMode, 'imported_file')
})

test('annotations keeps only annotation children', async () => {
  const { fetchImpl } = recorder({
    'GET /api/users/0/items/ABCD1234/children': jsonResponse(200, [
      { key: 'ANNO0001', data: { itemType: 'annotation', annotationType: 'highlight', annotationText: 'quoted', annotationComment: 'why', annotationColor: '#ffd400', annotationPageLabel: '12' } },
      { key: 'NOTE0001', data: { itemType: 'note', note: '<p>x</p>' } }
    ])
  })
  const client = createLibraryClient({ fetch: fetchImpl })
  const list = await client.annotations('ABCD1234')
  assert.equal(list.length, 1)
  assert.equal(list[0].type, 'highlight')
  assert.equal(list[0].text, 'quoted')
  assert.equal(list[0].comment, 'why')
  assert.equal(list[0].pageLabel, '12')
})

test('fulltext returns the indexed text of an attachment', async () => {
  const { fetchImpl } = recorder({
    'GET /api/users/0/items/ATTACH01/fulltext': jsonResponse(200, { content: 'body text', indexedChars: 9 })
  })
  const client = createLibraryClient({ fetch: fetchImpl })
  const text = await client.fulltext('ATTACH01')
  assert.equal(text.content, 'body text')
  assert.equal(text.indexedChars, 9)
})

test('a destructive op refuses to run without confirm', async () => {
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
  const refused = await registered.execute(
    { op: 'delete', ref: 'ABCD1234' },
    { agent: { session: { id: 's1', header: { cwd: os.tmpdir() } } } }
  )
  assert.match(refused.error, /LIBRARY_UNCONFIRMED/)
  const noteRefused = await registered.execute(
    { op: 'noteDelete', ref: 'NOTE0001' },
    { agent: { session: { id: 's1', header: { cwd: os.tmpdir() } } } }
  )
  assert.match(noteRefused.error, /LIBRARY_UNCONFIRMED/)
})

test('parallel writes share one authorization and one key file', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-key-'))
  const file = path.join(root, 'zotero-key.json')
  let authorized = 0
  const { calls, fetchImpl } = recorder({
    'GET /api/users/0/items?limit=1': () => jsonResponse(200, []),
    'POST /api/local/authorize': async () => {
      authorized += 1
      await new Promise((resolve) => setTimeout(resolve, 10))
      return jsonResponse(200, { key: 'KEY-SHARED', remember: true })
    },
    'POST /api/users/0/items': () => jsonResponse(200, { successful: { 0: { key: 'PARALLEL' } }, failed: {} })
  })
  const client = createLibraryClient({ fetch: fetchImpl, keyFile: file })
  await Promise.all([
    client.create({ itemType: 'note', note: 'a' }),
    client.create({ itemType: 'note', note: 'b' })
  ])
  assert.equal(authorized, 1)
  assert.equal(calls.filter((call) => call.method === 'POST' && call.pathname === '/api/users/0/items').length, 2)
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).key, 'KEY-SHARED')
})

test('a client reuses a key another instance stored while it was idle', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-key-'))
  const file = path.join(root, 'zotero-key.json')
  let authorized = 0
  const { fetchImpl } = recorder({
    'GET /api/users/0/items?limit=1': () => jsonResponse(200, []),
    'POST /api/local/authorize': () => {
      authorized += 1
      return jsonResponse(200, { key: 'KEY-A', remember: true })
    },
    'POST /api/users/0/items': () => jsonResponse(200, { successful: { 0: { key: 'NEW' } }, failed: {} })
  })
  const early = createLibraryClient({ fetch: fetchImpl, keyFile: file })
  const late = createLibraryClient({ fetch: fetchImpl, keyFile: file })
  await early.create({ itemType: 'note', note: 'x' })
  await late.create({ itemType: 'note', note: 'y' })
  assert.equal(authorized, 1)
})

test('libraryClient shares one client per base url and key file', () => {
  const options = { keyFile: false, fetch: () => Promise.resolve(jsonResponse(200, [])) }
  assert.equal(libraryClient(options), libraryClient(options))
})

test('a key without an explicit remember flag is cached', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-zotero-key-'))
  const keyFile = path.join(dir, 'key.json')
  const { fetchImpl } = recorder({
    'GET /api/users/0/items?limit=1': () => jsonResponse(200, []),
    'POST /api/local/authorize': () => jsonResponse(200, { key: 'KEY-OMITTED' }),
    'POST /api/users/0/items': () => jsonResponse(200, { successful: { 0: { key: 'NEWKEY01' } }, failed: {} })
  })
  const client = createLibraryClient({ fetch: fetchImpl, keyFile })
  await client.create({ itemType: 'note', note: '<p>x</p>' })
  assert.equal(JSON.parse(fs.readFileSync(keyFile, 'utf8')).key, 'KEY-OMITTED')
})
