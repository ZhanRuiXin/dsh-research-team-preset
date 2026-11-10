/**
 * Host half of the Research sidebar module.
 *
 * The panel itself is a client module (`client/panel.js`, served as this
 * package's `dsh.client` bundle). This host entry exists so the module can be
 * mounted, enabled and disabled on its own, separately from the settings
 * plugin that the preset's root package provides; it deliberately registers
 * nothing else, because the panel route (`/api/dsh-research-team-panel`) and
 * the `research_architecture` tool stay with the project tools.
 */

export const name = 'research-team-panel'

export const inject = []

/** Mounted by the root patch as its own row; no host-side registration. */
export function apply() {}
