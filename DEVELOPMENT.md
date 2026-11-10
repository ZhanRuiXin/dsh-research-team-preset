# Development

Internal notes for working on this preset. The public overview is in [README.md](README.md); the branch rules are in [AGENTS.md](AGENTS.md).

## Repository layout

```text
dsh-research-team-preset/
├── README.md                 # Public overview (canonical, English)
├── DEVELOPMENT.md            # This file
├── AGENTS.md                 # Branch and merge rules for coding agents
├── CHANGELOG.md
├── LICENSE
├── cordis.patch.yml          # Preset declaration: persona, tool rows, settings row
├── package.json
├── plugin/
│   ├── index.js              # research_project, research_workspace_init, research_scope_check, board protocol
│   ├── modeled-teammates.js  # spawn_teammate_with_model, research_team_routes, permission handling
│   ├── settings-file.js
│   └── settings-store.js
├── settings/index.js         # Settings API (GET/POST /api/dsh-research-team-settings)
├── client/index.js           # Plugins-page profile editor (prebuilt module)
├── docs/                     # Translated READMEs and translation notes
└── test/
    ├── modeled-teammates.test.js
    ├── scope-check.test.js
    └── workspace-init.test.js
```

## Development loop

This repository is a local DSH bundle with no build step for the host code. The client page is a prebuilt `window.__ModuleLoader__.load` module in `client/index.js`.

1. Install the checkout as a `link:` dependency in a DSH profile.
2. Edit the host/client files.
3. Restart DSH (preset and client modules load at startup; HMR may handle some host changes).
4. Inspect the settings route and the Plugins page.

## Checks

```bash
node --check settings/index.js
node --check plugin/index.js
node --check plugin/modeled-teammates.js
node --check client/index.js
npm test
```

`npm test` runs the four test files: spawn routing and permission inheritance, write-envelope scope checks, worklog scaffolding, and settings-route mounting.

Parse `cordis.patch.yml` with the `yaml` package after stripping `!!js` tags, and confirm the persona prefix contains every required section. Keep the 12 READMEs structurally in sync (same `## ` and `### ` headings in each).

## Verification checklist

Manual end-to-end checks against a real profile:

```text
plugin_manager list_plugins              # bundle active
Config.listConfigs name=@deepseek-ai/dsh-agent-preset   # include:preset-research-team
new session -> Research Team Mode
list_agents                              # roles can be created
research_project                         # returns the current workspaceId
taskboard_list                           # matches the GUI board
research_scope_check                     # envelope check on a card handoff
```

## Versioning

Semantic versioning. The current release is **0.1.1**; see [CHANGELOG.md](CHANGELOG.md). Releases are tagged from `main` as `vX.Y.Z` and published to npm as `dsh-research-team-preset`.
