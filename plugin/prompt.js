/**
 * Research-team persona row (preset-scoped).
 *
 * The identity is split into a shared core (`prompt/core.md`) plus one brief
 * per role (`prompt/roles/<role>.md`), so a teammate loads its own duties
 * instead of every role's. Mounted inside an agent preset, this row registers
 * the deployment persona prefix for that agent's scope and thereby shadows the
 * deployment persona, exactly like `@deepseek-ai/dsh-persona`.
 *
 * The Lead preset mounts `role: lead` (core + Lead brief). The member preset
 * mounts `role: member` and registers the core only; the spawn tool prepends
 * the member's role brief to its task message, which keeps the system prefix
 * byte-identical across every member so the provider prompt cache is reused.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PROMPT_ROOT = join(HERE, '..', 'prompt')

/** The persona section names the prompt registry renders for the deployment persona. */
export const PERSONA_PREFIX_SECTION = 'deployment:persona-prefix'
export const PERSONA_SUFFIX_SECTION = 'deployment:persona-suffix'

/** Roles that have their own brief file under `prompt/roles/`. */
export const ROLES = Object.freeze([
  'lead',
  'advisor',
  'researcher',
  'data',
  'designer',
  'builder',
  'runner',
  'reviewer',
  'writer'
])

/**
 * Read one prompt file from the package.
 * @param {string} relative path below `prompt/`
 * @returns {string}
 */
function read(relative) {
  return readFileSync(join(PROMPT_ROOT, relative), 'utf8').trim()
}

/** The shared core text every member receives. @returns {string} */
export function corePrompt() {
  return read('core.md')
}

/**
 * One role's brief.
 * @param {string} role a value from {@link ROLES}
 * @returns {string}
 */
export function rolePrompt(role) {
  if (typeof role !== 'string' || !ROLES.includes(role)) {
    throw new Error(`unknown research-team role "${String(role)}"; expected one of ${ROLES.join(', ')}`)
  }
  return read(join('roles', `${role}.md`))
}

/**
 * Composed persona for one preset row.
 * @param {'lead' | 'member' | string} role `lead`, `member`, or a role name
 * @returns {string}
 */
export function personaFor(role) {
  if (role === 'member') return corePrompt()
  return `${corePrompt()}\n\n${rolePrompt(role === undefined ? 'lead' : role)}`
}

/** Cordis plugin name. */
export const name = 'research-team-prompt'

/** The prompt registry this row contributes to. */
export const inject = ['systemPrompt']

/**
 * Register the preset persona as the deployment persona prefix for this scope.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {{ role?: string }} [config]
 */
export function apply(ctx, config = {}) {
  const role = typeof config.role === 'string' && config.role.length > 0 ? config.role : 'lead'
  const text = personaFor(role)
  ctx.effect(() => ctx.systemPrompt.section({
    name: PERSONA_PREFIX_SECTION,
    order: ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX'),
    text,
    interpolate: false
  }), 'research-team-prompt.section()')
  ctx.effect(() => ctx.systemPrompt.section({
    name: PERSONA_SUFFIX_SECTION,
    order: ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_SUFFIX'),
    text: ''
  }), 'research-team-prompt.suffix()')
}
