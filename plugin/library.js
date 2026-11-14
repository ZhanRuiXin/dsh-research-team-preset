/**
 * Zotero local-API library module.
 *
 * Reads are unauthenticated. Writes (Zotero 10+) need a local API key from
 * POST /api/local/authorize, which Zotero surfaces as a dialog the user
 * confirms once ("Always Allow" makes the key reusable). The protocol follows
 * Zotero's Local API and Write Requests documentation:
 *
 * - Zotero-Server-ID is required on every write (428 without it, 412 when the
 *   cached id belongs to another instance);
 * - single-use keys are consumed by the first write, so 401 means authorize
 *   again and the same request is replayed once;
 * - PATCH replaces tags and collections arrays wholesale, so those operations
 *   read the item, merge, and write back under the item version precondition.
 *
 * Every write is appended to `<project>/.research/library-log.jsonl` by the
 * tool layer, and nothing in this module deletes objects.
 */

import fs from 'node:fs'
import path from 'node:path'

const BASE_URL = 'http://127.0.0.1:23119/api'
const LIBRARY_PATH = '/users/0'
const APP_NAME = 'DSH research preset'
const REQUEST_TIMEOUT_MS = 15000

export class LibraryError extends Error {
  constructor(code, message, status) {
    super(message)
    this.name = 'LibraryError'
    this.code = code
    this.status = status
  }
}

