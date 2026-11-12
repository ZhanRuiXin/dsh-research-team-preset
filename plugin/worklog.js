/**
 * Worklog store.
 *
 * The machine state of a research project lives in `.research/`:
 *
 *   .research/worklog/plan.json            plan header (objective, milestone, next, …)
 *   .research/worklog/items/<id>.json      one work item per file
 *   .research/decisions.jsonl              append-only decision log
 *   .research/evidence.jsonl               append-only evidence log
 *   .research/designs/<id>.json            machine fields of a design document
 *
 * `worklog/PLAN.md`, `worklog/INDEX.md` and `worklog/<id>.md` are generated
 * views of that state: humans read them, the tools write them, and nobody
 * hand-edits them. Every function here takes the project root.
 */

import fs from 'node:fs'
import path from 'node:path'

export const ITEM_STATUSES = Object.freeze(['todo', 'in_progress', 'in_review', 'blocked', 'done', 'canceled'])
export const ITEM_KINDS = Object.freeze(['gated', 'internal'])

/** Allowed status moves. `done` and `canceled` are terminal; a reopen goes through the user. */
export const ITEM_TRANSITIONS = Object.freeze({
  todo: ['in_progress', 'in_review', 'blocked', 'canceled'],
  in_progress: ['in_review', 'blocked', 'todo', 'canceled'],
  in_review: ['done', 'in_progress', 'blocked', 'canceled'],
  blocked: ['in_progress', 'todo', 'canceled'],
  done: [],
  canceled: []
})

const STATUS_ORDER = { in_progress: 0, in_review: 1, blocked: 2, todo: 3, done: 4, canceled: 5 }

const STATE_DIR = '.research'
const WORKLOG_REL = path.join(STATE_DIR, 'worklog')
const ITEMS_REL = path.join(WORKLOG_REL, 'items')
const PLAN_REL = path.join(WORKLOG_REL, 'plan.json')
const DECISIONS_REL = path.join(STATE_DIR, 'decisions.jsonl')
const EVIDENCE_REL = path.join(STATE_DIR, 'evidence.jsonl')
const DESIGNS_REL = path.join(STATE_DIR, 'designs')

const BODY_MARKER = '<!-- research-worklog:body -->'
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/

function nowDay() {
  return new Date().toISOString().slice(0, 10)
}

function nowIso() {
  return new Date().toISOString()
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch {
    return ''
  }
}

function readJson(file, fallback) {
  const text = readText(file)
  if (text.trim() === '') return fallback
  try {
    return JSON.parse(text)
  } catch {
    return fallback
  }
}

function writeAtomic(file, text) {
  ensureDir(path.dirname(file))
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, text, 'utf8')
  fs.renameSync(tmp, file)
}

function writeJson(file, value) {
  writeAtomic(file, `${JSON.stringify(value, null, 2)}\n`)
}

