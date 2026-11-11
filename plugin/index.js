/**
 * Research-team helpers.
 *
 * 1. `research_project` — resolve the calling session's DSH project
 *    (workspaceId, title, path), because a worklog card must land in the right
 *    project and workspace ids are random.
 * 2. An English coordination-ledger section registered at this preset's
 *    scope: the worklog files are the record.
 *    read or written.
 * 3. `research_workspace_init` — idempotent durable-tracking bootstrap for a
 *    workspace: create `worklog/PLAN.md` and `worklog/INDEX.md` when missing,
 *    and initialize a git repository when the workspace is not already inside
 *    one. The agent decides when to call it; it writes at the registered
 *    project root so every session on the project shares one worklog, never
 *    creates a nested repository, and never commits.
 * 4. `research_scope_check` — compare a role's changed files (explicit paths or
 *    a `git diff`) with that role's default write envelope, so an out-of-scope
 *    handoff fails before the card reaches review.
 */

import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

import {
  appendDecision,
  appendEvidence,
  claimItem,
  gateItem,
  itemCardPath,
  listDecisions,
  listDesigns,
  listEvidence,
  listItems,
  migrateLegacy,
  readDesign,
  readItem,
  readPlan,
  renderViews,
  saveDesign,
  upsertItem,
  worklogDirs,
  worklogSummary,
  writePlan
} from './worklog.js'

export const name = 'research-project'

export const inject = ['tools', 'workspaceRegistry', 'systemPrompt', 'webServer', 'agents']

const execFileAsync = promisify(execFile)

const NL = String.fromCharCode(10)

const PLAN_TEMPLATE = (objective) => `# PLAN

- objective: ${objective}
- milestone: TODO
- active: none
- blocked: none
- decisions: none
- next: TODO
`

const INDEX_TEMPLATE = `| id | title | owner | status | updated | next |
| --- | --- | --- | --- | --- | --- |
`

const GITIGNORE_TEMPLATE = `tmp/
*.log
__pycache__/
.venv/
.dsh-worktrees/
`

/** The coordination ledger: worklog files are the record (see `## Coordination ledger`). */
const WORKLOG_PROTOCOL_EN = `The team records its work in the project worklog. Its machine state is JSON under .research/worklog/: plan.json (objective, milestones, next) and one items/<id>.json per work item (id, title, owner, status, kind, next, blocked, evidence, checklist). worklog/PLAN.md, worklog/INDEX.md and worklog/<id>.md are generated views of that state; read and write the ledger with research_worklog, never by editing the views.
Discipline:
1. Read before acting: call research_state (or research_worklog op=list) before starting, then read the one item you are taking. Do not scan every file in the worklog.
2. Claim before working: call research_worklog op=claim with your role. If another owner holds the item, stop and report; never take it over.
3. Internal steps are items with kind=internal; only steps that need the user's review or acceptance are kind=gated - deliverable checkpoints, scope decisions, risky changes, and the final handoff. Do not create an item per internal step, and never leave user-facing work only in chat.
4. Handoff: before moving an item to in_review, run research_scope_check on the changed paths, then record the checklist items with evidence, the execution summary (changed files, self-checks, risks), the base..head commit range when the project uses git, and the next action with research_worklog op=gate.
5. Review: the reviewer independently re-checks the item and records a PASS/FAIL verdict with evidence through research_worklog op=update; the Lead decides reopen or rework.
6. Acceptance belongs to the user: never mark an item done. done means the user accepted it (op=update with by="user" after they do); blocked means the work cannot continue; canceled means it will not.
7. Record decisions with research_decision, evidence with research_evidence, and design fields with research_design; the tools render PLAN.md and docs/evidence.md, so those files are never edited by hand.
8. Report at gates only: when a gate is reached or the user must act, report the item id, status and evidence. Do not narrate ledger bookkeeping between gates.
9. Ask the user with ask_user_question when you need input, a login, or a decision, and record the wait on the item instead of a status field of an external tool. If the answer does not arrive within the wait timeout, ask the advisor for an independent recommendation, record it with research_decision, and keep the work moving; the advisor's reply is advice, not the user's approval.
The worklog lives at the project root returned by research_project and is the record.`

async function runGit(cwd, args) {
  return execFileAsync('git', args, { cwd, windowsHide: true, maxBuffer: 1024 * 1024 })
}

function oneLine(value) {
  return String(value === null || value === undefined ? '' : value).replace(/\s+/g, ' ').trim()
}

/**
 * Idempotently bootstrap durable work tracking in one workspace.
 *
 * - Creates `worklog/PLAN.md` (seeded with the objective) and
 *   `worklog/INDEX.md` when they are missing; existing files are untouched.
 * - Initializes a git repository only when the workspace is not already inside
 *   one; a nested repository is never created and nothing is committed.
 * - Adds a minimal `.gitignore` only when it created the repository and the
 *   workspace has none.
 *
 * @param {string} cwd - workspace directory to initialize.
 * @param {string} [objective] - one-line goal seeded into PLAN.md.
 * @returns {Promise<object>} `{ cwd, gitState, repoRoot, created, notes }`.
 */
export async function initWorkspace(cwd, objective = '') {
  const created = []
  const notes = []
  let repoRoot
  try {
    const { stdout } = await runGit(cwd, ['rev-parse', '--show-toplevel'])
    repoRoot = stdout.trim()
    notes.push(`git: already inside a repository at ${repoRoot}`)
  } catch {
    repoRoot = undefined
  }

  let gitState
  if (repoRoot !== undefined) {
    gitState = 'existing'
  } else {
    try {
      await runGit(cwd, ['init'])
      gitState = 'created'
      notes.push('git: initialized a new repository (nothing committed)')
    } catch (error) {
      gitState = 'failed'
      notes.push(`git: init failed (${oneLine(error instanceof Error ? error.message : error)})`)
    }
  }

  const dirs = worklogDirs(cwd)
  const planPath = dirs.planView
  const indexPath = dirs.indexView
  if (!fs.existsSync(dirs.planFile)) {
    const goal = oneLine(objective)
    const legacyPlan = fs.existsSync(path.join(cwd, 'worklog', 'PLAN.md'))
    const legacyIndex = fs.existsSync(path.join(cwd, 'worklog', 'INDEX.md'))
    if (legacyPlan || legacyIndex) {
      const imported = migrateLegacy(cwd)
      notes.push(...imported.notes)
      if (imported.items > 0) notes.push(`worklog: imported ${imported.items} item(s) from the legacy markdown index`)
    } else {
      writePlan(cwd, { objective: goal.length > 0 ? goal : 'TODO' })
    }
    created.push('worklog/PLAN.md', 'worklog/INDEX.md')
  } else {
    renderViews(cwd)
    notes.push('worklog: PLAN.md and INDEX.md already present')
  }

  if (gitState === 'created') {
    const ignorePath = path.join(cwd, '.gitignore')
    if (!fs.existsSync(ignorePath)) {
      fs.writeFileSync(ignorePath, GITIGNORE_TEMPLATE, 'utf8')
      created.push('.gitignore')
    }
  }

  return {
    cwd,
    gitState,
    ...(repoRoot === undefined ? {} : { repoRoot }),
    created,
    notes,
  }
}

/**
 * Default write envelope per standard role. `null` means unrestricted (the
 * Lead). A project may narrow or extend an envelope in AGENTS.md or on the
 * card; this table is the default the check falls back to.
 */
