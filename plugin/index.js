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
 */

export const name = 'research-project'

export const inject = ['tools', 'workspaceRegistry', 'systemPrompt']

/** English counterpart of dsh-taskboard's protocol section (same rules). */
const TASKBOARD_PROTOCOL_EN = [
  'The dsh-taskboard plugin (DSH task board) is installed: tasks belong to projects (DSH workspaces) and are read and written with the taskboard_* tools; the human sees the same data live on the Web GUI board. Capabilities: list/get, create, update, move, comment_add/comments, delete (mark only), checklist, execution_report. Tasks carry urgency (urgent red / normal purple / relaxed blue), execution mode (claim / scheduled), and an optional pinned model.',
  'Working discipline:',
  '1. Check the board before starting work: call taskboard_list (filtered to this project, status=todo) before starting, and claim a claimable task in the stated order.',
  '2. Read before acting: call taskboard_get and read every comment before touching a card. Comments are the latest requirements; if they ask you to wait or pause, stop and report without changing status.',
  '3. Claim before working: only after todo -> in_progress (with ifVersion) succeeds should you read code or analyze implementation. If claiming fails (version conflict / project boundary mismatch / already held by someone else), stop and report; never retry in a loop or take over another session\'s task.',
  '4. Version conflict: retry exactly once. On an ifVersion conflict, re-read the card and retry once with the new version only if the task is still claimable and the requirements are unchanged; if it fails again, stop and report.',
  '5. Review handoff: after implementing and self-verifying, submit a structured taskboard_execution_report (summary / changed files / self-checks / risks), record details in a comment, then move in_progress -> in_review. When the task has an acceptance checklist, tick each item with taskboard_checklist and attach evidence.',
  '6. Completion requires user confirmation: you can never move a task to done — that is the user\'s confirmation action. A fully ticked checklist still does not mean done. blocked = cannot continue; canceled = will not continue.',
  '7. backlog = not authorized: a backlog task is not approved for execution; being assigned it is not authorization either, unless the user explicitly asks.',
  '8. Model and schedule are read-only: a task\'s model and execution configuration belong to the creator/user; the update tool does not allow you to change those two fields.',
  '9. When you need user input, a login, a scan, or a decision, set waitingForHuman=true and a waitingReason with taskboard_update; the reason names only the required action, never credentials. Clear the wait with false when unblocked. This marker is independent of blocked.',
  'Project boundary: by default only a session inside the owning project may claim (todo -> in_progress) or execute it; cross-root claiming is allowed only when the board enables allowClaimFromLinkedRoots and the task project is one of the linked workspace roots of this session. Task ownership never changes: reads, writes, builds, and git operations must use the owning project directory; linked-root visibility is not write permission.',
  'When the user mentions the task board, the board, or claiming a task, they mean this plugin; cooperate accordingly.',
].join('\n')

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
          text: `Current project: ${title}\nworkspaceId: ${id}\nPath: ${path}`
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

  return () => {
    disposeTool()
    disposeSection()
  }
}