function appendJsonl(file, value) {
  ensureDir(path.dirname(file))
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`, 'utf8')
}

function readJsonl(file, limit = 0) {
  const rows = []
  for (const line of readText(file).split(/\r?\n/)) {
    const trimmed = line.trim()
    if (trimmed === '') continue
    try {
      rows.push(JSON.parse(trimmed))
    } catch {}
  }
  return limit > 0 ? rows.slice(-limit) : rows
}

function short(value, max = 200) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function cell(value) {
  return short(value, 120).replace(/\|/g, '\\|')
}

export function validItemId(value) {
  return typeof value === 'string' && ID_PATTERN.test(value) ? value : undefined
}

export function worklogDirs(root) {
  return {
    state: path.join(root, STATE_DIR),
    worklog: path.join(root, WORKLOG_REL),
    items: path.join(root, ITEMS_REL),
    planFile: path.join(root, PLAN_REL),
    planView: path.join(root, 'worklog', 'PLAN.md'),
    indexView: path.join(root, 'worklog', 'INDEX.md'),
    decisions: path.join(root, DECISIONS_REL),
    evidence: path.join(root, EVIDENCE_REL),
    designs: path.join(root, DESIGNS_REL),
    evidenceView: path.join(root, 'docs', 'evidence.md')
  }
}

export function readPlan(root) {
  const dirs = worklogDirs(root)
  const plan = readJson(dirs.planFile, null)
  if (plan === null) {
    const legacy = legacyPlan(root)
    return { ...legacy, root, source: 'legacy' }
  }
  return {
    objective: typeof plan.objective === 'string' ? plan.objective : '',
    milestone: typeof plan.milestone === 'string' ? plan.milestone : '',
    milestones: Array.isArray(plan.milestones) ? plan.milestones.map((m) => short(m, 200)) : [],
    next: typeof plan.next === 'string' ? plan.next : '',
    updated: typeof plan.updated === 'string' ? plan.updated : ''
  }
}

function legacyPlan(root) {
  const text = readText(path.join(root, 'worklog', 'PLAN.md'))
  const pick = (key) => {
    const match = text.match(new RegExp(`^\\s*-?\\s*${key}\\s*:\\s*(.*)$`, 'm'))
    return match === null ? '' : match[1].trim()
  }
  const milestones = []
  const section = text.match(/##+\s*Milestones?\s*\n([\s\S]*?)(?:\n##+|\s*$)/i)
  if (section !== null) {
    for (const line of section[1].split(/\r?\n/)) {
      const match = line.match(/^\s*[-*]\s+(.+)$/)
      if (match !== null && milestones.length < 20) milestones.push(short(match[1], 200))
    }
  }
  return {
    objective: pick('objective'),
    milestone: pick('milestone'),
    milestones,
    next: pick('next'),
    updated: ''
  }
}

export function listItems(root) {
  const dirs = worklogDirs(root)
  const items = []
  let names = []
  try {
    names = fs.readdirSync(dirs.items).filter((name) => name.endsWith('.json'))
  } catch {}
  for (const name of names) {
    const parsed = readJson(path.join(dirs.items, name), null)
    if (parsed === null || typeof parsed.id !== 'string') continue
    items.push(normalizeItem(parsed))
  }
  if (items.length === 0) return legacyItems(root)
  items.sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) || String(b.updated).localeCompare(String(a.updated)))
  return items
}

function normalizeItem(input) {
  const status = ITEM_STATUSES.includes(input.status) ? input.status : 'todo'
  const kind = ITEM_KINDS.includes(input.kind) ? input.kind : 'internal'
  return {
    id: String(input.id),
    title: short(input.title, 160),
    owner: short(input.owner, 40),
    status,
    kind,
    updated: short(input.updated, 10),
    next: short(input.next, 300),
    blocked: short(input.blocked, 300),
    parent: short(input.parent, 64),
    summary: short(input.summary, 1200),
    base: short(input.base, 64),
    head: short(input.head, 64),
    evidence: Array.isArray(input.evidence) ? input.evidence.map((e) => short(e, 300)).slice(0, 40) : [],
    history: Array.isArray(input.history)
      ? input.history
          .map((entry) => ({
            at: short(entry?.at, 32),
            from: ITEM_STATUSES.includes(entry?.from) ? entry.from : '',
            to: ITEM_STATUSES.includes(entry?.to) ? entry.to : '',
            by: short(entry?.by, 40)
          }))
          .slice(-40)
      : [],
    checklist: Array.isArray(input.checklist)
      ? input.checklist.map((entry) => ({
          text: short(entry?.text, 300),
          done: entry?.done === true,
          note: short(entry?.note, 400)
        }))
      : []
  }
}

function legacyItems(root) {
  const rows = []
  for (const line of readText(path.join(root, 'worklog', 'INDEX.md')).split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|')) continue
    const cells = trimmed.split('|').map((part) => part.trim())
    if (cells.length < 7) continue
    if (cells[1] === '' || cells[1] === 'id' || /^-{2,}$/.test(cells[1])) continue
    rows.push(normalizeItem({
      id: cells[1],
      title: cells[2],
      owner: cells[3],
      status: cells[4],
      updated: cells[5],
      next: cells[6],
      kind: /^t-/.test(cells[1]) ? 'gated' : 'internal'
    }))
  }
  return rows.slice(0, 60)
}

export function readItem(root, id) {
  const safe = validItemId(id)
  if (safe === undefined) return undefined
  const parsed = readJson(path.join(worklogDirs(root).items, `${safe}.json`), null)
  return parsed === null ? undefined : normalizeItem(parsed)
}

function cardFile(root, item) {
  return path.join(root, 'worklog', `${item.id}.md`)
}

function renderCard(root, item) {
  const file = cardFile(root, item)
  const previous = readText(file)
  const markerAt = previous.indexOf(BODY_MARKER)
  const body = markerAt === -1 ? '' : previous.slice(markerAt + BODY_MARKER.length).trim()
  const lines = [
    `# ${item.id} — ${item.title}`,
    '',
    `- owner: ${item.owner || 'unowned'}`,
    `- status: ${item.status}`,
    `- updated: ${item.updated}`,
    `- next: ${item.next || '—'}`
  ]
  if (item.blocked !== '') lines.push(`- blocked: ${item.blocked}`)
  lines.push('', '## Current state', '', item.summary || item.next || 'TODO', '')
  if (item.checklist.length > 0) {
    lines.push('## Checklist', '')
    for (const entry of item.checklist) {
      lines.push(`- [${entry.done ? 'x' : ' '}] ${entry.text}${entry.note === '' ? '' : ` — ${entry.note}`}`)
    }
    lines.push('')
  }
  if (item.evidence.length > 0) {
    lines.push('## Evidence', '')
    for (const entry of item.evidence) lines.push(`- ${entry}`)
    lines.push('')
  }
  lines.push(BODY_MARKER, '', body, '')
  writeAtomic(file, lines.join('\n'))
}