/** Accept an 8-character Zotero key, an item URL, or a zotero:// ref. */
export function itemKey(ref) {
  if (typeof ref !== 'string') return ''
  const trimmed = ref.trim()
  const match = /([A-Z0-9]{8})(?:[/?#]|$)/.exec(trimmed.toUpperCase())
  if (match !== null) return match[1]
  return /^[A-Z0-9]{8}$/.test(trimmed.toUpperCase()) ? trimmed.toUpperCase() : ''
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Turn plain markdown-ish text into the HTML Zotero stores for notes. */
export function noteHtml(markdown) {
  if (typeof markdown !== 'string' || markdown.trim().length === 0) {
    throw new LibraryError('LIBRARY_INVALID', 'op=note needs markdown text.')
  }
  const blocks = markdown.replace(/\r\n?/g, '\n').split(/\n{2,}/)
  const html = blocks.map((block) => {
    const lines = block.split('\n').map((line) => line.trim()).filter((line) => line.length > 0)
    if (lines.length === 0) return ''
    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      const items = lines.map((line) => `<li>${escapeHtml(line.replace(/^[-*]\s+/, ''))}</li>`).join('')
      return `<ul>${items}</ul>`
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(lines[0])
    if (heading !== null && lines.length === 1) {
      const level = heading[1].length
      return `<h${level}>${escapeHtml(heading[2])}</h${level}>`
    }
    return `<p>${lines.map(escapeHtml).join('<br/>')}</p>`
  })
  const body = html.filter((part) => part.length > 0).join('')
  return body.length > 0 ? body : '<p></p>'
}

function trimText(text, limit) {
  const value = typeof text === 'string' ? text.trim() : ''
  return value.length > limit ? `${value.slice(0, limit)}...` : value
}

function compactItem(object) {
  const data = object?.data ?? object ?? {}
  const creators = Array.isArray(data.creators) ? data.creators : []
  const names = creators
    .map((creator) => (typeof creator?.lastName === 'string' ? creator.lastName : typeof creator?.name === 'string' ? creator.name : ''))
    .filter((name) => name.length > 0)
  return {
    key: typeof object?.key === 'string' ? object.key : typeof data.key === 'string' ? data.key : '',
    version: typeof object?.version === 'number' ? object.version : typeof data.version === 'number' ? data.version : 0,
    itemType: typeof data.itemType === 'string' ? data.itemType : '',
    title: typeof data.title === 'string' ? data.title : '',
    creators: names.join(', '),
    date: typeof data.date === 'string' ? data.date : '',
    doi: typeof data.DOI === 'string' ? data.DOI : '',
    tags: Array.isArray(data.tags) ? data.tags.map((tag) => tag?.tag ?? '').filter((tag) => tag.length > 0) : [],
    collections: Array.isArray(data.collections) ? data.collections : []
  }
}

function collectionName(entry) {
  return typeof entry?.data?.name === 'string' ? entry.data.name : typeof entry?.name === 'string' ? entry.name : ''
}

export function createLibraryClient(options = {}) {
  const baseUrl = (typeof options.baseUrl === 'string' ? options.baseUrl : BASE_URL).replace(/\/+$/, '')
  const fetchImpl = options.fetch ?? globalThis.fetch
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS
  if (typeof fetchImpl !== 'function') {
    throw new LibraryError('LIBRARY_UNAVAILABLE', 'This runtime has no fetch; Zotero local API access needs Node 22 or newer.')
  }
  let remembered = null

  async function send(method, pathname, { headers = {}, body } = {}) {
    let response
    try {
      response = await fetchImpl(`${baseUrl}${pathname}`, {
        method,
        headers,
        body,
        signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
          ? AbortSignal.timeout(timeoutMs)
          : undefined
      })
    } catch (error) {
      throw new LibraryError(
        'LIBRARY_UNAVAILABLE',
        `Zotero's local API is not reachable at ${baseUrl}: ${error?.message ?? error}. ` +
          'Start Zotero and enable Settings > Advanced > "Allow other applications on this computer to communicate with Zotero".'
      )
    }
    const text = typeof response.text === 'function' ? await response.text().catch(() => '') : ''
    let json = null
    if (text.length > 0) {
      try {
        json = JSON.parse(text)
      } catch {
        json = null
      }
    }
    return { response, text, json }
  }

  function statusOf(response) {
    return typeof response?.status === 'number' ? response.status : 0
  }

  function failure(prefix, response, text) {
    const detail = trimText(text, 300)
    return detail.length > 0 ? `${prefix} (${statusOf(response)}): ${detail}` : `${prefix} (${statusOf(response)})`
  }

  async function serverId() {
    const { response, text } = await send('GET', `${LIBRARY_PATH}/items?limit=1`)
    if (statusOf(response) === 403) {
      throw new LibraryError('LIBRARY_DISABLED', 'Zotero refused the local API. Enable Settings > Advanced > "Allow other applications on this computer to communicate with Zotero".', 403)
    }
    if (!response.ok) throw new LibraryError('LIBRARY_UNAVAILABLE', failure('Zotero answered', response, text), statusOf(response))
    const id = typeof response.headers?.get === 'function' ? response.headers.get('zotero-server-id') : null
    if (typeof id !== 'string' || id.length === 0) {
      throw new LibraryError('LIBRARY_OLD', 'Zotero did not return a Zotero-Server-ID header; local API writes need Zotero 10 or newer.')
    }
    return id
  }

  async function authorize(id) {
    const { response, json, text } = await send('POST', '/local/authorize', {
      headers: { 'Content-Type': 'application/json', 'Zotero-Server-ID': id },
      body: JSON.stringify({ appName: APP_NAME })
    })
    const status = statusOf(response)
    if (status === 429) {
      const wait = typeof response.headers?.get === 'function' ? response.headers.get('retry-after') : null
      throw new LibraryError('LIBRARY_RATE_LIMIT', `Zotero is showing too many authorization dialogs; retry after ${wait ?? 'about a minute'}.`, 429)
    }
    if (status === 403) {
      throw new LibraryError('LIBRARY_DENIED', 'The local write authorization was denied in Zotero. Ask the user to allow it, then retry.', 403)
    }
    if (!response.ok || typeof json?.key !== 'string') {
      throw new LibraryError('LIBRARY_AUTH', failure('Zotero refused the local write authorization', response, text), status)
    }
    if (json.remember === true) remembered = { key: json.key, serverId: id }
    return json.key
  }

  async function write(method, pathname, body, headers = {}) {
    const id = await serverId()
    const run = async (apiKey) =>
      send(method, pathname, {
        headers: { 'Content-Type': 'application/json', 'Zotero-Server-ID': id, 'Zotero-API-Key': apiKey, ...headers },
        body: body === undefined ? undefined : JSON.stringify(body)
      })
    let apiKey = remembered !== null && remembered.serverId === id ? remembered.key : await authorize(id)
    let result = await run(apiKey)
    if (statusOf(result.response) === 401) {
      remembered = null
      apiKey = await authorize(id)
      result = await run(apiKey)
    }
    const status = statusOf(result.response)
    if (status === 428) {
      throw new LibraryError('LIBRARY_NO_SERVER_ID', 'Zotero rejected the write because the server id was missing; retry after fetching status.', 428)
    }
    if (status === 412) {
      throw new LibraryError('LIBRARY_CONFLICT', 'The item changed since it was read (version or server id conflict). Read it again and retry.', 412)
    }
    if (status === 403) {
      throw new LibraryError('LIBRARY_DENIED', 'The local write authorization was denied in Zotero. Ask the user to allow it, then retry.', 403)
    }
    if (status === 429) {
      throw new LibraryError('LIBRARY_RATE_LIMIT', 'Zotero is rate limiting local writes; retry shortly.', 429)
    }
    if (!result.response.ok) {
      throw new LibraryError('LIBRARY_INVALID', failure('Zotero rejected the write', result.response, result.text), status)
    }
    return result
  }

  function readKeyFromResult(json) {
    const successful = json?.successful
    if (successful !== null && typeof successful === 'object') {
      const keys = Object.keys(successful)
      if (keys.length > 0) {
        const entry = successful[keys[0]]
        if (entry !== null && typeof entry === 'object' && typeof entry.key === 'string') return entry
      }
    }
    if (Array.isArray(json) && json.length > 0 && typeof json[0]?.key === 'string') return json[0]
    return null
  }

  function failedEntries(json) {
    const failed = json?.failed
    if (failed === null || typeof failed !== 'object') return []
    return Object.entries(failed).map(([index, entry]) => ({
      index,
      message: typeof entry?.message === 'string' ? entry.message : typeof entry === 'string' ? entry : JSON.stringify(entry)
    }))
  }

  return {
    baseUrl,

    async status() {
      const { response, json } = await send('GET', `${LIBRARY_PATH}/items?limit=1`)
      const status = statusOf(response)
      if (status === 403) {
        throw new LibraryError('LIBRARY_DISABLED', 'Zotero refused the local API. Enable Settings > Advanced > "Allow other applications on this computer to communicate with Zotero".', 403)
      }
      if (status === 0) throw new LibraryError('LIBRARY_UNAVAILABLE', `Zotero's local API is not reachable at ${baseUrl}.`)
      const header = (name) => (typeof response.headers?.get === 'function' ? response.headers.get(name) : null)
      return {
        reachable: response.ok,
        baseUrl,
        serverId: header('zotero-server-id') ?? '',
        apiVersion: header('zotero-api-version') ?? '',
        schemaVersion: header('zotero-schema-version') ?? '',
        lastModifiedVersion: Number(header('last-modified-version') ?? 0) || 0,
        totalResults: Number(header('total-results') ?? 0) || (Array.isArray(json) ? json.length : 0)
      }
    },

    async search(query, options = {}) {
      const limit = Number.isInteger(options.limit) && options.limit > 0 ? Math.min(options.limit, 100) : 20
      const params = new URLSearchParams({ limit: String(limit) })
      if (typeof query === 'string' && query.trim().length > 0) params.set('q', query.trim())
      if (typeof options.itemType === 'string' && options.itemType.length > 0) params.set('itemType', options.itemType)
      const { response, json, text } = await send('GET', `${LIBRARY_PATH}/items?${params.toString()}`)
      if (!response.ok) throw new LibraryError('LIBRARY_UNAVAILABLE', failure('Zotero search failed', response, text), statusOf(response))
      return Array.isArray(json) ? json.map(compactItem) : []
    },

    async item(ref, options = {}) {
      const key = itemKey(ref)
      if (key.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a Zotero item key or ref.`)
      const { response, json, text } = await send('GET', `${LIBRARY_PATH}/items/${key}`)
      if (statusOf(response) === 404) throw new LibraryError('LIBRARY_NOT_FOUND', `Zotero has no item ${key}.`, 404)
      if (!response.ok) throw new LibraryError('LIBRARY_UNAVAILABLE', failure(`Zotero could not read item ${key}`, response, text), statusOf(response))
      const data = json?.data ?? json ?? {}
      const result = { key, version: typeof json?.version === 'number' ? json.version : typeof data.version === 'number' ? data.version : 0, data }
      if (options.children === true) {
        const childrenResponse = await send('GET', `${LIBRARY_PATH}/items/${key}/children`)
        if (childrenResponse.response.ok && Array.isArray(childrenResponse.json)) {
          result.children = childrenResponse.json.map(compactItem)
        }
      }
      return result
    },

    async create(objects) {
      const list = Array.isArray(objects) ? objects : [objects]
      if (list.length === 0) throw new LibraryError('LIBRARY_INVALID', 'op=create needs at least one item.')
      const { response, json, text } = await write('POST', `${LIBRARY_PATH}/items`, list)
      const rejected = failedEntries(json)
      if (rejected.length > 0) {
        throw new LibraryError('LIBRARY_REJECTED', `Zotero rejected ${rejected.length} of ${list.length} item(s): ${rejected.map((entry) => `[${entry.index}] ${entry.message}`).join('; ')}`)
      }
      const created = readKeyFromResult(json)
      if (created === null) throw new LibraryError('LIBRARY_INVALID', failure('Zotero returned no created item', response, text), statusOf(response))
      return { key: created.key, version: typeof created.version === 'number' ? created.version : 0 }
    },

    async update(ref, fields) {
      const key = itemKey(ref)
      if (key.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a Zotero item key or ref.`)
      if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
        throw new LibraryError('LIBRARY_INVALID', 'op=update needs a fields object.')
      }
      const current = await this.item(key)
      await write('PATCH', `${LIBRARY_PATH}/items/${key}`, fields, { 'If-Unmodified-Since-Version': String(current.version) })
      return { key, version: current.version }
    },

    async tags(ref, add = [], remove = []) {
      const key = itemKey(ref)
      if (key.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a Zotero item key or ref.`)
      const current = await this.item(key)
      const names = new Set((Array.isArray(current.data.tags) ? current.data.tags : []).map((tag) => tag?.tag).filter((tag) => typeof tag === 'string'))
      for (const name of add) if (typeof name === 'string' && name.trim().length > 0) names.add(name.trim())
      for (const name of remove) if (typeof name === 'string') names.delete(name.trim())
      const tags = [...names].sort().map((tag) => ({ tag }))
      if (JSON.stringify(tags) === JSON.stringify((current.data.tags ?? []).map((tag) => ({ tag: tag?.tag })).sort((a, b) => a.tag.localeCompare(b.tag)))) {
        return { key, changed: false, tags: tags.map((tag) => tag.tag) }
      }
      await write('PATCH', `${LIBRARY_PATH}/items/${key}`, { tags }, { 'If-Unmodified-Since-Version': String(current.version) })
      return { key, changed: true, tags: tags.map((tag) => tag.tag) }
    },

    async collections(ref, add = [], remove = []) {
      const key = itemKey(ref)
      if (key.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a Zotero item key or ref.`)
      const current = await this.item(key)
      const keys = new Set((Array.isArray(current.data.collections) ? current.data.collections : []).filter((entry) => typeof entry === 'string'))
      for (const entry of add) {
        const target = /.+/.test(String(entry ?? '')) ? (/^[A-Z0-9]{8}$/.test(String(entry).trim().toUpperCase()) ? String(entry).trim().toUpperCase() : (await this.ensureCollection(String(entry))).key) : ''
        if (target.length > 0) keys.add(target)
      }
      for (const entry of remove) {
        const value = String(entry ?? '').trim()
        if (/^[A-Z0-9]{8}$/.test(value.toUpperCase())) keys.delete(value.toUpperCase())
        else {
          const found = (await this.listCollections()).find((collection) => collection.name === value)
          if (found !== undefined) keys.delete(found.key)
        }
      }
      const next = [...keys].sort()
      const previous = (current.data.collections ?? []).slice().sort()
      if (JSON.stringify(next) === JSON.stringify(previous)) return { key, changed: false, collections: next }
      await write('PATCH', `${LIBRARY_PATH}/items/${key}`, { collections: next }, { 'If-Unmodified-Since-Version': String(current.version) })
      return { key, changed: true, collections: next }
    },

    async listCollections() {
      const { response, json, text } = await send('GET', `${LIBRARY_PATH}/collections`)
      if (!response.ok) throw new LibraryError('LIBRARY_UNAVAILABLE', failure('Zotero could not list collections', response, text), statusOf(response))
      return Array.isArray(json) ? json.map((entry) => ({ key: entry?.key ?? entry?.data?.key ?? '', name: collectionName(entry), parentCollection: entry?.data?.parentCollection ?? false })) : []
    },

    async ensureCollection(name, parent) {
      const wanted = typeof name === 'string' ? name.trim() : ''
      if (wanted.length === 0) throw new LibraryError('LIBRARY_INVALID', 'op=collection needs a name.')
      const parentKey = parent === undefined || parent === null || String(parent).trim().length === 0 ? false : (/^[A-Z0-9]{8}$/.test(String(parent).trim().toUpperCase()) ? String(parent).trim().toUpperCase() : (await this.ensureCollection(String(parent))).key)
      const existing = (await this.listCollections()).find((collection) => collection.name === wanted && (parentKey === false ? collection.parentCollection !== undefined : collection.parentCollection === parentKey))
      if (existing !== undefined) return { key: existing.key, created: false, name: wanted }
      const { response, json, text } = await write('POST', `${LIBRARY_PATH}/collections`, [{ name: wanted, parentCollection: parentKey }])
      const created = readKeyFromResult(json)
      if (created === null) throw new LibraryError('LIBRARY_INVALID', failure('Zotero returned no created collection', response, text), statusOf(response))
      return { key: created.key, created: true, name: wanted }
    },

    async note(parentRef, markdown, tags = []) {
      const parent = itemKey(parentRef)
      if (parent.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${parentRef ?? ''}" is not a Zotero parent item key.`)
      const html = noteHtml(markdown)
      const item = { itemType: 'note', parentItem: parent, note: html }
      const clean = Array.isArray(tags) ? tags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0).map((tag) => ({ tag: tag.trim() })) : []
      if (clean.length > 0) item.tags = clean
      const created = await this.create(item)
      return { key: created.key, parent, version: created.version }
    }
  }
}

function projectLibraryLog(exec) {
  const cwd = exec?.agent?.session?.header?.cwd
  if (typeof cwd !== 'string' || cwd.length === 0) return ''
  const dir = path.join(cwd, '.research')
  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch {
    return ''
  }
  return path.join(dir, 'library-log.jsonl')
}

function appendLibraryLog(file, entry) {
  if (typeof file !== 'string' || file.length === 0) return
  try {
    fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, 'utf8')
  } catch {
    /* logging is best-effort */
  }
}

export const name = 'research-team-library'
export const inject = ['tools']

export function apply(ctx) {
  const dispose = ctx.tools.register({
    name: 'research_library',
    description:
      'Read and write the Zotero library through its local API (127.0.0.1:23119). ' +
      'Ops: status, search, item, create, update, tags, collections, collection, note, log. ' +
      'Reads need no key. The first write opens a Zotero dialog ("Always Allow" makes the key reusable); ' +
      'after that writes run without a per-change plan card, and each one is appended to .research/library-log.jsonl. ' +
      'Search for duplicates before create. update/tags/collections read the item, merge and write back under its version, so a concurrent edit fails with LIBRARY_CONFLICT instead of overwriting. ' +
      'Nothing here deletes objects; removals are tag/collection membership only.',
    parameters: {
      type: 'object',
      properties: {
        op: {
          type: 'string',
          enum: ['status', 'search', 'item', 'create', 'update', 'tags', 'collections', 'collection', 'note', 'log'],
          description:
            'status: reachability and server id. search: quick search. item: one item by key. create: POST items[]. ' +
            'update: patch fields. tags: add/remove tags. collections: add/remove collection membership. ' +
            'collection: find or create a collection by name. note: child note from markdown. log: recent writes.'
        },
        ref: { type: 'string', description: 'Item key (8 chars) for item, update, tags, collections, note (parent).' },
        query: { type: 'string', description: 'Search text for op=search.' },
        limit: { type: 'number', description: 'Result count for search/log (1-100).' },
        itemType: { type: 'string', description: 'Optional item type filter for op=search, e.g. journalArticle.' },
        data: { type: 'object', description: 'Complete Zotero item object for op=create (itemType and title at least).' },
        fields: { type: 'object', description: 'Fields to change for op=update.' },
        add: { type: 'array', items: { type: 'string' }, description: 'Tag names or collection names/keys to add.' },
        remove: { type: 'array', items: { type: 'string' }, description: 'Tag names or collection names/keys to remove.' },
        name: { type: 'string', description: 'Collection name for op=collection.' },
        parent: { type: 'string', description: 'Optional parent collection name or key for op=collection.' },
        markdown: { type: 'string', description: 'Note body for op=note (plain text, paragraphs, - lists, # headings).' },
        dryRun: { type: 'boolean', description: 'Describe the write without performing it (no authorization, no change).' }
      },
      required: ['op'],
      additionalProperties: false
    },
    output: {
      schema: {},
      render(_args, value) {
        if (value !== null && typeof value === 'object' && typeof value.error === 'string') {
          return [{ type: 'text', text: value.error }]
        }
        return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
      }
    },
    async execute(args, exec) {
      const op = typeof args?.op === 'string' ? args.op : ''
      const dryRun = args?.dryRun === true
      const client = createLibraryClient()
      const logFile = projectLibraryLog(exec)
      try {
        if (op === 'status') return await client.status()
        if (op === 'search') {
          const items = await client.search(args?.query, { limit: args?.limit, itemType: args?.itemType })
          return { count: items.length, items }
        }
        if (op === 'item') return await client.item(args?.ref, { children: args?.children === true })
        if (op === 'log') {
          const limit = Number.isInteger(args?.limit) && args.limit > 0 ? Math.min(args.limit, 100) : 10
          if (logFile.length === 0 || !fs.existsSync(logFile)) return { entries: [] }
          const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter((line) => line.trim().length > 0)
          return { entries: lines.slice(-limit).map((line) => { try { return JSON.parse(line) } catch { return { raw: line } } }) }
        }
        if (op === 'create') {
          const list = Array.isArray(args?.data) ? args.data : args?.data !== undefined ? [args.data] : []
          if (list.length === 0) return { error: 'LIBRARY_INVALID: op=create needs data (an item object or an array of them).' }
          if (dryRun) return { dryRun: true, op, wouldCreate: list }
          const created = await client.create(list)
          appendLibraryLog(logFile, { at: new Date().toISOString(), op, keys: [created.key], version: created.version, by: exec?.agent?.session?.id ?? '' })
          return created
        }
        if (op === 'update') {
          if (dryRun) return { dryRun: true, op, ref: args?.ref, fields: args?.fields ?? {} }
          const updated = await client.update(args?.ref, args?.fields)
          appendLibraryLog(logFile, { at: new Date().toISOString(), op, key: updated.key, fields: Object.keys(args?.fields ?? {}), by: exec?.agent?.session?.id ?? '' })
          return updated
        }
        if (op === 'tags') {
          if (dryRun) return { dryRun: true, op, ref: args?.ref, add: args?.add ?? [], remove: args?.remove ?? [] }
          const result = await client.tags(args?.ref, args?.add ?? [], args?.remove ?? [])
          if (result.changed) appendLibraryLog(logFile, { at: new Date().toISOString(), op, key: result.key, add: args?.add ?? [], remove: args?.remove ?? [], by: exec?.agent?.session?.id ?? '' })
          return result
        }
        if (op === 'collections') {
          if (dryRun) return { dryRun: true, op, ref: args?.ref, add: args?.add ?? [], remove: args?.remove ?? [] }
          const result = await client.collections(args?.ref, args?.add ?? [], args?.remove ?? [])
          if (result.changed) appendLibraryLog(logFile, { at: new Date().toISOString(), op, key: result.key, add: args?.add ?? [], remove: args?.remove ?? [], by: exec?.agent?.session?.id ?? '' })
          return result
        }
        if (op === 'collection') {
          if (dryRun) return { dryRun: true, op, name: args?.name, parent: args?.parent }
          const result = await client.ensureCollection(args?.name, args?.parent)
          if (result.created) appendLibraryLog(logFile, { at: new Date().toISOString(), op, key: result.key, name: result.name, by: exec?.agent?.session?.id ?? '' })
          return result
        }
        if (op === 'note') {
          if (dryRun) return { dryRun: true, op, parent: args?.ref, markdown: args?.markdown ?? '' }
          const created = await client.note(args?.ref, args?.markdown, args?.add ?? [])
          appendLibraryLog(logFile, { at: new Date().toISOString(), op, key: created.key, parent: created.parent, by: exec?.agent?.session?.id ?? '' })
          return created
        }
        return { error: `Unknown op "${op}"; use one of status, search, item, create, update, tags, collections, collection, note, log.` }
      } catch (error) {
        if (error instanceof LibraryError) return { error: `${error.code}: ${error.message}` }
        return { error: `${error?.name ?? 'Error'}: ${error?.message ?? String(error)}` }
      }
    }
  })
  return () => {
    if (typeof dispose === 'function') dispose()
  }
}
