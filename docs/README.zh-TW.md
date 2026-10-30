# Research Team Mode

**一個把單一工作階段變成小型、協同研究團隊的 DSH agent preset。**

**版本 1.0.0** · **更新 2026-10-31**

---

## 概觀

Research Team Mode 是一個 DSH agent preset，用來以團隊而非單一對話的方式執行端到端研究。Lead 負責規劃工作、維護任務看板、分派卡片、整合結果，並與使用者溝通。六名預設專家分別涵蓋顧問審查、文獻與證據、程式碼、執行、獨立複核與論文寫作。

此模式是為橫跨數天或數週、需要可追溯證據，且受益於清楚角色界線的研究而打造。它不是一次問答模式：Lead 只會建立任務實際需要的角色。

## 一覽

| | |
| --- | --- |
| **預設角色** | 6 名：advisor、researcher、builder、runner、reviewer、writer |
| **工作流程** | 任務看板優先：建立、認領、執行、回報、審查、使用者驗收 |
| **完成** | `in_review` 是 agent 的最後一站；只有使用者能把卡片移到 `done` |
| **模型路由** | 透過 Plugins 頁面的設定表單，為各角色設定 provider、model 與推理強度 |
| **執行環境** | PTC（`run_code` + 產生的 SDK），每位成員一層 subagent |

<p align="center">英文系統提示詞；完整英文 README 加上 11 種語言的完整翻譯</p>

## 適用對象

- 結合文獻回顧、實作、實驗與論文產出的研究專案。
- 需要從主張追溯到來源、執行記錄或日誌之證據鏈的團隊。
- 想要顧問與獨立審查者，而不是單一通用 agent 的使用者。
- 應由使用者做最終驗收決定，而非由 agent 決定的工作。

**不適用於：** 快速的事實性問題、單一檔案編輯，或一次回答就足夠的任務。此模式會指示 Lead 直接回答簡單問題，只在實質研究時才動員團隊。

## 需求

Research Team Mode 是一個 **profile 層級的 DSH bundle**。此 bundle 不會安裝或啟用它所使用的 profile bundle；DSH 的套件安裝器處理的是 npm 相依套件，而非功能 bundle。請先在同一個 profile 中啟用相依項目。

