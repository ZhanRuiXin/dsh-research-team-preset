# Changelog

All notable changes to Research Team Mode are documented here. The project uses semantic versioning. The plugin is not publicly released yet; its version stays 0.1.0.

## 0.1.0 — 2026-10-31

Unreleased preview.

- Seven standard roles: advisor, researcher, data, builder, runner, reviewer, writer.
- `data` role for external dataset and model-weight acquisition: source availability and license/access tracking, download tooling with resume and rate-limit handling, integrity checks against publisher hashes, unpacking, the manifest contract, one small validated sample, and the disk ledger.
- Data handoff: the manifest plus a validated sample unblocks format-adaptation code, so builder work depends on the sample card rather than the full transfer, and a long download never stalls the builder.
- Git workflow: the Lead proposes `git init` and waits for confirmation; destructive or risky changes run on a card-named branch; the reviewer reads the card's diff range; a branch is merged only after acceptance; generated artifacts stay out of the repository.
- Worklog discipline: work spanning sessions keeps `worklog/PLAN.md` and `worklog/INDEX.md` maintained by the Lead, plus one bounded `worklog/<task-id>.md` per card with a current-state block at the top and short append-only entries below; resume reads PLAN and INDEX first, then only the target card's state block and tail. Compact templates for all three live in the persona so every session sees them without reading the repository.
- Task-board-first workflow with a Lead bridge, per-card ownership, execution reports, and a human-only `done` gate.
- Opt-in `spawn_teammate_with_model` submodule for per-role provider, model, and reasoning effort.
- Plugins-page settings form with one row per member, a provider-grouped model menu, and a separate reasoning-effort menu.
- Settings persisted to `$DSH_HOME/research-team-settings.json`, refreshed from disk on reads and teammate spawns.
- English system prompt and English README; full translations in 11 additional languages under `docs/`.
- Fixed a settings loader bug from earlier builds: the file stores roles under `"roles"`, and the old loader passed the whole object to the role normalizer, producing all-empty settings after a restart.
- MIT license.
