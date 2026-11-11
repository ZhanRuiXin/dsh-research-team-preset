/**
 * Research-team helpers.
 *
 * 1. `research_project` — resolve the calling session's DSH project
 *    (workspaceId, title, path), because a worklog card must land in the right
 *    project and workspace ids are random.
 * 2. An English coordination-ledger section registered at this preset's
 *    scope: the worklog files are the record, and no external task board is
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
const WORKLOG_PROTOCOL_EN = `The team records its work in the project worklog, not on an external board. The ledger is the worklog directory at the project root: worklog/PLAN.md (objective, milestone, active items, blockers, dated decisions, next actions), worklog/INDEX.md (one row per active work item: id, title, owner, status, updated, next), and one markdown file per gated item (Current state block at the top, then short append-only entries).
Discipline:
1. Read before acting: read PLAN and INDEX before starting, then the target card's Current state and its tail only.
2. Claim before working: write your role and in_progress into the INDEX row and the card header before you begin. If the row names another owner, stop and report; never take over.
3. Internal steps are INDEX rows; only steps that need the user's review or acceptance get a card file - deliverable checkpoints, scope decisions, risky changes, and the final handoff. Do not create a card per internal step, and never leave user-facing work only in chat.
4. Handoff: before moving a card to in_review, write the checklist items with evidence, the execution summary (changed files, self-checks, risks), the base..head commit range when the project uses git, and the next action into the card file; run research_scope_check on the changed paths.
5. Review: the reviewer independently re-checks the card and writes a PASS/FAIL verdict with evidence into the card file; the Lead decides reopen or rework.
6. Acceptance belongs to the user: never mark a card done. done means the user accepted it; blocked means the work cannot continue; canceled means it will not.
7. Report at gates only: when a gate is reached or the user must act, report the card id, status and evidence. Do not narrate ledger bookkeeping between gates.
8. Ask the user with ask_user_question when you need input, a login, or a decision, and record the wait in the card file instead of a status field of an external tool. If the answer does not arrive within the wait timeout, ask the advisor for an independent recommendation, record it in the card file, and keep the work moving; the advisor's reply is advice, not the user's approval.
The worklog lives at the project root returned by research_project. If the user installs a task board, this preset neither reads nor writes it; the worklog remains the record.`

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

  const worklogDir = path.join(cwd, 'worklog')
  fs.mkdirSync(worklogDir, { recursive: true })

  const planPath = path.join(worklogDir, 'PLAN.md')
  if (!fs.existsSync(planPath)) {
    const goal = oneLine(objective)
    fs.writeFileSync(planPath, PLAN_TEMPLATE(goal.length > 0 ? goal : 'TODO'), 'utf8')
    created.push('worklog/PLAN.md')
  }

  const indexPath = path.join(worklogDir, 'INDEX.md')
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, INDEX_TEMPLATE, 'utf8')
    created.push('worklog/INDEX.md')
  }

  if (gitState === 'created') {
    const ignorePath = path.join(cwd, '.gitignore')
    if (!fs.existsSync(ignorePath)) {
      fs.writeFileSync(ignorePath, GITIGNORE_TEMPLATE, 'utf8')
      created.push('.gitignore')
    }
  }

  if (created.length === 0) notes.push('worklog: PLAN.md and INDEX.md already present')
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

export function buildPanelState(root) {
  const plan = planSummary(readTextFile(path.join(root, 'worklog', 'PLAN.md')))
  const cards = indexRows(readTextFile(path.join(root, 'worklog', 'INDEX.md')))
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
  const runs = []
  try {
    const dir = path.join(root, 'runs')
    for (const name of fs.readdirSync(dir).sort()) {
      const manifest = readTextFile(path.join(dir, name, 'manifest.json'))
      let parsed = {}
      if (manifest !== '') {
        try {
          parsed = JSON.parse(manifest)
        } catch {}
      }
      runs.push({
        name,
        status: typeof parsed.status === 'string' ? parsed.status : '',
        seeds: typeof parsed.seeds === 'string' ? parsed.seeds : '',
        budget: typeof parsed.budget === 'string' ? parsed.budget : ''
      })
    }
  } catch {}
  return {
    root,
    worklog: plan,
    cards,
    runs: runs.slice(0, 12),
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

  return () => {
    disposeArchitecture()
    disposePanel()
    disposeScope()
    disposeInit()
    disposeTool()
    disposeSection()
  }
}
