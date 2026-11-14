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

import crypto from 'node:crypto'
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

async function md5File(file) {
  return await new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5')
    const stream = fs.createReadStream(file)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}

const CONTENT_TYPES = {
  '.pdf': 'application/pdf',
  '.epub': 'application/epub+zip',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

function contentTypeFor(file) {
  return CONTENT_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream'
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

  async function send(method, pathname, { headers = {}, body, redirect } = {}) {
    let response
    try {
      response = await fetchImpl(`${baseUrl}${pathname}`, {
        method,
        headers,
        body,
        redirect,
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

  async function sendAbsolute(url, options = {}) {
    const headers = options.headers ?? {}
    try {
      const response = await fetchImpl(url, {
        method: options.method ?? 'POST',
        headers,
        body: options.body,
        signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
          ? AbortSignal.timeout(options.timeoutMs ?? timeoutMs)
          : undefined
      })
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
    } catch (error) {
      throw new LibraryError('LIBRARY_UNAVAILABLE', `The attachment upload endpoint is not reachable: ${error?.message ?? error}`)
    }
  }

  function absoluteUploadUrl(href) {
    if (/^https?:/i.test(href)) return href
    const origin = baseUrl.replace(/\/api$/, '')
    return href.startsWith('/') ? `${origin}${href}` : `${origin}/${href}`
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
      const offset = Number.isInteger(options.offset) && options.offset > 0 ? options.offset : 0
      const params = new URLSearchParams({ limit: String(limit) })
      if (offset > 0) params.set('start', String(offset))
      if (typeof query === 'string' && query.trim().length > 0) params.set('q', query.trim())
      if (typeof options.itemType === 'string' && options.itemType.length > 0) params.set('itemType', options.itemType)
      if (typeof options.tag === 'string' && options.tag.trim().length > 0) params.set('tag', options.tag.trim())
      if (typeof options.collection === 'string' && options.collection.trim().length > 0) params.set('collection', options.collection.trim())
      params.set('qmode', options.qmode === 'titleCreatorYear' ? 'titleCreatorYear' : 'everything')
      if (typeof options.sort === 'string' && options.sort.length > 0) params.set('sort', options.sort)
      const { response, json, text } = await send('GET', `${LIBRARY_PATH}/items?${params.toString()}`)
      if (!response.ok) throw new LibraryError('LIBRARY_UNAVAILABLE', failure('Zotero search failed', response, text), statusOf(response))
      const items = Array.isArray(json) ? json.map(compactItem) : []
      const header = typeof response.headers?.get === 'function' ? response.headers.get('total-results') : null
      const total = Number(header ?? 0) || items.length
      return { items, total, offset, limit }
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
    },

    async export(refs, format) {
      const allowed = ['bibtex', 'biblatex', 'ris', 'csljson']
      const wanted = typeof format === 'string' && format.trim().length > 0 ? format.trim().toLowerCase() : 'bibtex'
      if (!allowed.includes(wanted)) {
        throw new LibraryError('LIBRARY_INVALID', `format must be one of ${allowed.join(', ')}.`)
      }
      const keys = (Array.isArray(refs) ? refs : refs === undefined ? [] : [refs]).map(itemKey).filter((key) => key.length > 0)
      const params = new URLSearchParams({ format: wanted })
      if (keys.length > 0) params.set('itemkey', keys.join(','))
      const { response, text } = await send('GET', `${LIBRARY_PATH}/items?${params.toString()}`)
      if (!response.ok) throw new LibraryError('LIBRARY_UNAVAILABLE', failure('Zotero export failed', response, text), statusOf(response))
      return { format: wanted, keys, text }
    },

    async attach(parentRef, filePath, options = {}) {
      const parent = itemKey(parentRef)
      if (parent.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${parentRef ?? ''}" is not a parent item key.`)
      const absolute = path.resolve(String(filePath ?? ''))
      let stat = null
      try {
        stat = await fs.promises.stat(absolute)
      } catch {
        throw new LibraryError('LIBRARY_INVALID', `No file at ${absolute}.`)
      }
      if (!stat.isFile()) throw new LibraryError('LIBRARY_INVALID', `${absolute} is not a file.`)
      if (stat.size > 4 * 1024 * 1024 * 1024) throw new LibraryError('LIBRARY_INVALID', 'Zotero stores files under 4 GB.')
      const filename = path.basename(absolute)
      const contentType = typeof options.contentType === 'string' && options.contentType.length > 0 ? options.contentType : contentTypeFor(absolute)
      const created = await this.create([
        {
          itemType: 'attachment',
          parentItem: parent,
          linkMode: options.linkMode ?? 'imported_file',
          title: typeof options.title === 'string' && options.title.length > 0 ? options.title : filename,
          filename,
          contentType
        }
      ])
      const key = created.key
      const params = new URLSearchParams({
        md5: await md5File(absolute),
        filename,
        filesize: String(stat.size),
        mtime: String(Math.round(stat.mtimeMs))
      })
      const first = await write('POST', `${LIBRARY_PATH}/items/${key}/file?${params.toString()}`, undefined, { 'If-None-Match': '*' })
      if (first.json?.exists === 1) return { key, parent, uploaded: false, existed: true }
      const href = typeof first.json?.url === 'string' ? first.json.url : ''
      if (href.length === 0) throw new LibraryError('LIBRARY_INVALID', failure('Zotero did not return an upload URL', first.response, first.text), statusOf(first.response))
      const upload = await sendAbsolute(absoluteUploadUrl(href), {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body: await fs.promises.readFile(absolute)
      })
      if (![200, 201].includes(statusOf(upload.response))) {
        throw new LibraryError('LIBRARY_UPLOAD', failure('Zotero rejected the file upload', upload.response, upload.text), statusOf(upload.response))
      }
      const uploadKey = typeof first.json?.uploadKey === 'string' ? first.json.uploadKey : ''
      const done = await write('POST', `${LIBRARY_PATH}/items/${key}/file?upload=${encodeURIComponent(uploadKey)}`, undefined, { 'If-None-Match': '*' })
      const versionHeader = typeof done.response.headers?.get === 'function' ? done.response.headers.get('last-modified-version') : null
      return { key, parent, uploaded: true, existed: false, bytes: stat.size, version: Number(versionHeader ?? 0) || 0 }
    },

    async file(ref) {
      const key = itemKey(ref)
      if (key.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a Zotero attachment key.`)
      const { response, text } = await send('GET', `${LIBRARY_PATH}/items/${key}/file`, { redirect: 'manual' })
      const status = statusOf(response)
      if (status === 404) throw new LibraryError('LIBRARY_NOT_FOUND', `Zotero has no attachment ${key}.`, 404)
      if (![200, 301, 302, 303, 307, 308].includes(status)) {
        throw new LibraryError('LIBRARY_UNAVAILABLE', failure('Zotero could not resolve the attachment file', response, text), status)
      }
      const location = typeof response.headers?.get === 'function' ? (response.headers.get('location') ?? '') : ''
      const filePath = location.startsWith('file:') ? decodeURIComponent(location.replace(/^file:\/\/\/?/u, '')) : location
      return { key, path: filePath }
    },

    async fulltext(ref) {
      const key = itemKey(ref)
      if (key.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a Zotero attachment key.`)
      const { response, json } = await send('GET', `${LIBRARY_PATH}/items/${key}/fulltext`)
      if (statusOf(response) === 404) return { key, content: '', indexedChars: 0 }
      if (!response.ok) throw new LibraryError('LIBRARY_UNAVAILABLE', `Zotero could not read full text for ${key}.`, statusOf(response))
      return {
        key,
        content: typeof json?.content === 'string' ? json.content : '',
        indexedChars: typeof json?.indexedChars === 'number' ? json.indexedChars : 0
      }
    },

    async fulltextPut(ref, text) {
      const key = itemKey(ref)
      if (key.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a Zotero attachment key.`)
      const content = typeof text === 'string' ? text : ''
      if (content.trim().length === 0) throw new LibraryError('LIBRARY_INVALID', 'op=fulltextPut needs text.')
      await write('PUT', `${LIBRARY_PATH}/items/${key}/fulltext`, { content })
      return { key, indexedChars: content.length }
    },

    async annotations(ref) {
      const key = itemKey(ref)
      if (key.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a Zotero item key.`)
      const { response, json, text } = await send('GET', `${LIBRARY_PATH}/items/${key}/children`)
      if (!response.ok) throw new LibraryError('LIBRARY_UNAVAILABLE', failure(`Zotero could not read children of ${key}`, response, text), statusOf(response))
      const list = Array.isArray(json) ? json : []
      return list
        .filter((entry) => entry?.data?.itemType === 'annotation')
        .map((entry) => ({
          key: entry.key,
          type: entry.data.annotationType ?? '',
          text: entry.data.annotationText ?? '',
          comment: entry.data.annotationComment ?? '',
          color: entry.data.annotationColor ?? '',
          pageLabel: entry.data.annotationPageLabel ?? '',
          sortIndex: entry.data.annotationSortIndex ?? ''
        }))
    },

    async noteUpdate(ref, markdown) {
      const key = itemKey(ref)
      if (key.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a Zotero note key.`)
      const current = await this.item(key)
      await write('PATCH', `${LIBRARY_PATH}/items/${key}`, { note: noteHtml(markdown) }, { 'If-Unmodified-Since-Version': String(current.version) })
      return { key }
    },

    async noteDelete(ref) {
      const key = itemKey(ref)
      if (key.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a Zotero note key.`)
      const current = await this.item(key)
      await write('DELETE', `${LIBRARY_PATH}/items/${key}`, undefined, { 'If-Unmodified-Since-Version': String(current.version) })
      return { key, deleted: true }
    },

    async trashItem(ref) {
      const key = itemKey(ref)
      if (key.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a Zotero item key.`)
      const current = await this.item(key)
      await write('PATCH', `${LIBRARY_PATH}/items/${key}`, { deleted: true }, { 'If-Unmodified-Since-Version': String(current.version) })
      return { key, deleted: true }
    },

    async restoreItem(ref) {
      const key = itemKey(ref)
      if (key.length === 0) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a Zotero item key.`)
      const current = await this.item(key)
      await write('PATCH', `${LIBRARY_PATH}/items/${key}`, { deleted: false }, { 'If-Unmodified-Since-Version': String(current.version) })
      return { key, deleted: false }
    },

    async trash(options = {}) {
      const limit = Number.isInteger(options.limit) && options.limit > 0 ? Math.min(options.limit, 100) : 50
      const { response, json } = await send('GET', `${LIBRARY_PATH}/items/trash?limit=${limit}`)
      if (!response.ok) return []
      return Array.isArray(json) ? json.map(compactItem) : []
    },

    async tagList(options = {}) {
      const limit = Number.isInteger(options.limit) && options.limit > 0 ? Math.min(options.limit, 5000) : 100
      const { response, json, text } = await send('GET', `${LIBRARY_PATH}/tags?limit=${limit}`)
      if (!response.ok) throw new LibraryError('LIBRARY_UNAVAILABLE', failure('Zotero could not list tags', response, text), statusOf(response))
      return Array.isArray(json) ? json.map((entry) => entry?.tag ?? entry?.data?.tag ?? '').filter((name) => name.length > 0) : []
    },

    async tagDelete(name) {
      const wanted = typeof name === 'string' ? name.trim() : ''
      if (wanted.length === 0) throw new LibraryError('LIBRARY_INVALID', 'op=tagDelete needs a tag name.')
      await write('DELETE', `${LIBRARY_PATH}/tags?tag=${encodeURIComponent(wanted)}`)
      return { tag: wanted, deleted: true }
    },

    async collectionItems(ref, options = {}) {
      const raw = String(ref ?? '').trim().toUpperCase()
      const key = /^[A-Z0-9]{8}$/.test(raw) ? raw : (await this.ensureCollection(String(ref ?? ''))).key
      const limit = Number.isInteger(options.limit) && options.limit > 0 ? Math.min(options.limit, 100) : 50
      const start = Number.isInteger(options.offset) && options.offset > 0 ? options.offset : 0
      const { response, json, text } = await send('GET', `${LIBRARY_PATH}/collections/${key}/items?limit=${limit}&start=${start}`)
      if (!response.ok) throw new LibraryError('LIBRARY_UNAVAILABLE', failure(`Zotero could not list items of ${key}`, response, text), statusOf(response))
      const items = Array.isArray(json) ? json.map(compactItem) : []
      return { collection: key, items, total: Number(response.headers?.get?.('total-results') ?? 0) || items.length }
    },

    async collectionVersion(ref) {
      const key = String(ref ?? '').trim().toUpperCase()
      const { response, json } = await send('GET', `${LIBRARY_PATH}/collections/${key}`)
      if (!response.ok) throw new LibraryError('LIBRARY_NOT_FOUND', `Zotero has no collection ${key}.`, statusOf(response))
      return typeof json?.version === 'number' ? json.version : 0
    },

    async collectionUpdate(ref, fields) {
      const key = String(ref ?? '').trim().toUpperCase()
      if (!/^[A-Z0-9]{8}$/.test(key)) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a collection key.`)
      const patch = {}
      if (typeof fields?.name === 'string' && fields.name.trim().length > 0) patch.name = fields.name.trim()
      if (fields?.parent !== undefined) {
        const parent = String(fields.parent ?? '').trim()
        patch.parentCollection = parent.length === 0 ? false : (/^[A-Z0-9]{8}$/.test(parent.toUpperCase()) ? parent.toUpperCase() : (await this.ensureCollection(parent)).key)
      }
      if (Object.keys(patch).length === 0) throw new LibraryError('LIBRARY_INVALID', 'op=collectionUpdate needs fields.name or fields.parent.')
      const version = await this.collectionVersion(key)
      await write('PATCH', `${LIBRARY_PATH}/collections/${key}`, patch, { 'If-Unmodified-Since-Version': String(version) })
      return { key, ...patch }
    },

    async collectionDelete(ref) {
      const key = String(ref ?? '').trim().toUpperCase()
      if (!/^[A-Z0-9]{8}$/.test(key)) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a collection key.`)
      const version = await this.collectionVersion(key)
      await write('DELETE', `${LIBRARY_PATH}/collections/${key}`, undefined, { 'If-Unmodified-Since-Version': String(version) })
      return { key, deleted: true }
    },

    async searches() {
      const { response, json, text } = await send('GET', `${LIBRARY_PATH}/searches`)
      if (!response.ok) throw new LibraryError('LIBRARY_UNAVAILABLE', failure('Zotero could not list saved searches', response, text), statusOf(response))
      return Array.isArray(json) ? json.map((entry) => ({ key: entry?.key ?? '', name: entry?.data?.name ?? entry?.name ?? '' })) : []
    },

    async saveSearch(name, conditions) {
      const wanted = typeof name === 'string' ? name.trim() : ''
      if (wanted.length === 0) throw new LibraryError('LIBRARY_INVALID', 'op=saveSearch needs a name.')
      const list = Array.isArray(conditions) ? conditions : []
      if (list.length === 0) throw new LibraryError('LIBRARY_INVALID', 'op=saveSearch needs conditions[].')
      const { response, json, text } = await write('POST', `${LIBRARY_PATH}/searches`, [{ name: wanted, conditions: list }])
      const created = readKeyFromResult(json)
      if (created === null) throw new LibraryError('LIBRARY_INVALID', failure('Zotero returned no created search', response, text), statusOf(response))
      return { key: created.key, name: wanted }
    },

    async savedSearchItems(ref, options = {}) {
      const key = String(ref ?? '').trim().toUpperCase()
      const limit = Number.isInteger(options.limit) && options.limit > 0 ? Math.min(options.limit, 100) : 50
      const start = Number.isInteger(options.offset) && options.offset > 0 ? options.offset : 0
      const { response, json, text } = await send('GET', `${LIBRARY_PATH}/searches/${key}/items?limit=${limit}&start=${start}`)
      if (!response.ok) throw new LibraryError('LIBRARY_UNAVAILABLE', failure(`Zotero could not run saved search ${key}`, response, text), statusOf(response))
      const items = Array.isArray(json) ? json.map(compactItem) : []
      return { search: key, items, total: Number(response.headers?.get?.('total-results') ?? 0) || items.length }
    },

    async deleteSavedSearch(ref) {
      const key = String(ref ?? '').trim().toUpperCase()
      if (!/^[A-Z0-9]{8}$/.test(key)) throw new LibraryError('LIBRARY_INVALID', `"${ref ?? ''}" is not a saved-search key.`)
      await write('DELETE', `${LIBRARY_PATH}/searches/${key}`)
      return { key, deleted: true }
    },

    async fields(itemType) {
      const wanted = typeof itemType === 'string' && itemType.length > 0 ? itemType : 'journalArticle'
      const { response, json, text } = await send('GET', `${LIBRARY_PATH}/itemTypeFields?itemType=${encodeURIComponent(wanted)}`)
      if (!response.ok) throw new LibraryError('LIBRARY_UNAVAILABLE', failure('Zotero could not list item fields', response, text), statusOf(response))
      return Array.isArray(json) ? json.map((entry) => ({ field: entry?.field ?? '', localized: entry?.localized ?? '' })) : []
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
export const inject = ['tools', 'webServer', 'agents']

const LITERATURE_ROUTE = '/api/dsh-research-team-literature'

function libraryRoot(ctx, sessionId) {
  if (typeof sessionId !== 'string' || sessionId.length === 0) return ''
  const cwd = ctx?.agents?.get?.(sessionId)?.session?.header?.cwd
  return typeof cwd === 'string' ? cwd : ''
}

function projectLibraryKeys(rootPath) {
  const keys = new Set()
  if (typeof rootPath !== 'string' || rootPath.length === 0) return keys
  const file = path.join(rootPath, '.research', 'library-log.jsonl')
  let text = ''
  try { text = fs.readFileSync(file, 'utf8') } catch { return keys }
  const isKey = (value) => typeof value === 'string' && /^[A-Z0-9]{8}$/.test(value)
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    let entry = null
    try { entry = JSON.parse(trimmed) } catch { continue }
    for (const field of ['key', 'itemKey', 'ref', 'parentKey', 'parent']) {
      if (isKey(entry?.[field])) keys.add(entry[field])
    }
    for (const field of ['keys', 'items', 'parents']) {
      if (Array.isArray(entry?.[field])) for (const value of entry[field]) if (isKey(value)) keys.add(value)
    }
  }
  return keys
}

function yearOf(date) {
  const match = /(\d{4})/.exec(String(date ?? ''))
  return match ? Number(match[1]) : 0
}

function authorsOf(data) {
  const creators = Array.isArray(data?.creators) ? data.creators : []
  const names = creators
    .filter((creator) => creator && creator.creatorType !== 'editor' && creator.creatorType !== 'translator')
    .map((creator) => creator.lastName || creator.name || creator.firstName || '')
    .filter((name) => name.length > 0)
  return names.slice(0, 3)
}

function citationKeyOf(data) {
  const explicit = typeof data?.citationKey === 'string' ? data.citationKey.trim() : ''
  if (explicit.length > 0) return explicit
  const extra = typeof data?.extra === 'string' ? data.extra : ''
  const match = /^\s*Citation Key:\s*(\S+)\s*$/m.exec(extra)
  return match ? match[1] : ''
}

function literatureEntry(entry, counts) {
  const data = entry?.data ?? {}
  return {
    key: entry.key,
    title: String(data.title ?? ''),
    authors: authorsOf(data),
    year: yearOf(data.date),
    venue: String(data.publicationTitle ?? data.proceedingsTitle ?? data.bookTitle ?? data.websiteTitle ?? ''),
    itemType: String(data.itemType ?? ''),
    doi: String(data.doi ?? ''),
    url: String(data.url ?? ''),
    tags: (Array.isArray(data.tags) ? data.tags : []).map((tag) => tag?.tag).filter((tag) => typeof tag === 'string' && tag.length > 0).slice(0, 6),
    citationKey: citationKeyOf(data),
    attachments: counts.attachments,
    annotations: counts.annotations,
    notes: counts.notes
  }
}

async function mapLimit(list, limit, fn) {
  const results = new Array(list.length)
  let index = 0
  const workers = Array.from({ length: Math.max(1, Math.min(limit, list.length)) }, async () => {
    while (index < list.length) {
      const current = index
      index += 1
      try { results[current] = await fn(list[current]) } catch { results[current] = undefined }
    }
  })
  await Promise.all(workers)
  return results
}

function jsonResponse(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(body)
}

function localRequest(req) {
  const host = String(req.headers.host ?? '')
  return host.startsWith('127.0.0.1') || host.startsWith('localhost') || host.startsWith('[::1]')
}

async function readLiterature(ctx, url) {
  const sessionId = String(url.searchParams.get('session') ?? '')
  const query = String(url.searchParams.get('q') ?? '').trim()
  const scope = url.searchParams.get('scope') === 'all' ? 'all' : 'project'
  const filter = String(url.searchParams.get('filter') ?? 'all')
  const rawLimit = Number(url.searchParams.get('limit') ?? '')
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 60) : 30
  const rootPath = libraryRoot(ctx, sessionId)
  if (scope === 'project' && rootPath.length === 0) {
    throw new LibraryError('LIBRARY_NO_PROJECT', 'this session has no project root')
  }
  const client = createLibraryClient()
  const projectKeys = projectLibraryKeys(rootPath)
  let candidates = []
  if (scope === 'project') {
    if (query.length > 0) {
      const found = await client.search(query, { limit: 80 })
      candidates = found.items.filter((entry) => projectKeys.has(entry?.key))
    } else {
      const keys = [...projectKeys].slice(0, limit)
      candidates = (await mapLimit(keys, 6, async (key) => {
        try { return await client.item(key) } catch { return undefined }
      })).filter(Boolean)
    }
  } else {
    const found = await client.search(query, { limit })
    candidates = found.items
  }
  candidates = candidates.slice(0, limit)
  const items = (await mapLimit(candidates, 5, async (entry) => {
    const full = await client.item(entry.key, { children: true })
    const counts = { attachments: 0, annotations: 0, notes: 0 }
    for (const child of Array.isArray(full.children) ? full.children : []) {
      const type = child?.data?.itemType
      if (type === 'attachment') counts.attachments += 1
      else if (type === 'annotation') counts.annotations += 1
      else if (type === 'note') counts.notes += 1
    }
    return literatureEntry(full, counts)
  })).filter(Boolean)
  const visible = items.filter((entry) => {
    if (filter === 'fulltext') return entry.attachments > 0
    if (filter === 'meta') return entry.attachments === 0
    if (filter === 'annot') return entry.annotations > 0
    return true
  })
  return { root: rootPath, scope, filter, total: projectKeys.size, count: visible.length, items: visible }
}

async function literatureHandler(ctx, req, res) {
  try {
    if (!localRequest(req)) {
      jsonResponse(res, 403, { ok: false, error: 'literature requests must come from the local GUI' })
      return
    }
    if (req.method !== 'GET') {
      jsonResponse(res, 405, { ok: false, error: 'method not allowed' })
      return
    }
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    const data = await readLiterature(ctx, url)
    jsonResponse(res, 200, { ok: true, ...data })
  } catch (error) {
    const status = error instanceof LibraryError && error.code === 'LIBRARY_NO_PROJECT' ? 404 : 200
    jsonResponse(res, status, { ok: false, error: error instanceof LibraryError ? `${error.code}: ${error.message}` : String(error?.message ?? error) })
  }
}

export function apply(ctx) {
  const dispose = ctx.tools.register({
    name: 'research_zotero',
    description:
      'Read and write the Zotero library through its local API (http://127.0.0.1:23119/api). ' +
      'Read ops: status, search, item, annotations, fulltext, file, export, fields, tagList, collectionList, collectionItems, searches, savedSearchItems, trash, log. ' +
      'Write ops: create, update, attach, note, noteUpdate, noteDelete, tags, collections, collection, collectionUpdate, collectionDelete, delete, restore, saveSearch, deleteSavedSearch, fulltextPut, tagDelete. ' +
      'Reads need no key. The first write opens a Zotero dialog ("Always Allow" makes the key reusable); afterwards writes run without a per-change plan card and each one is appended to .research/library-log.jsonl. ' +
      'attach uploads a local file as a stored-file attachment (three-phase upload) and is how a paper\'s full text enters the library: create the item first, then attach the PDF to it. ' +
      'Search by DOI before create. update/tags/collections read the item, merge, and write back under its version, so a concurrent edit fails with LIBRARY_CONFLICT instead of overwriting. ' +
      'delete moves an item to the trash and requires confirm:true; noteDelete, collectionDelete, tagDelete and deleteSavedSearch require it too. This tool never erases data permanently.',
    parameters: {
      type: 'object',
      properties: {
        op: {
          type: 'string',
          enum: [
            'status', 'search', 'item', 'annotations', 'fulltext', 'file', 'export', 'fields',
            'tagList', 'collectionList', 'collectionItems', 'searches', 'savedSearchItems', 'trash', 'log',
            'create', 'update', 'attach', 'note', 'noteUpdate', 'noteDelete', 'tags', 'collections',
            'collection', 'collectionUpdate', 'collectionDelete', 'delete', 'restore', 'saveSearch',
            'deleteSavedSearch', 'fulltextPut', 'tagDelete'
          ],
          description:
            'status: reachability and server id. search: query with limit/offset/tag/collection. item: one item by key. ' +
            'annotations/fulltext/file: read an attachment. export: bibliography text. fields: valid fields of an item type. ' +
            'tagList/collectionList/collectionItems/searches/savedSearchItems/trash: library listings. ' +
            'create/update/attach/note/tags/collections/collection: writes. delete/restore: trash and undelete. ' +
            'noteDelete/collectionDelete/collectionUpdate/deleteSavedSearch/tagDelete: destructive, need confirm. log: recent writes.'
        },
        ref: { type: 'string', description: 'Item key (8 chars) or zotero:// ref. Parent key for attach/note; attachment key for fulltext/file/annotations.' },
        query: { type: 'string', description: 'Search text for op=search.' },
        limit: { type: 'number', description: 'Result count (1-100 for items, 1-5000 for tagList).' },
        offset: { type: 'number', description: 'Pagination start for search, collectionItems and savedSearchItems.' },
        itemType: { type: 'string', description: 'Item type filter for op=search; item type for op=fields.' },
        tag: { type: 'string', description: 'Tag filter for op=search.' },
        collection: { type: 'string', description: 'Collection name or key for collectionItems/collectionUpdate/collectionDelete; collection filter for search.' },
        qmode: { type: 'string', enum: ['everything', 'titleCreatorYear'], description: 'Search mode (default everything).' },
        sort: { type: 'string', description: 'Sort field for op=search, e.g. dateModified desc.' },
        data: { type: 'object', description: 'Complete Zotero item object for op=create (itemType and title at least).' },
        fields: { type: 'object', description: 'Fields to change for op=update; name/parent for collectionUpdate.' },
        add: { type: 'array', items: { type: 'string' }, description: 'Tag names or collection names/keys to add; item keys for op=export.' },
        remove: { type: 'array', items: { type: 'string' }, description: 'Tag names or collection names/keys to remove.' },
        name: { type: 'string', description: 'Collection name for op=collection; saved-search name for op=saveSearch.' },
        parent: { type: 'string', description: 'Optional parent collection name or key for op=collection.' },
        markdown: { type: 'string', description: 'Note body for op=note/noteUpdate (plain text, paragraphs, - lists, # headings).' },
        text: { type: 'string', description: 'Full-text content for op=fulltextPut.' },
        filePath: { type: 'string', description: 'Absolute path of the file to upload for op=attach (e.g. a PDF).' },
        format: { type: 'string', enum: ['bibtex', 'biblatex', 'ris', 'csljson'], description: 'Export format for op=export.' },
        confirm: { type: 'boolean', description: 'Required true for destructive ops (delete, noteDelete, collectionDelete, tagDelete, deleteSavedSearch).' },
        children: { type: 'boolean', description: 'Include child items for op=item.' },
        searchKey: { type: 'string', description: 'Saved-search key for op=savedSearchItems.' },
        conditions: {
          type: 'array',
          description: 'Saved-search conditions for op=saveSearch, e.g. [{ condition: "title", operator: "contains", value: "diffusion" }].',
          items: { type: 'object' }
        },
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
      const confirm = args?.confirm === true
      const client = createLibraryClient()
      const logFile = projectLibraryLog(exec)
      const log = (entry) => {
        appendLibraryLog(logFile, { at: new Date().toISOString(), by: exec?.agent?.session?.id ?? '', ...entry })
      }
      const needsConfirm = new Set(['delete', 'noteDelete', 'collectionDelete', 'tagDelete', 'deleteSavedSearch'])
      try {
        if (needsConfirm.has(op) && !confirm) {
          return { error: `LIBRARY_UNCONFIRMED: op=${op} removes or moves objects; pass confirm:true to proceed.` }
        }

        if (op === 'status') return await client.status()
        if (op === 'search') {
          return await client.search(args?.query, {
            limit: args?.limit,
            offset: args?.offset,
            itemType: args?.itemType,
            tag: args?.tag,
            collection: args?.collection,
            qmode: args?.qmode,
            sort: args?.sort
          })
        }
        if (op === 'item') return await client.item(args?.ref, { children: args?.children === true })
        if (op === 'annotations') return { key: itemKey(args?.ref), annotations: await client.annotations(args?.ref) }
        if (op === 'fulltext') return await client.fulltext(args?.ref)
        if (op === 'file') return await client.file(args?.ref)
        if (op === 'export') {
          const refs = Array.isArray(args?.add) && args.add.length > 0 ? args.add : args?.ref !== undefined ? [args.ref] : []
          return await client.export(refs, args?.format)
        }
        if (op === 'fields') return { itemType: args?.itemType ?? 'journalArticle', fields: await client.fields(args?.itemType) }
        if (op === 'tagList') return { tags: await client.tagList({ limit: args?.limit }) }
        if (op === 'collectionList') return { collections: await client.listCollections() }
        if (op === 'collectionItems') {
          return await client.collectionItems(args?.collection ?? args?.ref, { limit: args?.limit, offset: args?.offset })
        }
        if (op === 'searches') return { searches: await client.searches() }
        if (op === 'savedSearchItems') {
          return await client.savedSearchItems(args?.searchKey ?? args?.ref, { limit: args?.limit, offset: args?.offset })
        }
        if (op === 'trash') return { items: await client.trash({ limit: args?.limit }) }
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
          log({ op, keys: [created.key], version: created.version })
          return created
        }
        if (op === 'update') {
          if (dryRun) return { dryRun: true, op, ref: args?.ref, fields: args?.fields ?? {} }
          const updated = await client.update(args?.ref, args?.fields)
          log({ op, key: updated.key, fields: Object.keys(args?.fields ?? {}) })
          return updated
        }
        if (op === 'attach') {
          if (typeof args?.filePath !== 'string' || args.filePath.length === 0) {
            return { error: 'LIBRARY_INVALID: op=attach needs filePath and the parent item ref.' }
          }
          if (dryRun) return { dryRun: true, op, ref: args?.ref, filePath: args.filePath, contentType: args?.fields?.contentType }
          const attached = await client.attach(args?.ref, args.filePath, {
            title: args?.name,
            contentType: typeof args?.fields?.contentType === 'string' ? args.fields.contentType : undefined
          })
          log({ op, key: attached.key, parent: attached.parent, bytes: attached.bytes ?? 0, uploaded: attached.uploaded })
          return attached
        }
        if (op === 'note') {
          if (dryRun) return { dryRun: true, op, parent: args?.ref, markdown: args?.markdown ?? '' }
          const created = await client.note(args?.ref, args?.markdown, args?.add ?? [])
          log({ op, key: created.key, parent: created.parent })
          return created
        }
        if (op === 'noteUpdate') {
          if (dryRun) return { dryRun: true, op, ref: args?.ref, markdown: args?.markdown ?? '' }
          const updated = await client.noteUpdate(args?.ref, args?.markdown)
          log({ op, key: updated.key })
          return updated
        }
        if (op === 'noteDelete') {
          if (dryRun) return { dryRun: true, op, ref: args?.ref }
          const removed = await client.noteDelete(args?.ref)
          log({ op, key: removed.key })
          return removed
        }
        if (op === 'tags') {
          if (dryRun) return { dryRun: true, op, ref: args?.ref, add: args?.add ?? [], remove: args?.remove ?? [] }
          const result = await client.tags(args?.ref, args?.add ?? [], args?.remove ?? [])
          if (result.changed) log({ op, key: result.key, add: args?.add ?? [], remove: args?.remove ?? [] })
          return result
        }
        if (op === 'tagDelete') {
          if (dryRun) return { dryRun: true, op, name: args?.name }
          const removed = await client.tagDelete(args?.name)
          log({ op, tag: removed.tag })
          return removed
        }
        if (op === 'collections') {
          if (dryRun) return { dryRun: true, op, ref: args?.ref, add: args?.add ?? [], remove: args?.remove ?? [] }
          const result = await client.collections(args?.ref, args?.add ?? [], args?.remove ?? [])
          if (result.changed) log({ op, key: result.key, add: args?.add ?? [], remove: args?.remove ?? [] })
          return result
        }
        if (op === 'collection') {
          if (dryRun) return { dryRun: true, op, name: args?.name, parent: args?.parent }
          const result = await client.ensureCollection(args?.name, args?.parent)
          if (result.created) log({ op, key: result.key, name: result.name })
          return result
        }
        if (op === 'collectionUpdate') {
          if (dryRun) return { dryRun: true, op, collection: args?.collection, fields: args?.fields ?? {} }
          const updated = await client.collectionUpdate(args?.collection ?? args?.ref, args?.fields ?? {})
          log({ op, key: updated.key, fields: Object.keys(args?.fields ?? {}) })
          return updated
        }
        if (op === 'collectionDelete') {
          if (dryRun) return { dryRun: true, op, collection: args?.collection ?? args?.ref }
          const removed = await client.collectionDelete(args?.collection ?? args?.ref)
          log({ op, key: removed.key })
          return removed
        }
        if (op === 'delete') {
          if (dryRun) return { dryRun: true, op, ref: args?.ref }
          const removed = await client.trashItem(args?.ref)
          log({ op, key: removed.key })
          return removed
        }
        if (op === 'restore') {
          if (dryRun) return { dryRun: true, op, ref: args?.ref }
          const restored = await client.restoreItem(args?.ref)
          log({ op, key: restored.key })
          return restored
        }
        if (op === 'saveSearch') {
          if (dryRun) return { dryRun: true, op, name: args?.name, conditions: args?.conditions ?? [] }
          const created = await client.saveSearch(args?.name, args?.conditions)
          log({ op, key: created.key, name: created.name })
          return created
        }
        if (op === 'deleteSavedSearch') {
          if (dryRun) return { dryRun: true, op, searchKey: args?.searchKey ?? args?.ref }
          const removed = await client.deleteSavedSearch(args?.searchKey ?? args?.ref)
          log({ op, key: removed.key })
          return removed
        }
        if (op === 'fulltextPut') {
          if (dryRun) return { dryRun: true, op, ref: args?.ref, chars: String(args?.text ?? '').length }
          const written = await client.fulltextPut(args?.ref, args?.text)
          log({ op, key: written.key, chars: written.indexedChars })
          return written
        }
        return { error: `Unknown op "${op}".` }
      } catch (error) {
        if (error instanceof LibraryError) return { error: `${error.code}: ${error.message}` }
        return { error: `${error?.name ?? 'Error'}: ${error?.message ?? String(error)}` }
      }
    }
  })
  let disposeRoute = () => {}
  if (typeof ctx?.webServer?.register === 'function') {
    try {
      disposeRoute = ctx.webServer.register({ kind: 'exact', path: LITERATURE_ROUTE, handler: (req, res) => literatureHandler(ctx, req, res) })
    } catch (error) {
      const message = String(error?.message ?? error)
      if (!message.includes(`webserver: duplicate exact route "${LITERATURE_ROUTE}"`)) throw error
    }
  }
  return () => {
    if (typeof disposeRoute === 'function') disposeRoute()
    if (typeof dispose === 'function') dispose()
  }
}
