# Repository rules

- `main` is the stable, released branch. Do not commit to it directly.
- All changes accumulate on `work` and are pushed to `origin/work`.
- A change reaches `main` only after the accumulated checks below pass on `work`.
- Releases are tagged from `main` as `vX.Y.Z`; a tag must point at the merged commit.

## Checks before merging `work` into `main`

```bash
node --check settings/index.js
node --check plugin/index.js
node --check plugin/modeled-teammates.js
node --check client/index.js
node --check panel/index.js
node --check panel/client.js
node --test test/modeled-teammates.test.js test/scope-check.test.js test/workspace-init.test.js test/settings-route.test.js test/architecture.test.js test/worklog.test.js test/team-mode.test.js
```

- Parse `cordis.patch.yml` with the `yaml` package (strip `!!js` tags first) and confirm the persona prefix contains every required section.
- Keep the 12 READMEs structurally in sync: 23 `## ` and 13 `### ` headings in each.
- `npm pack --dry-run` ships only the files whitelist (no `test/`, no `tmp/`).
- Grep the shipped docs and persona for banned wording: `venue`, `submission`, `publishable`, `CCF`, `camera-ready`, `prestigious`.

This repository is a local DSH bundle with no build step; see `DEVELOPMENT.md` for the development loop and the check list.
