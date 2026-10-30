# Research Team Mode — 日本語

**バージョン:** 1.0.0 · **更新:** 2026-10-31

**言語:** [English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · **日本語** · [한국어](README.ko.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md)

## 概要

Research Team Mode は、1 つのセッションを小規模で協調的な研究チームに変える DSH エージェントプリセットです。Lead が目標の整理、タスク分解、タスクボード管理、割り当て、結果の統合、ユーザーとの対話を担当し、6 名の既定メンバーが顧問評価、文献と証拠、コード、実行、独立レビュー、論文執筆を分担します。

数日から数週間にわたる研究で、証拠の追跡と役割の境界が必要な作業に向いています。単発の質問や小さな修正には向いていません。

## 対象

- 文献レビュー、実装、実験、論文執筆を組み合わせた研究プロジェクト。
- 主張を論文、ログ、実行記録まで追跡できるようにしたいチーム。
- 汎用 agent 1 つではなく、顧問と独立レビュアーを置きたいユーザー。
- 最終的な受け入れ判断をユーザー自身が行いたい作業。

## 主な機能

- **6 名の既定メンバー**: advisor（学術顧問）、researcher（資料担当）、builder（コード構築）、runner（訓練と実行）、reviewer（レビュー）、writer（論文執筆）。
- **タスクボード優先**: Lead がカードを作成し、メンバーが引き受けて実行し、実行レポートを提出、reviewer が独立に確認します。
- **役割ごとのモデル**: プラグイン設定ページで、メンバーごとに provider、model、推論強度を選べます。
- **完了はユーザーのみ**: agent はカードを `in_review` まで進められますが、`done` は GUI でユーザーだけが確定できます。
- **PTC ランタイム**: `run_code` と生成された SDK でバッチ操作をまとめ、往復を減らします。
- **追跡可能性**: 証拠、実行記録、決定はタスクカードのコメントに残します。

## クイックスタート

1. 同じ DSH profile で Agent Teams（`@deepseek-ai/dsh-experimental-agent-team-profile`）と `dsh-taskboard` を有効にします。
2. この bundle をローカルパスまたは `link:` でインストールし、DSH を再起動します。
3. 新しいセッションを開き、「Research Team Mode」を選びます。タスクカードには `presetId=research-team` を設定します。
4. 「Plugins → @local/dsh-research-team-preset → research-team-settings → Configure」で既定モデルを設定します。

インストール、設定、タスクボード、既知の問題の詳細は [English README](../README.md) を参照してください。このページは AI 支援の翻訳です。修正を歓迎します。
