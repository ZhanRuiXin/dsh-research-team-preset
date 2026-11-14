/**
 * Research-team persona row (preset-scoped).
 *
 * Registers the shared core (`prompt/core.md`) as the deployment persona prefix
 * for the preset's scope, shadowing the deployment persona exactly like
 * `@deepseek-ai/dsh-persona`. Role duties are built-in skills
 * (`plugin/roles.js`), not prompt sections, so the Lead and every teammate
 * share one identical system prompt and the provider prompt cache is reused
 * across the team.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PROMPT_ROOT = join(HERE, '..', 'prompt')

/** The persona section names the prompt registry renders for the deployment persona. */
export const PERSONA_PREFIX_SECTION = 'deployment:persona-prefix'
export const PERSONA_SUFFIX_SECTION = 'deployment:persona-suffix'

/**
 * The shared core text every member receives.
 * @returns {string}
 */
export function corePrompt() {
  return readFileSync(join(PROMPT_ROOT, 'core.md'), 'utf8').trim()
}

/** Cordis plugin name. */
export const name = 'research-team-prompt'

/** The prompt registry this row contributes to. */
export const inject = ['systemPrompt']

/**
 * Register the shared core as the deployment persona prefix for this scope.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
export function apply(ctx) {
  const text = corePrompt()
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
