/**
 * Research-team helpers.
 *
 * 1. `research_project` — resolve the calling session's DSH project
 *    (workspaceId), because the task board requires a project UUID when a card
 *    is created and workspace ids are random.
 * 2. An English task-board protocol section registered at this preset's scope.
 *    The third-party dsh-taskboard plugin ships its protocol section in
 *    Chinese; a scoped section with the same name shadows it for agents in
 *    this mode only, so this mode's system prompt is English while the plugin
 *    itself stays untouched.
 * 3. `research_workspace_init` — idempotent durable-tracking bootstrap for a
 *    workspace: create `worklog/PLAN.md` and `worklog/INDEX.md` when missing,
 *    and initialize a git repository when the workspace is not already inside
 *    one. The agent decides when to call it; it never creates a nested
 *    repository and never commits.
 */

import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

export const name = 'research-project'

export const inject = ['tools', 'workspaceRegistry', 'systemPrompt']

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

/** English counterpart of dsh-taskboard's protocol section (same rules). */
const TASKBOARD_PROTOCOL_EN = `The dsh-taskboard plugin (DSH task board) is installed: tasks belong to projects (DSH workspaces) and are read and written with the taskboard_* tools; the human sees the same data live on the Web GUI board. Capabilities: list/get, create, update, move, comment_add/comments, delete (mark only), checklist, execution_report. Tasks carry urgency (urgent red / normal purple / relaxed blue), execution mode (claim / scheduled), and an optional pinned model.
Working discipline:
1. Check the board before starting work: call taskboard_list (filtered to this project, status=todo) before starting, and claim a claimable task in the stated order.
2. Read before acting: call taskboard_get and read every comment before touching a card. Comments are the latest requirements; if they ask you to wait or pause, stop and report without changing status.
3. Claim before working: only after todo -> in_progress (with ifVersion) succeeds should you read code or analyze implementation. If claiming fails (version conflict / project boundary mismatch / already held by someone else), stop and report; never retry in a loop or take over another session's task.
4. Version conflict: retry exactly once. On an ifVersion conflict, re-read the card and retry once with the new version only if the task is still claimable and the requirements are unchanged; if it fails again, stop and report.
5. Review handoff: after implementing and self-verifying, submit a structured taskboard_execution_report (summary / changed files / self-checks / risks), record details in a comment, then move in_progress -> in_review. When the task has an acceptance checklist, tick each item with taskboard_checklist and attach evidence.
6. Completion requires user confirmation: you can never move a task to done — that is the user's confirmation action. A fully ticked checklist still does not mean done. blocked = cannot continue; canceled = will not continue.
7. backlog = not authorized: a backlog task is not approved for execution; being assigned it is not authorization either, unless the user explicitly asks.
8. Model and schedule are read-only: a task's model and execution configuration belong to the creator/user; the update tool does not allow you to change those two fields.
9. When you need user input, a login, a scan, or a decision, set waitingForHuman=true and a waitingReason with taskboard_update; the reason names only the required action, never credentials. Clear the wait with false when unblocked. This marker is independent of blocked.
Project boundary: by default only a session inside the owning project may claim (todo -> in_progress) or execute it; cross-root claiming is allowed only when the board enables allowClaimFromLinkedRoots and the task project is one of the linked workspace roots of this session. Task ownership never changes: reads, writes, builds, and git operations must use the owning project directory; linked-root visibility is not write permission.
When the user mentions the task board, the board, or claiming a task, they mean this plugin; cooperate accordingly.`

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
    name: 'plugin:dsh-taskboard',
    order: 180,
    text: TASKBOARD_PROTOCOL_EN
  })

  const disposeTool = ctx.tools.register({
    name: 'research_project',
    description:
      'Resolve the current DSH project (workspace) for the calling session. ' +
      'Returns workspaceId, title and path. Call this before taskboard_create so a card lands in the right project.',
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
      'Bootstrap durable work tracking in the session workspace when the agent judges that substantive work is starting: create worklog/PLAN.md and worklog/INDEX.md when missing, and initialize a git repository when the workspace is not already inside one. Idempotent, never nested, never commits. Simple questions and one-off reads do not need it.',
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
      try {
        return await initWorkspace(cwd, typeof args.objective === 'string' ? args.objective : '')
      } catch (error) {
        return { error: `Workspace init failed: ${oneLine(error instanceof Error ? error.message : error)}` }
      }
    }
  })

  return () => {
    disposeInit()
    disposeTool()
    disposeSection()
  }
}
