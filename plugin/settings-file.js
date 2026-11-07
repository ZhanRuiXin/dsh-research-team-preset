/**
 * Settings-file reader for the modeled-teammates submodule.
 *
 * The per-role routes live in `$DSH_HOME/research-team-settings.json`. The host
 * settings plugin (`settings/index.js`) loads that file into the shared
 * in-process store (`plugin/settings-store.js`) and the modeled-teammates
 * submodule read the store. That made a preset submodule depend on a top-level
 * host row having run in the same module instance first: whenever the store was
 * still empty, `modelForRole` returned undefined and every teammate silently
 * inherited the Lead route, with nothing in the tool result saying why.
 *
 * This module removes that dependency. It reads the same file with the same
 * path rule, the same tolerance for the version-2 and legacy shapes, and the
 * same role names, so a spawn resolves the configured route even when the host
 * store was never populated in this process.
 *
 * Reads are cheap (one small JSON file) and always happen at call time, so a
 * settings-page save applies to the next teammate without a restart.
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ROLE_NAMES } from './settings-store.js'

export const SETTINGS_FILE_NAME = 'research-team-settings.json'

/** Same path rule as the host settings plugin. */
export function settingsPath() {
  const home = typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME !== ''
    ? process.env.DSH_HOME
    : path.join(os.homedir(), '.dsh')
  return path.join(home, SETTINGS_FILE_NAME)
}

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : undefined
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function messageFrom(error) {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Tolerant normalization, mirroring `normalizeSettings` in the host plugin.
 * Accepts `{ version, activeProfileId, profiles }`, the legacy `{ roles }`
 * shape, and a bare role map; always yields at least one profile.
 */
function normalize(input) {
  const source = object(input) ?? {}
  let rawProfiles
  if (Array.isArray(source.profiles) && source.profiles.length > 0) {
    rawProfiles = source.profiles
  } else if (source.roles !== undefined) {
    rawProfiles = [{ id: 'default', name: '默认配置', roles: source.roles }]
  } else if (Object.keys(source).length > 0) {
    rawProfiles = [{ id: 'default', name: '默认配置', roles: source }]
  } else {
    rawProfiles = [{ id: 'default', name: '默认配置', roles: {} }]
  }
  const profiles = []
  for (const item of rawProfiles) {
    const profile = object(item)
    if (profile === undefined) continue
    const roles = object(profile.roles) ?? object(profile) ?? {}
    profiles.push({
      id: text(profile.id) === '' ? `profile-${profiles.length + 1}` : text(profile.id),
      name: text(profile.name),
      roles
    })
  }
  if (profiles.length === 0) profiles.push({ id: 'default', name: '默认配置', roles: {} })
  const wanted = text(source.activeProfileId)
  const activeProfileId = profiles.some((profile) => profile.id === wanted) ? wanted : profiles[0].id
  return { version: 2, activeProfileId, profiles }
}

/**
 * Read the settings file and resolve the routes of the active profile.
 *
 * Returns `{ file, profile, activeProfileId, routes, error }` where `routes`
 * holds only fully configured roles (`{ provider, model, reasoningEffort? }`).
 * Read errors are reported in `error` instead of thrown, so a spawn can still
 * inherit the Lead route and say why.
 */
export function readRouteTable(file = settingsPath()) {
  let raw
  try {
    raw = fs.readFileSync(file, 'utf8')
  } catch (error) {
    const missing = error !== null && typeof error === 'object' && error.code === 'ENOENT'
    return {
      file,
      profile: undefined,
      activeProfileId: undefined,
      routes: {},
      error: `settings file ${missing ? 'is missing' : 'is unreadable'}: ${messageFrom(error)}`
    }
  }

  let parsed
  try {
    // A byte-order mark written by an editor would otherwise fail JSON.parse
    // and silently empty every role for that whole DSH session.
    parsed = JSON.parse(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw)
  } catch (error) {
    return {
      file,
      profile: undefined,
      activeProfileId: undefined,
      routes: {},
      error: `settings file is not valid JSON: ${messageFrom(error)}`
    }
  }

  const settings = normalize(parsed)
  const profile = settings.profiles.find((item) => item.id === settings.activeProfileId) ?? settings.profiles[0]
  const routes = {}
  for (const role of ROLE_NAMES) {
    const value = object(profile.roles[role]) ?? {}
    const provider = text(value.provider)
    const model = text(value.model)
    if (provider === '' || model === '') continue
    const route = { provider, model }
    const effort = text(value.reasoningEffort)
    if (effort !== '') route.reasoningEffort = effort
    routes[role] = route
  }
  return {
    file,
    profile: profile.name === '' ? profile.id : profile.name,
    activeProfileId: settings.activeProfileId,
    routes,
    error: undefined
  }
}
