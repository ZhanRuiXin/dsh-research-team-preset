# Changelog

All notable changes to Research Team Mode are documented here. The project uses semantic versioning.

## 1.0.0 — 2026-10-31

Initial shareable release.

- Six-member research team preset: advisor, researcher, builder, runner, reviewer, writer.
- Task-board-first workflow with a Lead bridge, per-card ownership, execution reports, and a human-only `done` gate.
- Opt-in `spawn_teammate_with_model` submodule for per-role provider, model, and reasoning effort.
- Plugins-page settings form with one row per member, a provider-grouped model menu, and a separate reasoning-effort menu.
- Settings persisted to `$DSH_HOME/research-team-settings.json`, refreshed from disk on reads and teammate spawns.
- English system prompt and English README; full translations in 11 additional languages under `docs/`.
- Translation brief under `docs/`.
- One centered, label-free language line at the top; linked repository/plugin references.
- Fixed a settings loader bug: the file stores roles under `"roles"`, but the old loader passed the whole object to the role normalizer and produced all-empty settings after a restart.
- MIT license, changelog, and repository metadata for sharing.
