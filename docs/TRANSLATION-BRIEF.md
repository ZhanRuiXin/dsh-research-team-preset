# Translation Brief

This brief is for producing the full language READMEs under `docs/`. It is not a translated README; it is contributor guidance.

## Source

Translate the **entire** `../README.md` (English). Do not summarize, shorten, reorder, or omit sections, tables, bullet lists, numbered steps, code blocks, or the version. The translation must contain essentially the same content as the English README.

## Target files

| Code | File | Language |
| --- | --- | --- |
| `zh-CN` | `README.zh-CN.md` | Simplified Chinese |
| `zh-TW` | `README.zh-TW.md` | Traditional Chinese |
| `ja` | `README.ja.md` | Japanese |
| `ko` | `README.ko.md` | Korean |
| `de` | `README.de.md` | German |
| `fr` | `README.fr.md` | French |
| `es` | `README.es.md` | Spanish |
| `pt-BR` | `README.pt-BR.md` | Brazilian Portuguese |
| `ru` | `README.ru.md` | Russian |
| `ar` | `README.ar.md` | Arabic |
| `hi` | `README.hi.md` | Hindi |

Overwrite the existing short introduction. Do not modify other files.

## Required structure

- Title exactly `# Research Team Mode` (no language suffix).
- Version line with exact values: `**Version 1.0.0** · **Updated 2026-10-31**`; localize the labels if natural.
- Add one centered language line after the version, with links to all 11 translations; the current language is bold and unlinked; no `Language:` or `Languages:` prefix. Do not repeat it at the bottom.
- Follow the English README section order exactly: Overview, At a glance, Who it is for, Requirements, Install, First run, Default team, Task board workflow, Per-role model settings, Configuration reference, Repository layout, How it works, Verification checklist, Troubleshooting, Known limitations, Development, Versioning, License, Acknowledgements.

## Links in a file under `docs/`

| English README link | Translation link |
| --- | --- |
| `README.md` / English | `../README.md` |
| `CHANGELOG.md` | `../CHANGELOG.md` |
| `LICENSE` | `../LICENSE` |
| `docs/README.<code>.md` | sibling `README.<code>.md` |

No link may point to `docs/docs/` or to a nonexistent file. Do not add a separate `## Translations` table or a `README.en.md` reference; the centered language lines are the navigation.

## Translation rules

- Translate prose, headings, table headers/cells, list items, and inline text.
- Keep code blocks, shell commands, paths, URLs, JSON keys, version numbers, dates, role names (`advisor`, `researcher`, `builder`, `runner`, `reviewer`, `writer`), tool names (`taskboard_*`, `spawn_teammate_with_model`, `run_code`, etc.), provider/model examples, and the product name **Research Team Mode** in English.
- Do not add a separate `## Translations` section or language table. The centered language lines at the top and bottom are the navigation.
- Preserve tables, code fences, and the `**At a glance**` structure.
- Translate labels such as "Version" and "Updated" naturally; keep `1.0.0` and `2026-10-31`.
- Do not add a "short introduction" banner or a translator note inside the document.
- The page must be a full README, not a summary.

## Verification

Before finishing, check that:

- the target file exists and is much longer than the old 36-line intro;
- all local links resolve from `docs/`;
- the centered language line is present once, after the version, without a `Language:` prefix;
- no separate `## Translations` section is present;
- the section order matches the English README;
- no other file was changed.

Report the target path, line count, number of `##` headings, and any link you had to adjust.
