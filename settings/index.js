/**
 * Host half of the Research Team model-profile settings page.
 *
 * A top-level plugin row (`research-team-settings`) that:
 * - loads `$DSH_HOME/research-team-settings.json` into the shared store;
 * - serves GET/POST `/api/dsh-research-team-settings` for the Web GUI page
 *   registered by this bundle's client half;
 * - writes the file and updates the store, so the next teammate spawn sees
 *   the selected profile without restarting.
 *
 * The settings file supports several named team profiles:
 *
 *   {
 *     "version": 2,
 *     "activeProfileId": "default",
 *     "profiles": [
 *       { "id": "default", "name": "默认配置", "roles": { "advisor": { ... } } }
 *     ]
 *   }
 *
 * A legacy file (`{ roles: { ... } }` or a bare role map) is migrated in
 * memory to a single profile named 默认配置; the file itself is only written
 * on the next save.
 *
 * The page is registered at
 * `plugins.row.config` key `@local/dsh-research-team-preset#research-team-settings`.
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ROLE_NAMES, getSettings, setSettings, setSettingsLoader } from '../plugin/settings-store.js'

export const name = 'research-team-settings'

export const inject = ['webServer']

const ROUTE = '/api/dsh-research-team-settings'
const MAX_BODY = 256 * 1024
const MAX_PROFILES = 50
const MAX_NAME = 60
const PROFILE_ID = /^[A-Za-z0-9_-]{1,64}$/
const LEGACY_PROFILE_ID = 'default'
const LEGACY_PROFILE_NAME = '默认配置'

function settingsPath() {
  const home = typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME !== ''
    ? process.env.DSH_HOME
    : path.join(os.homedir(), '.dsh')
  return path.join(home, 'research-team-settings.json')
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : undefined
}

function freshId(used) {
  let id
  do {
    id = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  } while (used.has(id))
  return id
}

function normalizeRoles(input) {
  const source = object(input) ?? {}
  const roles = {}
  for (const role of ROLE_NAMES) {
    const value = object(source[role]) ?? {}
    const provider = text(value.provider)
    const model = text(value.model)
    const paired = provider !== '' && model !== ''
    roles[role] = {
      provider: paired ? provider : '',
      model: paired ? model : '',
      reasoningEffort: paired ? text(value.reasoningEffort) : ''
    }
  }
  return roles
}

/**
 * Strict profile list validation for POST bodies. Throws an Error whose
 * message is shown to the settings page, so a bad save never drops profiles.
 */
function parseProfiles(value) {
  if (!Array.isArray(value) || value.length === 0) throw new Error('至少需要一套团队配置')
  if (value.length > MAX_PROFILES) throw new Error(`团队配置最多 ${MAX_PROFILES} 套`)
  const names = new Set()
  const ids = new Set()
  return value.map((item, index) => {
    const source = object(item)
    if (source === undefined) throw new Error(`第 ${index + 1} 套团队配置格式不正确`)
    const name = text(source.name)
    if (name === '') throw new Error(`第 ${index + 1} 套团队配置缺少名称`)
    if (name.length > MAX_NAME) throw new Error(`团队配置名称「${name.slice(0, 16)}…」超过 ${MAX_NAME} 个字符`)
    if (names.has(name)) throw new Error(`团队配置名称「${name}」重复，请改成唯一名称`)
    names.add(name)
    let id = text(source.id)
    if (id !== '' && !PROFILE_ID.test(id)) throw new Error(`团队配置「${name}」的内部 id 不合法`)
    if (id !== '') {
      if (ids.has(id)) throw new Error(`团队配置「${name}」的内部 id 与其他配置重复`)
      ids.add(id)
    } else {
      id = freshId(ids)
    }
    ids.add(id)
    return { id, name, roles: normalizeRoles(source.roles) }
  })
}

/** Tolerant single-profile normalization used for loading and migration. */
function normalizeProfile(source, index, usedIds, usedNames) {
  const raw = object(source) ?? {}
  let id = text(raw.id)
  if (!PROFILE_ID.test(id) || usedIds.has(id)) id = freshId(usedIds)
  usedIds.add(id)
  let name = text(raw.name).slice(0, MAX_NAME)
  if (name === '') name = `配置 ${index + 1}`
  if (usedNames.has(name)) {
    let suffix = 2
    while (usedNames.has(`${name} (${suffix})`)) suffix += 1
    name = `${name} (${suffix})`
  }
  usedNames.add(name)
  return { id, name, roles: normalizeRoles(raw.roles ?? raw) }
}

