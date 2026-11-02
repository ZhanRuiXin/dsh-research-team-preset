# Research Team Mode

**Un preset d'agent DSH qui transforme une session en une petite équipe de recherche coordonnée.**

**Version 0.1.0** · **Mise à jour 2026-10-31**

<p align="center"><a href="../README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <strong>Français</strong> · <a href="README.es.md">Español</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिन्दी</a></p>

---

## Aperçu

Research Team Mode est un preset d'agent DSH qui permet de mener une recherche de bout en bout en équipe plutôt qu'en une seule conversation. Le Lead planifie le travail, tient le tableau des tâches, répartit les cartes, intègre les résultats et dialogue avec l'utilisateur. Sept spécialistes par défaut couvrent l'avis consultatif, la littérature et les preuves, l'acquisition de données, le code, les exécutions, la revue indépendante et la rédaction de l'article.

Le mode est conçu pour des recherches qui s'étalent sur des jours ou des semaines, exigent des preuves traçables et bénéficient de frontières de rôles claires. Ce n'est pas un mode de questions-réponses en un seul échange : le Lead ne crée que les rôles dont une tâche a réellement besoin.

## En bref

| | |
| --- | --- |
| **Rôles par défaut** | 7 : advisor, researcher, data, builder, runner, reviewer, writer |
| **Flux de travail** | Priorité au tableau des tâches : créer, prendre en charge, exécuter, rapporter, relire, acceptation par l'utilisateur |
| **Achèvement** | `in_review` est le dernier arrêt de l'agent ; seul l'utilisateur peut déplacer une carte vers `done` |
| **Routage des modèles** | Provider, model et effort de raisonnement par rôle, depuis un formulaire de réglages de la page Plugins |
| **Git** | Initialisé par l'agent au début du travail substantiel ; changements destructifs sur une branche ; fusion après acceptation seulement |
| **Worklog** | `worklog/PLAN.md` + `INDEX.md` + un fichier borné par carte ; la reprise lit PLAN et INDEX d'abord |
| **Runtime** | PTC (`run_code` + SDK généré), une couche de sous-agent par membre |

## À qui s'adresse ce mode

- Projets de recherche qui combinent revue de littérature, implémentation, expériences et production d'article.
- Équipes qui ont besoin d'une piste de preuves reliant chaque affirmation à une source, un enregistrement d'exécution ou un journal.
- Utilisateurs qui préfèrent un conseiller et un relecteur indépendant à un agent généraliste.
- Travaux où la décision finale d'acceptation doit revenir à l'utilisateur, et non à l'agent.

**Pas pour :** les questions factuelles rapides, les modifications d'un seul fichier ou les tâches où une réponse en un seul échange suffit. Le mode demande au Lead de répondre directement aux questions simples et de mobiliser l'équipe uniquement pour une recherche substantielle.

## Prérequis

Research Team Mode est un **bundle DSH au niveau du profil**. Le bundle n'installe ni n'active les bundles de profil qu'il utilise ; l'installeur de paquets de DSH gère les dépendances npm, pas les bundles de fonctionnalités. Activez d'abord les dépendances dans le même profil.

