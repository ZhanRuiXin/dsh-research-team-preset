/**
 * Host half of the Research Team default-route settings page.
 *
 * A top-level plugin row (`research-team-settings`) that:
 * - loads `$DSH_HOME/research-team-settings.json` into the shared store;
 * - serves GET/POST `/api/dsh-research-team-settings` for the Web GUI page
 *   registered by this bundle's client half;
 * - writes the file and updates the store, so the next teammate spawn sees
 *   the new defaults without restarting.
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
const MAX_BODY = 64 * 1024

function settingsPath() {
  const home = typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME !== ''
    ? process.env.DSH_HOME
    : path.join(os.homedir(), '.dsh')
  return path.join(home, 'research-team-settings.json')
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalize(input) {
  const source = input !== null && typeof input === 'object' ? input : {}
  const roles = {}
  for (const role of ROLE_NAMES) {
    const value = source[role] !== null && typeof source[role] === 'object' ? source[role] : {}
    const provider = text(value.provider)
    const model = text(value.model)
    const paired = provider !== '' && model !== ''
    roles[role] = {
      provider: paired ? provider : '',
      model: paired ? model : '',
      reasoningEffort: paired ? text(value.reasoningEffort) : ''
    }
  }
  return { roles }
}

function load(file) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    const roles = parsed !== null && typeof parsed === 'object' && parsed.roles !== undefined ? parsed.roles : parsed
    return normalize(roles)
  } catch {
    return undefined
  }
}

function save(file, settings) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(settings, null, 2)}\n`, 'utf8')
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
  setSettings(load(file) ?? normalize({}))

  const handler = async (req, res) => {
    try {
      if (!trusted(req)) {
        json(res, 403, { ok: false, error: 'settings requests must come from the local GUI' })
        return
      }
      if (req.method === 'GET') {
        json(res, 200, { ok: true, roles: getSettings().roles })
        return
      }
      if (req.method !== 'POST') {
        json(res, 405, { ok: false, error: 'method not allowed' })
        return
      }
      const body = await readJson(req)
      const next = normalize(body !== null && typeof body === 'object' && body.roles !== undefined ? body.roles : body)
      save(file, next)
      setSettings(next)
      json(res, 200, { ok: true, roles: next.roles })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
    }
  }

  const dispose = ctx.webServer.register({ kind: 'exact', path: ROUTE, handler })
  return () => dispose()
}