export const WRITE_ENVELOPES = Object.freeze({
  advisor: Object.freeze([]),
  researcher: Object.freeze(['literature/', 'notes/', 'docs/evidence']),
  data: Object.freeze(['data/', 'manifests/', 'scripts/', 'reports/']),
  designer: Object.freeze(['docs/design/', '.research/architecture/']),
  builder: Object.freeze(['src/', 'configs/', 'tests/']),
  runner: Object.freeze(['runs/', 'logs/', 'checkpoints/']),
  reviewer: Object.freeze([]),
  writer: Object.freeze(['paper/', 'figures/']),
  lead: null
})

function normalizeRepoPath(file) {
  return String(file).replace(/\\/g, '/').replace(/^\.\//, '')
}

/**
 * Compare changed files with one role's write envelope.
 *
 * @param {string} role - standard role name.
 * @param {string[]} files - repository-relative changed paths.
 * @param {Record<string, readonly string[] | null>} [envelopes] - envelope table.
 * @returns {object} `{ role, allowed, violations, ok, envelope }`.
 */
export function checkScope(role, files, envelopes = WRITE_ENVELOPES) {
  if (!Object.prototype.hasOwnProperty.call(envelopes, role)) {
    return { error: `unknown role "${role}"; expected one of ${Object.keys(envelopes).join(', ')}` }
  }
  const envelope = envelopes[role]
  const allowed = []
  const violations = []
  for (const file of Array.isArray(files) ? files : []) {
    const normalized = normalizeRepoPath(file)
    if (normalized === '') continue
    const inside = envelope === null || envelope.some((root) => {
      const prefix = root.endsWith('/') ? root : `${root}/`
      return normalized === root || normalized.startsWith(prefix)
    })
    if (inside) allowed.push(normalized)
    else violations.push(normalized)
  }
  return { role, allowed, violations, ok: violations.length === 0, envelope }
}

export function renderExperiment(value) {
  if (value === undefined || value === null) return 'research_experiment: no result'
  if (typeof value.error === 'string') return `research_experiment: ${value.error}`
  if (Array.isArray(value.runs)) {
    const total = value.runs.length
    if (total === 0) return 'research_experiment: no runs recorded under runs/.'
    const lines = value.runs.map((run) => {
      const approval = run.approval === undefined ? '' : ` · ${run.approval}`
      return `- ${run.name}: ${run.state}${approval}${run.seeds === '' ? '' : ` · seeds ${run.seeds}`}`
    })
    return `research_experiment: ${total} run(s), newest first\n${lines.join('\n')}`
  }
  const parts = []
  if (typeof value.run === 'string') parts.push(`run ${value.run}`)
  if (typeof value.state === 'string') parts.push(value.state)
  if (typeof value.approval === 'string') parts.push(`approval ${value.approval}`)
  if (typeof value.startedAt === 'string') parts.push(`started ${value.startedAt}`)
  if (typeof value.finishedAt === 'string') parts.push(`finished ${value.finishedAt}`)
  return `research_experiment: ${parts.join(' · ') || 'done'}`
}

function renderScope(value) {
  if (value !== null && typeof value === 'object' && typeof value.error === 'string') {
    return [{ type: 'text', text: value.error }]
  }
  const role = String(value?.role ?? '(unknown)')
  const total = (Array.isArray(value?.allowed) ? value.allowed.length : 0) +
    (Array.isArray(value?.violations) ? value.violations.length : 0)
  const lines = []
  lines.push(`Scope check for ${role}: ${value?.ok === true ? 'PASS' : 'FAIL'} (${total} changed file${total === 1 ? '' : 's'})`)
  const envelope = value?.envelope
  lines.push(envelope === null
    ? 'Envelope: unrestricted'
    : `Envelope: ${Array.isArray(envelope) && envelope.length > 0 ? envelope.join(', ') : '(none — read-only)'}`)
  for (const file of Array.isArray(value?.violations) ? value.violations : []) {
    lines.push(`- outside envelope: ${file} — move it to its owning role, or record an approved exception on the card before the handoff`)
  }
  if (value?.ok === true) lines.push('Every changed file is inside the envelope.')
  return [{ type: 'text', text: lines.join(NL) }]
}

/* ------------------------------------------------------------------ */
/* Team panel: worklog summary, runs, designs and architecture cards.  */
/* ------------------------------------------------------------------ */

const ARCH_RELATIVE = '.research/architecture'
const ARCH_MAX_NODES = 200
const ARCH_MAX_BODY = 256 * 1024
const NODE_KINDS = ['input', 'module', 'output', 'data', 'loss', 'note']
const CARD_KINDS = ['method', 'model', 'experiment', 'pipeline']

function finiteOr(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function clampNumber(value, low, high, fallback) {
  return Math.round(Math.min(high, Math.max(low, finiteOr(value, fallback))))
}

function shortText(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export function sanitizeCardId(value) {
  const id = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return /^[a-z0-9][a-z0-9_-]{0,63}$/.test(id) ? id : undefined
}

export function architectureDir(root) {
  return path.join(root, ARCH_RELATIVE)
}

export function normalizeArchitectureCard(input, previous) {
  if (input === null || typeof input !== 'object') return { error: 'card must be an object' }
  const id = sanitizeCardId(input.id ?? previous?.id)
  if (id === undefined) return { error: 'id must match [a-z0-9][a-z0-9_-]{0,63}' }
  const seen = new Set()
  const nodes = []
  for (const raw of Array.isArray(input.nodes) ? input.nodes.slice(0, ARCH_MAX_NODES) : []) {
    if (raw === null || typeof raw !== 'object') continue
    const nodeId = sanitizeCardId(raw.id)
    if (nodeId === undefined || seen.has(nodeId)) return { error: `invalid or duplicate node id: ${String(raw.id)}` }
    seen.add(nodeId)
    nodes.push({
      id: nodeId,
      label: shortText(raw.label, 80) || nodeId,
      kind: NODE_KINDS.includes(raw.kind) ? raw.kind : 'module',
      x: clampNumber(raw.x, 0, 4000, 40),
      y: clampNumber(raw.y, 0, 4000, 40),
      w: clampNumber(raw.w, 60, 600, 160),
      h: clampNumber(raw.h, 30, 240, 56)
    })
  }
  if (nodes.length === 0) return { error: 'card needs at least one node' }
  const edges = []
  for (const raw of Array.isArray(input.edges) ? input.edges : []) {
    if (raw === null || typeof raw !== 'object' || !seen.has(raw.from) || !seen.has(raw.to)) continue
    if (raw.from === raw.to) continue
    edges.push({ from: String(raw.from), to: String(raw.to), label: shortText(raw.label, 60) })
  }
  const notes = []
  const rawNotes = Array.isArray(input.notes) ? input.notes : Array.isArray(previous?.notes) ? previous.notes : []
  for (const raw of rawNotes) {
    const body = shortText(raw?.text, 800)
    if (body === '') continue
    notes.push({
      id: sanitizeCardId(raw?.id) ?? `n${notes.length + 1}`,
      text: body,
      targets: Array.isArray(raw?.targets) ? raw.targets.filter((target) => seen.has(target)).slice(0, 20) : [],
      createdAt: typeof raw?.createdAt === 'string' ? raw.createdAt : new Date().toISOString()
    })
  }
  return {
    id,
    title: shortText(input.title ?? previous?.title, 80) || id,
    kind: CARD_KINDS.includes(input.kind) ? input.kind : previous?.kind ?? 'method',
    version: (previous?.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
    canvas: {
      width: clampNumber(input.canvas?.width, 320, 4000, 520),
      height: clampNumber(input.canvas?.height, 200, 4000, 300)
    },
    nodes,
    edges,
    notes
  }
}

export function readArchitectureCard(root, id) {
  const cardId = sanitizeCardId(id)
  if (cardId === undefined) return undefined
  try {
    return JSON.parse(fs.readFileSync(path.join(architectureDir(root), `${cardId}.json`), 'utf8'))
  } catch {
    return undefined
  }
}

export function listArchitectureCards(root) {
  const dir = architectureDir(root)
  let names = []
  try {
    names = fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort()
  } catch {
    return []
  }
  const cards = []
  for (const name of names.slice(0, 60)) {
    const id = name.slice(0, -5)
    if (sanitizeCardId(id) === undefined) continue
    const card = readArchitectureCard(root, id)
    if (card !== undefined) cards.push(card)
  }
  return cards
}

export function saveArchitectureCard(root, input, expectedVersion) {
  const id = sanitizeCardId(input?.id)
  if (id === undefined) return { error: 'id must match [a-z0-9][a-z0-9_-]{0,63}' }
  const previous = readArchitectureCard(root, id)
  if (expectedVersion !== undefined && expectedVersion !== null) {
    const current = previous?.version ?? 0
    if (current !== Number(expectedVersion)) {
      return { error: `version conflict: card "${id}" is at v${current}, reload before saving` }
    }
  }
  const next = normalizeArchitectureCard({ ...input, id }, previous)
  if (next.error !== undefined) return next
  const dir = architectureDir(root)
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${id}.json`)
  const temp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(temp, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  fs.renameSync(temp, file)
  return next
}

function readTextFile(file) {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch {
    return ''
  }
}

function planSummary(text) {
  const pick = (key) => {
    const match = text.match(new RegExp(`^\\s*-?\\s*${key}\\s*:\\s*(.*)$`, 'm'))
    return match === null ? '' : match[1].trim()
  }
  return {
    objective: pick('objective'),
    milestone: pick('milestone'),
    active: pick('active'),
    blocked: pick('blocked'),
    next: pick('next')
  }
}

function indexRows(text) {
  const rows = []
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|')) continue
    const cells = trimmed.split('|').map((cell) => cell.trim())
    if (cells.length < 5) continue
    if (cells.every((cell) => cell === '' || /^-{2,}$/.test(cell))) continue
    if (cells[1] === 'id' || cells[1] === 'ID') continue
    rows.push({
      id: cells[1],
      title: cells[2],
      owner: cells[3],
      status: cells[4] ?? '',
      updated: cells[5] ?? '',
      next: cells[6] ?? ''
    })
  }
  return rows.filter((row) => row.id !== '').slice(0, 40)
}

const EXPERIMENT_SETTINGS_PATH = path.join('.research', 'experiment-settings.json')

export function readExperimentSettings(root) {
  try {
    const parsed = JSON.parse(readTextFile(path.join(root, EXPERIMENT_SETTINGS_PATH)) || '{}')
    return { approval: parsed.approval === 'auto' ? 'auto' : 'required' }
  } catch {
    return { approval: 'required' }
  }
}

export function writeExperimentSettings(root, settings) {
  const dir = path.join(root, '.research')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'experiment-settings.json')
  const temp = `${file}.tmp-${process.pid}`
  const approval = settings.approval === 'auto' ? 'auto' : 'required'
  fs.writeFileSync(temp, `${JSON.stringify({ approval }, null, 2)}\n`, 'utf8')
  fs.renameSync(temp, file)
  return { approval }
}

export const EXPERIMENT_STATES = Object.freeze([
  'planned',
  'awaiting_approval',
  'approved',
  'running',
  'completed',
  'stopped',
  'failed',
  'rejected'
])

const TERMINAL_RUN_STATES = new Set(['completed', 'stopped', 'failed', 'rejected'])

function validRunId(value) {
  const id = String(value ?? '')
  return /^[A-Za-z0-9._-]+$/.test(id) && id !== '.' && id !== '..' ? id : ''
}

export function deriveRunState(parsed, settings) {
  const raw = typeof parsed?.state === 'string' ? parsed.state.toLowerCase() : ''
  if (EXPERIMENT_STATES.includes(raw)) return raw
  const status = String(parsed?.status ?? '').toLowerCase()
  const approval = typeof parsed?.approval === 'object' && parsed.approval !== null ? parsed.approval.state : ''
  if (/fail|error|crash|异常/.test(status)) return 'failed'
  if (/stop|kill|abort|halt|终止|停止/.test(status)) return 'stopped'
  if (/done|complete|finish|success|完成/.test(status)) return 'completed'
  if (/run|active|in_progress|进行中|运行/.test(status)) return 'running'
  if (approval === 'rejected') return 'rejected'
  if (typeof parsed?.finishedAt === 'string' && !Number.isNaN(Date.parse(parsed.finishedAt))) return 'completed'
  if (approval === 'approved' || approval === 'auto') return 'approved'
  return settings?.approval === 'auto' ? 'planned' : 'awaiting_approval'
}

function writeRunManifest(root, id, manifest) {
  const dir = path.join(root, 'runs', id)
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'manifest.json')
  const temp = `${file}.tmp-${process.pid}`
  fs.writeFileSync(temp, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  fs.renameSync(temp, file)
  return { ok: true, run: id }
}

function readRunManifest(root, id) {
  const file = path.join(root, 'runs', id, 'manifest.json')
  const text = readTextFile(file)
  if (text === '') return undefined
  try {
    const parsed = JSON.parse(text)
    return parsed !== null && typeof parsed === 'object' ? parsed : undefined
  } catch {
    return undefined
  }
}

export function registerRun(root, input = {}) {
  const id = validRunId(input.run)
  if (id === '') return { error: 'run id must match [A-Za-z0-9._-]' }
  if (readRunManifest(root, id) !== undefined) return { error: `run "${id}" already exists` }
  const settings = readExperimentSettings(root)
  const auto = settings.approval === 'auto'
  const now = new Date().toISOString()
  const manifest = {
    run: id,
    status: 'planned',
    state: auto ? 'approved' : 'awaiting_approval',
    question: String(input.question ?? ''),
    hypothesis: String(input.hypothesis ?? ''),
    decisionRule: String(input.decisionRule ?? ''),
    seeds: String(input.seeds ?? ''),
    budget: String(input.budget ?? ''),
    createdAt: now,
    approval: auto ? { state: 'auto', at: now, by: 'policy' } : { state: 'pending' }
  }
  writeRunManifest(root, id, manifest)
  return { run: id, state: manifest.state, approval: manifest.approval.state }
}

export function startRun(root, input = {}) {
  const id = validRunId(input.run)
  if (id === '') return { error: 'run id must match [A-Za-z0-9._-]' }
  const manifest = readRunManifest(root, id)
  if (manifest === undefined) return { error: `run "${id}" has no manifest; register it first` }
  const settings = readExperimentSettings(root)
  const state = deriveRunState(manifest, settings)
  if (state === 'running') return { error: `run "${id}" is already running` }
  if (TERMINAL_RUN_STATES.has(state)) return { error: `run "${id}" is already ${state}` }
  const approval = typeof manifest.approval === 'object' && manifest.approval !== null ? manifest.approval.state : ''
  if (settings.approval === 'required' && approval !== 'approved' && approval !== 'auto') {
    return { error: `run "${id}" is ${state}; it needs the user's approval before it can start` }
  }
  const startedAt = typeof manifest.startedAt === 'string' ? manifest.startedAt : new Date().toISOString()
  const next = { ...manifest, state: 'running', status: 'running', startedAt }
  if (approval === 'auto') next.approval = { ...(manifest.approval ?? {}), state: 'auto' }
  writeRunManifest(root, id, next)
  return { run: id, state: 'running', startedAt }
}

export function finishRun(root, input = {}) {
  const id = validRunId(input.run)
  if (id === '') return { error: 'run id must match [A-Za-z0-9._-]' }
  const state = String(input.state ?? '')
  if (!['completed', 'stopped', 'failed'].includes(state)) {
    return { error: 'state must be completed, stopped or failed' }
  }
  const manifest = readRunManifest(root, id)
  if (manifest === undefined) return { error: `run "${id}" has no manifest` }
  const settings = readExperimentSettings(root)
  const current = deriveRunState(manifest, settings)
  if (current !== 'running') return { error: `run "${id}" is ${current}, not running` }
  const finishedAt = new Date().toISOString()
  const next = {
    ...manifest,
    state,
    status: state,
    finishedAt,
    reason: String(input.reason ?? ''),
    evidence: String(input.evidence ?? '')
  }
  writeRunManifest(root, id, next)
  return { run: id, state, finishedAt }
}

export function setRunApproval(root, runId, decision) {
  const id = String(runId ?? '')
  if (!/^[A-Za-z0-9._-]+$/.test(id) || id === '.' || id === '..') return { error: 'invalid run id' }
  const file = path.join(root, 'runs', id, 'manifest.json')
  const current = readTextFile(file)
  if (current === '') return { error: `run "${id}" has no manifest` }
  let parsed
  try {
    parsed = JSON.parse(current)
  } catch {
    return { error: `run "${id}" has an unreadable manifest` }
  }
  if (parsed === null || typeof parsed !== 'object') return { error: `run "${id}" has an unreadable manifest` }
  const settings = readExperimentSettings(root)
  const derived = deriveRunState(parsed, settings)
  const lifecycle =
    decision === 'rejected'
      ? 'rejected'
      : derived === 'awaiting_approval' || derived === 'planned' || derived === 'approved'
        ? 'approved'
        : derived
  const next = {
    ...parsed,
    state: lifecycle,
    approval: { state: decision, at: new Date().toISOString(), by: 'user' }
  }
  const temp = `${file}.tmp-${process.pid}`
  fs.writeFileSync(temp, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  fs.renameSync(temp, file)
  return { ok: true }
}

export function buildPanelState(root) {
  const worklogPlan = readPlan(root)
  const plan = {
    objective: worklogPlan.objective,
    milestone: worklogPlan.milestone,
    active: 'none',
    blocked: 'none',
    next: worklogPlan.next
  }
  const items = listItems(root)
  const cards = items.map((item) => ({
    id: item.id,
    title: item.title,
    owner: item.owner,
    status: item.status,
    updated: item.updated,
    next: item.next,
    kind: item.kind
  }))
  const activeItems = items.filter((item) => item.status === 'in_progress' || item.status === 'in_review')
  const blockedItems = items.filter((item) => item.status === 'blocked')
  if (activeItems.length > 0) plan.active = activeItems.map((item) => item.id).join(', ')
  if (blockedItems.length > 0) plan.blocked = blockedItems.map((item) => item.id).join(', ')
  const designs = []
  try {
    const dir = path.join(root, 'docs', 'design')
    for (const name of fs.readdirSync(dir).filter((entry) => entry.endsWith('.md')).sort()) {
      const file = path.join(dir, name)
      const question = readTextFile(file).match(/##+\s*Question\s*\n+([^\n]+)/i)
      designs.push({
        name,
        updated: fs.statSync(file).mtime.toISOString(),
        question: question === null ? '' : question[1].trim().slice(0, 160)
      })
    }
  } catch {}
  const settings = readExperimentSettings(root)
  const now = Date.now()
  const runs = []
  try {
    const dir = path.join(root, 'runs')
    for (const name of fs.readdirSync(dir)) {
      const manifestPath = path.join(dir, name, 'manifest.json')
      const manifest = readTextFile(manifestPath)
      let parsed = {}
      if (manifest !== '') {
        try {
          parsed = JSON.parse(manifest)
        } catch {}
      }
      let modified = 0
      try {
        modified = fs.statSync(manifestPath).mtimeMs
      } catch {}
      const startedAt = typeof parsed.startedAt === 'string' ? Date.parse(parsed.startedAt) : modified
      const finishedAt = typeof parsed.finishedAt === 'string' ? Date.parse(parsed.finishedAt) : NaN
      const status = typeof parsed.status === 'string' ? parsed.status : ''
      const state = deriveRunState(parsed, settings)
      const running = state === 'running'
      const measured = running ? now : finishedAt
      const end = Number.isNaN(measured) ? NaN : measured
      let approval
      if (typeof parsed.approval === 'object' && parsed.approval !== null && typeof parsed.approval.state === 'string') {
        approval = parsed.approval.state
      } else {
        approval = settings.approval === 'auto' ? 'auto' : 'pending'
      }
      runs.push({
        name,
        status,
        state,
        reason: typeof parsed.reason === 'string' ? parsed.reason : '',
        seeds: typeof parsed.seeds === 'string' ? parsed.seeds : '',
        budget: typeof parsed.budget === 'string' ? parsed.budget : '',
        startedAt: Number.isNaN(startedAt) ? '' : new Date(startedAt).toISOString(),
        finishedAt: Number.isNaN(finishedAt) ? '' : new Date(finishedAt).toISOString(),
        elapsedMs: Number.isNaN(startedAt) || Number.isNaN(end) ? 0 : Math.max(0, end - startedAt),
        running,
        approval
      })
    }
  } catch {}
  runs.sort((a, b) => String(b.startedAt || '').localeCompare(String(a.startedAt || '')))
  return {
    root,
    worklog: plan,
    cards,
    runs: runs.slice(0, 40),
    experimentSettings: settings,
    designs: designs.slice(0, 12),
    architectures: listArchitectureCards(root)
  }
}

function jsonResponse(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(value))
}

function trustedRequest(req) {
  const origin = req.headers === undefined ? undefined : req.headers.origin
  if (typeof origin !== 'string' || origin === '') return true
  try {
    const parsed = new URL(origin)
    const host = req.headers === undefined ? undefined : req.headers.host
    if (typeof host === 'string' && parsed.host === host) return true
    return ['127.0.0.1', 'localhost', '::1', '[::1]'].includes(parsed.hostname)
  } catch {
    return false
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > ARCH_MAX_BODY) {
        reject(new Error('body is too large'))
        req.destroy()
        return
      }
      chunks.push(Buffer.from(chunk))
    })
    req.on('end', () => {
      try {
        resolve(chunks.length === 0 ? {} : JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

async function projectRootOf(ctx, exec) {
  const cwd = exec?.agent?.session?.header?.cwd
  if (typeof cwd !== 'string' || cwd.length === 0) return undefined
  const workspace = await ctx.workspaceRegistry.resolveByPath(cwd).catch(() => undefined)
  return workspace !== undefined && typeof workspace.path === 'string' && workspace.path.length > 0 ? workspace.path : cwd
}

async function sessionProjectRoot(ctx, sessionId) {
  if (typeof sessionId !== 'string' || sessionId === '') return undefined
  try {
    const agent = await Promise.resolve(ctx.agents?.get?.(sessionId))
    const cwd = agent?.session?.header?.cwd
    if (typeof cwd !== 'string' || cwd === '') return undefined
    const workspace = await ctx.workspaceRegistry.resolveByPath(cwd)
    if (workspace !== undefined && typeof workspace.path === 'string' && workspace.path.length > 0) return workspace.path
    return cwd
  } catch {
    return undefined
  }
}

function renderArchitecture(value, args) {
  if (value !== null && typeof value === 'object' && typeof value.error === 'string') {
    return [{ type: 'text', text: value.error }]
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return [{ type: 'text', text: 'No architecture cards yet.' }]
    return [{
      type: 'text',
      text: value.map((card) => `${card.id} v${card.version}  ${card.title} (${card.nodes.length} nodes, ${card.notes.length} notes)`).join(NL)
    }]
  }
  if (value.removed === true) {
    return [{ type: 'text', text: `Removed architecture card "${value.id}".` }]
  }
  if (args.op === 'get') {
    return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
  }
  if (Array.isArray(value.nodes)) {
    return [{
      type: 'text',
      text: `${value.id} v${value.version}: ${value.title} (${value.nodes.length} nodes, ${value.edges.length} edges, ${value.notes.length} notes)`
    }]
  }
  return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
}

function renderWorklog(value) {
  if (value !== null && typeof value === 'object' && typeof value.error === 'string') {
    return [{ type: 'text', text: value.error }]
  }
  const plan = value?.plan ?? {}
  const items = Array.isArray(value?.items) ? value.items : []
  const counts = value?.counts ?? {}
  const lines = [
    `Objective: ${plan.objective || 'TODO'}`,
    `Milestone: ${plan.milestone || 'TODO'}`,
    `Next: ${plan.next || 'TODO'}`,
    `Items: ${items.length} (${Object.entries(counts).map(([key, count]) => `${key} ${count}`).join(', ') || 'none'})`,
    ''
  ]
  for (const item of items) {
    lines.push(`- ${item.id} · ${item.status} · ${item.owner || 'unowned'} · ${item.title}`)
    if (item.next) lines.push(`    next: ${item.next}`)
  }
  if (Array.isArray(value?.notes)) for (const note of value.notes) lines.push(`note: ${note}`)
  return [{ type: 'text', text: lines.join(NL) }]
}

function renderDecision(value) {
  if (value !== null && typeof value === 'object' && typeof value.error === 'string') {
    return [{ type: 'text', text: value.error }]
  }
  const entry = value?.decision
  if (entry !== undefined) return [{ type: 'text', text: `Recorded: ${entry.at} ${entry.decision}` }]
  const rows = Array.isArray(value?.decisions) ? value.decisions : []
  if (rows.length === 0) return [{ type: 'text', text: 'No decisions recorded.' }]
  return [{ type: 'text', text: rows.map((row) => `- ${String(row.at).slice(0, 10)} ${row.decision}${row.reason ? ` — ${row.reason}` : ''}`).join(NL) }]
}

function renderEvidence(value) {
  if (value !== null && typeof value === 'object' && typeof value.error === 'string') {
    return [{ type: 'text', text: value.error }]
  }
  const entry = value?.evidence
  if (entry !== undefined) return [{ type: 'text', text: `Recorded evidence: ${entry.claim}${entry.source ? ` (${entry.source})` : ''}` }]
  const rows = Array.isArray(value?.evidence) ? value.evidence : []
  if (rows.length === 0) return [{ type: 'text', text: 'No evidence recorded.' }]
  return [{ type: 'text', text: rows.map((row) => `- ${row.claim}${row.source ? ` — ${row.source}` : ''}${row.strength ? ` [${row.strength}]` : ''}`).join(NL) }]
}

function renderDesign(value) {
  if (value !== null && typeof value === 'object' && typeof value.error === 'string') {
    return [{ type: 'text', text: value.error }]
  }
  if (Array.isArray(value?.designs)) {
    if (value.designs.length === 0) return [{ type: 'text', text: 'No design records.' }]
    return [{ type: 'text', text: value.designs.map((d) => `- ${d.id} · ${d.status} · ${d.title} — ${d.question || 'no question yet'}`).join(NL) }]
  }
  const d = value ?? {}
  return [{
    type: 'text',
    text: [
      `Design ${d.id}: ${d.title}`,
      `status: ${d.status}`,
      `question: ${d.question || 'TODO'}`,
      `hypotheses: ${(d.hypotheses ?? []).join(' | ') || '—'}`,
      `metrics: ${(d.metrics ?? []).join(', ') || '—'}`,
      `budget: ${d.budget || '—'}`,
      `doc: ${d.doc}`
    ].join(NL)
  }]
}

function renderState(value) {
  if (value !== null && typeof value === 'object' && typeof value.error === 'string') {
    return [{ type: 'text', text: value.error }]
  }
  const lines = [renderWorklog(value.worklog)[0]?.text ?? '']
  lines.push('', `Runs: ${(value.runs ?? []).length}, designs: ${(value.designs ?? []).length}, architecture cards: ${(value.architectures ?? []).length}`)
  return [{ type: 'text', text: lines.join(NL) }]
}

function renderInit(value) {
  if (value !== null && typeof value === 'object' && typeof value.error === 'string') {
    return [{ type: 'text', text: value.error }]
  }
  const lines = []
  lines.push(`Workspace: ${String(value?.cwd ?? '(unknown)')}`)
  lines.push(`Git: ${String(value?.gitState ?? '(unknown)')}${value?.repoRoot === undefined ? '' : ` (${String(value.repoRoot)})`}`)
  const created = Array.isArray(value?.created) ? value.created : []
  lines.push(created.length === 0 ? 'Created: nothing (already initialized)' : `Created: ${created.join(', ')}`)
  for (const note of Array.isArray(value?.notes) ? value.notes : []) lines.push(`- ${note}`)
  lines.push('Nothing was committed; commit the scaffold when the project rules ask for it.')
  return [{ type: 'text', text: lines.join(NL) }]
}

export function apply(ctx) {
  const disposeSection = ctx.systemPrompt.section({
    name: 'plugin:dsh-research-team-worklog',
    order: 180,
    text: WORKLOG_PROTOCOL_EN
  })

  const disposeTool = ctx.tools.register({
    name: 'research_project',
    description:
      'Resolve the current DSH project (workspace) for the calling session. ' +
      'Returns workspaceId, title and path. Call this before writing a worklog card so the record lands in the right project.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false
    },
    output: {
      schema: {},
      render(_args, value) {
        if (value !== null && typeof value === 'object' && typeof value.error === 'string') {
          return [{ type: 'text', text: value.error }]
        }
        const title = typeof value?.title === 'string' ? value.title : '(untitled)'
        const id = typeof value?.id === 'string' ? value.id : '(unknown)'
        const path = typeof value?.path === 'string' ? value.path : '(unknown)'
        return [{
          type: 'text',
          text: `Current project: ${title}${NL}workspaceId: ${id}${NL}Path: ${path}`
        }]
      }
    },
    async execute(_args, exec) {
      const cwd = exec?.agent?.session?.header?.cwd
      if (typeof cwd !== 'string' || cwd.length === 0) {
        return { error: 'Cannot determine the session working directory; workspaceId was not resolved. Ask the user to confirm the project.' }
      }
      const workspace = await ctx.workspaceRegistry.resolveByPath(cwd)
      if (workspace === undefined) {
        return {
          error:
            `The current directory is not registered as a DSH project: ${cwd}. ` +
            'Open it as a project in the DSH GUI, or ask the user to confirm the workspaceId; do not guess.'
        }
      }
      return { id: workspace.id, title: workspace.title, path: workspace.path }
    }
  })

  const disposeInit = ctx.tools.register({
    name: 'research_workspace_init',
    description:
      'Bootstrap durable work tracking in the session workspace when the agent judges that substantive work is starting: create worklog/PLAN.md and worklog/INDEX.md when missing, and initialize a git repository when the workspace is not already inside one. Writes at the registered project root so every session on the project shares one worklog; the session directory is used when the directory is not a registered project. Idempotent, never nested, never commits. Simple questions and one-off reads do not need it.',
    parameters: {
      type: 'object',
      properties: {
        objective: {
          type: 'string',
          description: 'Optional one-line objective seeded into worklog/PLAN.md.'
        }
      },
      additionalProperties: false
    },
    output: {
      schema: {},
      render(_args, value) {
        return renderInit(value)
      }
    },
    async execute(args, exec) {
      const cwd = exec?.agent?.session?.header?.cwd
      if (typeof cwd !== 'string' || cwd.length === 0) {
        return { error: 'Cannot determine the session working directory; the workspace was not initialized.' }
      }
      // One worklog per project: resolve the registered project root so a
      // session opened in a subdirectory does not create a second worklog.
      let target = cwd
      try {
        const workspace = await ctx.workspaceRegistry.resolveByPath(cwd)
        if (workspace !== undefined && typeof workspace.path === 'string' && workspace.path.length > 0) {
          target = workspace.path
        }
      } catch {
        target = cwd
      }
      try {
        return await initWorkspace(target, typeof args.objective === 'string' ? args.objective : '')
      } catch (error) {
        return { error: `Workspace init failed: ${oneLine(error instanceof Error ? error.message : error)}` }
      }
    }
  })

  const disposeScope = ctx.tools.register({
    name: 'research_scope_check',
    description:
      'Check the files a teammate changed against that role\'s write envelope before a card handoff. Pass paths, or a base commit (with an optional head) to read `git diff --name-only base..head`. Returns PASS or FAIL with every file outside the envelope; a violation is fixed by moving the change to its owning role, or by recording an approved exception on the card. The envelope is a default table; a project may narrow or extend it in AGENTS.md or on the card.',
    parameters: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          description: 'Role whose envelope to check: advisor, researcher, data, designer, builder, runner, reviewer, writer, or lead.'
        },
        paths: {
          type: 'array',
          items: { type: 'string' },
          description: 'Repository-relative changed files. Omit to use base/head with git diff.'
        },
        base: {
          type: 'string',
          description: 'Base commit or ref for `git diff --name-only base..head`.'
        },
        head: {
          type: 'string',
          description: 'Head commit for the diff; defaults to HEAD.'
        }
      },
      required: ['role'],
      additionalProperties: false
    },
    output: {
      schema: {},
      render(_args, value) {
        return renderScope(value)
      }
    },
    async execute(args, exec) {
      const role = typeof args.role === 'string' ? args.role : ''
      const cwd = exec?.agent?.session?.header?.cwd
      if (typeof cwd !== 'string' || cwd.length === 0) {
        return { error: 'Cannot determine the session working directory; no files were checked.' }
      }
      let files
      if (Array.isArray(args.paths)) {
        files = args.paths
      } else if (typeof args.base === 'string' && args.base.length > 0) {
        const head = typeof args.head === 'string' && args.head.length > 0 ? args.head : 'HEAD'
        try {
          const result = await runGit(cwd, ['diff', '--name-only', `${args.base}..${head}`])
          files = String(result.stdout ?? '')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
        } catch (error) {
          return { error: `Cannot read the git diff: ${oneLine(error instanceof Error ? error.message : error)}` }
        }
      } else {
        return { error: 'Pass paths, or base (with an optional head) to read a git diff.' }
      }
      return { cwd, ...checkScope(role, files) }
    }
  })

  const panelRoute = '/api/dsh-research-team-panel'
  const panelHandler = async (req, res) => {
    try {
      if (!trustedRequest(req)) {
        jsonResponse(res, 403, { ok: false, error: 'panel requests must come from the local GUI' })
        return
      }
      const url = new URL(req.url ?? '/', 'http://localhost')
      const sessionId = req.method === 'GET' ? url.searchParams.get('session') : undefined
      if (req.method === 'GET') {
        const root = await sessionProjectRoot(ctx, sessionId)
        if (root === undefined) {
          jsonResponse(res, 404, { ok: false, error: 'cannot resolve the project for this session' })
          return
        }
        jsonResponse(res, 200, { ok: true, ...buildPanelState(root) })
        return
      }
      if (req.method !== 'POST') {
        jsonResponse(res, 405, { ok: false, error: 'method not allowed' })
        return
      }
      const body = await readBody(req)
      const root = await sessionProjectRoot(ctx, typeof body?.sessionId === 'string' ? body.sessionId : undefined)
      if (root === undefined) {
        jsonResponse(res, 404, { ok: false, error: 'cannot resolve the project for this session' })
        return
      }
      if (body?.op === 'approval-mode') {
        const mode = body.mode === 'auto' ? 'auto' : body.mode === 'required' ? 'required' : ''
        if (mode === '') {
          jsonResponse(res, 400, { ok: false, error: 'mode must be required or auto' })
          return
        }
        writeExperimentSettings(root, { approval: mode })
        jsonResponse(res, 200, { ok: true, ...buildPanelState(root) })
        return
      }
      if (body?.op === 'approve') {
        const decision = body.decision === 'approved' || body.decision === 'rejected' ? body.decision : ''
        if (decision === '') {
          jsonResponse(res, 400, { ok: false, error: 'decision must be approved or rejected' })
          return
        }
        const result = setRunApproval(root, body.runId, decision)
        if (result.error !== undefined) {
          jsonResponse(res, 409, { ok: false, error: result.error })
          return
        }
        jsonResponse(res, 200, { ok: true, ...buildPanelState(root) })
        return
      }
      const card = readArchitectureCard(root, body?.id)
      if (body?.op === 'annotate') {
        if (card === undefined) {
          jsonResponse(res, 404, { ok: false, error: 'card not found' })
          return
        }
        const text = shortText(body.text, 800)
        if (text === '') {
          jsonResponse(res, 400, { ok: false, error: 'note text is empty' })
          return
        }
        const targets = Array.isArray(body.targets) ? body.targets : []
        const next = saveArchitectureCard(root, { ...card, notes: [...(card.notes ?? []), { text, targets }] }, card.version)
        if (next.error !== undefined) {
          jsonResponse(res, 409, { ok: false, error: next.error })
          return
        }
        jsonResponse(res, 200, { ok: true, card: next })
        return
      }
      if (body?.op === 'patch') {
        if (card === undefined) {
          jsonResponse(res, 404, { ok: false, error: 'card not found' })
          return
        }
        const moves = new Map((Array.isArray(body.moves) ? body.moves : []).map((move) => [String(move?.id), move]))
        const nodes = (card.nodes ?? []).map((node) => {
          const move = moves.get(node.id)
          if (move === undefined) return node
          return { ...node, x: clampNumber(move.x, 0, 4000, node.x), y: clampNumber(move.y, 0, 4000, node.y) }
        })
        const next = saveArchitectureCard(root, { ...card, nodes }, body.version)
        if (next.error !== undefined) {
          jsonResponse(res, 409, { ok: false, error: next.error })
          return
        }
        jsonResponse(res, 200, { ok: true, card: next })
        return
      }
      jsonResponse(res, 400, { ok: false, error: 'unknown operation' })
    } catch (error) {
      jsonResponse(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
    }
  }
  let disposePanel = () => {}
  try {
    disposePanel = ctx.webServer.register({ kind: 'exact', path: panelRoute, handler: panelHandler })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!message.includes(`webserver: duplicate exact route "${panelRoute}"`)) throw error
  }

  const disposeArchitecture = ctx.tools.register({
    name: 'research_architecture',
    description:
      'Read or update the architecture cards shown in the Research sidebar: the method, model, experiment and pipeline diagrams of this project, stored as JSON under .research/architecture/<id>.json. Use op=list to see them, op=get to read one, op=save to create or update, op=remove to delete. A card is a node/edge graph with absolute coordinates; before updating an existing card, read it and pass expectedVersion so a concurrent edit is not overwritten. The user can select nodes in the sidebar and leave an annotation; that annotation arrives as a note on the card, so read the card before answering it. The designer owns the method card and the builder owns the implementation card; the advisor reads both before a review, and the reviewer checks them at the results gate. Node boxes are sized from their labels, so omit w and h: the panel grows a box to fit its text and ignores a fixed width or height.',
    parameters: {
      type: 'object',
      properties: {
        op: { type: 'string', enum: ['list', 'get', 'save', 'remove'] },
        id: { type: 'string', description: 'Card id matching [a-z0-9][a-z0-9_-]{0,63}.' },
        card: {
          type: 'object',
          description: 'Full card for op=save: id, title, kind (method, model, experiment, pipeline), canvas {width,height}, nodes [{id,label,kind,x,y,w,h}], edges [{from,to,label}], notes. The panel is a narrow column: draw on a landscape canvas (default 520x300), 3 to 8 nodes in a left-to-right flow, at least 32 px apart, with labels short enough for two lines because they are clipped to the box.'
        },
        expectedVersion: { type: 'number', description: 'For op=save on an existing card, the version you read; a mismatch is rejected.' }
      },
      required: ['op'],
      additionalProperties: false
    },
    output: {
      schema: {},
      render(args, value) {
        return renderArchitecture(value, args)
      }
    },
    async execute(args, exec) {
      const cwd = exec?.agent?.session?.header?.cwd
      if (typeof cwd !== 'string' || cwd.length === 0) {
        return { error: 'Cannot determine the session working directory; no card was read or written.' }
      }
      const workspace = await ctx.workspaceRegistry.resolveByPath(cwd).catch(() => undefined)
      const root = workspace !== undefined && typeof workspace.path === 'string' && workspace.path.length > 0 ? workspace.path : cwd
      const op = typeof args.op === 'string' ? args.op : ''
      if (op === 'list') return listArchitectureCards(root)
      if (op === 'get') {
        const card = readArchitectureCard(root, args.id)
        return card === undefined ? { error: `No architecture card "${String(args.id)}".` } : card
      }
      if (op === 'remove') {
        const id = sanitizeCardId(args.id)
        if (id === undefined) return { error: 'id must match [a-z0-9][a-z0-9_-]{0,63}' }
        const file = path.join(architectureDir(root), `${id}.json`)
        if (!fs.existsSync(file)) return { error: `No architecture card "${id}".` }
        fs.unlinkSync(file)
        return { id, removed: true }
      }
      if (op === 'save') {
        return saveArchitectureCard(root, args.card, args.expectedVersion)
      }
      return { error: `Unknown op "${op}"; expected list, get, save or remove.` }
    }
  })

  const disposeExperiment = ctx.tools.register({
    name: 'research_experiment',
    description:
      'Record and drive one experiment through its lifecycle instead of hand-editing runs/<run>/manifest.json. ops: list, get, register, start, finish. register writes the manifest with the decision rule, seeds and budget, and puts the run in awaiting_approval (or approved when the project mode is auto). start refuses until the user approved the run, then records startedAt and state running. finish closes the run as completed, stopped or failed with a reason and evidence. The sidebar reads the same file.',
    parameters: {
      type: 'object',
      properties: {
        op: { type: 'string', enum: ['list', 'get', 'register', 'start', 'finish'], description: 'What to do.' },
        run: { type: 'string', description: 'Run id, [A-Za-z0-9._-] characters.' },
        question: { type: 'string', description: 'register: the question this run settles.' },
        hypothesis: { type: 'string', description: 'register: the hypothesis under test.' },
        decisionRule: { type: 'string', description: 'register: the pre-registered expected outcome, kill criterion and effect size.' },
        seeds: { type: 'string', description: 'register: planned seeds, e.g. 4.' },
        budget: { type: 'string', description: 'register: compute budget, e.g. 6 GPU-hours.' },
        state: { type: 'string', enum: ['completed', 'stopped', 'failed'], description: 'finish: terminal state.' },
        reason: { type: 'string', description: 'finish: why it ended, especially for stopped or failed.' },
        evidence: { type: 'string', description: 'finish: where the numbers are (log, table, summary path).' }
      },
      required: ['op'],
      additionalProperties: false
    },
    output: {
      schema: {},
      render(_args, value) {
        return renderExperiment(value)
      }
    },
    async execute(args, exec) {
      const cwd = exec?.agent?.session?.header?.cwd
      if (typeof cwd !== 'string' || cwd.length === 0) return { error: 'cannot resolve the project directory' }
      const workspace = await ctx.workspaceRegistry.resolveByPath(cwd).catch(() => undefined)
      const root = workspace !== undefined && typeof workspace.path === 'string' && workspace.path.length > 0 ? workspace.path : cwd
      const op = typeof args.op === 'string' ? args.op : ''
      if (op === 'list') return { runs: buildPanelState(root).runs }
      if (op === 'get') {
        const id = String(args.run ?? '')
        const manifest = readRunManifest(root, id)
        return manifest === undefined ? { error: `run "${id}" has no manifest` } : manifest
      }
      if (op === 'register') return registerRun(root, args)
      if (op === 'start') return startRun(root, args)
      if (op === 'finish') return finishRun(root, args)
      return { error: `Unknown op "${op}"; expected list, get, register, start or finish.` }
    }
  })


  const disposeWorklog = ctx.tools.register({
    name: 'research_worklog',
    description:
      'Read and write the project worklog. The machine state lives in .research/worklog (plan.json and one items/<id>.json per item); worklog/PLAN.md, worklog/INDEX.md and worklog/<id>.md are generated views that this tool rewrites, so do not hand-edit them. ops: init (create the store, importing a legacy markdown worklog once), list, get, update (create or patch an item: title, owner, status, kind, next, blocked, summary, base, head, evidence, checklist), claim (take an item as owner and set in_progress; refuses to take over another owner), gate (set in_review after writing the checklist with evidence, summary, base..head and next), plan (patch objective, milestone, milestones, next). Status is one of todo, in_progress, in_review, blocked, done, canceled; done belongs to the user, so an agent records it only with by="user".',
    parameters: {
      type: 'object',
      properties: {
        op: { type: 'string', enum: ['init', 'list', 'get', 'update', 'claim', 'gate', 'plan'] },
        id: { type: 'string', description: 'Work item id, [A-Za-z0-9][A-Za-z0-9._-]{0,63}.' },
        title: { type: 'string' },
        owner: { type: 'string' },
        status: { type: 'string', enum: ['todo', 'in_progress', 'in_review', 'blocked', 'done', 'canceled'] },
        kind: { type: 'string', enum: ['gated', 'internal'] },
        next: { type: 'string' },
        blocked: { type: 'string' },
        summary: { type: 'string' },
        base: { type: 'string' },
        head: { type: 'string' },
        evidence: { type: 'array', items: { type: 'string' } },
        checklist: {
          type: 'array',
          items: {
            type: 'object',
            properties: { text: { type: 'string' }, done: { type: 'boolean' }, note: { type: 'string' } }
          }
        },
        by: { type: 'string', description: 'Who records this; needed as "user" to set done.' },
        objective: { type: 'string', description: 'op=plan: the project objective.' },
        milestone: { type: 'string', description: 'op=plan: the current milestone.' },
        milestones: { type: 'array', items: { type: 'string' }, description: 'op=plan: the milestone list.' }
      },
      required: ['op'],
      additionalProperties: false
    },
    output: { schema: {}, render(_args, value) { return renderWorklog(value) } },
    async execute(args, exec) {
      const cwd = exec?.agent?.session?.header?.cwd
      if (typeof cwd !== 'string' || cwd.length === 0) return { error: 'cannot resolve the project directory' }
      const workspace = await ctx.workspaceRegistry.resolveByPath(cwd).catch(() => undefined)
      const root = workspace !== undefined && typeof workspace.path === 'string' && workspace.path.length > 0 ? workspace.path : cwd
      const op = typeof args.op === 'string' ? args.op : ''
      if (op === 'init') {
        const imported = migrateLegacy(root)
        if (!fs.existsSync(worklogDirs(root).planFile)) writePlan(root, { objective: args.objective })
        renderViews(root)
        return { ...worklogSummary(root), notes: imported.notes, migrated: imported.migrated }
      }
      if (op === 'list') return worklogSummary(root)
      if (op === 'get') {
        const item = readItem(root, args.id)
        return item === undefined
          ? { error: `no work item "${String(args.id)}"` }
          : { ...item, card: item.kind === 'gated' ? itemCardPath(root, item.id) : undefined }
      }
      if (op === 'plan') return { plan: writePlan(root, { objective: args.objective, milestone: args.milestone, milestones: args.milestones, next: args.next }) }
      if (op === 'claim') return claimItem(root, { id: args.id, owner: args.owner })
      if (op === 'gate') {
        const result = gateItem(root, args)
        if (result.error === undefined) renderViews(root)
        return result
      }
      if (op === 'update') {
        const result = upsertItem(root, args)
        return result
      }
      return { error: `Unknown op "${op}"; expected init, list, get, update, claim, gate or plan.` }
    }
  })

  const disposeState = ctx.tools.register({
    name: 'research_state',
    description:
      'Read the whole team state in one call: the worklog plan, work items with owners and status, decisions, evidence count, designs, experiments and architecture cards. Use it instead of parsing the worklog by hand; it returns the same data the Research sidebar shows.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    output: { schema: {}, render(_args, value) { return renderState(value) } },
    async execute(_args, exec) {
      const cwd = exec?.agent?.session?.header?.cwd
      if (typeof cwd !== 'string' || cwd.length === 0) return { error: 'cannot resolve the project directory' }
      const workspace = await ctx.workspaceRegistry.resolveByPath(cwd).catch(() => undefined)
      const root = workspace !== undefined && typeof workspace.path === 'string' && workspace.path.length > 0 ? workspace.path : cwd
      const panel = buildPanelState(root)
      return {
        worklog: worklogSummary(root),
        runs: panel.runs,
        designs: panel.designs,
        architectures: panel.architectures,
        decisions: listDecisions(root, 5)
      }
    }
  })

  const disposeDecision = ctx.tools.register({
    name: 'research_decision',
    description: 'Append a dated decision to the project decision log (.research/decisions.jsonl) or list the recent ones. The PLAN view renders them; do not edit PLAN.md by hand.',
    parameters: {
      type: 'object',
      properties: {
        op: { type: 'string', enum: ['append', 'list'] },
        decision: { type: 'string', description: 'append: what was decided.' },
        reason: { type: 'string', description: 'append: why.' },
        commit: { type: 'string', description: 'append: the commit that carries the decision.' },
        by: { type: 'string' },
        limit: { type: 'number', description: 'list: how many recent entries.' }
      },
      required: ['op'],
      additionalProperties: false
    },
    output: { schema: {}, render(_args, value) { return renderDecision(value) } },
    async execute(args, exec) {
      const root = await projectRootOf(ctx, exec)
      if (root === undefined) return { error: 'cannot resolve the project directory' }
      if (args.op === 'list') return { decisions: listDecisions(root, typeof args.limit === 'number' ? args.limit : 20) }
      if (args.op === 'append') return appendDecision(root, args)
      return { error: 'op must be append or list' }
    }
  })

  const disposeEvidence = ctx.tools.register({
    name: 'research_evidence',
    description: 'Record or list evidence claims for the paper and the worklog: claim, source, locator, strength. Stored in .research/evidence.jsonl and rendered to docs/evidence.md.',
    parameters: {
      type: 'object',
      properties: {
        op: { type: 'string', enum: ['append', 'list'] },
        claim: { type: 'string' },
        source: { type: 'string', description: 'Paper, dataset, run id or Zotero ref.' },
        locator: { type: 'string', description: 'Page, section, table or path.' },
        strength: { type: 'string', enum: ['strong', 'moderate', 'weak'] },
        by: { type: 'string' },
        limit: { type: 'number' }
      },
      required: ['op'],
      additionalProperties: false
    },
    output: { schema: {}, render(_args, value) { return renderEvidence(value) } },
    async execute(args, exec) {
      const root = await projectRootOf(ctx, exec)
      if (root === undefined) return { error: 'cannot resolve the project directory' }
      if (args.op === 'list') return { evidence: listEvidence(root, typeof args.limit === 'number' ? args.limit : 40) }
      if (args.op === 'append') return appendEvidence(root, args)
      return { error: 'op must be append or list' }
    }
  })

  const disposeDesign = ctx.tools.register({
    name: 'research_design',
    description: 'Create, update or list the machine fields of a design document: question, hypotheses, metrics, budget, status and doc path (defaults to docs/design/<id>.md, created with a "## Question" heading when missing). The prose stays in the markdown document.',
    parameters: {
      type: 'object',
      properties: {
        op: { type: 'string', enum: ['list', 'get', 'save'] },
        id: { type: 'string' },
        title: { type: 'string' },
        question: { type: 'string' },
        hypotheses: { type: 'array', items: { type: 'string' } },
        metrics: { type: 'array', items: { type: 'string' } },
        budget: { type: 'string' },
        status: { type: 'string', enum: ['draft', 'approved', 'active', 'closed'] },
        doc: { type: 'string' }
      },
      required: ['op'],
      additionalProperties: false
    },
    output: { schema: {}, render(_args, value) { return renderDesign(value) } },
    async execute(args, exec) {
      const root = await projectRootOf(ctx, exec)
      if (root === undefined) return { error: 'cannot resolve the project directory' }
      if (args.op === 'list') return { designs: listDesigns(root) }
      if (args.op === 'get') {
        const design = readDesign(root, args.id)
        return design === undefined ? { error: `no design "${String(args.id)}"` } : design
      }
      if (args.op === 'save') return saveDesign(root, args)
      return { error: 'op must be list, get or save' }
    }
  })

  return () => {
    disposeDesign()
    disposeEvidence()
    disposeDecision()
    disposeState()
    disposeWorklog()
    disposeExperiment()
    disposeArchitecture()
    disposePanel()
    disposeScope()
    disposeInit()
    disposeTool()
    disposeSection()
  }
}