| Capacité | Fourni par | Remarques |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | Développé contre `0.2.1-rc.5` ; d'autres versions peuvent fonctionner mais ne sont pas garanties |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | Fournit `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent` et les services Team |
| Tableau des tâches | [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) | Fournit `taskboard_*` et le tableau de l'interface web |
| Runtime PTC | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) et [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | Fait partie de la base DSH ; active `run_code` |
| Git Bash (facultatif, Windows) | [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) | Ajoute un outil `bash` pour les agents qui en ont besoin |
| Interface web | DSH Web/Desktop | Nécessaire pour le formulaire de réglages et le tableau des tâches |

Si une dépendance manque, le mode peut tout de même se charger partiellement, mais les outils d'équipe, le tableau ou la page de réglages seront indisponibles. Le gestionnaire de plugins ne propose pas ces bundles et ne les lie pas automatiquement.

## Installation

Ce dépôt est un bundle DSH local. Depuis une copie de travail :

1. **Activez les prérequis** dans le profil cible :
   - Agent Teams : [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness)
   - Tableau des tâches : [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard)
   - Éventuellement [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) sous Windows.
2. **Installez ce bundle** avec l'action d'installation de la page Plugins / du gestionnaire de plugins, en utilisant un lien local :

   ```text
   link:/absolute/path/to/research-team-preset
   ```

   Un chemin de dossier local fonctionne aussi. Conservez le lien si vous comptez mettre à jour depuis cette copie de travail ; réinstallez après avoir remplacé le dossier.
3. **Redémarrez DSH.** Les lignes de preset et la partie client du bundle se chargent au démarrage.
4. **Vérifiez que le bundle est activé** dans le même profil.
5. **Ouvrez une nouvelle session** et sélectionnez **Research Team Mode** dans le sélecteur de mode.
6. Pour les sessions d'exécution du tableau des tâches, créez les cartes avec `presetId=research-team` afin que l'exécution utilise la même persona et les mêmes outils.

> Le mode est un bundle au niveau du profil : l'installer dans un profil ne l'active pas dans un autre. Répétez les étapes d'installation et de prérequis pour chaque profil.

## Premier lancement

Demandez au Lead de vérifier l'environnement et le tableau avant de commencer le vrai travail :

```text
list_agents        # create only the roles the task needs
research_project   # resolve the current project/workspaceId
taskboard_list     # check existing cards in this project
```

Une première tâche typique :

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> taskboard_create(presetId=research-team) -> dispatch
Members: claim cards -> execute -> checklist + execution report -> in_review
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## Équipe par défaut

| Rôle | Responsabilité |
| --- | --- |
| `advisor` | Évaluation indépendante de la direction, du cadrage, des affirmations centrales, de la suffisance des preuves et de la stratégie de l'article ; recommande de poursuivre / réviser / arrêter. Consultatif uniquement, pas un verrou |
| `researcher` | Recherche bibliographique, acquisition, lecture attentive, extraction de preuves et tableau de preuves affirmation → source → emplacement |
| `data` | Acquisition de jeux de données et de poids de modèles externes, avec disponibilité de la source et statut de licence/accès, outillage de téléchargement gérant reprise et limites de débit, vérification d'intégrité par rapport aux hachages de l'éditeur, décompression, contrat de manifeste, petit échantillon validé et registre disque. Ne rédige pas de code d'entraînement et ne modifie pas le protocole d'évaluation |
| `builder` | Code, configuration, pipelines de données, tests et points d'entrée reproductibles ; pas de longues exécutions d'entraînement |
| `runner` | Lancer et suivre l'entraînement/l'évaluation ; consigner les run ids, configurations, graines, métriques, journaux, checkpoints et chemins d'artefacts |
| `reviewer` | Vérification indépendante des notes de littérature, du code, des résultats et des affirmations/citations de l'article ; PASS/FAIL avec preuves bloquantes |
| `writer` | Brouillon d'article LaTeX : prose, sections, tableaux, légendes, citations et code de figures ; ne lance pas d'expériences et ne modifie ni le code ni les modèles |

Le Lead est responsable de la clarification de l'objectif, de la décomposition, de la gestion du tableau, de la répartition, de l'intégration, des synthèses, de l'assemblage final des livrables et de la livraison. Les membres peuvent utiliser une couche de sous-agent pour une sous-tâche délimitée ; ils ne peuvent pas créer d'équipiers.

## Flux du tableau des tâches

```text
User goal
Lead:  research_project -> taskboard_create only at user gates (checklist, presetId=research-team)
       -> team_task_create (owner, blocked_by, write scopes) -> send_message
Member: team_task_update (claim) -> work -> team_task_update (complete) + send_message
Internal steps and member handoffs stay off the board; only user gates get cards
At a user gate: taskboard_get -> taskboard_move in_progress -> checklist/report -> in_review
Reviewer: independent PASS/FAIL with evidence on gated cards
Advisor: optional independent recommendation at key decisions or before submission
Lead:  summarize -> report card ids/status/evidence/risks to the user
User:  accept in the GUI -> done (agents can never move a card to done)
```

Seules les étapes qui attendent la revue ou la validation de l'utilisateur reçoivent une carte du tableau : jalons de livrable, décisions de périmètre à confirmer, changements risqués et remise finale. Les étapes internes, les sous-tâches auto-approuvées et les passations entre membres sont suivies dans `team_task_*` et restent hors du tableau ; à la porte, la carte garde le livrable, ses preuves et le verdict de revue.

## Flux Git

Le mode initialise un suivi durable au début du travail substantiel, et l'agent juge si une demande est un vrai travail ou une simple question. Dans un espace de travail qui n'est pas encore dans un dépôt, l'agent appelle `research_workspace_init`, qui crée `worklog/PLAN.md` et `worklog/INDEX.md` et exécute `git init`. Il ne crée jamais de dépôt imbriqué et ne commit pas l'échafaudage.

Les changements destructifs ou risqués se font sur une branche nommée d'après la carte, par exemple `task/<title>+<id>`, plutôt que sur la branche par défaut. La carte enregistre les commits de base et de tête, et le reviewer lit `git diff <base>..<head>` comme base de la revue de code et relance les vérifications d'acceptation.

Une branche n'est fusionnée qu'après l'acceptation de la carte, puis supprimée. Les artefacts générés (jeux de données, checkpoints, journaux, caches) restent hors du dépôt. Si le projet n'est pas un dépôt git, la revue s'appuie sur un instantané de hachages de fichiers et les preuves consignées sur la carte.

## Worklog

Le travail susceptible de s'étendre sur plusieurs sessions conserve un enregistrement petit et borné à côté du code. `worklog/PLAN.md` contient l'objectif, le jalon en cours, les cartes actives, les blocages et les décisions datées ; `worklog/INDEX.md` contient une ligne par carte active. Chaque carte reçoit `worklog/<task-id>.md` avec un bloc d'état courant en haut et de courtes entrées ajoutées en dessous.

À la reprise, l'agent lit d'abord PLAN et INDEX, puis seulement le bloc d'état et la fin de la carte cible, jamais le fichier entier ni le répertoire entier. PLAN reste sous environ 100 lignes, les fichiers de carte sous environ 200, et les cartes terminées sont retirées de l'index. Les modèles compacts des trois fichiers vivent dans la persona du preset, donc chaque session peut les créer ou les mettre à jour sans lire ce dépôt.

## Profils de modèle d'équipe

La page de réglages conserve plusieurs profils de modèle nommés pour les membres d'équipe par défaut et utilise celui qui est sélectionné pour le prochain spawn.

Ouvrez :

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

La barre de profils en haut de la page :

- **Changer** le profil (liste déroulante `团队配置`) qu'utilisera le prochain équipier par défaut.
- **新建配置** ajoute un profil avec sept lignes de rôle vides.
- **配置名称** renomme le profil sélectionné. Les noms sont obligatoires, uniques et limités à 60 caractères.
- **删除配置** supprime le profil sélectionné après un second clic de confirmation. Le dernier profil restant ne peut pas être supprimé.

Chaque profil comporte une ligne par membre par défaut :

- **Model** : une liste déroulante contenant les modèles de tous les providers, avec des en-têtes de groupe de providers non cliquables. Sélectionner un modèle définit à la fois le provider et le modèle.
- **Reasoning effort** : une seconde liste déroulante avec les efforts annoncés pour le modèle sélectionné, plus une option de valeur par défaut du modèle.

Un modèle vide signifie « hériter de la route du Lead » ; un effort vide signifie « utiliser la valeur par défaut du modèle ». `spawn_teammate_with_model` lit la valeur par défaut par rôle du profil sélectionné lorsque `model` est omis ; un `model` explicite la remplace. Le simple `spawn_teammate` hérite toujours du Lead.

La liste complète des profils est enregistrée d'un seul bloc, si bien que changer de profil ne perd pas les modifications faites dans un autre. La page valide les noms avant l'enregistrement et affiche le texte d'erreur du serveur lorsqu'un enregistrement est refusé.

Le nom de la ligne est important : `research-team-settings` doit rester à la **racine du paquet** `@local/dsh-research-team-preset`. Le scanner de modules client de DSH ne découvre `dsh.client` que pour les lignes situées exactement à la racine du paquet ; un nom de sous-chemin démarre le plugin hôte mais ne charge jamais la page.

### Où sont stockés les réglages

```text
$DSH_HOME/research-team-settings.json
```

```json
{
  "version": 2,
  "activeProfileId": "default",
  "profiles": [
    {
      "id": "default",
      "name": "默认配置",
      "roles": {
        "advisor": { "provider": "example-provider", "model": "example-model", "reasoningEffort": "high" },
        "researcher": { "provider": "", "model": "", "reasoningEffort": "" }
      }
    },
    {
      "id": "p-example",
      "name": "快速实验",
      "roles": {
        "advisor": { "provider": "", "model": "", "reasoningEffort": "" }
      }
    }
  ]
}
```

- `activeProfileId` désigne le profil utilisé par le prochain équipier. Le serveur retombe sur le premier profil lorsqu'il est absent ou inconnu.
- Un fichier hérité (`{ "roles": { ... } }` ou une simple table de rôles) est migré en mémoire vers un profil unique nommé `默认配置` ; le fichier est réécrit sous la forme de profil au prochain enregistrement. Un `POST { "roles": ... }` hérité ne met à jour que le profil actif, de sorte que les anciens scripts ne peuvent pas supprimer les autres profils.
- Le fichier JSON est la source de vérité. Le plugin hôte le charge au démarrage ; `getSettings()` et `modelForRole()` le relisent, de sorte que la page et le prochain équipier voient les valeurs les plus récentes.
- Un fichier absent ou temporairement illisible conserve le dernier instantané en mémoire valide au lieu de l'effacer.
- Le fichier de réglages **ne** se trouve **pas** dans ce dépôt. Sauvegardez-le séparément. Il est propre à chaque `DSH_HOME`, pas à chaque profil.
- Aucun identifiant n'est stocké ; uniquement les noms de profil et des chaînes provider/model/effort.
- Les enregistrements de réglages prennent effet sans redémarrage de DSH : le store relit le fichier et le prochain spawn résout le profil actif. Modifier le code de ce plugin lui-même nécessite toujours un redémarrage de DSH, car la partie hôte enregistre une route WebSocket/HTTP et un emplacement de page Plugins au niveau de l'hôte.
- La version 0.1.0 corrige un bug de chargeur des versions précédentes : le fichier encapsule les rôles sous `"roles"`, et l'ancien chargeur passait l'objet entier au normaliseur de rôles, produisant des réglages entièrement vides après redémarrage. Le chargeur actuel extrait la clé `"roles"`, migre les anciens fichiers et accepte une table de rôles nue pour compatibilité.

## Référence de configuration

| Réglage | Emplacement | Remarques |
| --- | --- | --- |
| Preset id | `cordis.patch.yml` | `research-team` ; les cartes de tâches doivent utiliser `presetId=research-team` |
| Persona | `cordis.patch.yml` | Prompt système en anglais ; règles valables pour tout le mode |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | Mettre `false` pour retirer `spawn_teammate_with_model` et son enveloppe de service |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | Fournisseurs de sous-agents utilisés par l'outil de spawn modélisé ; valeurs par défaut `spawn` / `fork` |
| Ligne `research-team-settings` | `cordis.patch.yml` | Ligne hôte de premier niveau ; conservez le nom à la racine du paquet |
| Profils de modèle d'équipe | `$DSH_HOME/research-team-settings.json` | Profils nommés ; le profil actif fournit provider/model/reasoningEffort pour les sept rôles par défaut |

## Arborescence du dépôt

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
│   └── settings-store.js         # Shared profile snapshot + disk refresh
├── settings/
│   └── index.js                  # Profile file + /api/dsh-research-team-settings
├── client/
│   └── index.js                  # plugins.row.config profile editor (model/effort dropdowns)
└── docs/
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

## Fonctionnement

- **Preset** : `cordis.patch.yml` déclare la persona, les lignes d'outils, le sous-module modeled-teammates et la ligne de réglages de premier niveau.
- **Prompt du tableau des tâches** : `plugin/index.js` enregistre une section de protocole en anglais (`plugin:dsh-taskboard`) à la portée du preset et fournit `research_project` pour résoudre l'espace de travail courant.
- **Routage par rôle** : `plugin/modeled-teammates.js` enveloppe `subagents.startActivation` avec `AsyncLocalStorage` et injecte `agentOptions` uniquement pour un appel `spawn_teammate_with_model`. Le paquet officiel Agent Teams n'est pas modifié. Cordis expose les services via un proxy traçable ; le wrapper vérifie donc son propre descripteur de propriété plutôt que l'identité de la méthode.
- **Réglages** : `settings/index.js` charge et enregistre le fichier JSON des profils et sert `GET/POST /api/dsh-research-team-settings` ; `client/index.js` enregistre l'éditeur de profils de la page Plugins via `plugins.row.config`.
- **Rafraîchissement** : `plugin/settings-store.js` détient l'instantané en mémoire, résout le profil actif à chaque lecture et à chaque spawn, et conserve le dernier instantané valide si une lecture échoue.

## Liste de vérification

```text
plugin_manager list_plugins              # bundle active
Config.listConfigs name=@deepseek-ai/dsh-agent-preset   # include:preset-research-team
new session -> Research Team Mode
list_agents                              # roles can be created
research_project                         # returns the current workspaceId
taskboard_list                           # matches the GUI board
Plugins -> bundle -> research-team-settings -> Configure   # page visible
新建配置 -> name it -> save -> reopen the page -> both profiles listed
select another profile -> save -> spawn_teammate_with_model uses it
delete one profile -> save -> only the remaining profile exists
legacy {roles} file -> restart -> shown as 默认配置
save a role model -> restart -> page still shows it
```

Le chemin de persistance des réglages peut être vérifié sans l'interface :

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## Dépannage

### Les réglages semblent se réinitialiser après un redémarrage

La version 0.1.0 corrige la cause connue : l'ancien chargeur passait tout l'objet `{ roles: ... }` au normaliseur de rôles et produisait des réglages entièrement vides. Mettez à jour vers 0.1.0 ou une version ultérieure, redémarrez DSH et vérifiez que :

- `$DSH_HOME/research-team-settings.json` existe et contient les profils enregistrés ;
- les anciens fichiers `{ "roles": ... }` s'affichent comme un profil unique `默认配置` et sont réécrits sous la forme de profil au prochain enregistrement ;
- la ligne `research-team-settings` est nommée exactement `@local/dsh-research-team-preset` ;
- l'hôte actuel exécute cette copie de travail, et non une copie installée obsolète.

### La page de réglages n'apparaît pas dans Plugins

- La ligne doit être la racine du paquet, et non `@local/dsh-research-team-preset/settings`.
- La partie client nécessite un redémarrage de DSH et un rafraîchissement du navigateur après l'installation.
- Vérifiez que le bundle est activé dans le profil.

### Les outils d'équipe sont absents

Activez [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) dans le même profil et redémarrez. L'installeur ne le propose pas.

### Les outils du tableau des tâches sont absents

Activez [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) dans le même profil et redémarrez.

### `spawn_teammate_with_model` est indisponible

Le sous-module enveloppe un service interne de sous-agents. Une mise à niveau de DSH peut modifier la forme de l'activation. Consultez le texte de l'échec ; si l'enveloppe ne peut pas s'installer, mettez `research-modeled-teammates.enabled: false`, redémarrez et utilisez le simple `spawn_teammate`.

### Le preset n'est pas listé

Confirmez que le bundle est installé et activé, redémarrez DSH et ouvrez une nouvelle session. Les déclarations de preset se chargent au démarrage.

### `research_project` ne peut pas résoudre l'espace de travail

Ouvrez le répertoire de travail comme projet/espace de travail DSH dans l'interface ou indiquez un projet connu ; l'outil ne devine pas.

## Limites connues

- Le routage des modèles par rôle est une enveloppe de service interne, pas une extension officielle d'Agent Teams. Les mises à niveau de DSH peuvent le casser ; la solution de repli est documentée ci-dessus.
- Les dépendances au niveau du profil ne sont ni installées ni activées automatiquement. Ce dépôt les documente mais ne les gère pas.
- Les profils de modèle d'équipe vivent dans un fichier JSON autonome sous `$DSH_HOME` ; ils ne font pas partie de l'export ou de la sauvegarde de configuration standard de DSH. Copiez le fichier si vous changez de machine.
- Le menu des modèles est un `<select>` natif avec des groupes de providers, pas un sélecteur personnalisé avec recherche.
- Le mode ne lance pas automatiquement sept équipiers au démarrage de la session. Le Lead crée les rôles selon les besoins de la tâche.
- Le mode n'initialise jamais de dépôt à l'intérieur d'un dépôt existant et ne commit jamais de lui-même le worklog ni l'échafaudage du dépôt.
- Les membres peuvent utiliser une couche de sous-agent ; la délégation plus profonde est volontairement désactivée.

## Développement

Ce dépôt est un bundle DSH local sans étape de build pour le code hôte. La page client est un module `window.__ModuleLoader__.load` précompilé dans `client/index.js`.

Boucle typique :

1. Installez la copie de travail comme dépendance `link:` dans un profil DSH.
2. Modifiez les fichiers hôte/client.
3. Redémarrez DSH (les modules de preset et client se chargent au démarrage ; HMR peut gérer certains changements hôte).
4. Inspectez la route de réglages et la page Plugins.

Vérifications utiles :

```bash
node --check settings/index.js
node --check plugin/index.js
node --check plugin/modeled-teammates.js
node --check client/index.js
```

Il n'y a pas encore de suite de tests automatisés. La route de réglages, le catalogue de modèles, le flux du tableau des tâches et la persistance après redémarrage sont les vérifications manuelles les plus utiles.

## Versionnage

Versionnage sémantique. La version actuelle est **0.1.0** ; voir [CHANGELOG.md](../CHANGELOG.md). Les documents sous `docs/` portent la même version.

## Licence

MIT. Voir [LICENSE](../LICENSE).

## Remerciements

Construit sur [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) et [Cordis](https://github.com/cordiverse/cordis). L'intégration du tableau des tâches utilise le plugin [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) ; les outils d'équipe proviennent du bundle de profil officiel Agent Teams. Merci aux auteurs des plugins et à toutes les personnes qui testent ce mode sur de vrais projets de recherche.
