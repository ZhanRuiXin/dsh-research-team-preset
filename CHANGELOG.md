# Changelog

All notable changes to Research Team Mode are documented here. The project uses semantic versioning.

## 1.1.0 — 2026-10-31

- Adds `data` as a seventh standard role for external dataset and model-weight acquisition: source availability and license/access tracking, download tooling with resume and rate-limit handling, integrity checks against publisher hashes, unpacking, the manifest contract, one small validated sample, and the disk ledger.
- Establishes the data handoff: the manifest plus a validated sample unblocks format-adaptation code, so builder work depends on the sample card rather than the full transfer, and a multi-hour download never stalls the builder.
- Updates the roster, the Plugins-page settings rows, and all 12 language documents from six to seven roles.

## 1.0.0 — 2026-10-31

Initial shareable release.

- Six-member research team preset: advisor, researcher, builder, runner, reviewer, writer.
- Task-board-first workflow with a Lead bridge, per-card ownership, execution reports, and a human-only `done` gate.
- Opt-in `spawn_teammate_with_model` submodule for per-role provider, model, and reasoning effort.
- Plugins-page settings form with one row per member, a provider-grouped model menu, and a separate reasoning-effort menu.
- Settings persisted to `$DSH_HOME/research-team-settings.json`, refreshed from disk on reads and teammate spawns.
- English system prompt and English README; full translations in 11 additional languages under `docs/`.
- One centered, label-free language line at the top; linked repository/plugin references.
- Fixed a settings loader bug: the file stores roles under `"roles"`, but the old loader passed the whole object to the role normalizer and produced all-empty settings after a restart.
- MIT license, changelog, and repository metadata for sharing.
