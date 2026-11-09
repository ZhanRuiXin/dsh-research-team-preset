# Research Team Mode

**A DSH agent preset that turns one session into a small, coordinated research team.**

**Version 0.1.0** · **Updated 2026-10-31**

<p align="center"><strong>English</strong> · <a href="docs/README.zh-CN.md">简体中文</a> · <a href="docs/README.zh-TW.md">繁體中文</a> · <a href="docs/README.ja.md">日本語</a> · <a href="docs/README.ko.md">한국어</a> · <a href="docs/README.de.md">Deutsch</a> · <a href="docs/README.fr.md">Français</a> · <a href="docs/README.es.md">Español</a> · <a href="docs/README.pt-BR.md">Português (Brasil)</a> · <a href="docs/README.ru.md">Русский</a> · <a href="docs/README.ar.md">العربية</a> · <a href="docs/README.hi.md">हिन्दी</a></p>

---

## Overview

Research Team Mode is a DSH agent preset for running end-to-end research as a team instead of a single chat. The Lead plans the work, keeps both ledgers (board cards for user gates, team tasks for internal steps), dispatches work, integrates results, and talks to the user. Eight default specialists cover advisory review, literature and evidence, data acquisition, experiment design, code, runs, independent review, and paper writing.

The mode is built for research that spans days or weeks, needs traceable evidence, and benefits from clear role boundaries. It is not a one-shot Q&A mode: the Lead creates only the roles a task actually needs.

## At a glance

| | |
| --- | --- |
| **Default roles** | 8: advisor, designer, researcher, data, builder, runner, reviewer, writer |
| **Workflow** | Gate-based: internal steps in `team_task_*`, user gates on the board; create, claim, execute, report, review, user acceptance |
| **Completion** | `in_review` is the agent's last stop; only the user can move a card to `done` |
| **Model routing** | Per-role provider, model, and reasoning effort from a Plugins-page settings form |
| **Git** | Initialized by the agent when substantive work starts; branches for destructive changes; merged only after acceptance |
| **Worklog** | `worklog/PLAN.md` + `INDEX.md` + one bounded file per gated card; resume reads PLAN and INDEX first |
| **Runtime** | PTC (`run_code` + generated SDK), one subagent layer per member |

## Who it is for

- Research projects that combine literature review, implementation, experiments, and paper output.
- Teams that need an evidence trail from claim to source, run record, or log.
- Users who want an advisor and an independent reviewer rather than one general-purpose agent.
- Work where the user should make the final acceptance decision, not the agent.

**Not for:** quick factual questions, single-file edits, or tasks where a one-shot answer is enough. The mode tells the Lead to answer simple questions directly and mobilize the team only for substantive research.

## How the Lead talks to you

The Lead's replies are scientific communication, not a status feed: the claim or result first, with the evidence behind it (run id, dataset, metric with uncertainty and sample size, source), then what is uncertain, then what the user has to decide. Each statement is labelled observed fact, inference, hypothesis, or open question, and the method is explained far enough that the user can follow and keep learning.

Internal mechanics stay internal. Agent handoffs, retries, tool errors, board bookkeeping, and what the team learned while working are not forwarded unless they change how a result should be read or block a decision. Member reports are translated into a claim, its evidence, and its limits rather than pasted.

The division of labor is explicit: the user sets the scientific direction and judges the evidence, and the team carries the search, implementation, experiment, and verification load.

## Requirements

Research Team Mode is a **profile-level DSH bundle**. The bundle does not install or enable the profile bundles it uses; DSH's package installer handles npm dependencies, not feature bundles. Enable the dependencies in the same profile first.

