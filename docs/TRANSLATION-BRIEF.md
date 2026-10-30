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
- Language selector after the version, with links:
  - English: `../README.md`
  - Other translations: sibling `README.<code>.md`
  - Current language: bold, not a link
  - Language guide: `LANGUAGES.md`
- Repeat the language selector at the bottom.
- Follow the English README section order exactly: Overview, At a glance, Who it is for, Requirements, Install, First run, Default team, Task board workflow, Per-role model settings, Configuration reference, Repository layout, How it works, Verification checklist, Troubleshooting, Known limitations, Development, Translations, Versioning, License, Acknowledgements.

## Links in a file under `docs/`

| English README link | Translation link |
| --- | --- |
| `README.md` / English | `../README.md` |
| `CHANGELOG.md` | `../CHANGELOG.md` |
| `LICENSE` | `../LICENSE` |
| `docs/LANGUAGES.md` | `LANGUAGES.md` |
| `docs/README.<code>.md` | `README.<code>.md` |
| Other translation pages | sibling `README.<code>.md` |

No link may point to `docs/docs/` or to a nonexistent file. No English short-intro row or `README.en.md` reference.

## Translation rules

- Translate prose, headings, table headers/cells, list items, and inline text.
- Keep code blocks, shell commands, paths, URLs, JSON keys, version numbers, dates, role names (`advisor`, `researcher`, `builder`, `runner`, `reviewer`, `writer`), tool names (`taskboard_*`, `spawn_teammate_with_model`, `run_code`, etc.), provider/model examples, and the product name **Research Team Mode** in English.
- Keep the `## Translations` table: English full `../README.md`, all other languages sibling links. Do not add an English short-intro row.
- Preserve tables, code fences, and the `**At a glance**` structure.
- Translate labels such as "Version" and "Updated" naturally; keep `1.0.0` and `2026-10-31`.
- Do not add a "short introduction" banner or a translator note inside the document.
- The page must be a full README, not a summary.

## Verification

Before finishing, check that:

- the target file exists and is much longer than the old 36-line intro;
- all local links resolve from `docs/`;
- the language selector is present at the top and bottom;
- the section order matches the English README;
- no other file was changed.

Report the target path, line count, number of `##` headings, and any link you had to adjust.
