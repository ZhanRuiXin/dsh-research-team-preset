/**
 * Project literature index.
 *
 * The team keeps the project's reading list as data, not as chat: categories
 * the team invents for this project (related work, methods, models, data sets
 * …), and one entry per Zotero item key. The entry title is what the panel
 * shows; the per-entry markdown note in `.research/literature/<KEY>.md` is what
 * the panel expands. The index itself lives in `.research/literature.json` and
 * is written with the same tmp+rename pattern as the worklog.
 */

import fs from 'node:fs'
import path from 'node:path'

const ROUTE = '/api/dsh-research-team-literature'
const INDEX_DIR = '.research'
const INDEX_NAME = 'literature.json'
const NOTE_DIR = 'literature'
const KEY_PATTERN = /^[A-Z0-9]{8}$/
const LIMIT_NOTE = 8000

function indexFile(root) { return path.join(root, INDEX_DIR, INDEX_NAME) }
function noteFile(root, key) { return path.join(root, INDEX_DIR, NOTE_DIR, `${key}.md`) }

function text(value, limit) {
  const raw = typeof value === 'string' ? value : value === undefined || value === null ? '' : String(value)
  const trimmed = raw.trim()
  return trimmed.length > limit ? `${trimmed.slice(0, limit)}…` : trimmed
}

export class LiteratureError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'LiteratureError'
    this.code = code
  }
}

export function isLiteratureKey(value) {
  return typeof value === 'string' && KEY_PATTERN.test(value.trim().toUpperCase())
}

function normaliseEntry(raw) {
  if (raw === null || typeof raw !== 'object') return null
  const key = typeof raw.key === 'string' ? raw.key.trim().toUpperCase() : ''
  if (KEY_PATTERN.test(key) === false) return null
  const title = text(raw.title, 300)
  const authors = Array.isArray(raw.authors) ? raw.authors.map((name) => text(name, 80)).filter((name) => name.length > 0).slice(0, 12) : []
  const year = Number.isInteger(raw.year) && raw.year > 1000 && raw.year < 3000 ? raw.year : 0
  const at = typeof raw.at === 'string' ? raw.at : ''
  return { key, title, authors, year, at }
}

export function readLiteratureIndex(root) {
  const empty = { version: 1, categories: [] }
  if (typeof root !== 'string' || root.length === 0) return empty
  let parsed = null
  try { parsed = JSON.parse(fs.readFileSync(indexFile(root), 'utf8')) } catch { return empty }
  const categories = []
  const seen = new Set()
  for (const raw of Array.isArray(parsed?.categories) ? parsed.categories : []) {
    const id = text(raw?.id, 60)
    const label = text(raw?.label, 40)
    if (id.length === 0 || label.length === 0 || seen.has(id)) continue
    seen.add(id)
    const entries = []
    const keys = new Set()
    for (const rawEntry of Array.isArray(raw?.entries) ? raw.entries : []) {
      const entry = normaliseEntry(rawEntry)
      if (entry === null || keys.has(entry.key)) continue
      keys.add(entry.key)
      entries.push(entry)
    }
    categories.push({ id, label, entries })
  }
  return { version: 1, categories }
}

function writeIndex(root, index) {
  const file = indexFile(root)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, `${JSON.stringify(index, null, 2)}\n`, 'utf8')
  fs.renameSync(tmp, file)
}

export function readLiteratureNote(root, key) {
  if (isLiteratureKey(key) === false) return ''
  try { return fs.readFileSync(noteFile(root, key.trim().toUpperCase()), 'utf8').slice(0, LIMIT_NOTE) } catch { return '' }
}

function writeLiteratureNote(root, key, note) {
  const file = noteFile(root, key)
  if (typeof note === 'string' && note.trim().length > 0) {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, note.trim().length > LIMIT_NOTE ? note.slice(0, LIMIT_NOTE) : note, 'utf8')
    return
  }
  try { fs.unlinkSync(file) } catch { /* missing is fine */ }
}

function findEntry(index, key) {
  for (const category of index.categories) {
    const entry = category.entries.find((item) => item.key === key)
    if (entry !== undefined) return { category, entry }
  }
  return null
}