| Capability | Provider | Notes |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | Developed against `0.2.1-rc.5`; other releases may work but are not guaranteed |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | Provides `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent`, `team_task_*`, and the Team services |
| Task board | [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) | Provides `taskboard_*` and the Web GUI board |
| PTC runtime | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) and [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | Part of the DSH base; enables `run_code` |
| Git Bash (optional, Windows) | [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) | Adds a `bash` tool for agents that need it |
| Web GUI | DSH Web/Desktop | Required for the settings form and the task board |

If a dependency is missing, the mode can still load partially, but the team tools, the board, or the settings page will be unavailable. The plugin manager does not prompt for these bundles and does not link them automatically.

## Install

This repository is a local DSH bundle. From a checkout:

1. **Enable the prerequisites** in the target profile:
   - Agent Teams: [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness)
   - Task board: [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard)
   - Optionally [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) on Windows.
2. **Install this bundle** with the Plugins page/plugin manager's install action, using a local link:

   ```text
   link:/absolute/path/to/research-team-preset
   ```

   A local folder path also works. Keep the link if you plan to update from this checkout; reinstall after replacing the folder.
3. **Restart DSH.** Preset rows and the client half of the bundle load at startup.
4. **Check the bundle is enabled** in the same profile.
5. **Open a new session** and select **Research Team Mode** in the mode selector.
6. For task-board execution sessions, create cards with `presetId=research-team` so the execution uses the same persona and tools.

> The mode is a profile-level bundle: installing it in one profile does not enable it in another. Repeat the install and prerequisite steps per profile.

## First run

Ask the Lead to check the environment and the board before starting real work:

```text
list_agents        # create only the roles the task needs
research_project   # resolve the current project/workspaceId
taskboard_list     # check existing cards in this project
```

A typical first task:

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> taskboard_create only at user gates -> team_task_create -> send_message
Members: team_task_update (claim) -> work -> complete + send_message; gated steps also claim the card
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
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

The Lead owns goal clarification, decomposition, board management, dispatch, integration, summaries, final asset assembly, and delivery. Members may use one subagent layer for a scoped subtask; they cannot create teammates. The Lead keeps its own tool use light, favors a short user-facing update over another routine call, and leaves deep work to the owning member.

### Shared Zotero library

The researcher treats the user's Zotero library as the team's shared literature source. It searches existing collections and items before the open web, reuses the attached PDFs and annotation passages, and imports a missing paper only in its formal version of record, with the PDF attached and filed in a project collection. Imports dedupe by DOI and title, leave the user's tags and collections alone, and record the `zotero://` item ref in the evidence table and on the board card, so every teammate reads the same paper and the reviewer can spot-check the same pages. When the full text is paywalled or only metadata exists, the researcher records the link and marks the evidence as metadata-only instead of importing a substitute.

### Advisory review

The advisor is a scientific co-thinker, not a gatekeeper. It first names what holds in the plan and why, then at most three issues ordered by how much they threaten the result, each tied to a specific step, claim, or number. Every issue ships with the smallest repair that would make the plan acceptable, or one concrete alternative with its trade-off; a bare rejection is not a review. It separates "this cannot answer the question" from "this works but is weaker or costlier", states the condition under which the plan becomes acceptable, and ends with proceed, revise with the required changes, or stop with the direction to take instead. It judges against the standard the project has actually committed to and names it, instead of assuming the most demanding one: a plan that is sound for its stated goal is not a failure because a stronger claim would need more evidence, and a wrong target is raised separately as a scope decision for the user. When the evidence needed to judge is missing it names the cheapest test or source that would settle it. A sound plan gets a plain endorsement rather than manufactured objections, and a stop always carries a replacement direction. It remains advice: the Lead decides and the reviewer stays the independent PASS/FAIL gate.

## Design ownership

The Lead does not author the experiment design. For design-heavy work the designer owns a design document in the project workspace (`docs/design/<name>.md` or the project's existing design location): the question and hypotheses, protocol and controls, baselines, ablations, metrics and statistical plan, compute budget, and a change log for design changes made while runs are in flight.

The builder implements the design, the runner executes it, and the reviewer checks at the proposal gate that the design can answer the question and at the results gate that execution matched it. The advisor gives an independent scientific read at the proposal gate. The Lead confirms that the design document exists and that the researcher and data inputs are in place, then admits or returns the step. For implementation-led work the builder drafts the design and the advisor reviews it once.

## Experiment admission

Compute is spent on a decision, not on activity. Before a run beyond a trivial smoke test, the design document or worklog records the question the run settles, the hypothesis, the expected outcome and the effect size that would count as support, the result that would refute it, the kill criterion, the baseline it must beat, the cheapest pilot, and the budget. A run without that record is not admitted, and the rule must be able to come back "stop".

The team pilots first: the smallest configuration that can still fail the hypothesis, judged against the pre-registered threshold, and only then an explicit decision to scale. If the pilot misses the threshold, the line stops, the negative result is recorded and reported, and no extra seeds or variants are added to average away the miss. One variable changes at a time, a mid-run protocol change is logged with its reason, and a run is also bounded by budget, by the same failure repeating twice, and by a metric that has stopped moving.

The Lead admits the run, the runner refuses to launch without the pre-flight record, and the reviewer checks at the results gate that execution matched the pre-registered rule and that a stop decision was honored rather than overridden.

## Task board workflow

```text
User goal
Lead:  research_project -> taskboard_create only at user gates (checklist, presetId=research-team)
       -> team_task_create (owner, blocked_by, write scopes) -> send_message
Member: team_task_update (claim) -> work -> team_task_update (complete) + send_message
Internal steps and member handoffs stay off the board; only user gates get cards
At a user gate: taskboard_get -> taskboard_move in_progress -> checklist/report -> in_review
Reviewer: independent PASS/FAIL with evidence on gated cards
Advisor: optional independent recommendation at key decisions or final review
Lead:  scientific summary (claim, evidence, uncertainty) -> card ids/status only when a gate needs the user
User:  accept in the GUI -> done (agents can never move a card to done)
```

Only steps waiting for the user's review or acceptance get a board card: deliverable checkpoints, scope decisions the user must confirm, risky changes, and the final handoff. Internal steps, self-approved subtasks, and member-to-member handoffs are tracked in `team_task_*` and stay off the board; when a gate is reached, the card keeps the deliverable, its evidence, and the review verdict. Team members coordinate internally in English; user-facing replies, cards, and deliverables follow the user's language. When a decision or missing information belongs to the user, the Lead asks with `ask_user_question` instead of leaving a waiting state on the card; if the question times out, the Lead asks the advisor for an independent recommendation, records it, and keeps the work moving.

## Git workflow

The mode initializes durable tracking when substantive work starts, and the agent judges whether a request is real work or a simple question. In a workspace that is not already inside a repository, the agent calls `research_workspace_init`, which creates `worklog/PLAN.md` and `worklog/INDEX.md` and runs `git init`. It never creates a nested repository and never commits the scaffold.

Destructive or risky changes run on a branch named after the step, for example `task/<title>+<id>` (the card for gated work, the team task for internal work), instead of editing the default branch in place. The card or team task records the base and head commits, and the reviewer reads `git diff <base>..<head>` as the code-review basis and still re-runs the acceptance checks.

A branch is merged only after the card is accepted, then deleted. Generated artifacts such as datasets, checkpoints, logs, and caches stay out of the repository. When the project is not a git repository, review falls back to a file-hash snapshot plus the evidence recorded on the card.

## Worklog

Work that may span sessions keeps a small, bounded record next to the code. `worklog/PLAN.md` holds the objective, current milestone, active cards, blockers, and dated decisions; `worklog/INDEX.md` holds one line per active card. Each card gets `worklog/<task-id>.md` with a current-state block at the top and short append-only entries below.

On resume the agent reads PLAN and INDEX first, then only the target card's state block and tail, never the whole file or the whole directory. PLAN stays under about 100 lines and card files under about 200, with finished cards trimmed from the index. Compact templates for all three files live in the preset persona, so every session can create or update them without reading this repository.

## Team model profiles

The settings page keeps several named model profiles for the default team members and uses the selected one for the next spawn.

Open:

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

The profile bar at the top of the page:

- **Switch** the profile (`团队配置` dropdown) that the next default teammate uses.
- **新建配置** appends a profile with eight empty role rows.
- **配置名称** renames the selected profile. Names are required, unique, and at most 60 characters.
- **删除配置** deletes the selected profile after a second confirming click. The last remaining profile cannot be deleted.

Each profile has one row per default member:

- **Model**: one dropdown containing every provider's models, with non-clickable provider group headers. Selecting a model sets both provider and model.
- **Reasoning effort**: a second dropdown with the selected model's advertised efforts, plus a model-default option.

An empty model means "inherit the Lead's route"; an empty effort means "use the model default". `spawn_teammate_with_model` reads the selected profile's per-role default when `model` is omitted; an explicit `model` overrides it. Plain `spawn_teammate` always inherits the Lead.

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

The row name matters: `research-team-settings` must stay at the **package root** `@local/dsh-research-team-preset`. DSH's client-module scanner only discovers `dsh.client` for exact package-root rows; a subpath name starts the host plugin but never loads the page.

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
| Preset id | `cordis.patch.yml` | `research-team`; task cards should use `presetId=research-team` |
| Persona | `cordis.patch.yml` | English system prompt; mode-wide rules |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | Set `false` to remove `spawn_teammate_with_model` and its service wrapper |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | Subagent providers used by the modeled spawn tool; defaults `spawn` / `fork` |
| `research-team-settings` row | `cordis.patch.yml` | Top-level host row; keep the package-root name |
| Team model profiles | `$DSH_HOME/research-team-settings.json` | Named profiles; the active profile supplies provider/model/reasoningEffort for the eight default roles |

## Repository layout

```text
research-team-preset/
├── README.md                     # This file (canonical, English)
├── CHANGELOG.md
├── LICENSE
├── .gitignore
├── package.json                  # DSH bundle manifest and exports
├── cordis.patch.yml              # Preset + top-level settings row
├── plugin/
│   ├── index.js                  # research_project + English task-board prompt section
│   ├── modeled-teammates.js      # spawn_teammate_with_model, research_team_routes + activation wrapper
│   ├── settings-file.js          # Direct settings-file route reader (no host-store dependency)
│   └── settings-store.js         # Shared profile snapshot + disk refresh
├── settings/
│   └── index.js                  # Profile file + /api/dsh-research-team-settings
├── client/
│   └── index.js                  # plugins.row.config profile editor (model/effort dropdowns)
├── test/
│   └── modeled-teammates.test.js # Route resolution, inheritance diagnostics, tool wiring
└── docs/
    ├── README.zh-CN.md
    ├── README.zh-TW.md
    ├── README.ja.md
    ├── README.ko.md
    ├── README.de.md
    ├── README.fr.md
    ├── README.es.md
    ├── README.pt-BR.md
    ├── README.ru.md
    ├── README.ar.md
    └── README.hi.md
```

## How it works

- **Preset**: `cordis.patch.yml` declares the persona, tool rows, the modeled-teammates submodule, and the top-level settings row.
- **Task-board prompt**: `plugin/index.js` registers an English protocol section (`plugin:dsh-taskboard`) at the preset scope and provides `research_project` to resolve the current workspace.
- **Per-role routing**: `plugin/modeled-teammates.js` wraps `subagents.startActivation` with `AsyncLocalStorage` and injects `agentOptions` only for a `spawn_teammate_with_model` call. It resolves the route from `plugin/settings-file.js` (the settings JSON, read at spawn time) and falls back to the in-process store, so a preset submodule never depends on the top-level settings row having filled that store first. The official Agent Teams package is untouched. Cordis returns a traceable proxy for services, so the wrapper verifies its own property descriptor instead of method identity.
- **Settings**: `settings/index.js` loads/saves the profile JSON file and serves `GET/POST /api/dsh-research-team-settings`; `client/index.js` registers the Plugins-page profile editor through `plugins.row.config`.
- **Refresh**: `plugin/settings-store.js` holds the in-memory snapshot, resolves the active profile on every read and spawn, and keeps the last good snapshot if a read fails.

## Verification checklist

```text
plugin_manager list_plugins              # bundle active
Config.listConfigs name=@deepseek-ai/dsh-agent-preset   # include:preset-research-team
new session -> Research Team Mode
list_agents                              # roles can be created
research_project                         # returns the current workspaceId
taskboard_list                           # matches the GUI board
Plugins -> bundle -> research-team-settings -> Configure   # page visible
新建配置 -> name it -> save -> reopen the page -> both profiles listed
select another profile -> save -> spawn_teammate_with_model uses it
delete one profile -> save -> only the remaining profile exists
legacy {roles} file -> restart -> shown as 默认配置
save a role model -> restart -> page still shows it
node --test test/modeled-teammates.test.js   # route resolution and inheritance diagnostics
```

The settings persistence path can be checked without the UI:

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## Troubleshooting

### Settings appear to reset after restart

Version 0.1.0 fixes the known cause: the old loader passed the whole `{ roles: ... }` object to the role normalizer and produced all-empty settings. Update to 0.1.0 or later, restart DSH, and check that:

- `$DSH_HOME/research-team-settings.json` exists and contains the saved profiles;
- old `{ "roles": ... }` files are shown as a single `默认配置` profile and are rewritten in the profile shape on the next save;
- the `research-team-settings` row is named exactly `@local/dsh-research-team-preset`;
- the current host is running this checkout, not a stale installed copy.

### Every teammate runs on the Lead's model

Check the spawn result printed above the member's first message. It reads `requested=<provider>/<model> effort=<effort>` when a configured or explicit route was applied, and `requested=inherit (Lead route)` with a `note:` line when no route matched. A `note:` naming the role means that role has no provider/model in the active profile; a note saying the name is not a standard role means the teammate name did not contain a role word.

Two other causes are not about the settings file:

- the Lead called plain `spawn_teammate` instead of `spawn_teammate_with_model`, which always inherits the Lead. The persona tells the Lead to pass no `model` to the modeled tool and never to fall back because it is unsure about names;
- the settings row was saved under a different `DSH_HOME` than the running host reads. Compare the `settings file:` line printed by `research_team_routes` with `echo $DSH_HOME`.

### The settings page does not appear in Plugins

- The row must be the package root, not `@local/dsh-research-team-preset/settings`.
- The client half needs a DSH restart and a browser refresh after installation.
- Check that the bundle is enabled in the profile.

### Team tools are missing

Enable [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) in the same profile and restart. The installer does not prompt for it.

### Task-board tools are missing

Enable [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) in the same profile and restart.

### `spawn_teammate_with_model` is unavailable

The submodule wraps an internal subagent service. A DSH upgrade can change the activation shape. Check the failure text; if the wrapper cannot install, set `research-modeled-teammates.enabled: false`, restart, and use plain `spawn_teammate`.

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

## Development

This repository is a local DSH bundle with no build step for the host code. The client page is a prebuilt `window.__ModuleLoader__.load` module in `client/index.js`.

Typical loop:

1. Install the checkout as a `link:` dependency in a DSH profile.
2. Edit the host/client files.
3. Restart DSH (preset and client modules load at startup; HMR may handle some host changes).
4. Inspect the settings route and the Plugins page.

Useful checks:

```bash
node --check settings/index.js
node --check plugin/index.js
node --check plugin/modeled-teammates.js
node --check client/index.js
```

There is no automated test suite yet. The settings route, model catalog, task-board flow, and restart persistence are the highest-value manual checks.

## Versioning

Semantic versioning. The current release is **0.1.0**; see [CHANGELOG.md](CHANGELOG.md). The docs under `docs/` carry the same version.

## License

MIT. See [LICENSE](LICENSE).

## Acknowledgements

Built on [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) and [Cordis](https://github.com/cordiverse/cordis). The task-board integration uses the [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) plugin; team tools come from the official Agent Teams profile bundle. Thanks to the plugin authors and everyone who tests the mode on real research projects.
