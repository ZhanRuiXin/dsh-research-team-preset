# Research Team Mode — English

**Version:** 1.0.0 · **Updated:** 2026-10-31

**Languages:** **English (short)** · [English (full)](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md)

> This is a short introduction. The complete, canonical documentation is the [English README](../README.md).

## Overview

Research Team Mode is a DSH agent preset that turns one session into a small, coordinated research team. The Lead plans the work, keeps the task board, dispatches cards, integrates results, and talks to the user. Six default specialists cover advisory review, literature and evidence, code, runs, independent review, and paper writing.

It is for research that spans days or weeks, needs traceable evidence, and benefits from clear role boundaries. It is not a one-shot Q&A mode.

## Who it is for

- Projects that combine literature review, implementation, experiments, and paper output.
- Teams that need each claim traced to a source, run log, or experiment record.
- Users who want an advisor and an independent reviewer instead of one general-purpose agent.
- Work where the final acceptance decision must remain with the user.

## Capabilities

- **Six default roles**: advisor (scientific advice), researcher (literature and evidence), builder (code), runner (training and execution), reviewer (review), writer (paper writing).
- **Task board first**: the Lead creates cards, members claim and execute them, submit an execution report, and the reviewer verifies independently.
- **Per-role models**: the plugin settings page selects provider, model, and reasoning effort for each member.
- **Completion is user-only**: agents reach `in_review`; only the user moves a card to `done` in the GUI.
- **PTC runtime**: `run_code` and the generated SDK batch operations and reduce round-trips.
- **Traceability**: evidence, run records, and decisions stay in the task-card comments.

## Quick start

1. Enable Agent Teams (`@deepseek-ai/dsh-experimental-agent-team-profile`) and `dsh-taskboard` in the same DSH profile.
2. Install this bundle from a local path or `link:`, then restart DSH.
3. Open a new session and select “Research Team Mode”; use `presetId=research-team` on task cards.
4. Open “Plugins → @local/dsh-research-team-preset → research-team-settings → Configure” and set per-role defaults.

Full installation, configuration, task-board workflow, and known issues: [English README](../README.md). This page is a short introduction; it is not a full translation.