function categoryId(label, index) {
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'category'
  let id = base
  let n = 2
  while (index.categories.some((category) => category.id === id)) { id = `${base}-${n}`; n += 1 }
  return id
}

export function upsertCategory(root, payload = {}) {
  const label = text(payload.label, 40)
  if (label.length === 0) throw new LiteratureError('LITERATURE_INVALID', 'a category needs a label')
  const index = readLiteratureIndex(root)
  const wanted = text(payload.id, 60)
  const existing = wanted.length > 0 ? index.categories.find((category) => category.id === wanted) : undefined
  if (existing !== undefined) {
    existing.label = label
    writeIndex(root, index)
    return existing
  }
  const category = { id: categoryId(label, index), label, entries: [] }
  index.categories.push(category)
  writeIndex(root, index)
  return category
}

export function removeCategory(root, id) {
  const index = readLiteratureIndex(root)
  const kept = index.categories.filter((category) => category.id !== text(id, 60))
  if (kept.length === index.categories.length) throw new LiteratureError('LITERATURE_NOT_FOUND', `no category "${id}"`)
  index.categories = kept
  writeIndex(root, index)
  return index
}

export function upsertLiteratureEntry(root, payload = {}) {
  const key = text(payload.key, 16).toUpperCase()
  if (KEY_PATTERN.test(key) === false) {
    throw new LiteratureError('LITERATURE_INVALID', 'key must be the 8-character Zotero item key')
  }
  const index = readLiteratureIndex(root)
  const category = index.categories.find((item) => item.id === text(payload.category, 60))
  if (category === undefined) {
    throw new LiteratureError('LITERATURE_INVALID', `no category "${payload.category ?? ''}"; create it with op=category first`)
  }
  const title = text(payload.title, 300)
  if (title.length === 0) throw new LiteratureError('LITERATURE_INVALID', 'an entry needs the paper title')
  const authors = Array.isArray(payload.authors) ? payload.authors.map((name) => text(name, 80)).filter((name) => name.length > 0).slice(0, 12) : []
  const year = Number.isInteger(payload.year) ? payload.year : 0
  const find = findEntry(index, key)
  let entry
  if (find === null) {
    entry = { key, title, authors, year, at: new Date().toISOString() }
    category.entries.push(entry)
  } else {
    entry = find.entry
    entry.title = title
    if (authors.length > 0) entry.authors = authors
    if (year > 0) entry.year = year
    if (find.category !== category) {
      find.category.entries = find.category.entries.filter((item) => item.key !== key)
      category.entries.push(entry)
    }
  }
  writeIndex(root, index)
  if (payload.note !== undefined) writeLiteratureNote(root, key, payload.note)
  return entry
}

export function removeLiteratureEntry(root, key) {
  const wanted = text(key, 16).toUpperCase()
  const index = readLiteratureIndex(root)
  for (const category of index.categories) {
    const before = category.entries.length
    category.entries = category.entries.filter((entry) => entry.key !== wanted)
    if (category.entries.length !== before) {
      writeIndex(root, index)
      writeLiteratureNote(root, wanted, '')
      return { key: wanted, removed: true }
    }
  }
  throw new LiteratureError('LITERATURE_NOT_FOUND', `no entry ${wanted}`)
}

