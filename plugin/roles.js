/**
 * Research-team role skills.
 *
 * The preset has one system prompt (`prompt/core.md`) for every member. Each
 * role's own duties live here as a built-in skill, so a teammate loads only
 * the brief for its role, on demand, through the `skill` tool. The provider
 * reads the briefs at apply time and serves them from memory.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PROMPT_ROOT = join(HERE, '..', 'prompt')

/** Ranks the built-in skills just above bundled documentation skills. */
const SKILL_RANK = 600

/** When a role brief is worth loading, written for the catalog listing. */
const WHEN_TO_LOAD = Object.freeze({
  lead: 'you are the Lead of a research-team session: spawning and routing teammates, consulting the advisor, and reporting to the user.',
  advisor: 'your task is an advisor review: a decision-level second opinion on a plan, design or result rather than line-by-line code review.',
  researcher: 'you survey literature, collect sources and build the evidence table for the project.',
  data: 'you acquire, validate or prepare datasets for experiments.',
  designer: 'you design an experiment or study: the question, claims, baselines, controls, statistics and budget.',
  builder: 'you implement code or change the pipeline for an experiment in this project.',
  runner: 'you launch, monitor, stop or report experiment runs.',
  reviewer: 'you review a proposal or a result against its manifest, or audit the code that produced it.',
  writer: 'you draft, revise or typeset the paper, figures, tables or the supplementary material.'
})

/** Roles that have their own brief file under `prompt/roles/`. */
export const ROLES = Object.freeze(Object.keys(WHEN_TO_LOAD))

/** The skill name a role loads. @param {string} role @returns {string} */
export function roleSkill(role) {
  return `research-role-${role}`
}

/** Skill bodies and catalog entries, read once when the plugin applies. */
const INVOCATION = Object.freeze({ modelInvocable: true, userInvocable: true })
const PROVIDER_NAME = 'research-team-roles'

const CANDIDATES = ROLES.map((role, index) => Object.freeze({
  name: roleSkill(role),
  description: `Research-team role brief for the ${role} role. Load it when ${WHEN_TO_LOAD[role]}`,
  invocation: INVOCATION,
  provider: PROVIDER_NAME,
  source: 'bundled',
  rank: SKILL_RANK + index,
  locator: role
}))

const BODIES = new Map(ROLES.map(role => [
  role,
  readFileSync(join(PROMPT_ROOT, 'roles', `${role}.md`), 'utf8').trim()
]))

const provider = {
  name: PROVIDER_NAME,
  list: () => Promise.resolve(CANDIDATES),
  async get(candidate) {
    const role = ROLES.find(entry => roleSkill(entry) === candidate.name)
    if (role === undefined) return undefined
    const candidateEntry = CANDIDATES[ROLES.indexOf(role)]
    return {
      name: candidateEntry.name,
      description: candidateEntry.description,
      invocation: INVOCATION,
      provider: PROVIDER_NAME,
      source: 'bundled',
      content: BODIES.get(role)
    }
  }
}

/** Cordis plugin name. */
export const name = 'research-team-roles'

/** The skill registry this row contributes to. */
export const inject = ['skills']

/** Register the nine role briefs as built-in skills. @param {import('@deepseek-ai/cordis').Context} ctx */
export function apply(ctx) {
  ctx.skills.registerProvider(() => provider)
}
