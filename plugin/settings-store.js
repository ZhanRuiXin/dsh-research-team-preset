/**
 * Shared in-process store for the default teammate model profiles.
 *
 * The host settings plugin (`settings/index.js`) fills it from the settings
 * JSON file and keeps it current when the Plugins-page form saves. The
 * modeled-teammates submodule reads it at spawn time, so edits on the settings
 * page apply to the next teammate without restarting DSH.
 *
 * The snapshot is `{ version, activeProfileId, profiles: [{ id, name, roles }] }`.
 * `modelForRole` resolves the role in the active profile only, so switching
 * profiles on the settings page changes the next teammate's route.
 */

export const ROLE_NAMES = Object.freeze(['advisor', 'designer', 'researcher', 'data', 'builder', 'runner', 'reviewer', 'writer'])

const EMPTY = Object.freeze({ version: 2, activeProfileId: '', profiles: Object.freeze([]) })

let current = EMPTY
let loader

/** Install the loader that reads the settings file, or clear it. */
export function setSettingsLoader(next) {
  loader = typeof next === 'function' ? next : undefined
}

/**
 * Re-read the settings file into the snapshot.
 * A loader that returns undefined (missing or invalid file) keeps the current
 * snapshot instead of resetting it to empty.
 */
export function refreshSettings() {
  if (loader === undefined) return
  try {
    const next = loader()
    if (next !== undefined) setSettings(next)
  } catch {
    // Keep the last good snapshot on a transient read failure.
  }
}

/** Current settings snapshot, refreshed from the loader when one is installed. */
export function getSettings() {
  refreshSettings()
  return current
}

/** Replace the settings snapshot (normalized by the caller). */
export function setSettings(next) {
  current = next !== null && typeof next === 'object' && !Array.isArray(next) ? next : EMPTY
}

/**
 * Resolve the profile that spawn-time model lookup uses: the profile whose id
 * matches `activeProfileId`, falling back to the first profile.
 */
export function activeProfile(settings) {
  const source = settings !== null && typeof settings === 'object' ? settings : current
  const profiles = Array.isArray(source.profiles) ? source.profiles : []
  const wanted = source.activeProfileId
  return profiles.find((profile) => profile !== null && typeof profile === 'object' && profile.id === wanted)
    ?? profiles.find((profile) => profile !== null && typeof profile === 'object')
}

/**
 * Match a teammate name to one of the standard roles.
 *
 * An exact match used to be required, so a Lead that named a member after the
 * role plus a qualifier ("ELHA-R advisor", "advisor-hi", "senior_reviewer")
 * silently got no route and the member inherited the Lead route. Match the role
 * as a whole word instead; the first role word in the name wins.
 */
export function matchRoleName(name) {
  const raw = typeof name === 'string' ? name.trim().toLowerCase() : ''
  if (raw === '') return undefined
  if (ROLE_NAMES.includes(raw)) return raw
  const tokens = raw.split(/[^a-z]+/).filter((token) => token !== '')
  for (const token of tokens) {
    if (ROLE_NAMES.includes(token)) return token
  }
  return undefined
}

/**
 * Resolve the configured route for one default role in the active profile.
 * An empty provider or model means "inherit the Lead's route". The returned
 * object carries the matched `role` so callers can report which role a
 * descriptive teammate name resolved to; strip it before using the object as
 * spawn-time agent options.
 */
export function modelForRole(name) {
  refreshSettings()
  const role = matchRoleName(name)
  if (role === undefined) return undefined
  const profile = activeProfile(current)
  if (profile === undefined) return undefined
  const roles = profile.roles
  if (roles === null || typeof roles !== 'object') return undefined
  const value = roles[role]
  if (value === null || typeof value !== 'object') return undefined
  const provider = typeof value.provider === 'string' ? value.provider.trim() : ''
  const model = typeof value.model === 'string' ? value.model.trim() : ''
  if (provider === '' || model === '') return undefined
  const out = { role, provider, model }
  if (typeof value.reasoningEffort === 'string' && value.reasoningEffort.trim() !== '') {
    out.reasoningEffort = value.reasoningEffort.trim()
  }
  return out
}