export function renderViews(root) {
  const dirs = worklogDirs(root)
  const plan = readPlan(root)
  const items = listItems(root)
  const active = items.filter((item) => item.status === 'in_progress' || item.status === 'in_review')
  const blocked = items.filter((item) => item.status === 'blocked')
  const decisions = readJsonl(dirs.decisions)

  const planLines = [
    '# PLAN',
    '',
    `- objective: ${plan.objective || 'TODO'}`,
    `- milestone: ${plan.milestone || 'TODO'}`,
    `- active: ${active.length === 0 ? 'none' : active.map((item) => item.id).join(', ')}`,
    `- blocked: ${blocked.length === 0 ? 'none' : blocked.map((item) => `${item.id} (${item.blocked || item.next || 'blocked'})`).join('; ')}`,
    `- decisions: ${decisions.length === 0 ? 'none' : `${decisions.length} recorded, see below`}`,
    `- next: ${plan.next || 'TODO'}`,
    `- updated: ${plan.updated || nowDay()}`,
    ''
  ]
  if (plan.milestones.length > 0) {
    planLines.push('## Milestones', '')
    for (const milestone of plan.milestones) planLines.push(`- ${milestone}`)
    planLines.push('')
  }
  planLines.push('## Decisions', '')
  if (decisions.length === 0) {
    planLines.push('- none')
  } else {
    for (const entry of decisions.slice(-20)) {
      const head = entry.commit === undefined || entry.commit === '' ? '' : `, ${entry.commit}`
      planLines.push(`- ${entry.at.slice(0, 10)} ${entry.decision} (${entry.reason || 'no reason recorded'}${head})`)
    }
  }
  planLines.push('', '<!-- Generated from .research/worklog by research_worklog; edit with the tools, not by hand. -->', '')
  writeAtomic(dirs.planView, planLines.join('\n'))

  const indexLines = [
    '# Work log index',
    '',
    '| id | title | owner | status | updated | next |',
    '| --- | --- | --- | --- | --- | --- |'
  ]
  for (const item of items) {
    indexLines.push(`| ${item.id} | ${cell(item.title)} | ${cell(item.owner)} | ${cell(item.status)} | ${cell(item.updated)} | ${cell(item.next)} |`)
  }
  indexLines.push('', '<!-- Generated from .research/worklog by research_worklog; edit with the tools, not by hand. -->', '')
  writeAtomic(dirs.indexView, indexLines.join('\n'))

  for (const item of items) {
    if (item.kind === 'gated') renderCard(root, item)
  }
  return { plan, items }
}

