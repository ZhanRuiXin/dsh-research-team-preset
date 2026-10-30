# Research Team Mode

**A DSH agent preset that turns one session into a small, coordinated research team.**

**Version 1.0.0** · **Updated 2026-10-31**

**Languages:** English · [简体中文](docs/README.zh-CN.md) · [繁體中文](docs/README.zh-TW.md) · [日本語](docs/README.ja.md) · [한국어](docs/README.ko.md) · [Deutsch](docs/README.de.md) · [Français](docs/README.fr.md) · [Español](docs/README.es.md) · [Português (Brasil)](docs/README.pt-BR.md) · [Русский](docs/README.ru.md) · [العربية](docs/README.ar.md) · [हिन्दी](docs/README.hi.md) · [Language guide](docs/LANGUAGES.md)

---

## Overview

Research Team Mode is a DSH agent preset for running end-to-end research as a team instead of a single chat. The Lead plans the work, keeps the task board, dispatches cards, integrates results, and talks to the user. Six default specialists cover advisory review, literature and evidence, code, runs, independent review, and paper writing.

The mode is built for research that spans days or weeks, needs traceable evidence, and benefits from clear role boundaries. It is not a one-shot Q&A mode: the Lead creates only the roles a task actually needs.

## At a glance

| | |
| --- | --- |
| **Default roles** | 6: advisor, researcher, builder, runner, reviewer, writer |
| **Workflow** | Task-board-first: create, claim, execute, report, review, user acceptance |
| **Completion** | `in_review` is the agent's last stop; only the user can move a card to `done` |
| **Model routing** | Per-role provider, model, and reasoning effort from a Plugins-page settings form |
| **Runtime** | PTC (`run_code` + generated SDK), one subagent layer per member |
| **Language** | English system prompt; English README plus short introductions in 11 languages |

## Who it is for

- Research projects that combine literature review, implementation, experiments, and paper output.
- Teams that need an evidence trail from claim to source, run record, or log.
- Users who want an advisor and an independent reviewer rather than one general-purpose agent.
- Work where the user should make the final acceptance decision, not the agent.

**Not for:** quick factual questions, single-file edits, or tasks where a one-shot answer is enough. The mode tells the Lead to answer simple questions directly and mobilize the team only for substantive research.

## Requirements

Research Team Mode is a **profile-level DSH bundle**. The bundle does not install or enable the profile bundles it uses; DSH's package installer handles npm dependencies, not feature bundles. Enable the dependencies in the same profile first.

| Capability | Provider | Notes |
| --- | --- | --- |
| DSH | DeepSeek Harness `0.2.x` | Developed against `0.2.1-rc.5`; other releases may work but are not guaranteed |
| Agent Teams | `@deepseek-ai/dsh-experimental-agent-team-profile` | Provides `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent`, and the Team services |
| Task board | `dsh-taskboard` | Provides `taskboard_*` and the Web GUI board |
| PTC runtime | `@deepseek-ai/dsh-agent-tool-presentation` and `@deepseek-ai/dsh-ptc-runtime-node` | Part of the DSH base; enables `run_code` |
| Git Bash (optional, Windows) | `dsh-gitbash-shell` | Adds a `bash` tool for agents that need it |
| Web GUI | DSH Web/Desktop | Required for the settings form and the task board |

If a dependency is missing, the mode can still load partially, but the team tools, the board, or the settings page will be unavailable. The plugin manager does not prompt for these bundles and does not link them automatically.

## Install

This repository is a local DSH bundle. From a checkout:

1. **Enable the prerequisites** in the target profile:
   - Agent Teams: `@deepseek-ai/dsh-experimental-agent-team-profile`
   - Task board: `dsh-taskboard`
   - Optionally `dsh-gitbash-shell` on Windows.
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
Lead: research_project -> taskboard_create(presetId=research-team) -> dispatch
Members: claim cards -> execute -> checklist + execution report -> in_review
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## Default team

| Role | Responsibility |
| --- | --- |
| `advisor` | Independent assessment of direction, framing, central claims, evidence sufficiency, and paper strategy; recommends proceed / revise / stop. Advisory only, not a gate |
| `researcher` | Literature search, acquisition, close reading, evidence extraction, and a claim → source → location evidence table |
| `builder` | Code, configuration, data pipelines, tests, and reproducible entry points; no long training runs |
| `runner` | Start and monitor training/evaluation; record run ids, configs, seeds, metrics, logs, checkpoints, and artifact paths |
| `reviewer` | Independent verification of literature notes, code, results, and paper claims/citations; PASS/FAIL with blocking evidence |
| `writer` | LaTeX paper draft: prose, sections, tables, captions, citations, and figure code; does not run experiments or change code/models |