export function literaturePayload(root) {
  const index = readLiteratureIndex(root)
  const categories = index.categories.map((category) => ({
    id: category.id,
    label: category.label,
    entries: category.entries.map((entry) => ({ ...entry, note: readLiteratureNote(root, entry.key) }))
  }))
  const count = categories.reduce((total, category) => total + category.entries.length, 0)
  return { categories, count }
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

function projectRoot(ctx, sessionId) {
  if (typeof sessionId !== 'string' || sessionId.length === 0) return ''
  const cwd = ctx?.agents?.get?.(sessionId)?.session?.header?.cwd
  return typeof cwd === 'string' ? cwd : ''
}

export const name = 'research-team-literature'
export const inject = ['tools', 'webServer', 'agents']

export function apply(ctx) {
  const dispose = ctx.tools.register({
    name: 'research_literature',
    description:
      'Maintain the project reading list behind the Research panel 文献 section. Categories are the project\'s own labels (related work, methods, models, data sets …); each entry is a Zotero item key with its title and an optional markdown note that the panel expands. ' +
      'The index lives in .research/literature.json and each note in .research/literature/<KEY>.md, so it travels with the project and the writer can cite from it. ' +
      'Ops: list, get, category (add or rename, label), removeCategory (id), add (key, category, title, note, authors, year), remove (key), update the same way as add. ' +
      'Get the key from research_zotero op=search; never invent a key.',
    parameters: {
      type: 'object',
      properties: {
        op: { type: 'string', enum: ['list', 'get', 'category', 'removeCategory', 'add', 'remove'] },
        id: { type: 'string', description: 'Category id for op=removeCategory, or the id to rename for op=category.' },
        label: { type: 'string', description: 'Category label shown in the panel, for op=category.' },
        key: { type: 'string', description: 'Zotero item key (8 characters), for op=get/add/remove.' },
        category: { type: 'string', description: 'Category id the entry belongs to, for op=add.' },
        title: { type: 'string', description: 'Paper title shown on the card, for op=add.' },
        authors: { type: 'array', items: { type: 'string' }, description: 'Optional author names for the card meta line.' },
        year: { type: 'number', description: 'Optional publication year.' },
        note: { type: 'string', description: 'Markdown note shown when the card expands; pass an empty string to clear it.' }
      },
      required: ['op']
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
      try {
        const root = projectRoot(ctx, exec?.agent?.session?.header?.id ?? exec?.agent?.session?.id)
        if (root === '') return { error: 'LITERATURE_NO_PROJECT: no project root for this session' }
        const op = String(args?.op ?? '')
        if (op === 'list') return literaturePayload(root)
        if (op === 'get') {
          const key = text(args?.key, 16).toUpperCase()
          const found = findEntry(readLiteratureIndex(root), key)
          if (found === null) return { error: `LITERATURE_NOT_FOUND: no entry ${key}` }
          return { category: found.category.id, ...found.entry, note: readLiteratureNote(root, key) }
        }
        if (op === 'category') {
          const category = upsertCategory(root, { id: args?.id, label: args?.label })
          return { category, index: literaturePayload(root) }
        }
        if (op === 'removeCategory') {
          removeCategory(root, args?.id)
          return literaturePayload(root)
        }
        if (op === 'add') {
          const entry = upsertLiteratureEntry(root, args ?? {})
          return { entry: { ...entry, note: readLiteratureNote(root, entry.key) }, index: literaturePayload(root) }
        }
        if (op === 'remove') {
          const removed = removeLiteratureEntry(root, args?.key)
          return { ...removed, index: literaturePayload(root) }
        }
        return { error: `Unknown op "${op}".` }
      } catch (error) {
        if (error instanceof LiteratureError) return { error: `${error.code}: ${error.message}` }
        return { error: `${error?.name ?? 'Error'}: ${error?.message ?? String(error)}` }
      }
    }
  })

  let disposeRoute = () => {}
  if (typeof ctx?.webServer?.register === 'function') {
    const handler = async (req, res) => {
      try {
        if (localRequest(req) === false) {
          jsonResponse(res, 403, { ok: false, error: 'literature requests must come from the local GUI' })
          return
        }
        if (req.method !== 'GET') {
          jsonResponse(res, 405, { ok: false, error: 'method not allowed' })
          return
        }
        const url = new URL(req.url ?? '/', 'http://127.0.0.1')
        const sessionId = String(url.searchParams.get('session') ?? '')
        const root = projectRoot(ctx, sessionId)
        if (root === '') {
          jsonResponse(res, 404, { ok: false, error: 'cannot resolve the project for this session' })
          return
        }
        jsonResponse(res, 200, { ok: true, ...literaturePayload(root) })
      } catch (error) {
        jsonResponse(res, 200, { ok: false, error: String(error?.message ?? error) })
      }
    }
    try {
      disposeRoute = ctx.webServer.register({ kind: 'exact', path: ROUTE, handler })
    } catch (error) {
      const message = String(error?.message ?? error)
      if (!message.includes(`webserver: duplicate exact route "${ROUTE}"`)) throw error
    }
  }
  return () => {
    if (typeof disposeRoute === 'function') disposeRoute()
    if (typeof dispose === 'function') dispose()
  }
}