export function writePlan(root, patch = {}) {
  const dirs = worklogDirs(root)
  const current = readPlan(root)
  const plan = {
    objective: typeof patch.objective === 'string' ? short(patch.objective, 400) : current.objective,
    milestone: typeof patch.milestone === 'string' ? short(patch.milestone, 200) : current.milestone,
    milestones: Array.isArray(patch.milestones) ? patch.milestones.map((m) => short(m, 200)).slice(0, 40) : current.milestones,
    next: typeof patch.next === 'string' ? short(patch.next, 400) : current.next,
    updated: nowDay()
  }
  writeJson(dirs.planFile, plan)
  renderViews(root)
  return plan
}

export function upsertItem(root, input = {}) {
  const dirs = worklogDirs(root)
  const id = validItemId(input.id)
  if (id === undefined) return { error: 'id must match [A-Za-z0-9][A-Za-z0-9._-]{0,63}' }
  const previous = readItem(root, id)
  const status = input.status === undefined ? previous?.status ?? 'todo' : input.status
  if (!ITEM_STATUSES.includes(status)) {
    return { error: `status must be one of ${ITEM_STATUSES.join(', ')}` }
  }
  if (input.status === 'done' && input.by !== 'user') {
    return { error: 'done belongs to the user: record acceptance only after the user accepted the work (pass by: "user")' }
  }
  const history = previous !== undefined && Array.isArray(previous.history) ? [...previous.history] : []
  if (previous !== undefined && status !== previous.status) {
    const allowed = ITEM_TRANSITIONS[previous.status] ?? []
    if (!allowed.includes(status)) {
      return {
        error: `cannot move "${id}" from ${previous.status} to ${status}; allowed from ${previous.status}: ${allowed.join(', ') || 'none'}`
      }
    }
    if (status === 'blocked' && short(input.blocked ?? previous.blocked, 300) === '') {
      return { error: 'blocked needs a reason: pass blocked with what the item is waiting for' }
    }
    history.push({ at: nowIso(), from: previous.status, to: status, by: short(input.by ?? input.owner ?? previous.owner, 40) })
  }
  const item = normalizeItem({
    ...previous,
    ...input,
    id,
    status,
    history,
    kind: input.kind ?? previous?.kind ?? (/^t-/.test(id) ? 'gated' : 'internal'),
    updated: nowDay(),
    title: input.title ?? previous?.title ?? '',
    owner: input.owner ?? previous?.owner ?? '',
    next: input.next ?? previous?.next ?? '',
    blocked: input.blocked ?? previous?.blocked ?? '',
    evidence: input.evidence ?? previous?.evidence ?? [],
    checklist: input.checklist ?? previous?.checklist ?? []
  })
  if (item.title === '') return { error: 'title is required when creating an item' }
  writeJson(path.join(dirs.items, `${id}.json`), item)
  renderViews(root)
  return { item, card: item.kind === 'gated' ? cardFile(root, item) : undefined, created: previous === undefined }
}

export function claimItem(root, input = {}) {
  const id = validItemId(input.id)
  if (id === undefined) return { error: 'id must match [A-Za-z0-9][A-Za-z0-9._-]{0,63}' }
  const owner = short(input.owner, 40)
  if (owner === '') return { error: 'owner is required' }
  const previous = readItem(root, id)
  if (previous === undefined) return { error: `no work item "${id}"; create it with op=update first` }
  if (previous.owner !== '' && previous.owner !== owner && previous.status !== 'todo') {
    return { error: `"${id}" is owned by ${previous.owner} (${previous.status}); do not take it over — report it to the user` }
  }
  return upsertItem(root, { ...previous, id, owner, status: 'in_progress' })
}

export function gateItem(root, input = {}) {
  const id = validItemId(input.id)
  if (id === undefined) return { error: 'id must match [A-Za-z0-9][A-Za-z0-9._-]{0,63}' }
  const previous = readItem(root, id)
  if (previous === undefined) return { error: `no work item "${id}"` }
  const checklist = Array.isArray(input.checklist) ? input.checklist : previous.checklist
  const evidence = Array.isArray(input.evidence) ? input.evidence : previous.evidence
  const hasEvidence =
    evidence.length > 0 || checklist.some((entry) => entry?.done === true && short(entry?.note, 400) !== '')
  if (!hasEvidence) {
    return { error: 'a gate needs evidence: record at least one evidence entry, or a checklist item with a note' }
  }
  return upsertItem(root, {
    ...previous,
    id,
    kind: 'gated',
    status: 'in_review',
    summary: input.summary ?? previous.summary,
    base: input.base ?? previous.base,
    head: input.head ?? previous.head,
    checklist,
    evidence: Array.isArray(input.evidence) ? [...previous.evidence, ...input.evidence] : previous.evidence,
    next: input.next ?? previous.next
  })
}