The Lead owns goal clarification, decomposition, board management, dispatch, integration, summaries, final asset assembly, and delivery. Members may use one subagent layer for a scoped subtask; they cannot create teammates.

## Task board workflow

```text
User goal
Lead:  research_project -> taskboard_create (checklist, presetId=research-team)
       -> comment the owner -> send_message
Member: taskboard_get (read comments) -> taskboard_move todo -> in_progress
       -> work -> taskboard_checklist (with evidence) -> taskboard_execution_report
       -> taskboard_comment_add -> taskboard_move -> in_review
Reviewer: independent PASS/FAIL with evidence
Advisor: optional independent recommendation at key decisions or before submission
Lead:  summarize -> report card ids/status/evidence/risks to the user
User:  accept in the GUI -> done (agents can never move a card to done)
```

The board is the single task ledger. Do not keep deliverable tracking only in chat. `team_task_*` is for transient coordination, not deliverables.

## Per-role model settings

Open:

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

Each default member occupies one row:

- **Model**: one dropdown containing every provider's models, with non-clickable provider group headers. Selecting a model sets both provider and model.
- **Reasoning effort**: a second dropdown with the selected model's advertised efforts, plus a model-default option.

An empty model means "inherit the Lead's route"; an empty effort means "use the model default". `spawn_teammate_with_model` reads the per-role default when `model` is omitted; an explicit `model` overrides it. Plain `spawn_teammate` always inherits the Lead.

The row name matters: `research-team-settings` must stay at the **package root** `@local/dsh-research-team-preset`. DSH's client-module scanner only discovers `dsh.client` for exact package-root rows; a subpath name starts the host plugin but never loads the page.

### Where settings are stored

```text
$DSH_HOME/research-team-settings.json
```

```json
{
  "roles": {
    "advisor": { "provider": "example-provider", "model": "example-model", "reasoningEffort": "high" },
    "researcher": { "provider": "", "model": "", "reasoningEffort": "" }
  }
}
```

- The JSON file is the source of truth. The host plugin loads it at startup; `getSettings()` and `modelForRole()` refresh from it, so the page and the next teammate see the latest values.
- A missing or temporarily unreadable file keeps the last good in-memory snapshot instead of clearing it.
- The settings file is **not** in this repository. Back it up separately. It is per `DSH_HOME`, not per profile.
- No credentials are stored; only provider/model/effort strings.
- Settings saves apply without a DSH restart. Restart is required for the first install of the settings row/client page and for preset/plugin changes.
- Version 1.0.0 fixes a loader bug in earlier builds: the file wraps roles under `"roles"`, and the old loader passed the whole object to the role normalizer, producing all-empty settings after restart. The current loader unwraps `"roles"` and supports a bare role map for compatibility.

## Configuration reference

| Setting | Location | Notes |
| --- | --- | --- |
| Preset id | `cordis.patch.yml` | `research-team`; task cards should use `presetId=research-team` |
| Persona | `cordis.patch.yml` | English system prompt; mode-wide rules |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | Set `false` to remove `spawn_teammate_with_model` and its service wrapper |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | Subagent providers used by the modeled spawn tool; defaults `spawn` / `fork` |
| `research-team-settings` row | `cordis.patch.yml` | Top-level host row; keep the package-root name |
| Per-role routes | `$DSH_HOME/research-team-settings.json` | Provider/model/reasoningEffort for the six default roles |

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
│   ├── modeled-teammates.js      # spawn_teammate_with_model + activation wrapper
│   └── settings-store.js         # Shared settings snapshot + disk refresh
├── settings/
│   └── index.js                  # Settings file + /api/dsh-research-team-settings
├── client/
│   └── index.js                  # plugins.row.config form (model/effort dropdowns)
└── docs/
    ├── LANGUAGES.md              # Language guide and documentation layers
    ├── README.en.md
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
- **Per-role routing**: `plugin/modeled-teammates.js` wraps `subagents.startActivation` with `AsyncLocalStorage` and injects `agentOptions` only for a `spawn_teammate_with_model` call. The official Agent Teams package is untouched.
- **Settings**: `settings/index.js` loads/saves the JSON file and serves `GET/POST /api/dsh-research-team-settings`; `client/index.js` registers the Plugins-page row form through `plugins.row.config`.
- **Refresh**: `plugin/settings-store.js` holds the in-memory snapshot, refreshes from disk on reads and spawns, and keeps the last good snapshot if a read fails.

## Verification checklist

