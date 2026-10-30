# Research Team Mode — Deutsch

**Version:** 1.0.0 · **Aktualisiert:** 2026-10-31

**Sprachen:** [English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · **Deutsch** · [Français](README.fr.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md)

## Überblick

Research Team Mode ist ein DSH-Agent-Preset, das eine Sitzung in ein kleines, koordiniertes Forschungsteam verwandelt. Der Lead plant die Arbeit, führt das Task Board, verteilt Karten, integriert Ergebnisse und kommuniziert mit der nutzenden Person. Sechs Standardrollen decken Beratung, Literatur und Evidenz, Code, Läufe, unabhängige Prüfung und das Schreiben des Papers ab.

Der Modus eignet sich für Forschung über Tage oder Wochen, die nachvollziehbare Evidenz und klare Rollengrenzen braucht. Für einfache Fragen oder kleine einmalige Änderungen ist er nicht gedacht.

## Für wen

- Forschungsprojekte, die Literaturarbeit, Implementierung, Experimente und Paper-Produktion verbinden.
- Teams, die Behauptungen bis zur Quelle, zum Laufprotokoll oder zur Laufzeit-Aufzeichnung zurückverfolgen wollen.
- Nutzende, die statt eines Allzweck-Agenten einen Berater und eine unabhängige Prüfung wünschen.
- Arbeiten, bei denen die finale Abnahme beim Menschen liegen soll, nicht beim Agenten.

## Funktionen

- **Sechs Standardrollen**: advisor (wissenschaftliche Beratung), researcher (Literatur und Evidenz), builder (Code), runner (Training und Ausführung), reviewer (Prüfung), writer (Paper).
- **Task-Board zuerst**: Der Lead erstellt Karten, Mitglieder übernehmen und bearbeiten sie, reichen einen Ausführungsbericht ein, der Reviewer prüft unabhängig.
- **Modelle pro Rolle**: Auf der Plugin-Einstellungsseite lassen sich provider, model und Reasoning-Effort je Mitglied wählen.
- **Abschluss nur durch den Menschen**: Agenten kommen bis `in_review`; `done` setzt ausschließlich die nutzende Person in der GUI.
- **PTC-Laufzeit**: `run_code` und das erzeugte SDK bündeln Batch-Arbeiten und reduzieren Roundtrips.
- **Nachvollziehbarkeit**: Evidenz, Laufaufzeichnungen und Entscheidungen bleiben in den Kommentaren der Aufgabenkarten.

## Schnellstart

1. Im selben DSH-Profil Agent Teams (`@deepseek-ai/dsh-experimental-agent-team-profile`) und `dsh-taskboard` aktivieren.
2. Dieses Bundle über einen lokalen Pfad oder `link:` installieren und DSH neu starten.
3. Eine neue Sitzung öffnen und „Research Team Mode“ wählen; Aufgabenkarten erhalten `presetId=research-team`.
4. Unter „Plugins → @local/dsh-research-team-preset → research-team-settings → Configure“ die Standardmodelle setzen.

Vollständige Installation, Konfiguration, Task-Board-Ablauf und bekannte Probleme stehen im [English README](../README.md). Diese Seite ist eine KI-gestützte Übersetzung; Korrekturen sind willkommen.
