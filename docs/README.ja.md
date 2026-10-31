# Research Team Mode

**1 つのセッションを、小規模で連携の取れた研究チームに変える DSH エージェントプリセット。**

**バージョン 1.1.0** · **更新 2026-10-31**

<p align="center"><a href="../README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a> · <strong>日本語</strong> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिन्दी</a></p>

---

## 概要

Research Team Mode は、単一のチャットではなくチームとしてエンドツーエンドの研究を進めるための DSH エージェントプリセットです。Lead が作業を計画し、タスクボードを維持し、カードを割り当て、結果を統合し、ユーザーと対話します。7 名の既定スペシャリストが、顧問レビュー、文献と証拠、データ取得、コード、実行、独立レビュー、論文執筆を担当します。

このモードは、数日から数週間にわたる研究、追跡可能な証拠を必要とする研究、明確な役割の境界が有効な研究のために作られています。単発の Q&A モードではありません。Lead は、タスクが実際に必要とする役割だけを作成します。

## 一目でわかる概要

| | |
| --- | --- |
| **既定の役割** | 7: advisor, researcher, data, builder, runner, reviewer, writer |
| **ワークフロー** | タスクボード優先：作成、claim、実行、報告、レビュー、ユーザーによる受け入れ |
| **完了** | `in_review` がエージェントの最終地点。カードを `done` に移動できるのはユーザーだけ |
| **モデルルーティング** | Plugins ページの設定フォームから、役割ごとに provider、model、reasoning effort を指定 |
| **ランタイム** | PTC（`run_code` + 生成 SDK）。メンバーごとにサブエージェント 1 層 |

## 対象となるユーザー

- 文献レビュー、実装、実験、論文執筆を組み合わせた研究プロジェクト。
- 主張から出典、実行記録、ログまでの証拠の連鎖を必要とするチーム。
- 汎用エージェント 1 つではなく、顧問と独立したレビュアーを求めるユーザー。
- 最終的な受け入れ判断をエージェントではなくユーザーが下すべき作業。

**対象外:** 簡単な事実確認の質問、単一ファイルの編集、単発の回答で足りるタスク。このモードは Lead に対し、単純な質問には直接回答し、実質的な研究にのみチームを動員するよう指示します。

## 要件

Research Team Mode は**プロファイルレベルの DSH バンドル**です。このバンドルは、自身が利用するプロファイルバンドルをインストールも有効化もしません。DSH のパッケージインストーラーが扱うのは npm 依存関係であり、機能バンドルではありません。まず同じプロファイルで依存関係を有効化してください。

