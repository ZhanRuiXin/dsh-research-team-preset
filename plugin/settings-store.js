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

export const ROLE_NAMES = Object.freeze(['advisor', 'researcher', 'data', 'builder', 'runner', 'reviewer', 'writer'])

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
 * Resolve the configured route for one default role in the active profile.
 * An empty provider or model means "inherit the Lead's route".
 */
export function modelForRole(name) {
  refreshSettings()
  const profile = activeProfile(current)
  if (profile === undefined) return undefined
  const roles = profile.roles
  if (roles === null || typeof roles !== 'object') return undefined
  const role = roles[name]
  if (role === null || typeof role !== 'object') return undefined
  const provider = typeof role.provider === 'string' ? role.provider.trim() : ''
  const model = typeof role.model === 'string' ? role.model.trim() : ''
  if (provider === '' || model === '') return undefined
  const out = { provider, model }
  if (typeof role.reasoningEffort === 'string' && role.reasoningEffort.trim() !== '') {
    out.reasoningEffort = role.reasoningEffort.trim()
  }
  return out
}