/**
 * The user's own decision on a gated item, taken from the Research panel:
 * `accept` moves it to done, `return` sends it back to in_progress with the reason.
 * The model cannot take this action through its tools.
 * @param {string} root
 * @param {{ id?: string, decision?: string, reason?: string }} input
 */
export function decideItem(root, input = {}) {
  const id = validItemId(input.id)
  if (id === undefined) return { error: 'id must match [A-Za-z0-9][A-Za-z0-9._-]{0,63}' }
  const previous = readItem(root, id)
  if (previous === undefined) return { error: `no work item "${id}"` }
  if (previous.status !== 'in_review') {
    return { error: `"${id}" is ${previous.status}; only an item in in_review can be accepted or returned` }
  }
  const decision = input.decision
  if (decision !== 'accept' && decision !== 'return') {
    return { error: 'decision must be "accept" or "return"' }
  }
  return upsertItem(root, {
    ...previous,
    id,
    status: decision === 'accept' ? 'done' : 'in_progress',
    by: 'user',
    next: decision === 'return' ? short(input.reason ?? '退回：补充后再提交', 200) : previous.next
  })
}

export function appendDecision(root, input = {}) {
  const decision = short(input.decision, 400)
  if (decision === '') return { error: 'decision is required' }
  const entry = {
    at: nowIso(),
    decision,
    reason: short(input.reason, 400),
    commit: short(input.commit, 64),
    by: short(input.by, 40)
  }
  appendJsonl(worklogDirs(root).decisions, entry)
  renderViews(root)
  return { decision: entry }
}

export function listDecisions(root, limit = 20) {
  return readJsonl(worklogDirs(root).decisions, limit)
}

export function appendEvidence(root, input = {}) {
  const claim = short(input.claim, 400)
  if (claim === '') return { error: 'claim is required' }
  const entry = {
    at: nowIso(),
    claim,
    source: short(input.source, 300),
    locator: short(input.locator, 200),
    strength: short(input.strength, 40),
    by: short(input.by, 40)
  }
  appendJsonl(worklogDirs(root).evidence, entry)
  renderEvidence(root)
  return { evidence: entry }
}

export function listEvidence(root, limit = 40) {
  return readJsonl(worklogDirs(root).evidence, limit)
}

function renderEvidence(root) {
  const dirs = worklogDirs(root)
  const rows = readJsonl(dirs.evidence)
  if (rows.length === 0) return
  const lines = [
    '# Evidence',
    '',
    '| claim | source | locator | strength | recorded |',
    '| --- | --- | --- | --- | --- |'
  ]
  for (const row of rows) {
    lines.push(`| ${cell(row.claim)} | ${cell(row.source)} | ${cell(row.locator)} | ${cell(row.strength)} | ${String(row.at).slice(0, 10)} |`)
  }
  lines.push('', '<!-- Generated from .research/evidence.jsonl by research_evidence. -->', '')
  writeAtomic(dirs.evidenceView, lines.join('\n'))
}

export function readDesign(root, id) {
  const safe = validItemId(id)
  if (safe === undefined) return undefined
  const parsed = readJson(path.join(worklogDirs(root).designs, `${safe}.json`), null)
  if (parsed === null) return undefined
  return {
    id: safe,
    title: short(parsed.title, 200),
    question: short(parsed.question, 400),
    hypotheses: Array.isArray(parsed.hypotheses) ? parsed.hypotheses.map((h) => short(h, 300)) : [],
    metrics: Array.isArray(parsed.metrics) ? parsed.metrics.map((h) => short(h, 120)) : [],
    budget: short(parsed.budget, 200),
    status: short(parsed.status, 40) || 'draft',
    doc: short(parsed.doc, 200),
    updated: short(parsed.updated, 10)
  }
}

export function listDesigns(root) {
  const dir = worklogDirs(root).designs
  let names = []
  try {
    names = fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort()
  } catch {}
  return names.map((name) => readDesign(root, name.slice(0, -5))).filter((value) => value !== undefined)
}

