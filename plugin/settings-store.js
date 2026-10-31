/**
 * Shared in-process store for the per-role default teammate routes.
 *
 * The host settings plugin (`settings/index.js`) fills it from the settings
 * JSON file and keeps it current when the Plugins-page form saves. The
 * modeled-teammates submodule reads it at spawn time, so edits on the settings
 * page apply to the next teammate without restarting DSH.
 */

export const ROLE_NAMES = Object.freeze(['advisor', 'researcher', 'data', 'builder', 'runner', 'reviewer', 'writer'])

let current = Object.freeze({ roles: Object.freeze({}) })
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
  current = next !== null && typeof next === 'object' ? next : Object.freeze({ roles: Object.freeze({}) })
}

/**
 * Resolve the configured route for one default role.
 * An empty provider or model means "inherit the Lead's route".
 */
export function modelForRole(name) {
  refreshSettings()
  const roles = current.roles
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
