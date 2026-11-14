# Research Team Mode

[![powered by dsh](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness) [![DSH 0.2.x](https://img.shields.io/badge/DSH-0.2.x-4D6BFE?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness) [![license MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

**A DSH agent preset that turns one session into a small, coordinated research team.**

**Version 0.2.2** · **Updated 2026-11-14**

<p align="center"><strong>English</strong> · <a href="docs/README.zh-CN.md">简体中文</a> · <a href="docs/README.zh-TW.md">繁體中文</a> · <a href="docs/README.ja.md">日本語</a> · <a href="docs/README.ko.md">한국어</a> · <a href="docs/README.de.md">Deutsch</a> · <a href="docs/README.fr.md">Français</a> · <a href="docs/README.es.md">Español</a> · <a href="docs/README.pt-BR.md">Português (Brasil)</a> · <a href="docs/README.ru.md">Русский</a> · <a href="docs/README.ar.md">العربية</a> · <a href="docs/README.hi.md">हिन्दी</a></p>

---

## Overview

Research Team Mode is a DSH agent preset for running end-to-end research as a team instead of a single chat. The Lead plans the work, keeps the worklog (a JSON store under `.research/worklog/` with one item per piece of work, gated or internal), dispatches work, integrates results, and talks to the user. Eight default specialists cover advisory review, literature and evidence, data acquisition, experiment design, code, runs, independent review, and paper writing.

The mode is built for research that spans days or weeks, needs traceable evidence, and benefits from clear role boundaries. It is not a one-shot Q&A mode: the Lead creates only the roles a task actually needs.

The preset has one system prompt for the whole team. `prompt/core.md` holds the shared discipline and is mounted by `plugin/prompt.js`; each role's own duties are a built-in skill under `prompt/roles/`, registered by `plugin/roles.js` as `research-role-<role>`. The Lead loads `research-role-lead`, and a teammate loads the one its task message names, so every member runs the same preset with the same cacheable system prefix while carrying only the rules it needs.

## At a glance

| | |
| --- | --- |
| **Default roles** | 8: advisor, designer, researcher, data, builder, runner, reviewer, writer |
| **Workflow** | Gate-based: every piece of work is a work item; only steps that need your review carry a card view; create, claim, execute, report, review, user acceptance |
| **Completion** | `in_review` is the agent's last stop; only the user can move a work item to `done` |
| **Model routing** | Per-role provider, model, and reasoning effort from a Plugins-page settings form |
| **Git** | Initialized by the agent when substantive work starts; branches for destructive changes; merged only after acceptance |
| **Worklog** | `.research/worklog/` JSON store with generated `PLAN.md` and `INDEX.md` views; resume reads `research_state` first |
| **Continuity** | One store per project at its root; a resumed session calls `research_state` and reads the one item it needs; the store and git carry state across sessions |
| **Runtime** | PTC (`run_code` + generated SDK), one subagent layer per member |

## Who it is for

- Research projects that combine literature review, implementation, experiments, and paper output.
- Teams that need an evidence trail from claim to source, run record, or log.
- Users who want an advisor and an independent reviewer rather than one general-purpose agent.
- Work where the user should make the final acceptance decision, not the agent.

**Not for:** quick factual questions, single-file edits, or tasks where a one-shot answer is enough. The mode tells the Lead to answer simple questions directly and mobilize the team only for substantive research.

## How the Lead talks to you

The Lead's replies are scientific communication, not a status feed: the claim or result first, with the evidence behind it (run id, dataset, metric with uncertainty and sample size, source), then what is uncertain, then what the user has to decide. Each statement is labelled observed fact, inference, hypothesis, or open question, and the method is explained far enough that the user can follow and keep learning.

Internal mechanics stay internal. Agent handoffs, retries, tool errors, ledger bookkeeping, and what the team learned while working are not forwarded unless they change how a result should be read or block a decision. Member reports are translated into a claim, its evidence, and its limits rather than pasted.

The division of labor is explicit: the user sets the scientific direction and judges the evidence, and the team carries the search, implementation, experiment, and verification load.

Your questions are the contract for the turn. When you ask for a survey, an extension list, or a decision, the answer delivers that, and any research program, gate, or kill criterion is additional rather than a substitute; the reply walks your questions in order, answers each with its evidence and the file where the full detail lives, and says plainly if one cannot be answered yet.

A long turn is not a silent one. If the team has been working for more than about ten minutes, the Lead sends a short interim answer saying what is settled, what is still being gathered, and when the next answer comes, so you can redirect before the compute is spent.

A negative prior result constrains the method, the data, and the budget that produced it, not the idea. Before a direction is closed, the strongest version is stated and shown to fail; every "cannot be claimed" comes with the version that could be claimed and the evidence that would earn it.

## Requirements

Research Team Mode is a **profile-level DSH bundle**. The bundle does not install or enable the profile bundles it uses; DSH's package installer handles npm dependencies, not feature bundles. Enable the dependencies in the same profile first.

| Capability | Provider | Notes |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | Developed against `0.2.2-rc.3`; other releases may work but are not guaranteed |
| Agent Teams | [`@deepseek-ai/dsh-agent-team`](https://github.com/deepseek-ai/deepseek-harness) | Shares the task DAG and change waits across a subagent tree; teammates are continuable subagent children, and the preset records work in its own worklog. Every session opened in the profile gets Team collaboration enabled, including older workspaces, so the 智能体团队协作 toggle does not have to be set by hand. |
| PTC runtime | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) and [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | Part of the DSH base; enables `run_code` |

**Optional integrations.** These are plugins by other authors. The preset runs without them and installs nothing; add one only to link the team with it:

- **Zotero** (`dsh-zotero`) — the shared library tools (`zotero_*`) and the paper-fetch import path. Without it, literature work uses Semantic Scholar, arXiv, and the web, and the evidence table still records claim, source, and location.
- **Mnemon** (`dsh-mnemon`) — durable notes across sessions (`mnemon_*`). Without it, the worklog and `CHANGELOG.md` carry continuity.

If a dependency is missing, the mode can still load partially, but the team tools or the settings page will be unavailable. The plugin manager does not prompt for these bundles and does not link them automatically.

## Install

This preset ships as a DSH bundle and is published on npm as `dsh-research-team-preset`.

### Install from the DSH plugins page

1. **Enable the required bundles** in the target profile: Agent Teams [`@deepseek-ai/dsh-agent-team`](https://github.com/deepseek-ai/deepseek-harness). The optional integrations above can be added now or later.
2. Open **Settings → Plugins** and click **Add**.
3. Paste the install spec: `dsh-research-team-preset@0.2.2` for the npm package, `github:ZhanRuiXin/dsh-research-team-preset#v0.2.2` to pin the source, or `link:/absolute/path/to/dsh-research-team-preset` for a local checkout.
4. **Restart DSH.** Preset rows and the client half of the bundle load at startup.
5. **Check the bundle is enabled** in the same profile, then **open a new session** and select **Research Team Mode** in the mode selector.

### Install from the CLI

```text
dsh plugin add dsh-research-team-preset@0.2.2
```

To pin the source instead of the registry:

```text
dsh plugin add github:ZhanRuiXin/dsh-research-team-preset#v0.2.2
```

> The mode is a profile-level bundle: installing it in one profile does not enable it in another. Repeat the install and prerequisite steps per profile.

## First run

Ask the Lead to check the environment and the worklog before starting real work:

```text
list_agents                    # create only the roles the task needs
research_project               # resolve the current project root
research_workspace_init        # seed .research/worklog/ and render PLAN.md and INDEX.md if missing
```

A typical first task:

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> research_worklog (gated item at a user gate, internal item otherwise) -> send_message
Members: research_worklog op=claim -> work -> op=gate with checklist evidence and base..head -> send_message
Reviewer: independent PASS/FAIL with evidence through research_worklog op=update
Lead: summarize -> user acceptance (done, set by the user)
```

## Default team

| Role | Responsibility |
| --- | --- |
| `advisor` | Independent assessment of direction, framing, central claims, evidence sufficiency, and paper strategy. Constructive by default: what holds, the few issues that threaten the result, the smallest repair or a concrete alternative for each, then proceed / revise / stop. Advisory only, not a gate |
| `researcher` | Literature search, acquisition, close reading, evidence extraction, and a claim → source → location evidence table. Searches the shared Zotero library first, imports the formal full paper with its PDF when a needed work is missing, dedupes by DOI/title, and shares `zotero://` refs with the team |
| `data` | External dataset and model-weight acquisition, including source availability and license/access status, download tooling with resume and rate-limit handling, integrity checks against publisher hashes, unpacking, the manifest contract, a small validated sample, and the disk ledger; does not write training code or change the evaluation protocol |
| `designer` | Owns the experiment design document: questions and hypotheses, protocol and controls, baselines, ablations, metrics and statistical plan, compute budget, and design change control while runs are in flight; does not write production code or run experiments |
| `builder` | Code, configuration, data pipelines, tests, and reproducible entry points; no long training runs |
| `runner` | Start and monitor training/evaluation; record run ids, configs, seeds, metrics, logs, checkpoints, and artifact paths |
| `reviewer` | Independent verification of literature notes, code, results, and paper claims/citations; PASS/FAIL with blocking evidence |
| `writer` | LaTeX paper draft: prose, sections, tables, captions, citations, and figure code; does not run experiments or change code/models |

The Lead owns goal clarification, decomposition, ledger management, dispatch, integration, summaries, final asset assembly, and delivery. Members may use one subagent layer for a scoped subtask; they cannot create teammates. The Lead keeps its own tool use light, favors a short user-facing update over another routine call, and leaves deep work to the owning member.

### Shared Zotero library

The researcher treats the user's Zotero library as the team's shared literature source. It searches existing collections and items before the open web, reuses the attached PDFs and annotation passages, and imports a missing paper only in its formal version of record, with the PDF attached and filed in a project collection. Imports dedupe by DOI and title, leave the user's tags and collections alone, and record the `zotero://` item ref in the evidence table and in the item's evidence, so every teammate reads the same paper and the reviewer can spot-check the same pages. When the full text is paywalled or only metadata exists, the researcher records the link and marks the evidence as metadata-only instead of importing a substitute.

### Advisory review

The advisor is a scientific co-thinker, not a gatekeeper. It first names what holds in the plan and why, then at most three issues ordered by how much they threaten the result, each tied to a specific step, claim, or number. Every issue ships with the smallest repair that would make the plan acceptable, or one concrete alternative with its trade-off; a bare rejection is not a review. It separates "this cannot answer the question" from "this works but is weaker or costlier", states the condition under which the plan becomes acceptable, and ends with proceed, revise with the required changes, or stop with the direction to take instead. It judges against the standard the project has actually committed to and names it, instead of assuming the most demanding one: a plan that is sound for its stated goal is not a failure because a stronger claim would need more evidence, and a wrong target is raised separately as a scope decision for the user. When the evidence needed to judge is missing it names the cheapest test or source that would settle it. A sound plan gets a plain endorsement rather than manufactured objections, and a stop always carries a replacement direction. It remains advice: the Lead decides and the reviewer stays the independent PASS/FAIL gate.

The Lead prepares every consultation instead of forwarding the conversation. It translates what the user asked into the decision the advisor must answer, with the claim or plan at issue, the current evidence and its scope, the options on the table, the constraints, and what the user needs from the answer; a vague or overloaded question is sharpened first, and the user's raw message and the team's internal history are not passed along. The advisor is consulted once per decision point, not to confirm what the Lead can already defend or to summarize the Lead's own work, and the reply reaches the user as the scientific conclusion and the decision it leaves open, not as forwarded text.

## Design ownership

The Lead does not author the experiment design. For design-heavy work the designer owns a design document in the project workspace (`docs/design/<name>.md` or the project's existing design location): the question and hypotheses, protocol and controls, baselines, ablations, metrics and statistical plan, compute budget, and a change log for design changes made while runs are in flight.

The builder implements the design, the runner executes it, and the reviewer checks at the proposal gate that the design can answer the question and at the results gate that execution matched it. The advisor gives an independent scientific read at the proposal gate. The Lead confirms that the design document exists and that the researcher and data inputs are in place, then admits or returns the step. For implementation-led work the builder drafts the design and the advisor reviews it once.

## Write envelope

Each role writes only inside its own envelope. The advisor and the reviewer write nothing; the researcher owns `literature/`, `notes/`, and `docs/evidence`; data owns `data/`, `manifests/`, download scripts under `scripts/`, and `reports/`; the designer owns `docs/design/`; the builder owns `src/`, `configs/`, and `tests/`; the runner owns `runs/`, `logs/`, and `checkpoints/`; the writer owns `paper/` and `figures/`; the Lead is unrestricted. Reading, searching, and the annotation note on an architecture card stay open to everyone.

The envelope is a contract rather than a preference: a change that belongs to another role is reported to that owner instead of written by the wrong member. The advisor and the reviewer are spawned read-only, so a review reports what must change instead of changing it; any teammate that genuinely needs to write outside its envelope gets an explicit exception from the Lead, recorded on the card before the work starts. Every other role inherits the Lead's sandbox permission, so a teammate is never more restricted than the Lead unless its role requires it.

Before a work item moves to in_review, the owning member or the Lead runs `research_scope_check` with the role and either the changed paths or the base and head commits. A violation is fixed by moving the change to its owning role, or by recording the exception the Lead approved; never by widening the envelope mid-card. A project can narrow or extend an envelope in `AGENTS.md` or on the card, and the card wins for that step so a later session reads the same rule.

## Experiment admission

Compute is spent on a decision, not on activity. Before a run beyond a trivial smoke test, the design document or worklog records the question the run settles, the hypothesis, the expected outcome and the effect size that would count as support, the result that would refute it, the kill criterion, the baseline it must beat, the cheapest pilot, and the budget. A run without that record is not admitted, and the rule must be able to come back "stop".

The team pilots first: the smallest configuration that can still fail the hypothesis, judged against the pre-registered threshold, and only then an explicit decision to scale. If the pilot misses the threshold, the line stops, the negative result is recorded and reported, and no extra seeds or variants are added to average away the miss. One variable changes at a time, a mid-run protocol change is logged with its reason, and a run is also bounded by budget, by the same failure repeating twice, and by a metric that has stopped moving.

The Lead admits the run, the runner refuses to launch without the pre-flight record, and the reviewer checks at the results gate that execution matched the pre-registered rule and that a stop decision was honored rather than overridden.

## Session continuity

A session is a conversation, not the project: the worklog and git carry the work, while the chat, the team, and background jobs do not survive the session. Before the first substantive action in a project that already has a worklog, the agent calls `research_state` and reads the one item it is taking before planning or spending compute.

The worklog lives at the project root returned by `research_project`, not in a session subdirectory, so every session on the project shares one store. The `.research/` store, git, and memory are durable; the PLAN, INDEX and card files are generated views, and teammate conversations and background jobs live only in the session. Anything a later session must know is recorded through the tools before the session ends.

A run or long job that outlives the turn leaves its job or terminal handle, host, start time, expected completion, and decision rule in the item's `next` and `evidence` fields. On resume the agent checks liveness first, and an orphaned run is reconciled and put to the user as adopt, restart, or stop rather than silently run twice. A work item held by a session that no longer exists is reported to the user for reopening, never taken over.

## Research sidebar

The preset adds a Research panel tab to the right sidebar. It answers what the team is doing now, what is blocked, and what comes next: the objective from the plan, the active work items from the JSON store (finished ones sit behind a 已完成 toggle), the runs with their lifecycle and approval state (a directory under `runs/` only counts once it carries a `manifest.json`), the architecture cards in their project-defined groups, and the live team. Click a work item or an experiment to expand the row: an item opens its full title, next action, blocked reason, evidence and checklist; a run opens its question, hypothesis, decision rule, reason and timing. Clicking it again collapses it.

Architecture cards are node and edge diagrams stored as JSON under `.research/architecture/`, one file per card. The agent reads and updates them with the `research_architecture` tool, so the diagram stays in step with the design instead of drifting in a slide. A card renders as SVG inside the panel; dragging a box over nodes selects them, and the selection can be quoted into the conversation; anything worth keeping is stored on the card as a note the agent reads before it answers. The tab registers through `dsh-better-sidebar` when that plugin is installed and falls back to the native right sidebar otherwise.

The panel ships as its own module under `panel/`, separate from the settings form, so it can be enabled or disabled on its own. It appears as a right-sidebar tab in each conversation.

The team section lists every member of the running team, with the Lead first: name, role, model and whether the member is running, idle, starting or failed, plus the work item it owns. It reads the live team from the Lead's subagent tree, so it is a running-state view rather than a log; when an older session created its teammates before subagents carried names, the panel recovers their names from the session's `team/member` records instead of showing session ids. It lists the preset's own teammates: standard-role names, children recorded when `spawn_teammate_with_model` started them, and legacy roster members. Subagents other plugins create under the same Lead are not shown.

The designer owns the cards that describe the method and the builder owns the cards that describe the implementation, in whatever groups the project defines; the advisor reads them before reviewing a design or implementation decision, and the reviewer checks them at the results gate. Drag with the middle mouse button to pan the canvas, zoom from the toolbar, and drag a box over nodes to select them for an annotation.
The experiment section lists runs newest first and shows how long each has been going or how long it took. Every run follows one explicit lifecycle (planned, awaiting approval, approved, running, completed, stopped, failed or rejected), and the agent drives it with the `research_experiment` tool: register writes the decision rule, seeds and budget; start refuses until the user approves or the project mode is automatic; finish records completed, stopped or failed with a reason. The section header carries an approval switch (requires approval / auto), a run waiting for approval shows approve and reject buttons that write into its manifest, and the list scrolls inside its own box once it grows.

## Worklog and coordination

The worklog is the record. Its machine state is JSON under `.research/worklog/`: `plan.json` and one `items/<id>.json` per work item. The tools write it — `research_worklog` (init, list, get, update, claim, gate, plan), `research_decision`, `research_evidence`, `research_design`, and `research_state` for one read of the whole team state — and `worklog/PLAN.md`, `worklog/INDEX.md` and `worklog/<id>.md` are generated views, so nobody edits them by hand.

A work item carries an owner, a status (`todo`, `in_progress`, `in_review`, `blocked`, `done`, `canceled`), a next action, optional evidence and checklist items, and a kind: internal steps and gated deliverables. Claiming is `op=claim`, and it refuses to take over an item another owner holds. Status moves follow one table: `todo -> in_progress -> in_review -> done`, with `blocked` and `canceled` as side states; `blocked` requires a reason, a gate requires at least one evidence entry or a noted checklist item, and every move is kept in the item history. At a gate the owner records the checklist with evidence, the execution summary and the `base..head` range, and the item moves to `in_review`; A work item can carry deliverables: the panel shows one button per file, and a click opens it in the right sidebar. Register them with `research_worklog` op=update and `deliverables: [{ label, path }]`, where `path` is relative to the project root (or use `url` for an http(s) link). the reviewer records PASS/FAIL; `done` stays the user's acceptance action: the sidebar shows 确认完成 / 退回 on every `in_review` item, and the model never writes it.

```text
research_worklog op=init                 # plan.json + views
research_worklog op=update kind=gated    # a gate that needs the user
research_worklog op=claim                # take it as your role
research_worklog op=gate                 # in_review with evidence
research_state                           # the whole team state in one read
```

When Team collaboration is on, the host also injects its own Agent Teams policy, which names `team_task_*` as the shared-task board. The record stays here: use team tasks only for internal assignments that do not need a durable record, and keep gates, evidence, decisions, run manifests and user acceptance in `.research/worklog/` and `runs/`. A completed team task never stands in for a worklog gate.

The full discipline lives in the preset prompt and in `AGENTS.md` of the project.

## Git workflow

The mode initializes durable tracking when substantive work starts, and the agent judges whether a request is real work or a simple question. In a workspace that is not already inside a repository, the agent calls `research_workspace_init`, which seeds `.research/worklog/` and renders `worklog/PLAN.md` and `worklog/INDEX.md`, and runs `git init`. It never creates a nested repository and never commits the scaffold.

Destructive or risky changes run on a branch named after the step, for example `task/<title>+<id>` (the work item id, gated or internal alike), instead of editing the default branch in place. The item records the base and head commits, and the reviewer reads `git diff <base>..<head>` as the code-review basis and still re-runs the acceptance checks.

A branch is merged only after the item is accepted, then deleted. Generated artifacts such as datasets, checkpoints, logs, and caches stay out of the repository. When the project is not a git repository, review falls back to a file-hash snapshot plus the evidence recorded on the item.

## Worklog

Work that may span sessions keeps a small, bounded record next to the code, at the project root. `worklog/PLAN.md` holds the objective, current milestone, active cards, blockers, and dated decisions; `worklog/INDEX.md` holds one line per active card. Each card gets `worklog/<task-id>.md` with a current-state block at the top and short append-only entries below.

On resume the agent calls `research_state`, then reads the one item it is taking, never the whole store; `session_search` is a fallback when the session history is available, not the record. The generated PLAN stays under about 100 lines and card views under about 200, with finished items trimmed from the index. The tools write the views, so no session has to copy a template.

## Team model profiles

The settings page keeps several named model profiles for the default team members and uses the selected one for the next spawn.

Open:

```text
Plugins → dsh-research-team-preset → research-team-settings → Configure
```

The profile bar at the top of the page:

- **Switch** the profile (`团队配置` dropdown) that the next default teammate uses.
- **新建配置** appends a profile with eight empty role rows.
- **配置名称** renames the selected profile. Names are required, unique, and at most 60 characters.
- **删除配置** deletes the selected profile after a second confirming click. The last remaining profile cannot be deleted.

Each profile has one row per default member:

- **Model**: one dropdown containing every provider's models, with non-clickable provider group headers. Selecting a model sets both provider and model.
- **Reasoning effort**: a second dropdown with the selected model's advertised efforts, plus a model-default option.

An empty model means "inherit the Lead's route"; an empty effort means "use the model default". `spawn_teammate_with_model` reads the selected profile's per-role default when `model` is omitted; an explicit `model` overrides it. A named child started without `model` inherits the Lead route.

Route lookup happens at spawn time and reads `$DSH_HOME/research-team-settings.json` directly before falling back to the in-process store, so a session opened before the Plugins page was ever saved still resolves the configured routes. A teammate name resolves to a role when it contains the role as a whole word (`advisor`, `ELHA-R advisor`, `advisor-hi`); a name with no standard role inherits the Lead route, and the tool result carries a `diagnostics` note saying which role was matched and why nothing was configured. The Lead can call `research_team_routes` to read the configured table instead of guessing provider and model names.

Suggested capability tiers, as a starting point rather than a rule:

| Role | Suggested tier | Why |
| --- | --- | --- |
| `designer` | Strongest | A design error invalidates every run |
| `advisor` | Strongest, different family from designer | Independent critique needs a different view |
| `builder` | High | Code correctness and long context |
| `reviewer` | High, different family from builder and runner | Evidence audit needs its own lens |
| `researcher` | Mid-high | Baseline and SOTA judgment |
| `writer` | Mid | Organized writing from checked evidence |
| `data` | Mid-low | Procedural acquisition with tools |
| `runner` | Mid-low | Tool reliability over deep reasoning |

The whole profile list is saved together, so switching profiles does not discard edits made in another one. The page validates names before saving and shows the server's error text when a save is rejected.

The row name matters: `research-team-settings` must stay at the **package root** `dsh-research-team-preset`. DSH's client-module scanner only discovers `dsh.client` for exact package-root rows; a subpath name starts the host plugin but never loads the page.

### Where settings are stored

```text
$DSH_HOME/research-team-settings.json
```

```json
{
  "version": 2,
  "activeProfileId": "default",
  "profiles": [
    {
      "id": "default",
      "name": "默认配置",
      "roles": {
        "advisor": { "provider": "example-provider", "model": "example-model", "reasoningEffort": "high" },
        "designer": { "provider": "", "model": "", "reasoningEffort": "" },
        "researcher": { "provider": "", "model": "", "reasoningEffort": "" }
      }
    },
    {
      "id": "p-example",
      "name": "快速实验",
      "roles": {
        "advisor": { "provider": "", "model": "", "reasoningEffort": "" }
      }
    }
  ]
}
```

- `activeProfileId` names the profile used by the next teammate. The server falls back to the first profile when it is missing or unknown.
- A legacy file (`{ "roles": { ... } }` or a bare role map) is migrated in memory to a single profile named `默认配置`; the file is rewritten in the profile shape on the next save. A legacy `POST { "roles": ... }` updates only the active profile, so older scripts cannot drop the other profiles.
- The JSON file is the source of truth. The host plugin loads it at startup; `getSettings()` and `modelForRole()` refresh from it, so the page and the next teammate see the latest values.
- A missing or temporarily unreadable file keeps the last good in-memory snapshot instead of clearing it.
- The settings file is **not** in this repository. Back it up separately. It is per `DSH_HOME`, not per profile.
- No credentials are stored; only profile names and provider/model/effort strings.
- Settings saves apply without a DSH restart: the store re-reads the file and the next spawn resolves the active profile. Changing this plugin's own code still needs a DSH restart, because the host half registers a WebSocket/HTTP route and a Plugins-page slot at host level.
- Version 0.1.0 fixes a loader bug in earlier builds: the file wraps roles under `"roles"`, and the old loader passed the whole object to the role normalizer, producing all-empty settings after restart. The current loader unwraps `"roles"`, migrates old files, and supports a bare role map for compatibility.

## Configuration reference

| Setting | Location | Notes |
| --- | --- | --- |
| Preset id | `cordis.patch.yml` | `research-team`; use it when a session should run this preset. Teammates inherit it, so it is the only preset you pick |
| Prompt | `prompt/` | English shared core mounted as the preset persona by `plugin/prompt.js`; the role briefs ship as built-in skills through `plugin/roles.js` |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | Set `false` to remove `spawn_teammate_with_model` and its service wrapper |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | Subagent providers used by the modeled spawn tool; defaults `spawn` / `fork` |
| `research-team-settings` row | `cordis.patch.yml` | Top-level host row; keep the package-root name |
| `dsh-research-team-panel` row | `cordis.patch.yml` | Top-level host row for the Research sidebar module; mounted by package name |
| Team model profiles | `$DSH_HOME/research-team-settings.json` | Named profiles; the active profile supplies provider/model/reasoningEffort for the eight default roles |

## How it works

- **Preset**: `cordis.patch.yml` declares one preset row, `research-team`, with the prompt row, the role-skill row, the tool rows, the modeled-teammates submodule, and the top-level settings row. The prompt row mounts `prompt/core.md` for every member; the role-skill row serves `research-role-lead` and the eight specialist briefs, which the model loads with the `skill` tool. The preset also mounts `@deepseek-ai/dsh-tool-subagent-control` and `@deepseek-ai/dsh-tool-agent-team`: the profile supplies the subagent and agent-team services, not the tool packages, so `list_agents`, `send_message`, `wait_agent`, `interrupt_agent` and `team_task_*` only exist when the preset declares them. A spawned teammate inherits this preset instead of mounting a second one, and the spawn tool refuses a teammate caller so only the Lead can create teammates.
- **Coordination ledger**: `plugin/index.js` registers an English ledger section (`plugin:dsh-research-team-worklog`) at the preset scope and provides `research_project` to resolve the current project root.
- **Per-role routing**: `plugin/modeled-teammates.js` wraps `subagents.startActivation` with `AsyncLocalStorage` and injects `agentOptions` only for a `spawn_teammate_with_model` call. It resolves the route from `plugin/settings-file.js` (the settings JSON, read at spawn time) and falls back to the in-process store, so a preset submodule never depends on the top-level settings row having filled that store first. The official Agent Teams package is untouched. Cordis returns a traceable proxy for services, so the wrapper verifies its own property descriptor instead of method identity.
- **Settings**: `settings/index.js` loads/saves the profile JSON file and serves `GET/POST /api/dsh-research-team-settings`; `client/index.js` registers the Plugins-page profile editor through `plugins.row.config`.
- **Refresh**: `plugin/settings-store.js` holds the in-memory snapshot, resolves the active profile on every read and spawn, and keeps the last good snapshot if a read fails.

## Troubleshooting

### Settings appear to reset after restart

Version 0.1.0 fixes the known cause: the old loader passed the whole `{ roles: ... }` object to the role normalizer and produced all-empty settings. Update to 0.1.0 or later, restart DSH, and check that:

- `$DSH_HOME/research-team-settings.json` exists and contains the saved profiles;
- old `{ "roles": ... }` files are shown as a single `默认配置` profile and are rewritten in the profile shape on the next save;
- the `research-team-settings` row is named exactly `dsh-research-team-preset`;
- the current host is running this checkout, not a stale installed copy.

### Every teammate runs on the Lead's model

Check the spawn result printed above the member's first message. It reads `requested=<provider>/<model> effort=<effort>` when a configured or explicit route was applied, and `requested=inherit (Lead route)` with a `note:` line when no route matched. A `note:` naming the role means that role has no provider/model in the active profile; a note saying the name is not a standard role means the teammate name did not contain a role word.

Two other causes are not about the settings file:

- the Lead used a plain delegation tool instead of `spawn_teammate_with_model`, which bypasses the per-role route. The persona tells the Lead to pass no `model` to the modeled tool and never to fall back because it is unsure about names;
- the settings row was saved under a different `DSH_HOME` than the running host reads. Compare the `settings file:` line printed by `research_team_routes` with `echo $DSH_HOME`.

### The settings page does not appear in Plugins

- The row must be the package root, not `dsh-research-team-preset/settings`.
- The client half needs a DSH restart and a browser refresh after installation.
- Check that the bundle is enabled in the profile.

### Team tools are missing

Enable [`@deepseek-ai/dsh-agent-team`](https://github.com/deepseek-ai/deepseek-harness) in the same profile and restart. The installer does not prompt for it.

### A work item is missing from the sidebar

The Research panel lists `worklog/INDEX.md` rows. Add or update the row in `INDEX.md` (id, title, owner, status, updated, next) and the panel picks it up within five seconds.

### `spawn_teammate_with_model` is unavailable

The submodule wraps an internal subagent service. A DSH upgrade can change the activation shape. Check the failure text; if the wrapper cannot install, set `research-modeled-teammates.enabled: false`, restart, and use the profile's delegation tool.

### The preset is not listed

Confirm the bundle is installed and enabled, restart DSH, and open a new session. Preset declarations load at startup.

### `research_project` cannot resolve the workspace

Open the working directory as a DSH project/workspace in the GUI or pass a known project; the tool does not guess.

## Known limitations

- The per-role model routing is an internal service wrapper, not an official Agent Teams extension. DSH upgrades may break it; the fallback is documented above.
- Profile-level dependencies are not installed or enabled automatically. This repository documents them but does not manage them.
- Team model profiles live in a standalone JSON file under `$DSH_HOME`; they are not part of DSH's standard config export/backup. Copy the file if you move machines.
- The model menu is a native `<select>` with provider groups, not a searchable custom picker.
- The mode does not auto-spawn eight teammates on session start. The Lead creates roles as the task requires.
- The mode never initializes a repository inside an existing repository, and it never commits the worklog or repository scaffold on its own.
- Members may use one subagent layer; deeper delegation is intentionally disabled.

## License

MIT. See [LICENSE](LICENSE).

## Acknowledgements

Built on [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) and [Cordis](https://github.com/cordiverse/cordis). The preset records its work in the project worklog; team tools come from the official Agent Teams profile bundle. Thanks to the plugin authors and everyone who tests the mode on real research projects.

Contributing and internal development notes live in [DEVELOPMENT.md](DEVELOPMENT.md).