```text
plugin_manager list_plugins              # bundle active
Config.listConfigs name=@deepseek-ai/dsh-agent-preset   # include:preset-research-team
new session -> Research Team Mode
list_agents                              # roles can be created
research_project                         # returns the current workspaceId
taskboard_list                           # matches the GUI board
Plugins -> bundle -> research-team-settings -> Configure   # page visible
save a role model -> restart -> page still shows it
```

The settings persistence path can be checked without the UI:

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## Troubleshooting

### Settings appear to reset after restart

Version 1.0.0 fixes the known cause: the old loader passed the whole `{ roles: ... }` object to the role normalizer and produced all-empty settings. Update to 1.0.0 or later, restart DSH, and check that:

- `$DSH_HOME/research-team-settings.json` exists and contains the saved roles;
- the `research-team-settings` row is named exactly `@local/dsh-research-team-preset`;
- the current host is running this checkout, not a stale installed copy.

### The settings page does not appear in Plugins

- The row must be the package root, not `@local/dsh-research-team-preset/settings`.
- The client half needs a DSH restart and a browser refresh after installation.
- Check that the bundle is enabled in the profile.

### Team tools are missing

Enable `@deepseek-ai/dsh-experimental-agent-team-profile` in the same profile and restart. The installer does not prompt for it.

### Task-board tools are missing

Enable `dsh-taskboard` in the same profile and restart.

### `spawn_teammate_with_model` is unavailable

The submodule wraps an internal subagent service. A DSH upgrade can change the activation shape. Check the failure text; if the wrapper cannot install, set `research-modeled-teammates.enabled: false`, restart, and use plain `spawn_teammate`.

### The preset is not listed

Confirm the bundle is installed and enabled, restart DSH, and open a new session. Preset declarations load at startup.

### `research_project` cannot resolve the workspace

Open the working directory as a DSH project/workspace in the GUI or pass a known project; the tool does not guess.

## Known limitations

- The per-role model routing is an internal service wrapper, not an official Agent Teams extension. DSH upgrades may break it; the fallback is documented above.
- Profile-level dependencies are not installed or enabled automatically. This repository documents them but does not manage them.
- Role settings live in a standalone JSON file under `$DSH_HOME`; they are not part of DSH's standard config export/backup. Copy the file if you move machines.
- The model menu is a native `<select>` with provider groups, not a searchable custom picker.
- The mode does not auto-spawn six teammates on session start. The Lead creates roles as the task requires.
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

## Translations

English is the canonical, complete README. The pages under `docs/` are **short introductions, not word-for-word translations**, and they share one structure and version. See the [Language guide](docs/LANGUAGES.md) for the layered documentation map.

An English short introduction is available at [docs/README.en.md](docs/README.en.md); the full source of truth remains this README.

| Language | Introduction |
| --- | --- |
| English (full) | This README |
| English (short) | [docs/README.en.md](docs/README.en.md) |
| 简体中文 | [docs/README.zh-CN.md](docs/README.zh-CN.md) |
| 繁體中文 | [docs/README.zh-TW.md](docs/README.zh-TW.md) |
| 日本語 | [docs/README.ja.md](docs/README.ja.md) |
| 한국어 | [docs/README.ko.md](docs/README.ko.md) |
| Deutsch | [docs/README.de.md](docs/README.de.md) |
| Français | [docs/README.fr.md](docs/README.fr.md) |
| Español | [docs/README.es.md](docs/README.es.md) |
| Português (Brasil) | [docs/README.pt-BR.md](docs/README.pt-BR.md) |
| Русский | [docs/README.ru.md](docs/README.ru.md) |
| العربية | [docs/README.ar.md](docs/README.ar.md) |
| हिन्दी | [docs/README.hi.md](docs/README.hi.md) |

## Versioning

Semantic versioning. The current release is **1.0.0**; see [CHANGELOG.md](CHANGELOG.md). The docs under `docs/` carry the same version.

## License

MIT. See [LICENSE](LICENSE).

## Acknowledgements

Built on DeepSeek Harness and Cordis. The task-board integration uses the `dsh-taskboard` plugin; team tools come from the official Agent Teams profile bundle. Thanks to the plugin authors and everyone who tests the mode on real research projects.

**Languages:** [简体中文](docs/README.zh-CN.md) · [繁體中文](docs/README.zh-TW.md) · [日本語](docs/README.ja.md) · [한국어](docs/README.ko.md) · [Deutsch](docs/README.de.md) · [Français](docs/README.fr.md) · [Español](docs/README.es.md) · [Português (Brasil)](docs/README.pt-BR.md) · [Русский](docs/README.ru.md) · [العربية](docs/README.ar.md) · [हिन्दी](docs/README.hi.md)