| 能力 | 提供者 | 備註 |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | 以 `0.2.1-rc.5` 為開發基準；其他版本可能可用但不保證 |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | 提供 `spawn_teammate`、`send_message`、`wait_agent`、`interrupt_agent` 與 Team 服務 |
| 任務看板 | [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) | 提供 `taskboard_*` 與 Web GUI 看板 |
| PTC runtime | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) 與 [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | 屬於 DSH 基礎的一部分；啟用 `run_code` |
| Git Bash（選用，Windows） | [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) | 為需要的 agent 新增 `bash` 工具 |
| Web GUI | DSH Web/Desktop | 設定表單與任務看板所必需 |

若缺少相依項目，此模式仍可部分載入，但團隊工具、看板或設定頁面將無法使用。外掛管理員不會提示這些 bundle，也不會自動連結它們。

## 安裝

此儲存庫是本機的 DSH bundle。從 checkout 開始：

1. **在目標 profile 中啟用先決條件**：
   - Agent Teams：[`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness)
   - 任務看板：[`dsh-taskboard`](https://github.com/cloader/dsh-taskboard)
   - Windows 上可選用 [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell)。
2. **安裝此 bundle**，使用 Plugins 頁面／外掛管理員的安裝動作，並使用本機連結：

   ```text
   link:/absolute/path/to/research-team-preset
   ```

   本機資料夾路徑也可行。若打算從此 checkout 更新，請保留該連結；替換資料夾後需重新安裝。
3. **重新啟動 DSH。** Preset 列與 bundle 的用戶端部分會在啟動時載入。
4. **確認 bundle 已在同一個 profile 中啟用**。
5. **開啟新的工作階段**，並在模式選擇器中選擇 **Research Team Mode**。
6. 若用於任務看板執行工作階段，建立卡片時請使用 `presetId=research-team`，讓執行使用相同 persona 與工具。

> 此模式是 profile 層級的 bundle：在一個 profile 中安裝並不會在另一個 profile 中啟用。請依每個 profile 重複安裝與先決條件步驟。

## 首次執行

在開始實際工作前，請 Lead 檢查環境與看板：

```text
list_agents        # create only the roles the task needs
research_project   # resolve the current project/workspaceId
taskboard_list     # check existing cards in this project
```

典型的首次任務：

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> taskboard_create(presetId=research-team) -> dispatch
Members: claim cards -> execute -> checklist + execution report -> in_review
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## 預設團隊

| 角色 | 職責 |
| --- | --- |
| `advisor` | 獨立評估方向、框架、核心主張、證據充分性與論文策略；建議 proceed / revise / stop。僅供顧問參考，不是關卡 |
| `researcher` | 文獻搜尋、取得、精讀、證據擷取，以及「主張 → 來源 → 位置」證據表 |
| `builder` | 程式碼、設定、資料管線、測試與可重現的進入點；不負責長時間訓練 |
| `runner` | 啟動並監控訓練／評估；記錄 run id、config、seed、指標、日誌、checkpoint 與產物路徑 |
| `reviewer` | 獨立驗證文獻筆記、程式碼、結果與論文主張／引用；以阻擋性證據給出 PASS/FAIL |
| `writer` | LaTeX 論文草稿：行文、章節、表格、圖說、引用與圖表程式碼；不執行實驗或修改程式碼／模型 |

Lead 負責目標釐清、拆解、看板管理、分派、整合、摘要、最終資產組裝與交付。成員可使用一層 subagent 處理界定清楚的子任務；他們不能建立隊友。

## 任務看板流程

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

看板是唯一的任務帳本。不要只在聊天中追蹤交付項目。`team_task_*` 用於短暫協調，不用於交付項目。

## 各角色模型設定

開啟：

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

每個預設成員佔一列：

- **Model**：一個下拉選單，包含所有 provider 的模型，並有不可點擊的 provider 群組標題。選擇模型會同時設定 provider 與 model。
- **Reasoning effort**：第二個下拉選單，列出所選模型宣告支援的推理強度，外加一個模型預設選項。

模型留空表示「沿用 Lead 的路由」；強度留空表示「使用模型預設值」。`spawn_teammate_with_model` 在省略 `model` 時會讀取各角色的預設值；明確指定 `model` 則會覆寫。單純的 `spawn_teammate` 一律沿用 Lead。

列名很重要：`research-team-settings` 必須保持在**套件根目錄** `@local/dsh-research-team-preset`。DSH 的用戶端模組掃描器只會為套件根目錄的列探索 `dsh.client`；子路徑名稱會啟動主機外掛，但永遠不會載入頁面。

### 設定儲存位置

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

- JSON 檔案是真實來源。主機外掛會在啟動時載入；`getSettings()` 與 `modelForRole()` 會從中重新整理，因此頁面與下一位隊友能看到最新值。
- 檔案遺失或暫時無法讀取時，會保留上一次良好的記憶體快照，而不是清空。
- 設定檔**不在**此儲存庫中。請另行備份。它隸屬於 `DSH_HOME`，而不是每個 profile。
- 不儲存任何憑證；只儲存 provider/model/effort 字串。
- 設定儲存無需重新啟動 DSH 即可生效。首次安裝設定列／用戶端頁面，以及變更 preset／外掛時，仍需重新啟動。
- 版本 1.0.0 修正了早期版本的載入器錯誤：檔案將角色包在 `"roles"` 之下，而舊載入器把整個物件傳給角色正規化器，導致重新啟動後設定全為空。目前的載入器會解開 `"roles"`，並為了相容性支援未包裝的角色映射。

## 設定參考

| 設定 | 位置 | 備註 |
| --- | --- | --- |
| Preset id | `cordis.patch.yml` | `research-team`；任務卡應使用 `presetId=research-team` |
| Persona | `cordis.patch.yml` | 英文系統提示詞；模式層級規則 |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | 設為 `false` 可移除 `spawn_teammate_with_model` 及其服務包裝 |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | 模型化 spawn 工具使用的 subagent provider；預設為 `spawn` / `fork` |
| `research-team-settings` 列 | `cordis.patch.yml` | 頂層主機列；請保留套件根目錄名稱 |
| 各角色路由 | `$DSH_HOME/research-team-settings.json` | 六個預設角色的 provider/model/reasoningEffort |

## 儲存庫結構

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

## 運作原理

- **Preset**：`cordis.patch.yml` 宣告 persona、工具列、modeled-teammates 子模組與頂層設定列。
- **任務看板提示詞**：`plugin/index.js` 在 preset 範圍註冊英文協定區段（`plugin:dsh-taskboard`），並提供 `research_project` 以解析目前工作區。
- **各角色路由**：`plugin/modeled-teammates.js` 以 `AsyncLocalStorage` 包裝 `subagents.startActivation`，僅在 `spawn_teammate_with_model` 呼叫時注入 `agentOptions`。官方 Agent Teams 套件未被改動。
- **設定**：`settings/index.js` 載入／儲存 JSON 檔並提供 `GET/POST /api/dsh-research-team-settings`；`client/index.js` 透過 `plugins.row.config` 註冊 Plugins 頁面的列形式。
- **重新整理**：`plugin/settings-store.js` 持有記憶體快照，在讀取與 spawn 時從磁碟重新整理，並在讀取失敗時保留上一次良好的快照。

## 驗證清單

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

設定持久化路徑可在不使用 UI 的情況下檢查：

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## 疑難排解

### 重新啟動後設定似乎重設

版本 1.0.0 修正了已知原因：舊載入器把整個 `{ roles: ... }` 物件傳給角色正規化器，產生全空的設定。請更新到 1.0.0 或更新版本、重新啟動 DSH，並檢查：

- `$DSH_HOME/research-team-settings.json` 存在且包含已儲存的角色；
- `research-team-settings` 列的名稱完全是 `@local/dsh-research-team-preset`；
- 目前主機執行的是此 checkout，而不是過時的已安裝副本。

### Plugins 中沒有出現設定頁面

- 列必須是套件根目錄，而不是 `@local/dsh-research-team-preset/settings`。
- 用戶端部分在安裝後需要重新啟動 DSH 並重新整理瀏覽器。
- 檢查 bundle 是否已在 profile 中啟用。

### 缺少團隊工具

在同一個 profile 中啟用 [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) 並重新啟動。安裝器不會提示它。

### 缺少任務看板工具

在同一個 profile 中啟用 [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) 並重新啟動。

### `spawn_teammate_with_model` 無法使用

此子模組包裝了一個內部 subagent 服務。DSH 升級可能改變啟動形態。請檢查失敗訊息；若包裝無法安裝，請設定 `research-modeled-teammates.enabled: false`、重新啟動，並改用單純的 `spawn_teammate`。

### 未列出 preset

確認 bundle 已安裝並啟用、重新啟動 DSH，然後開啟新的工作階段。Preset 宣告會在啟動時載入。

### `research_project` 無法解析工作區

在 GUI 中將工作目錄開啟為 DSH 專案／工作區，或傳入已知的專案；此工具不會猜測。

## 已知限制

- 各角色模型路由是內部服務包裝，不是官方 Agent Teams 擴充。DSH 升級可能使其失效；備援方案記載於上。
- Profile 層級相依項目不會自動安裝或啟用。此儲存庫記錄它們，但不管理它們。
- 角色設定存放在 `$DSH_HOME` 下的獨立 JSON 檔；它們不屬於 DSH 標準設定匯出／備份。移動機器時請複製該檔案。
- 模型選單是原生 `<select>` 加上 provider 群組，不是可搜尋的自訂選擇器。
- 此模式不會在工作階段開始時自動 spawn 六名隊友。Lead 會依任務需要建立角色。
- 成員可使用一層 subagent；更深的委派會被刻意停用。

## 開發

此儲存庫是本機的 DSH bundle，主機程式碼沒有建置步驟。用戶端頁面是 `client/index.js` 中預先建置的 `window.__ModuleLoader__.load` 模組。

典型循環：

1. 在 DSH profile 中將 checkout 安裝為 `link:` 相依項目。
2. 編輯主機／用戶端檔案。
3. 重新啟動 DSH（preset 與用戶端模組會在啟動時載入；HMR 可能處理部分主機變更）。
4. 檢查設定路由與 Plugins 頁面。

實用檢查：

```bash
node --check settings/index.js
node --check plugin/index.js
node --check plugin/modeled-teammates.js
node --check client/index.js
```

目前尚無自動化測試套件。設定路由、模型目錄、任務看板流程與重新啟動後的持久化是最有價值的手動檢查。

## 版本

語意化版本。目前版本是 **1.0.0**；參見 [CHANGELOG.md](../CHANGELOG.md)。`docs/` 下的文件帶有相同版本。

## 授權

MIT。參見 [LICENSE](../LICENSE)。

## 致謝

建構於 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 與 [Cordis](https://github.com/cordiverse/cordis) 之上。任務看板整合使用 [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) 外掛；團隊工具來自官方 Agent Teams profile bundle。感謝外掛作者，以及所有在真實研究專案上測試此模式的人。
