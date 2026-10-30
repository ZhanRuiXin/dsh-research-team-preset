# Research Team Mode

**Ein DSH-Agent-Preset, das eine Sitzung in ein kleines, koordiniertes Forschungsteam verwandelt.**

**Version 1.0.0** · **Aktualisiert 2026-10-31**

---

## Überblick

Research Team Mode ist ein DSH-Agent-Preset, mit dem sich End-to-End-Forschung als Team statt in einem einzigen Chat betreiben lässt. Der Lead plant die Arbeit, führt das Task Board, verteilt Karten, integriert Ergebnisse und kommuniziert mit der nutzenden Person. Sechs Standardrollen decken Beratung, Literatur und Evidenz, Code, Läufe, unabhängige Prüfung und das Schreiben des Papers ab.

Der Modus ist für Forschung gedacht, die sich über Tage oder Wochen erstreckt, nachvollziehbare Evidenz benötigt und von klaren Rollengrenzen profitiert. Er ist kein Modus für einmalige Fragen und Antworten: Der Lead erstellt nur die Rollen, die eine Aufgabe tatsächlich braucht.

## Auf einen Blick

| | |
| --- | --- |
| **Standardrollen** | 6: advisor, researcher, builder, runner, reviewer, writer |
| **Workflow** | Task Board zuerst: erstellen, übernehmen, ausführen, berichten, prüfen, Abnahme durch die nutzende Person |
| **Abschluss** | `in_review` ist die letzte Station des Agenten; nur die nutzende Person kann eine Karte auf `done` setzen |
| **Modell-Routing** | Provider, Modell und Reasoning-Effort pro Rolle über ein Einstellungsformular auf der Plugins-Seite |
| **Laufzeit** | PTC (`run_code` + generiertes SDK), eine Subagent-Ebene pro Mitglied |

<p align="center">Englisches System-Prompt; vollständiges englisches README plus vollständige Übersetzungen in 11 Sprachen</p>

## Für wen es gedacht ist

- Forschungsprojekte, die Literaturarbeit, Implementierung, Experimente und Paper-Erstellung verbinden.
- Teams, die eine Evidenzkette von der Behauptung zur Quelle, zum Laufprotokoll oder Log benötigen.
- Nutzende, die einen Advisor und einen unabhängigen Reviewer statt eines Allzweck-Agenten wünschen.
- Arbeiten, bei denen die nutzende Person die abschließende Abnahmeentscheidung treffen soll, nicht der Agent.

**Nicht geeignet für:** schnelle Faktenfragen, Änderungen an einzelnen Dateien oder Aufgaben, bei denen eine einmalige Antwort ausreicht. Der Modus weist den Lead an, einfache Fragen direkt zu beantworten und das Team nur für substanzielle Forschung zu mobilisieren.

## Voraussetzungen

Research Team Mode ist ein **DSH-Bundle auf Profilebene**. Das Bundle installiert oder aktiviert die von ihm verwendeten Profil-Bundles nicht selbst; der Paketinstaller von DSH kümmert sich um npm-Abhängigkeiten, nicht um Feature-Bundles. Aktivieren Sie die Abhängigkeiten zuerst im selben Profil.