export function saveDesign(root, input = {}) {
  const id = validItemId(input.id)
  if (id === undefined) return { error: 'id must match [A-Za-z0-9][A-Za-z0-9._-]{0,63}' }
  const previous = readDesign(root, id) ?? {}
  const design = {
    id,
    title: input.title === undefined ? previous.title ?? '' : short(input.title, 200),
    question: input.question === undefined ? previous.question ?? '' : short(input.question, 400),
    hypotheses: Array.isArray(input.hypotheses) ? input.hypotheses.map((h) => short(h, 300)) : previous.hypotheses ?? [],
    metrics: Array.isArray(input.metrics) ? input.metrics.map((h) => short(h, 120)) : previous.metrics ?? [],
    budget: input.budget === undefined ? previous.budget ?? '' : short(input.budget, 200),
    status: input.status === undefined ? previous.status ?? 'draft' : short(input.status, 40),
    doc: input.doc === undefined ? previous.doc ?? `docs/design/${id}.md` : short(input.doc, 200),
    updated: nowDay()
  }
  if (design.title === '') return { error: 'title is required' }
  writeJson(path.join(worklogDirs(root).designs, `${id}.json`), design)
  const docPath = path.join(root, design.doc)
  if (!fs.existsSync(docPath) && design.doc.endsWith('.md')) {
    ensureDir(path.dirname(docPath))
    writeAtomic(docPath, `# ${design.title}\n\n## Question\n\n${design.question || 'TODO'}\n\n## Notes\n\n`)
  }
  return design
}

/** Import a legacy markdown worklog once, keeping the originals under .research/worklog/legacy/. */
export function migrateLegacy(root) {
  const dirs = worklogDirs(root)
  const hasItems = (() => {
    try {
      return fs.readdirSync(dirs.items).some((name) => name.endsWith('.json'))
    } catch {
      return false
    }
  })()
  if (hasItems) return { migrated: false, items: 0, notes: ['json worklog already exists'] }
  const legacyPlanFile = path.join(root, 'worklog', 'PLAN.md')
  const legacyIndexFile = path.join(root, 'worklog', 'INDEX.md')
  const rows = legacyItems(root)
  const plan = legacyPlan(root)
  if (rows.length === 0 && plan.objective === '' && !fs.existsSync(legacyPlanFile)) {
    return { migrated: false, items: 0, notes: ['no legacy worklog to import'] }
  }
  const notes = []
  if (fs.existsSync(legacyPlanFile)) {
    ensureDir(path.join(dirs.worklog, 'legacy'))
    fs.copyFileSync(legacyPlanFile, path.join(dirs.worklog, 'legacy', 'PLAN.md'))
    notes.push('copied the legacy PLAN.md to .research/worklog/legacy/PLAN.md')
  }
  if (fs.existsSync(legacyIndexFile)) {
    ensureDir(path.join(dirs.worklog, 'legacy'))
    fs.copyFileSync(legacyIndexFile, path.join(dirs.worklog, 'legacy', 'INDEX.md'))
    notes.push('copied the legacy INDEX.md to .research/worklog/legacy/INDEX.md')
  }
  writeJson(dirs.planFile, {
    objective: plan.objective,
    milestone: plan.milestone,
    milestones: plan.milestones,
    next: plan.next,
    updated: nowDay()
  })
  for (const row of rows) {
    if (row.title === '') continue
    writeJson(path.join(dirs.items, `${row.id}.json`), { ...row, updated: row.updated || nowDay() })
  }
  renderViews(root)
  notes.push(`imported ${rows.length} work item(s) from worklog/INDEX.md`)
  return { migrated: true, items: rows.length, notes }
}

export function worklogSummary(root) {
  const items = listItems(root)
  const counts = {}
  for (const item of items) counts[item.status] = (counts[item.status] ?? 0) + 1
  return {
    plan: readPlan(root),
    items,
    counts,
    decisions: listDecisions(root, 10),
    evidenceCount: listEvidence(root).length,
    designs: listDesigns(root)
  }
}

export function itemCardPath(root, id) {
  return path.join(root, 'worklog', `${id}.md`)
}