/**
 * Tolerant normalization of a whole settings object. Accepts the version-2
 * shape, the legacy `{ roles }` shape, and a bare role map; always returns at
 * least one profile and an activeProfileId that points at one of them.
 */
export function normalizeSettings(input) {
  const source = object(input) ?? {}
  let rawProfiles
  if (Array.isArray(source.profiles)) {
    rawProfiles = source.profiles
  } else if (source.roles !== undefined) {
    rawProfiles = [{ id: LEGACY_PROFILE_ID, name: LEGACY_PROFILE_NAME, roles: source.roles }]
  } else if (Object.keys(source).length > 0) {
    rawProfiles = [{ id: LEGACY_PROFILE_ID, name: LEGACY_PROFILE_NAME, roles: source }]
  } else {
    rawProfiles = [{ id: LEGACY_PROFILE_ID, name: LEGACY_PROFILE_NAME, roles: {} }]
  }
  if (rawProfiles.length === 0) rawProfiles = [{ id: LEGACY_PROFILE_ID, name: LEGACY_PROFILE_NAME, roles: {} }]
  const usedIds = new Set()
  const usedNames = new Set()
  const profiles = rawProfiles.slice(0, MAX_PROFILES).map((item, index) => normalizeProfile(item, index, usedIds, usedNames))
  const wanted = text(source.activeProfileId)
  const activeProfileId = profiles.some((profile) => profile.id === wanted) ? wanted : profiles[0].id
  return { version: 2, activeProfileId, profiles }
}

/**
 * Parse a POST body. The version-2 shape replaces the whole profile list; a
 * legacy `{ roles }` (or bare role map) body replaces only the roles of the
 * active profile so older scripts cannot silently drop the other profiles.
 */
function parseBody(body, current) {
  const source = object(body)
  if (source === undefined) throw new Error('请求体必须是 JSON 对象')
  if (Array.isArray(source.profiles)) {
    const profiles = parseProfiles(source.profiles)
    const wanted = text(source.activeProfileId)
    const activeProfileId = profiles.some((profile) => profile.id === wanted) ? wanted : profiles[0].id
    return { version: 2, activeProfileId, profiles }
  }
  const legacyRoles = source.roles !== undefined || ROLE_NAMES.some((role) => source[role] !== undefined)
  if (!legacyRoles) throw new Error('请求体缺少 profiles')
  const settings = normalizeSettings(current)
  const activeIndex = Math.max(0, settings.profiles.findIndex((profile) => profile.id === settings.activeProfileId))
  settings.profiles = settings.profiles.map((profile, index) => index === activeIndex
    ? { ...profile, roles: normalizeRoles(source.roles !== undefined ? source.roles : source) }
    : profile)
  return settings
}

function load(file) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    return normalizeSettings(parsed)
  } catch {
    return undefined
  }
}

function save(file, settings) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(settings, null, 2)}\n`, 'utf8')
}

function payload(settings) {
  const profiles = Array.isArray(settings.profiles) ? settings.profiles : []
  const active = profiles.find((profile) => profile.id === settings.activeProfileId) ?? profiles[0]
  return {
    ok: true,
    version: 2,
    activeProfileId: settings.activeProfileId,
    profiles,
    roles: active === undefined ? normalizeRoles({}) : active.roles
  }
}

function json(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(value))
}

function trusted(req) {
  const origin = req.headers === undefined ? undefined : req.headers.origin
  if (typeof origin !== 'string' || origin === '') return true
  try {
    const parsed = new URL(origin)
    const host = req.headers === undefined ? undefined : req.headers.host
    if (typeof host === 'string' && parsed.host === host) return true
    return parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost' || parsed.hostname === '::1' || parsed.hostname === '[::1]'
  } catch {
    return false
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(new Error('settings body is too large'))
        req.destroy()
        return
      }
      chunks.push(Buffer.from(chunk))
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

export function apply(ctx) {
  const file = settingsPath()
  setSettingsLoader(() => load(file))
  setSettings(load(file) ?? normalizeSettings(undefined))

  const handler = async (req, res) => {
    try {
      if (!trusted(req)) {
        json(res, 403, { ok: false, error: 'settings requests must come from the local GUI' })
        return
      }
      if (req.method === 'GET') {
        json(res, 200, payload(getSettings()))
        return
      }
      if (req.method !== 'POST') {
        json(res, 405, { ok: false, error: 'method not allowed' })
        return
      }
      const body = await readJson(req)
      const next = parseBody(body, getSettings())
      save(file, next)
      setSettings(next)
      json(res, 200, payload(next))
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
    }
  }

  const dispose = ctx.webServer.register({ kind: 'exact', path: ROUTE, handler })
  return () => dispose()
}
