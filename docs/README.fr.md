# Research Team Mode — Français

**Version :** 1.0.0 · **Mise à jour :** 2026-10-31

**Langues :** [English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Deutsch](README.de.md) · **Français** · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md)

> Cette page est une courte introduction. La documentation complète de référence se trouve dans le [English README](../README.md).

## Présentation

Research Team Mode est un preset d'agent DSH qui transforme une session en une petite équipe de recherche coordonnée. Le Lead planifie le travail, tient le tableau des tâches, répartit les cartes, intègre les résultats et dialogue avec l'utilisateur. Six rôles par défaut couvrent le conseil, la littérature et les preuves, le code, les exécutions, la revue indépendante et la rédaction de l'article.

Le mode s'adresse aux recherches qui durent des jours ou des semaines, exigent une traçabilité des preuves et bénéficient de frontières de rôles claires. Il n'est pas conçu pour une question ponctuelle ou une petite modification unique.

## Pour qui

- Les projets qui combinent revue de littérature, implémentation, expériences et production d'article.
- Les équipes qui veulent relier chaque affirmation à une source, un journal d'exécution ou un enregistrement de run.
- Les utilisateurs qui préfèrent un conseiller et un relecteur indépendant à un agent généraliste.
- Les travaux où la validation finale doit rester une décision humaine.

## Fonctionnalités

- **Six rôles par défaut** : advisor (conseil scientifique), researcher (littérature et preuves), builder (code), runner (entraînement et exécution), reviewer (revue), writer (rédaction).
- **Le tableau des tâches d'abord** : le Lead crée les cartes, les membres les prennent en charge et soumettent un rapport d'exécution, le reviewer vérifie indépendamment.
- **Modèle par rôle** : la page de configuration du plugin permet de choisir provider, model et effort de raisonnement pour chaque membre.
- **Achèvement réservé à l'utilisateur** : un agent va jusqu'à `in_review` ; seul l'utilisateur passe une carte à `done` dans l'interface.
- **Runtime PTC** : `run_code` et le SDK généré regroupent les opérations par lots et réduisent les allers-retours.
- **Traçabilité** : les preuves, les exécutions et les décisions restent dans les commentaires des cartes.

## Démarrage rapide

1. Dans le même profil DSH, activer Agent Teams (`@deepseek-ai/dsh-experimental-agent-team-profile`) et `dsh-taskboard`.
2. Installer ce bundle via un chemin local ou `link:`, puis redémarrer DSH.
3. Ouvrir une nouvelle session et choisir « Research Team Mode » ; les cartes utilisent `presetId=research-team`.
4. Dans « Plugins → @local/dsh-research-team-preset → research-team-settings → Configure », définir les modèles par défaut.

L'installation complète, la configuration, le flux du tableau des tâches et les problèmes connus sont documentés dans le [English README](../README.md). Cette page est une traduction assistée par IA ; les corrections sont bienvenues.
