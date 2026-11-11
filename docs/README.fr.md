# Research Team Mode

[![powered by dsh](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness) [![DSH 0.2.x](https://img.shields.io/badge/DSH-0.2.x-4D6BFE?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness) [![license MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../LICENSE)

**Un preset d'agent DSH qui transforme une session en une petite équipe de recherche coordonnée.**

**Version 0.1.1** · **Mise à jour 2026-11-10**

<p align="center"><a href="../README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <strong>Français</strong> · <a href="README.es.md">Español</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिन्दी</a></p>

---

## Aperçu

Research Team Mode est un preset d'agent DSH pour mener une recherche de bout en bout en equipe plutot que dans un seul chat. Le Lead planifie le travail, tient le registre du worklog (fichiers de carte pour les portes utilisateur, lignes d'INDEX pour les etapes internes), repartit le travail, integre les resultats et communique avec l'utilisateur. Huit roles par defaut couvrent le conseil, la litterature et les preuves, l'acquisition de donnees, la conception d'experiences, le code, les executions, la revue independante et la redaction du paper.

Le mode est conçu pour des recherches qui s'étalent sur des jours ou des semaines, exigent des preuves traçables et bénéficient de frontières de rôles claires. Ce n'est pas un mode de questions-réponses en un seul échange : le Lead ne crée que les rôles dont une tâche a réellement besoin.

## En bref

| | |
| --- | --- |
| **Rôles par défaut** | 8 : advisor, designer, researcher, data, builder, runner, reviewer, writer |
| **Flux** | Par portes : etapes internes en lignes d'index du worklog, portes utilisateur en fichiers de carte ; creer, prendre, executer, rapporter, revoir, acceptation par l'utilisateur |
| **Achèvement** | `in_review` est le dernier arrêt de l'agent ; seul l'utilisateur peut déplacer une carte vers `done` |
| **Routage des modèles** | Provider, model et effort de raisonnement par rôle, depuis un formulaire de réglages de la page Plugins |
| **Git** | Initialisé par l'agent au début du travail substantiel ; changements destructifs sur une branche ; fusion après acceptation seulement |
| **Worklog** | `worklog/PLAN.md` + `INDEX.md` + un fichier borné par carte associée à une porte ; la reprise lit PLAN et INDEX d'abord |
| **Runtime** | PTC (`run_code` + SDK généré), une couche de sous-agent par membre |

## À qui s'adresse ce mode

- Projets de recherche qui combinent revue de littérature, implémentation, expériences et production d'article.
- Équipes qui ont besoin d'une piste de preuves reliant chaque affirmation à une source, un enregistrement d'exécution ou un journal.
- Utilisateurs qui préfèrent un conseiller et un relecteur indépendant à un agent généraliste.
- Travaux où la décision finale d'acceptation doit revenir à l'utilisateur, et non à l'agent.

**Pas pour :** les questions factuelles rapides, les modifications d'un seul fichier ou les tâches où une réponse en un seul échange suffit. Le mode demande au Lead de répondre directement aux questions simples et de mobiliser l'équipe uniquement pour une recherche substantielle.

## Comment le Lead vous parle

Les réponses du Lead relèvent de la communication scientifique, pas d'un fil d'état : d'abord l'affirmation ou le résultat avec les preuves qui le soutiennent (run id, jeu de données, métrique avec incertitude et taille d'échantillon, source), puis ce qui reste incertain, puis ce que vous devez décider. Chaque énoncé est étiqueté fait observé, inférence, hypothèse ou question ouverte, et la méthode est expliquée assez loin pour que vous puissiez suivre et continuer à apprendre.

La mécanique interne reste interne. Les passations entre agents, les nouvelles tentatives, les erreurs d'outils, la tenue du worklog et ce que l'équipe a appris en travaillant ne sont pas transmis, sauf s'ils changent la lecture d'un résultat ou bloquent une décision. Les rapports des membres sont traduits en affirmation, preuve et limites plutôt que collés.

La répartition est explicite : vous fixez la direction scientifique et jugez les preuves, l'équipe porte la charge de la recherche, de l'implémentation, de l'expérimentation et de la vérification.

Vos questions sont le contrat de ce tour. Si vous demandez un panorama, une liste d’extensions ou une décision, la réponse livre cela ; un programme de recherche, un seuil ou un critère d’arrêt s’y ajoute et ne le remplace jamais. La réponse parcourt vos questions dans l’ordre, répond à chacune avec sa preuve et le fichier où se trouve le détail, et dit clairement si l’une ne peut pas encore être traitée.

Un tour long n’est pas un tour silencieux. Si l’équipe travaille depuis plus d’une dizaine de minutes, le Lead envoie une brève réponse intermédiaire : ce qui est établi, ce qui est encore en cours de collecte et quand viendra la prochaine réponse, pour que vous puissiez infléchir avant que le calcul soit dépensé.

Un résultat négatif antérieur contraint la méthode, les données et le budget qui l’ont produit, pas l’idée. Avant de fermer une direction, on formule sa version la plus forte et on montre qu’elle échoue ; chaque « on ne peut pas l’affirmer » s’accompagne de la version qui pourrait l’être et de la preuve qui la mériterait.

## Prérequis

Research Team Mode est un preset d'agent DSH pour mener une recherche de bout en bout en equipe plutot que dans un seul chat. Le Lead planifie le travail, tient le registre du worklog (fichiers de carte pour les portes utilisateur, lignes d'INDEX pour les etapes internes), repartit le travail, integre les resultats et communique avec l'utilisateur. Huit roles par defaut couvrent le conseil, la litterature et les preuves, l'acquisition de donnees, la conception d'experiences, le code, les executions, la revue independante et la redaction du paper.

| Capacité | Fourni par | Remarques |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | Développé contre `0.2.1-rc.5` ; d'autres versions peuvent fonctionner mais ne sont pas garanties |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | Fournit `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent` et les services Team ; le preset consigne son travail dans le worklog, pas dans les taches d'equipe |
| Runtime PTC | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) et [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | Fait partie de la base DSH ; active `run_code` |

**Intégrations facultatives.** Ces plugins sont écrits par d’autres auteurs. Le preset fonctionne sans eux et n’en installe aucun ; ajoutez-en un seulement pour relier l’équipe à lui :

- **Zotero** (`dsh-zotero`) — les outils de la bibliothèque partagée (`zotero_*`) et le chemin d’import paper-fetch. Sans lui, le travail bibliographique passe par Semantic Scholar, arXiv et le web, et la table de preuves continue d’enregistrer l’affirmation, la source et la localisation.
- **Mnemon** (`dsh-mnemon`) — des notes durables entre sessions (`mnemon_*`). Sans lui, le worklog et `CHANGELOG.md` assurent la continuité.

Si une dépendance manque, le mode peut tout de même se charger partiellement, mais les outils d'équipe, le worklog ou la page de réglages seront indisponibles. Le gestionnaire de plugins ne propose pas ces bundles et ne les lie pas automatiquement.

## Installation

Ce preset est livré comme bundle DSH et publié sur npm sous le nom `dsh-research-team-preset`.

### Installer depuis la page Plugins de DSH

| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | Fournit `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent` et les services Team ; le preset consigne son travail dans le worklog, pas dans les taches d'equipe |
2. Ouvrez **Réglages → Plugins** et cliquez sur **Ajouter**.
3. Collez la source d’installation : `dsh-research-team-preset@0.1.1` pour le paquet npm, `github:ZhanRuiXin/dsh-research-team-preset#v0.1.1` pour épingler la source, ou `link:/absolute/path/to/dsh-research-team-preset` pour un checkout local.
4. **Redémarrez DSH.** Les lignes de preset et la moitié client du bundle se chargent au démarrage.
5. **Vérifiez que le bundle est activé** dans le même profil, puis **ouvrez une nouvelle session** et choisissez **Research Team Mode** dans le sélecteur de mode.

### Installer depuis la ligne de commande

```text
dsh plugin add dsh-research-team-preset@0.1.1
```

Pour épingler la source plutôt que le registre :

```text
dsh plugin add github:ZhanRuiXin/dsh-research-team-preset#v0.1.1
```


> Le mode est un bundle au niveau du profil : l’installer dans un profil ne l’active pas dans un autre. Répétez l’installation et les prérequis pour chaque profil.

## Premier lancement

Demandez au Lead de vérifier l'environnement et le worklog avant de commencer le vrai travail :

```text
list_agents                    # create only the roles the task needs
research_project               # resolve the current project root
research_workspace_init        # create worklog/PLAN.md and INDEX.md if missing
```

Une première tâche typique :

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> worklog card at user gates -> INDEX row + send_message
Members: write owner + in_progress into the INDEX row -> work -> card file handoff + send_message
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## Équipe par défaut

| Rôle | Responsabilité |
| --- | --- |
| `advisor` | Évaluation indépendante de la direction, du cadrage, des affirmations centrales, de la suffisance des preuves et de la stratégie de l'article. Constructif par défaut : ce qui tient, les quelques problèmes qui menacent le résultat, la plus petite réparation ou une alternative concrète pour chacun, puis proceed / revise / stop. Uniquement un avis, pas une porte |
| `researcher` | Recherche bibliographique, acquisition, lecture attentive, extraction de preuves et worklog de preuves affirmation → source → emplacement. Interroge d'abord la bibliothèque Zotero partagée, importe l'article complet en version de référence (version of record) avec son PDF lorsqu'un travail manque, dédoublonne par DOI/titre et partage les références `zotero://` avec l'équipe |
| `data` | Acquisition de jeux de données et de poids de modèles externes, avec disponibilité de la source et statut de licence/accès, outillage de téléchargement gérant reprise et limites de débit, vérification d'intégrité par rapport aux hachages de l'éditeur, décompression, contrat de manifeste, petit échantillon validé et registre disque. Ne rédige pas de code d'entraînement et ne modifie pas le protocole d'évaluation |
| `designer` | Possède le document de conception de l'expérience : questions et hypothèses, protocole et contrôles, baselines, ablations, métriques et plan statistique, budget de calcul, et contrôle des changements de conception pendant que des exécutions sont en cours ; ne rédige pas de code de production et ne lance pas d'expériences |
| `builder` | Code, configuration, pipelines de données, tests et points d'entrée reproductibles ; pas de longues exécutions d'entraînement |
| `runner` | Lancer et suivre l'entraînement/l'évaluation ; consigner les run ids, configurations, graines, métriques, journaux, checkpoints et chemins d'artefacts |
| `reviewer` | Vérification indépendante des notes de littérature, du code, des résultats et des affirmations/citations de l'article ; PASS/FAIL avec preuves bloquantes |
| `writer` | Brouillon d'article LaTeX : prose, sections, worklogx, légendes, citations et code de figures ; ne lance pas d'expériences et ne modifie ni le code ni les modèles |

Le Lead est responsable de la clarification de l'objectif, de la décomposition, de la gestion du worklog, de la répartition, de l'intégration, des synthèses, de l'assemblage final des livrables et de la livraison. Les membres peuvent utiliser une couche de sous-agent pour une sous-tâche délimitée ; ils ne peuvent pas créer d'équipiers. Le Lead garde son propre usage des outils léger, préfère une courte mise à jour à l'utilisateur plutôt qu'un nouvel appel routinier, et laisse le travail d'approfondissement au membre concerné.

### Bibliothèque Zotero partagée

Le researcher considère la bibliothèque Zotero de l'utilisateur comme la source bibliographique partagée de l'équipe. Il interroge d'abord les collections et les entrées existantes avant le web ouvert, réutilise les PDF joints et les passages annotés, et n'importe un article manquant que dans sa version de référence (version of record), avec le PDF joint et classé dans une collection de projet. Les imports dédoublonnent par DOI et titre, laissent les étiquettes (tags) et les collections de l'utilisateur intactes, et consignent la référence de l'entrée `zotero://` dans le worklog de preuves et sur la carte du worklog, afin que chaque équipier lise le même article et que le reviewer puisse vérifier les mêmes pages. Lorsque le texte intégral est derrière un paywall ou qu'il n'existe que des métadonnées, le researcher consigne le lien et marque cet élément de preuve comme de simples métadonnées (metadata-only) au lieu d'importer un substitut.

### Revue consultative

L'advisor est un co-penseur scientifique, pas un gardien. Il nomme d'abord ce qui tient dans le plan et pourquoi, puis au plus trois problèmes classés selon la menace qu'ils font peser sur le résultat, chacun rattaché à une étape, une affirmation ou un chiffre précis. Chaque problème arrive avec la plus petite réparation qui rendrait le plan acceptable, ou une alternative concrète avec son compromis ; un refus sec n'est pas une revue. Il distingue « cela ne peut pas répondre à la question » de « cela fonctionne mais c'est plus faible ou plus coûteux », énonce la condition sous laquelle le plan devient acceptable et termine par proceed, revise avec les changements requis, ou stop avec la direction à prendre à la place. Il juge selon la norme à laquelle le projet s'est réellement engagé et la nomme, au lieu de supposer la plus exigeante : un plan solide pour son objectif déclaré n'est pas un échec parce qu'une affirmation plus forte demanderait plus de preuves, et un objectif erroné est remonté à part comme décision de périmètre pour vous. Quand la preuve nécessaire pour juger manque, il nomme le test ou la source le moins coûteux qui trancherait. Un plan solide reçoit un soutien clair plutôt que des objections fabriquées, et un stop porte toujours une direction de remplacement. Cela reste un avis : le Lead décide et le reviewer reste la porte indépendante PASS/FAIL.

Chaque consultation est préparée par le Lead au lieu de transmettre la conversation. Le Lead traduit la question de l'utilisateur en la décision que l'advisor doit trancher, avec la thèse ou le plan en cause, les preuves actuelles et leur portée, les options sur la table, les contraintes et ce que l'utilisateur attend de la réponse ; une question vague ou surchargée est d'abord affinée, et le message brut de l'utilisateur comme l'historique interne de l'équipe ne sont pas transmis. L'advisor est consulté une fois par point de décision, non pour confirmer ce que le Lead peut déjà défendre par les preuves ni pour résumer le travail du Lead, et la réponse parvient à l'utilisateur comme conclusion scientifique et comme la décision qu'elle laisse ouverte, non comme un texte relayé.

## Responsabilité de la conception

Le Lead ne rédige pas la conception de l'expérience. Pour les travaux à forte composante de conception, le designer possède un document de conception dans l'espace de travail du projet (`docs/design/<name>.md` ou l'emplacement de conception existant du projet) : la question et les hypothèses, le protocole et les contrôles, les baselines, les ablations, les métriques et le plan statistique, le budget de calcul, ainsi qu'un journal des changements apportés à la conception pendant que des exécutions sont en cours.

Le builder met en œuvre la conception, le runner l'exécute, et le reviewer vérifie à la porte de proposition que la conception permet de répondre à la question, puis à la porte des résultats que l'exécution y correspond. L'advisor donne une lecture scientifique indépendante à la porte de proposition. Le Lead confirme que le document de conception existe et que les apports du researcher et du data sont en place, puis admet ou renvoie l'étape. Pour les travaux menés par l'implémentation, le builder rédige la conception et l'advisor la relit une fois.

## Périmètre d’écriture

Chaque rôle n’écrit que dans son propre périmètre. Advisor et reviewer n’écrivent rien ; researcher possède `literature/`, `notes/` et `docs/evidence` ; data possède `data/`, `manifests/`, les scripts de téléchargement sous `scripts/` et `reports/` ; designer possède `docs/design/` ; builder possède `src/`, `configs/` et `tests/` ; runner possède `runs/`, `logs/` et `checkpoints/` ; writer possède `paper/` et `figures/` ; le Lead n’est pas restreint. Lire, chercher et commenter les cartes reste ouvert à tous.

Le périmètre est un contrat, pas une préférence : une modification qui appartient à un autre rôle est signalée à son propriétaire plutôt qu’écrite par le mauvais membre. Advisor et reviewer démarrent en lecture seule, donc une revue signale ce qui doit changer au lieu de le changer ; un coéquipier qui a réellement besoin d’écrire hors de son périmètre reçoit une exception explicite du Lead, consignée sur la carte avant le début du travail. Tout autre rôle hérite de l'autorisation sandbox du Lead : un coéquipier n'est donc jamais plus restreint que le Lead, sauf si son rôle l'exige.

Avant qu’une carte passe à in_review, le propriétaire ou le Lead lance `research_scope_check` avec le rôle et soit les chemins modifiés, soit les commits de base et de tête. Une violation se corrige en déplaçant la modification vers son rôle ou en consignant l’exception approuvée par le Lead, jamais en élargissant le périmètre en cours de carte. Un projet peut restreindre ou étendre un périmètre dans `AGENTS.md` ou sur la carte ; pour cette étape la carte fait foi, afin qu’une session ultérieure lise la même règle.

## Admission des expériences

Le calcul se dépense pour une décision, pas pour de l'activité. Aucune exécution au-delà d'un test de fumée trivial ne démarre avant que sa règle de décision ne soit écrite, et la règle doit pouvoir répondre « arrêter ». Avant le lancement, on consigne dans le document de conception ou le worklog : la question que l'exécution tranche, l'hypothèse, le résultat attendu et la taille d'effet qui compterait comme preuve, le résultat qui la réfuterait, le critère d'arrêt, la référence à battre, le pilote le moins coûteux susceptible de trancher et le budget de calcul. Une exécution sans cette trace n'est pas admise.

Le pilote d'abord : la plus petite configuration qui peut encore réfuter l'hypothèse (une graine, un split, un sous-ensemble, un horizon plus court), lue contre le seuil préenregistré, puis une décision explicite de passer à l'échelle. Si le pilote manque le seuil, la ligne s'arrête, le résultat négatif est consigné et signalé, et l'on n'ajoute ni graines ni variantes pour diluer l'écart. Une seule variable change à la fois, le facteur de confusion est annoncé avant l'exécution, et tout changement de protocole en cours d'exécution est consigné avec sa raison. L'exécution est aussi bornée par le budget, par la répétition deux fois de la même panne et par une métrique qui ne bouge plus.

Le Lead admet l'exécution, le runner refuse de la lancer sans la trace préalable et le reviewer vérifie à la porte des résultats que l'exécution a respecté la règle préenregistrée et qu'une décision d'arrêt a été honorée plutôt que contournée.

## Continuité entre sessions

Une session est une conversation, pas le projet : le worklog, le worklog et git portent le travail, tandis que le chat, l’équipe et les tâches d’arrière-plan ne survivent pas à la session. Dans un projet qui a déjà `worklog/PLAN.md`, avant la première action substantielle, l’agent lit PLAN et INDEX, puis le bloc d’état de la carte courante, avant de planifier ou de dépenser du calcul.

Le worklog se trouve a la racine du projet renvoyee par `research_project`, et non dans un sous-repertoire de session : toutes les sessions du projet partagent un PLAN et un INDEX. PLAN, INDEX, fichiers de carte, git et memoire sont durables ; les conversations entre coequipiers et les travaux en arriere-plan n'existent que dans la session. Tout ce qu'une session ulterieure doit savoir est ecrit dans PLAN ou le fichier de carte avant la fin.

Une exécution ou une tâche longue qui dépasse le tour laisse son identifiant de tâche ou de terminal, l’hôte, l’heure de début, la fin attendue et la règle de décision qu’elle sert dans le fichier de carte ou PLAN. À la reprise, l’agent vérifie d’abord qu’elle est toujours vivante ; une exécution orpheline est réconciliée et soumise à l’utilisateur comme adopter, redémarrer ou arrêter, plutôt que relancée en silence. Une carte détenue par une session disparue est signalée à l’utilisateur pour réouverture, jamais reprise.

## Barre latérale de recherche

Le preset ajoute un onglet « Recherche » a la barre laterale droite. Il repond a ce que fait l'equipe, ce qui la bloque et quelle est la prochaine etape : objectif et jalon depuis `worklog/PLAN.md`, elements actifs de `worklog/INDEX.md`, executions recentes, documents de conception et cartes d'architecture.

Les cartes d'architecture sont des diagrammes nœuds-liens stockés en JSON sous `.research/architecture/`, un fichier par carte. L'agent les lit et les met à jour avec l'outil `research_architecture`, afin que le diagramme suive la conception au lieu de dériver dans une diapositive. Une carte est rendue en SVG dans le panneau ; un cadre de sélection sur les nœuds les sélectionne, et la note que vous écrivez est enregistrée sur la carte comme annotation que l'agent lit avant de répondre. L'onglet s'enregistre via `dsh-better-sidebar` lorsque ce plugin est installé, sinon via la barre latérale droite native.


Le panneau est un module à part sous `panel/`, séparé du formulaire de réglages, activable ou désactivable indépendamment. Il apparaît comme onglet de la barre latérale droite dans chaque conversation.

Le designer possède la carte de méthode, le builder la carte d’implémentation ; l’advisor lit les deux avant de revoir une décision de conception ou d’implémentation, et le reviewer les vérifie à la porte des résultats. Faire glisser avec le bouton du milieu déplace la vue, la molette zoome, et un cadre sur les nœuds les sélectionne pour une annotation.

## Worklog et coordination

Le preset ajoute un onglet « Recherche » a la barre laterale droite. Il repond a ce que fait l'equipe, ce qui la bloque et quelle est la prochaine etape : objectif et jalon depuis `worklog/PLAN.md`, elements actifs de `worklog/INDEX.md`, executions recentes, documents de conception et cartes d'architecture.

A la porte, le responsable ecrit la checklist avec preuves, le resume d'execution, la plage de commits et l'etape suivante dans le fichier de carte, lance `research_scope_check` sur les chemins modifies, puis passe le statut a `in_review`. Le reviewer ecrit un PASS/FAIL avec preuves ; le Lead ne rapporte l'id de carte, le statut et les preuves qu'a la porte ou quand l'utilisateur doit agir. `done` appartient a l'acceptation de l'utilisateur ; `blocked` signifie que le travail ne peut pas continuer, `canceled` qu'il ne continuera pas.

```text
User goal
Lead:  research_project -> worklog card (checklist) only at user gates
       -> INDEX row (owner, status=todo, next) + send_message
Member: write owner + in_progress into the INDEX row and the card header -> work
        -> write evidence, summary, base..head, next into the card file -> in_review
Internal steps stay INDEX rows; only user gates get a card file
Reviewer: independent PASS/FAIL with evidence in the card file
Advisor: optional independent recommendation at key decisions or final review
Lead:  scientific summary (claim, evidence, uncertainty) -> card id/status when a gate needs the user
User:  accept -> done (agents can never set done)
```

## Flux Git

Le mode initialise un suivi durable au début du travail substantiel, et l'agent juge si une demande est un vrai travail ou une simple question. Dans un espace de travail qui n'est pas encore dans un dépôt, l'agent appelle `research_workspace_init`, qui crée `worklog/PLAN.md` et `worklog/INDEX.md` et exécute `git init`. Il ne crée jamais de dépôt imbriqué et ne commit pas l'échafaudage.

Les changements destructifs ou risqués se font sur une branche nommée d'après l'étape, par exemple `task/<title>+<id>` (la carte pour le travail à porte, la tâche d'équipe pour le travail interne), plutôt que sur la branche par défaut. La carte ou la tâche d'équipe enregistre les commits de base et de tête, et le reviewer lit `git diff <base>..<head>` comme base de la revue de code et relance les vérifications d'acceptation.

Une branche n'est fusionnée qu'après l'acceptation de la carte, puis supprimée. Les artefacts générés (jeux de données, checkpoints, journaux, caches) restent hors du dépôt. Si le projet n'est pas un dépôt git, la revue s'appuie sur un instantané de hachages de fichiers et les preuves consignées sur la carte.

## Worklog

Le travail susceptible de s'étendre sur plusieurs sessions conserve un enregistrement petit et borné à côté du code. `worklog/PLAN.md` contient l'objectif, le jalon en cours, les cartes actives, les blocages et les décisions datées ; `worklog/INDEX.md` contient une ligne par carte active. Chaque carte reçoit `worklog/<task-id>.md` avec un bloc d'état courant en haut et de courtes entrées ajoutées en dessous.

À la reprise, l'agent lit d'abord PLAN et INDEX, puis seulement le bloc d'état et la fin de la carte cible, jamais le fichier entier ni le répertoire entier. PLAN reste sous environ 100 lignes, les fichiers de carte sous environ 200, et les cartes terminées sont retirées de l'index. Les modèles compacts des trois fichiers vivent dans la persona du preset, donc chaque session peut les créer ou les mettre à jour sans lire ce dépôt.

## Profils de modèle d'équipe

La page de réglages conserve plusieurs profils de modèle nommés pour les membres d'équipe par défaut et utilise celui qui est sélectionné pour le prochain spawn.

Ouvrez :

```text
Plugins → dsh-research-team-preset → research-team-settings → Configure
```

La barre de profils en haut de la page :

- **Changer** le profil (liste déroulante `团队配置`) qu'utilisera le prochain équipier par défaut.
- **新建配置** ajoute un profil avec huit lignes de rôle vides.
- **配置名称** renomme le profil sélectionné. Les noms sont obligatoires, uniques et limités à 60 caractères.
- **删除配置** supprime le profil sélectionné après un second clic de confirmation. Le dernier profil restant ne peut pas être supprimé.

Chaque profil comporte une ligne par membre par défaut :

- **Model** : une liste déroulante contenant les modèles de tous les providers, avec des en-têtes de groupe de providers non cliquables. Sélectionner un modèle définit à la fois le provider et le modèle.
- **Reasoning effort** : une seconde liste déroulante avec les efforts annoncés pour le modèle sélectionné, plus une option de valeur par défaut du modèle.

Un modèle vide signifie « hériter de la route du Lead » ; un effort vide signifie « utiliser la valeur par défaut du modèle ». `spawn_teammate_with_model` lit la valeur par défaut par rôle du profil sélectionné lorsque `model` est omis ; un `model` explicite la remplace. Le simple `spawn_teammate` hérite toujours du Lead.

Paliers de capacité suggérés, comme point de départ plutôt que comme règle :

| Rôle | Palier suggéré | Pourquoi |
| --- | --- | --- |
| `designer` | Le plus élevé | Une erreur de conception invalide toutes les exécutions |
| `advisor` | Le plus élevé, famille de modèles différente du designer | Une critique indépendante a besoin d'un autre regard |
| `builder` | Élevé | Justesse du code et contexte long |
| `reviewer` | Élevé, famille différente du builder et du runner | L'audit des preuves a besoin de son propre regard |
| `researcher` | Moyen à élevé | Jugement sur les baselines et l'état de l'art |
| `writer` | Moyen | Rédaction structurée à partir de preuves vérifiées |
| `data` | Moyen à faible | Acquisition procédurale avec des outils |
| `runner` | Moyen à faible | Fiabilité des outils plutôt que raisonnement profond |

La liste complète des profils est enregistrée d'un seul bloc, si bien que changer de profil ne perd pas les modifications faites dans un autre. La page valide les noms avant l'enregistrement et affiche le texte d'erreur du serveur lorsqu'un enregistrement est refusé.

Le nom de la ligne est important : `research-team-settings` doit rester à la **racine du paquet** `dsh-research-team-preset`. Le scanner de modules client de DSH ne découvre `dsh.client` que pour les lignes situées exactement à la racine du paquet ; un nom de sous-chemin démarre le plugin hôte mais ne charge jamais la page.

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
        "designer": { "provider": "", "model": "", "reasoningEffort": "" },
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
| Profils de modèle d'équipe | `$DSH_HOME/research-team-settings.json` | Profils nommés ; le profil actif fournit provider/model/reasoningEffort pour les huit rôles par défaut |

## Fonctionnement

- **Preset** : `cordis.patch.yml` déclare la persona, les lignes d'outils, le sous-module modeled-teammates et la ligne de réglages de premier niveau.
- **Routage par rôle** : `plugin/modeled-teammates.js` enveloppe `subagents.startActivation` avec `AsyncLocalStorage` et injecte `agentOptions` uniquement pour un appel `spawn_teammate_with_model`. Le paquet officiel Agent Teams n'est pas modifié. Cordis expose les services via un proxy traçable ; le wrapper vérifie donc son propre descripteur de propriété plutôt que l'identité de la méthode.
- **Réglages** : `settings/index.js` charge et enregistre le fichier JSON des profils et sert `GET/POST /api/dsh-research-team-settings` ; `client/index.js` enregistre l'éditeur de profils de la page Plugins via `plugins.row.config`.
- **Rafraîchissement** : `plugin/settings-store.js` détient l'instantané en mémoire, résout le profil actif à chaque lecture et à chaque spawn, et conserve le dernier instantané valide si une lecture échoue.

## Dépannage

### Les réglages semblent se réinitialiser après un redémarrage

La version 0.1.0 corrige la cause connue : l'ancien chargeur passait tout l'objet `{ roles: ... }` au normaliseur de rôles et produisait des réglages entièrement vides. Mettez à jour vers 0.1.0 ou une version ultérieure, redémarrez DSH et vérifiez que :

- `$DSH_HOME/research-team-settings.json` existe et contient les profils enregistrés ;
- les anciens fichiers `{ "roles": ... }` s'affichent comme un profil unique `默认配置` et sont réécrits sous la forme de profil au prochain enregistrement ;
- la ligne `research-team-settings` est nommée exactement `dsh-research-team-preset` ;
- l'hôte actuel exécute cette copie de travail, et non une copie installée obsolète.

### Chaque coéquipier tourne sur le modèle du Lead

Regardez la sortie de spawn imprimée au-dessus du premier message du membre. Elle affiche `requested=<provider>/<model> effort=<effort>` lorsqu'une route configurée ou explicite a été appliquée, et `requested=inherit (Lead route)` avec une ligne `note:` lorsqu'aucune route ne correspond. Un `note:` qui nomme un rôle signifie que ce rôle n'a pas de provider/model dans le profil actif ; une note indiquant que le nom n'est pas un rôle standard signifie que le nom du coéquipier ne contenait aucun mot de rôle.

Deux autres causes ne concernent pas le fichier de réglages :

- le Lead a appelé le `spawn_teammate` simple au lieu de `spawn_teammate_with_model`, qui hérite toujours du Lead. La persona demande au Lead de ne passer aucun `model` à l'outil modeled et de ne jamais revenir en arrière par doute sur les noms ;

- la ligne de réglages a été enregistrée sous un `DSH_HOME` différent de celui que lit l'hôte en cours. Comparez la ligne `settings file:` imprimée par `research_team_routes` avec `echo $DSH_HOME`.

### La page de réglages n'apparaît pas dans Plugins

- La ligne doit être la racine du paquet, et non `dsh-research-team-preset/settings`.
- La partie client nécessite un redémarrage de DSH et un rafraîchissement du navigateur après l'installation.
- Vérifiez que le bundle est activé dans le profil.

### Les outils d'équipe sont absents

| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | Fournit `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent` et les services Team ; le preset consigne son travail dans le worklog, pas dans les taches d'equipe |

### Les outils du worklog des tâches sont absents

La barre laterale « Recherche » affiche les entrees de `worklog/INDEX.md`

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
- Le mode ne lance pas automatiquement huit équipiers au démarrage de la session. Le Lead crée les rôles selon les besoins de la tâche.
- Le mode n'initialise jamais de dépôt à l'intérieur d'un dépôt existant et ne commit jamais de lui-même le worklog ni l'échafaudage du dépôt.
- Les membres peuvent utiliser une couche de sous-agent ; la délégation plus profonde est volontairement désactivée.

## Licence

MIT. Voir [LICENSE](../LICENSE).

## Remerciements

La barre laterale « Recherche » affiche les entrees de `worklog/INDEX.md`

Les notes de contribution et de développement interne se trouvent dans [DEVELOPMENT.md](../DEVELOPMENT.md).
