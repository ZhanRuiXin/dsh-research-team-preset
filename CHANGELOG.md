# Changelog

All notable changes to Research Team Mode are documented here. The project uses semantic versioning. The plugin is not publicly released yet; its version stays 0.1.0.

## 0.1.0 — 2026-10-31

Unreleased preview.

- Eight standard roles: advisor, designer, researcher, data, builder, runner, reviewer, writer.
- `designer` owns the experiment design document (questions and hypotheses, protocol and controls, baselines, ablations, metrics and statistical plan, compute budget, design change log); the builder implements it, the runner executes it, the reviewer checks adherence, and the advisor reviews the design at the proposal gate; the Lead gates the step but does not author the design.
- Role boundaries: the runner diagnoses failures but does not patch code, the reviewer focuses on design at the proposal gate and evidence/deviation at the results gate, and the writer works from a pre-checked evidence pack.
- Model guidance: designer and advisor strongest, builder and reviewer next, researcher mid-high, writer mid, data and runner cheapest reliable tool-using models; reasoning effort is set separately.
- `data` role for external dataset and model-weight acquisition: source availability and license/access tracking, download tooling with resume and rate-limit handling, integrity checks against publisher hashes, unpacking, the manifest contract, one small validated sample, and the disk ledger.
- Data handoff: the manifest plus a validated sample unblocks format-adaptation code, so builder work depends on the sample step rather than the full transfer, and a long download never stalls the builder.
- Git workflow: when the request is substantive work rather than a simple question, the agent initializes durable tracking itself with `research_workspace_init`; the tool creates the worklog scaffold and initializes a repository only when the workspace is not already inside one, never nested and never committing. Destructive or risky changes run on a step-named branch; the reviewer reads the card's diff range; a branch is merged only after acceptance; generated artifacts stay out of the repository.
- Worklog discipline: `research_workspace_init` seeds `worklog/PLAN.md` and `worklog/INDEX.md`; work spanning sessions keeps them Lead-maintained plus one bounded `worklog/<task-id>.md` per gated card, with a current-state block at the top and short append-only entries. Resume reads PLAN and INDEX first, then only the target card's state block and tail. Compact templates for all three live in the persona so every session sees them without reading the repository.
- Gate-based task-board workflow with a Lead bridge, per-gated-step ownership, execution reports, and a human-only `done` gate; internal assignments, ordering, and handoffs run on `team_task_*`.
- Task board scope: cards mark the steps that need the user's review or acceptance (deliverable checkpoints, scope decisions, risky changes, final handoff), while internal assignments, self-approved subtasks, and member-to-member handoffs are tracked with `team_task_*` and stay off the board. The persona and the injected board protocol state the split.
- Prompt audit: the persona, the injected board protocol, and the README now tell the same two-ledger story across the roster, dispatch, worklog, git, and communication sections; a gated step's owner claims its card before starting, and a card may sit in todo while internal work runs.
- Team communication: internal messages between the Lead and teammates, spawn prompts, shared team tasks, and handoff notes are written in English; user-facing replies, board cards, execution reports, and deliverables follow the user's language.
- User questions: the Lead asks with `ask_user_question` instead of setting `waitingForHuman`/`waitingReason` on cards; a question that stays unanswered past the wait timeout becomes an advisor consultation, recorded before the work continues.
- Lead focus: the Lead keeps its own tool use light, skips ritual checks when nothing changed, batches related operations, and prefers a short user-facing update over another routine call; deep work belongs to the owning member.
- Shared Zotero literature: the researcher searches the user's Zotero library before the open web, imports a missing paper's formal version of record with its PDF (deduped by DOI/title, filed in a project collection), and shares `zotero://` item refs on the evidence table and the gated card. Paywalled or metadata-only evidence is labelled instead of substituted.
- Opt-in `spawn_teammate_with_model` submodule for per-role provider, model, and reasoning effort.
- Multiple named team model profiles: create, rename, switch, and delete profiles from the Plugins page, with eight role rows each, a provider-grouped model menu, and a separate reasoning-effort menu. The selected profile supplies the next teammate's route.
- Profile settings persisted to `$DSH_HOME/research-team-settings.json` as `{ version: 2, activeProfileId, profiles }`, refreshed from disk on reads and teammate spawns. Legacy `{ roles: ... }` files migrate to a single `默认配置` profile.
- Settings API: `GET/POST /api/dsh-research-team-settings` reads and writes the whole profile list; a legacy `{ roles: ... }` POST updates only the active profile.
- Fixed `spawn_teammate_with_model` on current builds: Cordis wraps every Service instance in a traceable proxy whose method reads are re-wrapped on each access, so the old identity check reported "patch did not take effect" even after the wrapper was installed, and the tool stayed permanently unavailable. The patch now verifies the own property descriptor instead. The harness covers configured-role injection, explicit overrides, plain inheritance, and restore on dispose.
- Fixed the modeled spawn itself: `spawn_teammate_with_model` passed the prompt as a bare string, while the Team spawn path expects typed content blocks, so every modeled spawn failed with `content.some is not a function`. The tool now passes `[{ type: 'text', text }]`, matching the built-in `spawn_teammate`.
- English system prompt and English README; full translations in 11 additional languages under `docs/`.
- Fixed a settings loader bug from earlier builds: the file stores roles under `"roles"`, and the old loader passed the whole object to the role normalizer, producing all-empty settings after a restart.
- MIT license.