| 機能 | Provider | 備考 |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | `0.2.1-rc.5` を基準に開発。他のリリースでも動作する可能性はありますが保証はありません |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | `spawn_teammate`、`send_message`、`wait_agent`、`interrupt_agent`、および Team サービスを提供 |
| タスクボード | [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) | `taskboard_*` と Web GUI のボードを提供 |
| PTC ランタイム | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) と [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | DSH ベースの一部。`run_code` を有効化 |
| Git Bash（任意、Windows） | [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) | 必要とするエージェントに `bash` ツールを追加 |
| Web GUI | DSH Web/Desktop | 設定フォームとタスクボードに必要 |

依存関係が欠けていてもモードは部分的に読み込まれますが、チームツール、ボード、設定ページのいずれかが利用できなくなります。プラグインマネージャーはこれらのバンドルを促したり、自動でリンクしたりすることはありません。

## インストール

このリポジトリはローカルの DSH バンドルです。チェックアウトから次の手順で行います。

1. 対象のプロファイルで**前提条件を有効化**します:
   - Agent Teams: [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness)
   - タスクボード: [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard)
   - Windows では任意で [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell)。
2. Plugins ページ／プラグインマネージャーのインストール操作で、ローカルリンクを指定して**このバンドルをインストール**します:

   ```text
   link:/absolute/path/to/research-team-preset
   ```

   ローカルのフォルダパスでも構いません。このチェックアウトから更新する予定がある場合はリンクを保持してください。フォルダを置き換えた後は再インストールしてください。
3. **DSH を再起動します。** プリセットの行とバンドルのクライアント側は起動時に読み込まれます。
4. 同じプロファイルで**バンドルが有効になっていること**を確認します。
5. **新しいセッションを開き**、モードセレクターで **Research Team Mode** を選択します。
6. タスクボードの実行セッションでは、`presetId=research-team` を指定してカードを作成し、実行が同じペルソナとツールを使うようにします。

> このモードはプロファイルレベルのバンドルです。あるプロファイルにインストールしても、別のプロファイルでは有効になりません。プロファイルごとにインストールと前提条件の手順を繰り返してください。

## 初回実行

実際の作業を始める前に、Lead に環境とボードの確認を依頼してください:

```text
list_agents        # create only the roles the task needs
research_project   # resolve the current project/workspaceId
taskboard_list     # check existing cards in this project
```

典型的な最初のタスク:

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> taskboard_create(presetId=research-team) -> dispatch
Members: claim cards -> execute -> checklist + execution report -> in_review
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## 既定チーム

| 役割 | 責任 |
| --- | --- |
| `advisor` | 方向性、フレーミング、中心的な主張、証拠の十分性、論文戦略についての独立した評価。proceed / revise / stop を勧告。助言のみで、ゲートではありません |
| `researcher` | 文献検索、入手、精読、証拠の抽出、および主張 → 出典 → 位置の証拠表 |
| `data` | 外部データセットとモデル重みの取得。出所の入手可能性とライセンス／アクセス状況の追跡、再開とレート制限に対応した取得ツール、公開元ハッシュによる完全性検証、展開、manifest 契約、検証済みの小さなサンプル、ディスク台帳を担当します。訓練コードの作成や評価プロトコルの変更は行いません |
| `builder` | コード、設定、データパイプライン、テスト、再現可能なエントリーポイント。長時間の訓練実行は行いません |
| `runner` | 訓練／評価の開始と監視。実行 ID、設定、シード、メトリクス、ログ、チェックポイント、成果物のパスを記録 |
| `reviewer` | 文献ノート、コード、結果、論文の主張／引用の独立した検証。ブロッキングとなる証拠を伴う PASS/FAIL |
| `writer` | LaTeX 論文ドラフト：本文、節、表、キャプション、引用、図のコード。実験の実行やコード／モデルの変更は行いません |

Lead は、目標の明確化、分解、ボード管理、割り当て、統合、要約、最終成果物の組み立て、納品を担います。メンバーは範囲を限定したサブタスクのためにサブエージェントを 1 層だけ使えますが、チームメイトを作成することはできません。

## タスクボードのワークフロー

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

ボードが唯一のタスク台帳です。成果物の追跡をチャットだけで行わないでください。`team_task_*` は一時的な調整用であり、成果物用ではありません。

## 役割ごとのモデル設定

次の場所を開きます:

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

既定のメンバーはそれぞれ 1 行を占めます:

- **モデル**: すべての provider のモデルを含む 1 つのドロップダウン。provider のグループヘッダーはクリックできません。モデルを選ぶと provider と model の両方が設定されます。
- **推論強度**: 選択中のモデルが公開している強度に、モデルの既定値オプションを加えた 2 つ目のドロップダウン。

モデルが空の場合は「Lead のルートを継承」、強度が空の場合は「モデルの既定値を使用」を意味します。`spawn_teammate_with_model` は `model` が省略されたときに役割ごとの既定値を読み、明示的な `model` はそれを上書きします。通常の `spawn_teammate` は常に Lead を継承します。

行の名前が重要です: `research-team-settings` は**パッケージルート** `@local/dsh-research-team-preset` に置く必要があります。DSH のクライアントモジュールスキャナーは、パッケージルートに完全一致する行についてのみ `dsh.client` を検出します。サブパスの名前ではホストプラグインは起動しますが、ページは決して読み込まれません。

### 設定の保存場所

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

- JSON ファイルが信頼できる唯一の情報源です。ホストプラグインは起動時にこれを読み込み、`getSettings()` と `modelForRole()` はそこから更新されるため、ページと次のチームメイトは最新の値を参照します。
- ファイルが存在しない、または一時的に読めない場合は、消去せずに最後に正常だったメモリ内スナップショットを保持します。
- 設定ファイルはこのリポジトリには**ありません**。別途バックアップしてください。プロファイルごとではなく `DSH_HOME` ごとに存在します。
- 資格情報は保存されません。保存されるのは provider/model/effort の文字列だけです。
- 設定の保存は DSH の再起動なしで反映されます。再起動が必要なのは、設定行／クライアントページの初回インストール時と、プリセット／プラグインの変更時です。
- バージョン 1.0.0 は以前のビルドにおけるローダーのバグを修正します。ファイルは役割を `"roles"` の下に包みますが、古いローダーはオブジェクト全体を役割ノーマライザーに渡していたため、再起動後にすべて空の設定が生成されていました。現在のローダーは `"roles"` を展開し、互換性のために素の役割マップもサポートします。

## 設定リファレンス

| 設定 | 場所 | 備考 |
| --- | --- | --- |
| プリセット ID | `cordis.patch.yml` | `research-team`。タスクカードでは `presetId=research-team` を使う |
| ペルソナ | `cordis.patch.yml` | 英語のシステムプロンプト。モード全体のルール |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | `false` にすると `spawn_teammate_with_model` とそのサービスラッパーを削除 |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | modeled spawn ツールが使うサブエージェント provider。既定値は `spawn` / `fork` |
| `research-team-settings` 行 | `cordis.patch.yml` | トップレベルのホスト行。パッケージルート名を保つ |
| 役割ごとのルート | `$DSH_HOME/research-team-settings.json` | 7 つの既定役割の provider/model/reasoningEffort |

## リポジトリ構成

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

## 仕組み

- **プリセット**: `cordis.patch.yml` がペルソナ、ツール行、modeled-teammates サブモジュール、トップレベルの設定行を宣言します。
- **タスクボードのプロンプト**: `plugin/index.js` がプリセットスコープに英語のプロトコル節（`plugin:dsh-taskboard`）を登録し、現在のワークスペースを解決する `research_project` を提供します。
- **役割ごとのルーティング**: `plugin/modeled-teammates.js` が `subagents.startActivation` を `AsyncLocalStorage` でラップし、`spawn_teammate_with_model` の呼び出しに限って `agentOptions` を注入します。公式の Agent Teams パッケージには手を加えません。
- **設定**: `settings/index.js` が JSON ファイルを読み書きし、`GET/POST /api/dsh-research-team-settings` を提供します。`client/index.js` は `plugins.row.config` を通じて Plugins ページの行フォームを登録します。
- **更新**: `plugin/settings-store.js` がメモリ内スナップショットを保持し、読み取り時と spawn 時にディスクから更新します。読み取りに失敗した場合は最後に正常だったスナップショットを保持します。

## 検証チェックリスト

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

設定の永続化パスは UI なしでも確認できます:

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## トラブルシューティング

### 再起動後に設定がリセットされたように見える

バージョン 1.0.0 は既知の原因を修正します。古いローダーは `{ roles: ... }` オブジェクト全体を役割ノーマライザーに渡し、すべて空の設定を生成していました。1.0.0 以降に更新して DSH を再起動し、次を確認してください:

- `$DSH_HOME/research-team-settings.json` が存在し、保存した役割が含まれているか。
- `research-team-settings` 行の名前が正確に `@local/dsh-research-team-preset` か。
- 現在のホストがこのチェックアウトを実行しており、古いインストール済みコピーではないか。

### 設定ページが Plugins に表示されない

- 行はパッケージルートである必要があり、`@local/dsh-research-team-preset/settings` ではいけません。
- クライアント側はインストール後に DSH の再起動とブラウザのリロードが必要です。
- バンドルがプロファイルで有効になっているか確認してください。

### チームツールが見つからない

同じプロファイルで [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) を有効化し、再起動してください。インストーラーはこれを促しません。

### タスクボードのツールが見つからない

同じプロファイルで [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) を有効化し、再起動してください。

### `spawn_teammate_with_model` が利用できない

このサブモジュールは内部のサブエージェントサービスをラップしています。DSH のアップグレードでアクティベーションの形が変わる可能性があります。失敗メッセージを確認し、ラッパーをインストールできない場合は `research-modeled-teammates.enabled: false` を設定して再起動し、通常の `spawn_teammate` を使用してください。

### プリセットが一覧にない

バンドルがインストールされ有効になっていることを確認し、DSH を再起動して新しいセッションを開いてください。プリセットの宣言は起動時に読み込まれます。

### `research_project` がワークスペースを解決できない

作業ディレクトリを GUI で DSH プロジェクト／ワークスペースとして開くか、既知のプロジェクトを渡してください。ツールは推測しません。

## 既知の制限

- 役割ごとのモデルルーティングは内部サービスラッパーであり、公式の Agent Teams 拡張ではありません。DSH のアップグレードで壊れる可能性があり、フォールバックは上記に記載しています。
- プロファイルレベルの依存関係は自動ではインストールも有効化もされません。このリポジトリはそれらを文書化しますが、管理はしません。
- 役割設定は `$DSH_HOME` 配下の独立した JSON ファイルにあり、DSH 標準の設定エクスポート／バックアップには含まれません。マシンを移行する場合はファイルをコピーしてください。
- モデルメニューは provider グループ付きのネイティブ `<select>` であり、検索可能なカスタムピッカーではありません。
- このモードはセッション開始時に 7 名のチームメイトを自動生成しません。Lead がタスクの必要に応じて役割を作成します。
- メンバーはサブエージェントを 1 層まで使えます。より深い委任は意図的に無効化されています。

## 開発

このリポジトリはローカルの DSH バンドルで、ホストコードのビルド手順はありません。クライアントページは `client/index.js` 内のビルド済み `window.__ModuleLoader__.load` モジュールです。

典型的な開発ループ:

1. チェックアウトを DSH プロファイルの `link:` 依存関係としてインストールします。
2. ホスト／クライアントのファイルを編集します。
3. DSH を再起動します（プリセットとクライアントモジュールは起動時に読み込まれます。HMR が一部のホスト側変更を処理できる場合があります）。
4. 設定ルートと Plugins ページを確認します。

有用なチェック:

```bash
node --check settings/index.js
node --check plugin/index.js
node --check plugin/modeled-teammates.js
node --check client/index.js
```

自動テストスイートはまだありません。設定ルート、モデルカタログ、タスクボードのフロー、再起動後の永続化が、最も価値のある手動チェック項目です。

## バージョニング

セマンティックバージョニングを採用しています。現在のリリースは **1.1.0** です。[CHANGELOG.md](../CHANGELOG.md) を参照してください。`docs/` 配下のドキュメントも同じバージョンを持ちます。

## ライセンス

MIT。[LICENSE](../LICENSE) を参照してください。

## 謝辞

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) と [Cordis](https://github.com/cordiverse/cordis) の上に構築されています。タスクボード連携は [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) プラグインを使用し、チームツールは公式の Agent Teams プロファイルバンドルから提供されます。プラグインの作者と、実際の研究プロジェクトでこのモードを試してくれるすべての人に感謝します。