| Funktion | Provider | Hinweise |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | Entwickelt gegen `0.2.1-rc.5`; andere Releases können funktionieren, sind aber nicht garantiert |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | Stellt `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent` und die Team-Services bereit |
| Task Board | [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) | Stellt `taskboard_*` und das Board in der Web-GUI bereit |
| PTC-Laufzeit | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) und [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | Teil der DSH-Basis; aktiviert `run_code` |
| Git Bash (optional, Windows) | [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) | Fügt Agenten, die es benötigen, ein `bash`-Tool hinzu |
| Web-GUI | DSH Web/Desktop | Erforderlich für das Einstellungsformular und das Task Board |

Wenn eine Abhängigkeit fehlt, kann der Modus trotzdem teilweise geladen werden, aber die Team-Tools, das Board oder die Einstellungsseite sind dann nicht verfügbar. Der Plugin-Manager fragt diese Bundles nicht ab und verknüpft sie nicht automatisch.

## Installation

Dieses Repository ist ein lokales DSH-Bundle. Aus einem Checkout:

1. **Aktivieren Sie die Voraussetzungen** im Zielprofil:
   - Agent Teams: [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness)
   - Task Board: [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard)
   - Optional [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) unter Windows.
2. **Installieren Sie dieses Bundle** über die Installationsaktion der Plugins-Seite bzw. des Plugin-Managers mit einem lokalen Link:

   ```text
   link:/absolute/path/to/research-team-preset
   ```

   Ein lokaler Ordnerpfad funktioniert ebenfalls. Behalten Sie den Link bei, wenn Sie von diesem Checkout aus aktualisieren möchten; nach dem Ersetzen des Ordners ist eine Neuinstallation erforderlich.
3. **Starten Sie DSH neu.** Preset-Zeilen und die Client-Hälfte des Bundles werden beim Start geladen.
4. **Prüfen Sie, ob das Bundle aktiviert ist**, und zwar im selben Profil.
5. **Öffnen Sie eine neue Sitzung** und wählen Sie im Modus-Auswahlfeld **Research Team Mode**.
6. Erstellen Sie für Ausführungssitzungen des Task Boards Karten mit `presetId=research-team`, damit die Ausführung dieselbe Persona und dieselben Tools verwendet.

> Der Modus ist ein Bundle auf Profilebene: Eine Installation in einem Profil aktiviert ihn nicht in einem anderen. Wiederholen Sie Installation und Voraussetzungsschritte für jedes Profil.

## Erster Start

Bitten Sie den Lead, Umgebung und Board zu prüfen, bevor die eigentliche Arbeit beginnt:

```text
list_agents        # create only the roles the task needs
research_project   # resolve the current project/workspaceId
taskboard_list     # check existing cards in this project
```

Eine typische erste Aufgabe:

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> taskboard_create(presetId=research-team) -> dispatch
Members: claim cards -> execute -> checklist + execution report -> in_review
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## Standardteam

| Rolle | Verantwortung |
| --- | --- |
| `advisor` | Unabhängige Bewertung von Richtung, Framing, zentralen Behauptungen, Evidenzlage und Paper-Strategie; empfiehlt proceed / revise / stop. Nur beratend, kein Gate |
| `researcher` | Literatursuche, Beschaffung, Close Reading, Evidenzextraktion und eine Evidenztabelle Behauptung → Quelle → Fundstelle |
| `builder` | Code, Konfiguration, Datenpipelines, Tests und reproduzierbare Einstiegspunkte; keine langen Trainingsläufe |
| `runner` | Startet und überwacht Training/Evaluation; zeichnet Run-IDs, Konfigurationen, Seeds, Metriken, Logs, Checkpoints und Artefaktpfade auf |
| `reviewer` | Unabhängige Verifikation von Literaturnotizen, Code, Ergebnissen und Paper-Behauptungen/-Zitaten; PASS/FAIL mit blockierender Evidenz |
| `writer` | LaTeX-Paper-Entwurf: Prosa, Abschnitte, Tabellen, Bildunterschriften, Zitate und Abbildungscode; führt keine Experimente aus und ändert weder Code noch Modelle |

Der Lead verantwortet Zielklärung, Zerlegung, Board-Verwaltung, Zuweisung, Integration, Zusammenfassungen, die Zusammenstellung der finalen Artefakte und die Auslieferung. Mitglieder dürfen für eine abgegrenzte Teilaufgabe eine Subagent-Ebene nutzen; sie können keine Teammitglieder erstellen.

## Arbeitsablauf im Task Board

```text
User goal
Lead:  research_project -> taskboard_create (checklist, presetId=research-team)
       -> comment the owner -> send_message
Member: taskboard_get (read comments) -> taskboard_move todo -> in_progress
       -> work -> taskboard_checklist (with evidence) -> taskboard_execution_report
       -> taskboard_comment_add -> taskboard_move -> in_review
Reviewer: independent PASS/FAIL with evidence
Advisor: optional independent recommendation at key decisions or before submission
Lead:  summarize -> report card ids/status/evidence/risks to the user
User:  accept in the GUI -> done (agents can never move a card to done)
```

Das Board ist das einzige Aufgabenregister. Behalten Sie die Nachverfolgung von Deliverables nicht nur im Chat. `team_task_*` dient der temporären Koordination, nicht der Verwaltung von Deliverables.

## Modelleinstellungen pro Rolle

Öffnen Sie:

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

Jedes Standardmitglied belegt eine Zeile:

- **Modell**: ein Dropdown mit den Modellen aller Provider und nicht anklickbaren Provider-Gruppenüberschriften. Die Auswahl eines Modells legt sowohl Provider als auch Modell fest.
- **Reasoning-Effort**: ein zweites Dropdown mit den für das ausgewählte Modell angegebenen Efforts sowie einer Option für den Modellstandard.

Ein leeres Modell bedeutet „Route des Lead übernehmen“; ein leerer Effort bedeutet „Modellstandard verwenden“. `spawn_teammate_with_model` liest den rollenspezifischen Standard, wenn `model` fehlt; ein explizites `model` überschreibt ihn. Ein einfaches `spawn_teammate` übernimmt immer die Route des Lead.

Der Zeilenname ist entscheidend: `research-team-settings` muss an der **Paketwurzel** `@local/dsh-research-team-preset` bleiben. Der Client-Modul-Scanner von DSH erkennt `dsh.client` nur bei exakten Paketwurzelzeilen; ein Subpfad-Name startet zwar das Host-Plugin, lädt aber nie die Seite.

### Wo Einstellungen gespeichert werden

```text
$DSH_HOME/research-team-settings.json
```

```json
{
  "roles": {
    "advisor": { "provider": "example-provider", "model": "example-model", "reasoningEffort": "high" },
    "researcher": { "provider": "", "model": "", "reasoningEffort": "" }
  }
}
```

- Die JSON-Datei ist die Quelle der Wahrheit. Das Host-Plugin lädt sie beim Start; `getSettings()` und `modelForRole()` lesen sie erneut ein, sodass die Seite und das nächste Teammitglied die aktuellen Werte sehen.
- Eine fehlende oder vorübergehend nicht lesbare Datei behält den letzten guten In-Memory-Snapshot bei, statt ihn zu leeren.
- Die Einstellungsdatei ist **nicht** Teil dieses Repositorys. Sichern Sie sie separat. Sie gilt pro `DSH_HOME`, nicht pro Profil.
- Es werden keine Zugangsdaten gespeichert, nur Provider-/Modell-/Effort-Strings.
- Gespeicherte Einstellungen werden ohne DSH-Neustart wirksam. Ein Neustart ist bei der Erstinstallation der Einstellungszeile bzw. der Client-Seite sowie bei Änderungen an Preset/Plugin erforderlich.
- Version 1.0.0 behebt einen Loader-Bug in früheren Builds: Die Datei kapselt Rollen unter `"roles"`, und der alte Loader übergab das gesamte Objekt an den Rollen-Normalisierer, was nach einem Neustart zu vollständig leeren Einstellungen führte. Der aktuelle Loader entpackt `"roles"` und unterstützt aus Kompatibilitätsgründen auch eine bloße Rollen-Map.

## Konfigurationsreferenz

| Einstellung | Ort | Hinweise |
| --- | --- | --- |
| Preset-ID | `cordis.patch.yml` | `research-team`; Aufgabenkarten sollten `presetId=research-team` verwenden |
| Persona | `cordis.patch.yml` | Englisches System-Prompt; modusweite Regeln |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | Auf `false` setzen, um `spawn_teammate_with_model` und dessen Service-Wrapper zu entfernen |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | Subagent-Provider des modeled Spawn-Tools; Standard `spawn` / `fork` |
| Zeile `research-team-settings` | `cordis.patch.yml` | Host-Zeile auf oberster Ebene; Paketwurzelnamen beibehalten |
| Rollenspezifische Routen | `$DSH_HOME/research-team-settings.json` | Provider/model/reasoningEffort für die sechs Standardrollen |

## Repository-Struktur

```text
research-team-preset/
├── README.md                     # This file (canonical, English)
├── CHANGELOG.md
├── LICENSE
├── .gitignore
├── package.json                  # DSH bundle manifest and exports
├── cordis.patch.yml              # Preset + top-level settings row
├── plugin/
│   ├── index.js                  # research_project + English task-board prompt section
│   ├── modeled-teammates.js      # spawn_teammate_with_model + activation wrapper
│   └── settings-store.js         # Shared settings snapshot + disk refresh
├── settings/
│   └── index.js                  # Settings file + /api/dsh-research-team-settings
├── client/
│   └── index.js                  # plugins.row.config form (model/effort dropdowns)
└── docs/
    ├── LANGUAGES.md              # Language guide
    ├── README.zh-CN.md
    ├── README.zh-TW.md
    ├── README.ja.md
    ├── README.ko.md
    ├── README.de.md
    ├── README.fr.md
    ├── README.es.md
    ├── README.pt-BR.md
    ├── README.ru.md
    ├── README.ar.md
    └── README.hi.md
```

## Funktionsweise

- **Preset**: `cordis.patch.yml` deklariert die Persona, Tool-Zeilen, das modeled-teammates-Submodul und die Einstellungszeile auf oberster Ebene.
- **Task-Board-Prompt**: `plugin/index.js` registriert einen englischen Protokollabschnitt (`plugin:dsh-taskboard`) im Preset-Scope und stellt `research_project` bereit, um den aktuellen Workspace aufzulösen.
- **Rollenbasiertes Routing**: `plugin/modeled-teammates.js` umschließt `subagents.startActivation` mit `AsyncLocalStorage` und injiziert `agentOptions` nur für einen Aufruf von `spawn_teammate_with_model`. Das offizielle Agent-Teams-Paket bleibt unverändert.
- **Einstellungen**: `settings/index.js` lädt und speichert die JSON-Datei und bedient `GET/POST /api/dsh-research-team-settings`; `client/index.js` registriert das Zeilenformular der Plugins-Seite über `plugins.row.config`.
- **Aktualisierung**: `plugin/settings-store.js` hält den In-Memory-Snapshot, liest bei Lesezugriffen und Spawns von der Festplatte neu ein und behält den letzten guten Snapshot, falls ein Lesevorgang fehlschlägt.

## Verifikations-Checkliste

```text
plugin_manager list_plugins              # bundle active
Config.listConfigs name=@deepseek-ai/dsh-agent-preset   # include:preset-research-team
new session -> Research Team Mode
list_agents                              # roles can be created
research_project                         # returns the current workspaceId
taskboard_list                           # matches the GUI board
Plugins -> bundle -> research-team-settings -> Configure   # page visible
save a role model -> restart -> page still shows it
```

Der Persistenzpfad der Einstellungen lässt sich auch ohne UI prüfen:

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## Fehlerbehebung

### Einstellungen scheinen nach einem Neustart zurückgesetzt zu werden

Version 1.0.0 behebt die bekannte Ursache: Der alte Loader übergab das gesamte Objekt `{ roles: ... }` an den Rollen-Normalisierer und erzeugte vollständig leere Einstellungen. Aktualisieren Sie auf 1.0.0 oder höher, starten Sie DSH neu und prüfen Sie, dass:

- `$DSH_HOME/research-team-settings.json` existiert und die gespeicherten Rollen enthält;
- die Zeile `research-team-settings` exakt `@local/dsh-research-team-preset` heißt;
- der aktuelle Host dieses Checkout ausführt und keine veraltete installierte Kopie.

### Die Einstellungsseite erscheint nicht auf der Plugins-Seite

- Die Zeile muss die Paketwurzel sein, nicht `@local/dsh-research-team-preset/settings`.
- Die Client-Hälfte benötigt nach der Installation einen DSH-Neustart und ein Neuladen des Browsers.
- Prüfen Sie, ob das Bundle im Profil aktiviert ist.

### Team-Tools fehlen

Aktivieren Sie [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) im selben Profil und starten Sie neu. Der Installer fragt danach nicht.

### Task-Board-Tools fehlen

Aktivieren Sie [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) im selben Profil und starten Sie neu.

### `spawn_teammate_with_model` ist nicht verfügbar

Das Submodul umschließt einen internen Subagent-Service. Ein DSH-Upgrade kann die Form der Aktivierung ändern. Prüfen Sie den Fehlertext; falls der Wrapper nicht installiert werden kann, setzen Sie `research-modeled-teammates.enabled: false`, starten Sie neu und verwenden Sie das einfache `spawn_teammate`.

### Das Preset wird nicht angezeigt

Bestätigen Sie, dass das Bundle installiert und aktiviert ist, starten Sie DSH neu und öffnen Sie eine neue Sitzung. Preset-Deklarationen werden beim Start geladen.

### `research_project` kann den Workspace nicht auflösen

Öffnen Sie das Arbeitsverzeichnis in der GUI als DSH-Projekt/Workspace oder übergeben Sie ein bekanntes Projekt; das Tool rät nicht.

## Bekannte Einschränkungen

- Das Modell-Routing pro Rolle ist ein interner Service-Wrapper, keine offizielle Agent-Teams-Erweiterung. DSH-Upgrades können es beschädigen; der Fallback ist oben dokumentiert.
- Abhängigkeiten auf Profilebene werden nicht automatisch installiert oder aktiviert. Dieses Repository dokumentiert sie, verwaltet sie aber nicht.
- Rolleneinstellungen liegen in einer eigenständigen JSON-Datei unter `$DSH_HOME`; sie sind nicht Teil des Standard-Konfigurationsexports bzw. -Backups von DSH. Kopieren Sie die Datei, wenn Sie den Rechner wechseln.
- Das Modellmenü ist ein natives `<select>` mit Provider-Gruppen, keine durchsuchbare eigene Auswahlkomponente.
- Der Modus startet beim Sitzungsbeginn nicht automatisch sechs Teammitglieder. Der Lead erstellt Rollen nach Bedarf der Aufgabe.
- Mitglieder dürfen eine Subagent-Ebene nutzen; tiefere Delegation ist bewusst deaktiviert.

## Entwicklung

Dieses Repository ist ein lokales DSH-Bundle ohne Build-Schritt für den Host-Code. Die Client-Seite ist ein vorgebautes `window.__ModuleLoader__.load`-Modul in `client/index.js`.

Typischer Arbeitszyklus:

1. Das Checkout als `link:`-Abhängigkeit in einem DSH-Profil installieren.
2. Die Host-/Client-Dateien bearbeiten.
3. DSH neu starten (Preset- und Client-Module werden beim Start geladen; HMR kann einige Host-Änderungen übernehmen).
4. Die Einstellungsroute und die Plugins-Seite prüfen.

Nützliche Prüfungen:

```bash
node --check settings/index.js
node --check plugin/index.js
node --check plugin/modeled-teammates.js
node --check client/index.js
```

Es gibt noch keine automatisierte Testsuite. Die Einstellungsroute, der Modellkatalog, der Task-Board-Ablauf und die Persistenz über Neustarts hinweg sind die wichtigsten manuellen Prüfungen.

## Versionierung

Semantische Versionierung. Die aktuelle Version ist **1.0.0**; siehe [CHANGELOG.md](../CHANGELOG.md). Die Dokumente unter `docs/` tragen dieselbe Version.

## Lizenz

MIT. Siehe [LICENSE](../LICENSE).

## Danksagungen

Basiert auf [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) und [Cordis](https://github.com/cordiverse/cordis). Die Task-Board-Integration verwendet das Plugin [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard); die Team-Tools stammen aus dem offiziellen Agent-Teams-Profil-Bundle. Danke an die Plugin-Autoren und alle, die den Modus an echten Forschungsprojekten testen.
