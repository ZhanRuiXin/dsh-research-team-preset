# Changelog

All notable changes to Research Team Mode are documented here. The project uses semantic versioning. The plugin is not publicly released yet; its version stays 0.1.0.

## 0.1.0 — 2026-10-31

Unreleased preview.

- Seven standard roles: advisor, researcher, data, builder, runner, reviewer, writer.
- `data` role for external dataset and model-weight acquisition: source availability and license/access tracking, download tooling with resume and rate-limit handling, integrity checks against publisher hashes, unpacking, the manifest contract, one small validated sample, and the disk ledger.
- Data handoff: the manifest plus a validated sample unblocks format-adaptation code, so builder work depends on the sample card rather than the full transfer, and a long download never stalls the builder.
- Git workflow: when the request is substantive work rather than a simple question, the agent initializes durable tracking itself with `research_workspace_init`; the tool creates the worklog scaffold and initializes a repository only when the workspace is not already inside one, never nested and never committing. Destructive or risky changes run on a card-named branch; the reviewer reads the card's diff range; a branch is merged only after acceptance; generated artifacts stay out of the repository.
- Worklog discipline: `research_workspace_init` seeds `worklog/PLAN.md` and `worklog/INDEX.md`; work spanning sessions keeps them Lead-maintained plus one bounded `worklog/<task-id>.md` per card, with a current-state block at the top and short append-only entries. Resume reads PLAN and INDEX first, then only the target card's state block and tail. Compact templates for all three live in the persona so every session sees them without reading the repository.
- Task-board-first workflow with a Lead bridge, per-card ownership, execution reports, and a human-only `done` gate.
- Opt-in `spawn_teammate_with_model` submodule for per-role provider, model, and reasoning effort.
- Multiple named team model profiles: create, rename, switch, and delete profiles from the Plugins page, with seven role rows each, a provider-grouped model menu, and a separate reasoning-effort menu. The selected profile supplies the next teammate's route.
- Profile settings persisted to `$DSH_HOME/research-team-settings.json` as `{ version: 2, activeProfileId, profiles }`, refreshed from disk on reads and teammate spawns. Legacy `{ roles: ... }` files migrate to a single `默认配置` profile.
- Settings API: `GET/POST /api/dsh-research-team-settings` reads and writes the whole profile list; a legacy `{ roles: ... }` POST updates only the active profile.
- Fixed `spawn_teammate_with_model` on current builds: Cordis wraps every Service instance in a traceable proxy whose method reads are re-wrapped on each access, so the old identity check reported "patch did not take effect" even after the wrapper was installed, and the tool stayed permanently unavailable. The patch now verifies the own property descriptor instead. The harness covers configured-role injection, explicit overrides, plain inheritance, and restore on dispose.
- English system prompt and English README; full translations in 11 additional languages under `docs/`.
- Fixed a settings loader bug from earlier builds: the file stores roles under `"roles"`, and the old loader passed the whole object to the role normalizer, producing all-empty settings after a restart.
- MIT license.
