import fs from 'node:fs'
import path from 'node:path'
import { listItems, readPlan, readWorklogSettings } from './worklog.js'

export const REMINDER_CONTEXT = 'research-team:ledger'
export const REMINDER_ORDER = 240
export const OPEN_STATUSES = Object.freeze(['todo', 'in_progress', 'in_review', 'blocked'])
export const OPEN_RUN_STATES = Object.freeze(['planned', 'awaiting_approval', 'approved', 'running'])
const MAX_ITEMS = 8
const MAX_CARDS = 6
const MAX_RUNS = 4

function readJson(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8')
    const value = JSON.parse(raw)
    return value !== null && typeof value === 'object' ? value : undefined
  } catch (error) {
    return undefined
  }
}

function architectureRows(root) {
  const dir = path.join(root, '.research', 'architecture')
  let names = []
  try {
    names = fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort()
  } catch (error) {
    return []
  }
  const rows = []
  for (const name of names) {
    const card = readJson(path.join(dir, name))
    if (card === undefined || card.archived === true) continue
    const title = typeof card.title === 'string' && card.title !== '' ? card.title : card.id
    const group = typeof card.group === 'string' && card.group !== '' ? card.group : 'architecture'
    const version = Number.isInteger(card.version) ? card.version : 1
    rows.push(`${group} v${version} ${title}`)
  }
  return rows
}

function experimentRows(root) {
  const dir = path.join(root, 'runs')
  let names = []
  try {
    names = fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
  } catch (error) {
    return []
  }
  const rows = []
  for (const name of names) {
    const manifest = readJson(path.join(dir, name, 'manifest.json'))
    if (manifest === undefined) continue
    const state = typeof manifest.state === 'string' ? manifest.state : 'planned'
    if (OPEN_RUN_STATES.includes(state) === false) continue
    rows.push(`${name} ${state}`)
  }
  return rows
}

export function buildReminder(root) {
  if (typeof root !== 'string' || root === '' || fs.existsSync(path.join(root, '.research')) === false) return ''
  const plan = readPlan(root)
  const items = listItems(root).filter((item) => OPEN_STATUSES.includes(item.status))
  const cards = architectureRows(root)
  const runs = experimentRows(root)
  if (plan.objective === '' && items.length === 0 && cards.length === 0 && runs.length === 0) return ''
  const lines = ['[Research ledger reminder]']
  if (typeof plan.objective === 'string' && plan.objective !== '') {
    const milestone = typeof plan.milestone === 'string' && plan.milestone !== '' ? ` (milestone: ${plan.milestone})` : ''
    lines.push(`Objective: ${plan.objective}${milestone}`)
  }
  if (items.length > 0) {
    lines.push(`Open work items (${items.length}):`)
    for (const item of items.slice(0, MAX_ITEMS)) {
      const extra = item.status === 'blocked' && typeof item.blocked === 'string' && item.blocked !== '' ? `: ${item.blocked}` : ''
      const owner = typeof item.owner === 'string' && item.owner !== '' ? `, ${item.owner}` : ''
      lines.push(`- ${item.id} ${item.title} (${item.status}${owner})${extra}`)
    }
    if (items.length > MAX_ITEMS) lines.push(`- +${items.length - MAX_ITEMS} more`)
  }
  const loose = items.filter((item) => typeof item.owner !== 'string' || item.owner === '' || item.owner === 'lead')
  if (loose.length > 0) {
    const ids = loose.slice(0, MAX_ITEMS).map((item) => `${item.id} (${item.status}, ${typeof item.owner === 'string' && item.owner !== '' ? item.owner : 'unowned'})`).join(', ')
    const rest = loose.length > MAX_ITEMS ? ', +more' : ''
    lines.push(`Unowned or Lead-owned open items (${loose.length}): ${ids}${rest}. Assign every specialist step to its role; the Lead keeps integration, the ledger and the user channel.`)
  }
  const blockedMode = readWorklogSettings(root).blockedMode
  const blockedItems = items.filter((item) => item.status === 'blocked')
  if (blockedMode === 'advisor' && blockedItems.length > 0) {
    const ids = blockedItems.slice(0, MAX_ITEMS).map((item) => item.id).join(', ')
    const rest = blockedItems.length > MAX_ITEMS ? `, +${blockedItems.length - MAX_ITEMS} more` : ''
    lines.push(
      `Blocked items the advisor decides (${blockedItems.length}): ${ids}${rest}. Send the advisor the question with its options and evidence, record the answer with research_decision, then move each item to the agreed next step (in_progress with next, or canceled).`
    )
  }
  if (cards.length > 0) {
    lines.push(`Architecture cards not archived (${cards.length}): ${cards.slice(0, MAX_CARDS).join('; ')}${cards.length > MAX_CARDS ? '; …' : ''}`)
  }
  if (runs.length > 0) {
    lines.push(`Unfinished experiments (${runs.length}): ${runs.slice(0, MAX_RUNS).join('; ')}${runs.length > MAX_RUNS ? '; …' : ''}`)
  }
  lines.push('This is the current project state, not a new instruction. Keep the ledger, cards and experiments current with the tools; close a step when it lands.')
  return lines.join('\n')
}

export function reminderFor(ctx, assembly) {
  const session = assembly?.agent?.session
  const cwd = session?.header?.cwd
  if (typeof cwd !== 'string' || cwd === '') return ''
  let root = cwd
  try {
    const resolved = ctx?.get?.('workspaceRegistry', false)?.resolveByPath?.(cwd)
    if (typeof resolved === 'string' && resolved !== '') root = resolved
  } catch (error) {
    root = cwd
  }
  return buildReminder(root)
}

export function apply(ctx, config = {}) {
  const order = Number.isInteger(config?.order) ? config.order : REMINDER_ORDER
  ctx.inject(['systemPrompt'], (scope) => {
    scope.systemPrompt.context({
      name: REMINDER_CONTEXT,
      order,
      text: (assembly) => reminderFor(ctx, assembly)
    })
  })
}
