# Research Team Mode

**一個把單一工作階段變成小型、協同研究團隊的 DSH agent preset。**

**版本 0.1.0** · **更新 2026-10-31**

<p align="center"><a href="../README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <strong>繁體中文</strong> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिन्दी</a></p>

---

## 概觀

Research Team Mode 是一個 DSH agent preset，用來以團隊而非單一對話的方式執行端到端研究。Lead 負責規劃工作、維護兩套記錄（使用者關卡用看板卡片，內部步驟用團隊任務）、分派工作、整合結果，並與使用者溝通。七名預設專家分別涵蓋顧問審查、文獻與證據、資料取得、程式碼、執行、獨立複核與論文寫作。

此模式是為橫跨數天或數週、需要可追溯證據，且受益於清楚角色界線的研究而打造。它不是一次問答模式：Lead 只會建立任務實際需要的角色。

## 一覽

| | |
| --- | --- |
| **預設角色** | 7 名：advisor、researcher、data、builder、runner、reviewer、writer |
| **工作流程** | 關卡制：內部步驟在 `team_task_*` 中，使用者關卡在看板上；建立、認領、執行、回報、審查、使用者驗收 |
| **完成** | `in_review` 是 agent 的最後一站；只有使用者能把卡片移到 `done` |
| **模型路由** | 透過 Plugins 頁面的設定表單，為各角色設定 provider、model 與推理強度 |
| **Git** | 實質性工作開始時由 agent 初始化；破壞性改動走分支；驗收通過後才合併 |
| **Worklog** | `worklog/PLAN.md` + `INDEX.md` + 每張關卡卡片一個有界檔案；恢復時先讀 PLAN 和 INDEX |
| **執行環境** | PTC（`run_code` + 產生的 SDK），每位成員一層 subagent |

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
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | 提供 `spawn_teammate`、`send_message`、`wait_agent`、`interrupt_agent`、`team_task_*` 與 Team 服務 |
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
Lead: research_project -> taskboard_create only at user gates -> team_task_create -> send_message
Members: team_task_update (claim) -> work -> complete + send_message; gated steps also claim the card
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## 預設團隊

| 角色 | 職責 |
| --- | --- |
| `advisor` | 獨立評估方向、框架、核心主張、證據充分性與論文策略；建議 proceed / revise / stop。僅供顧問參考，不是關卡 |
| `researcher` | 文獻搜尋、取得、精讀、證據擷取，以及「主張 → 來源 → 位置」證據表 |
| `data` | 外部資料集與模型權重的取得，包含來源可得性與授權／存取狀態追蹤、含續傳與限速處理的下載工具、依發布方雜湊值做的完整性校驗、解壓縮、manifest 契約、小型驗證樣本與磁碟帳本；不寫訓練程式碼，也不改評估協定 |
| `builder` | 程式碼、設定、資料管線、測試與可重現的進入點；不負責長時間訓練 |
| `runner` | 啟動並監控訓練／評估；記錄 run id、config、seed、指標、日誌、checkpoint 與產物路徑 |
| `reviewer` | 獨立驗證文獻筆記、程式碼、結果與論文主張／引用；以阻擋性證據給出 PASS/FAIL |
| `writer` | LaTeX 論文草稿：行文、章節、表格、圖說、引用與圖表程式碼；不執行實驗或修改程式碼／模型 |

Lead 負責目標釐清、拆解、看板管理、分派、整合、摘要、最終資產組裝與交付。成員可使用一層 subagent 處理界定清楚的子任務；他們不能建立隊友。 Lead 控制自己的工具呼叫量，能用一句進度回覆說清的事不再多跑一次工具，深入的工作交給對應成員。

## 任務看板流程

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

只有需要使用者審查或驗收的步驟才建立看板卡片，例如交付項目節點、需要使用者確認的範圍決策、風險改動和最終交接。內部步驟、自行核准的子任務以及成員之間的交接用 `team_task_*` 追蹤，不進入看板；到達驗收節點時，交付項目、證據和評審結論都記錄在卡片上。團隊成員之間以英文協作；面向使用者的回覆、卡片與交付項目則使用使用者的語言。 需要使用者決定或補充資訊時，Lead 用 `ask_user_question` 直接詢問，而不是把等待狀態留在卡片上；詢問逾時後，Lead 徵詢顧問的独立建議並記錄下來，然後繼續推進。

## Git 工作流程

此模式在實質性工作開始時初始化耐久記錄，由 agent 判斷請求是真正的工作還是簡單問題。工作區還不在任何儲存庫裡時，agent 呼叫 `research_workspace_init`，它會建立 `worklog/PLAN.md` 和 `worklog/INDEX.md`，並執行 `git init`。它不會建立巢狀儲存庫，也不會提交腳手架。

破壞性或風險較高的改動在依步驟命名的分支上進行，例如 `task/<title>+<id>`（有使用者關卡的工作用卡片，內部工作用團隊任務），不直接改預設分支。卡片或團隊任務記錄 base 與 head 提交，reviewer 以 `git diff <base>..<head>` 作為程式碼審查依據，並仍會重跑驗收檢查。

分支只在卡片被驗收後合併，合併後刪除。資料集、checkpoint、日誌、快取等產物不納入版本庫。專案不是 git 儲存庫時，審查退回用檔案雜湊快照加卡片上記錄的證據。

## 工作日誌

可能跨工作階段的工作會在程式碼旁邊保留一份小而受限的記錄。`worklog/PLAN.md` 存目標、目前里程碑、活躍卡片、阻塞項與帶日期的決策；`worklog/INDEX.md` 每張活躍卡一行。每張卡有 `worklog/<task-id>.md`，頂部是目前狀態區塊，下面是簡短的追加條目。

恢復時 agent 先讀 PLAN 和 INDEX，再只讀目標卡的狀態區塊與尾部，不整讀檔案也不整讀目錄。PLAN 控制在約一百行，單卡檔案約兩百行，完成的卡從索引撤掉。三種檔案的精簡範本就在預設 persona 裡，任何工作階段都能直接建立或更新，不需要讀本儲存庫。

## 團隊模型配置

設定頁面會為預設團隊成員保留多個具名模型配置，並在下一次 spawn 時使用選取的那一個。

開啟：

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

頁面頂端的配置列：

- **切換**：選取下一次預設隊友要使用的配置（`团队配置` 下拉選單）。
- **新建配置**：追加一個含七個空白角色列的配置。
- **配置名称**：重新命名選取的配置。名稱為必填、唯一，且最多 60 個字元。
- **删除配置**：二次確認點擊後刪除選取的配置。最後一個配置無法刪除。

每個配置中，每個預設成員各佔一列：

- **Model**：一個下拉選單，包含所有 provider 的模型，並有不可點擊的 provider 群組標題。選擇模型會同時設定 provider 與 model。
- **Reasoning effort**：第二個下拉選單，列出所選模型宣告支援的推理強度，外加一個模型預設選項。

模型留空表示「沿用 Lead 的路由」；強度留空表示「使用模型預設值」。`spawn_teammate_with_model` 在省略 `model` 時會讀取所選配置中各角色的預設值；明確指定 `model` 則會覆寫。單純的 `spawn_teammate` 一律沿用 Lead。

整份配置清單會一起儲存，因此切換配置不會丟棄在另一個配置中所做的編輯。頁面在儲存前會驗證名稱，儲存被拒絕時會顯示伺服器的錯誤文字。

列名很重要：`research-team-settings` 必須保持在**套件根目錄** `@local/dsh-research-team-preset`。DSH 的用戶端模組掃描器只會為套件根目錄的列探索 `dsh.client`；子路徑名稱會啟動主機外掛，但永遠不會載入頁面。

### 設定儲存位置

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

- `activeProfileId` 指定下一位隊友要使用的配置。該值缺少或未知時，伺服器會回退到第一個配置。
- 舊檔案（`{ "roles": { ... } }` 或未包裝的角色映射）會在記憶體中遷移為單一具名 `默认配置` 的配置；檔案會在下一次儲存時改寫為配置結構。舊的 `POST { "roles": ... }` 只會更新作用中的配置，因此舊指令碼不會丟掉其他配置。
- JSON 檔案是真實來源。主機外掛會在啟動時載入；`getSettings()` 與 `modelForRole()` 會從中重新整理，因此頁面與下一位隊友能看到最新值。
- 檔案遺失或暫時無法讀取時，會保留上一次良好的記憶體快照，而不是清空。
- 設定檔**不在**此儲存庫中。請另行備份。它隸屬於 `DSH_HOME`，而不是每個 profile。
- 不儲存任何憑證；只儲存配置名稱與 provider/model/effort 字串。
- 設定儲存無需重新啟動 DSH 即可生效：設定存放區會重新讀取檔案，下一次 spawn 會解析作用中的配置。變更此外掛本身的程式碼仍需重新啟動 DSH，因為主機部分會在主機層級註冊 WebSocket/HTTP 路由與 Plugins 頁面插槽。
- 版本 0.1.0 修正了早期版本的載入器錯誤：檔案將角色包在 `"roles"` 之下，而舊載入器把整個物件傳給角色正規化器，導致重新啟動後設定全為空。目前的載入器會解開 `"roles"`、遷移舊檔案，並為了相容性支援未包裝的角色映射。

## 設定參考

| 設定 | 位置 | 備註 |
| --- | --- | --- |
| Preset id | `cordis.patch.yml` | `research-team`；任務卡應使用 `presetId=research-team` |
| Persona | `cordis.patch.yml` | 英文系統提示詞；模式層級規則 |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | 設為 `false` 可移除 `spawn_teammate_with_model` 及其服務包裝 |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | 模型化 spawn 工具使用的 subagent provider；預設為 `spawn` / `fork` |
| `research-team-settings` 列 | `cordis.patch.yml` | 頂層主機列；請保留套件根目錄名稱 |
| 團隊模型配置 | `$DSH_HOME/research-team-settings.json` | 具名配置；作用中的配置為七個預設角色提供 provider/model/reasoningEffort |

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

## 運作原理

- **Preset**：`cordis.patch.yml` 宣告 persona、工具列、modeled-teammates 子模組與頂層設定列。
- **任務看板提示詞**：`plugin/index.js` 在 preset 範圍註冊英文協定區段（`plugin:dsh-taskboard`），並提供 `research_project` 以解析目前工作區。
- **各角色路由**：`plugin/modeled-teammates.js` 以 `AsyncLocalStorage` 包裝 `subagents.startActivation`，僅在 `spawn_teammate_with_model` 呼叫時注入 `agentOptions`。官方 Agent Teams 套件未被改動。 Cordis 對服務回傳可追蹤代理，因此包裝器改為檢查自身屬性描述符，而不比較方法身分。
- **設定**：`settings/index.js` 載入／儲存配置 JSON 檔並提供 `GET/POST /api/dsh-research-team-settings`；`client/index.js` 透過 `plugins.row.config` 註冊 Plugins 頁面的配置編輯器。
- **重新整理**：`plugin/settings-store.js` 持有記憶體快照，在每次讀取與 spawn 時解析作用中的配置，並在讀取失敗時保留上一次良好的快照。

## 驗證清單

```text
plugin_manager list_plugins              # bundle active
Config.listConfigs name=@deepseek-ai/dsh-agent-preset   # include:preset-research-team
new session -> Research Team Mode
list_agents                              # roles can be created
research_project                         # returns the current workspaceId
taskboard_list                           # matches the GUI board
Plugins -> bundle -> research-team-settings -> Configure   # 頁面可見
新建配置 -> 命名 -> 儲存 -> 重新開啟頁面 -> 兩個配置都會列出
選擇另一個配置 -> 儲存 -> spawn_teammate_with_model 會使用它
刪除一個配置 -> 儲存 -> 只剩剩餘的那個配置
舊 {roles} 檔案 -> 重新啟動 -> 顯示為 默认配置
儲存某個角色的模型 -> 重新啟動 -> 頁面仍會顯示
```

設定持久化路徑可在不使用 UI 的情況下檢查：

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## 疑難排解

### 重新啟動後設定似乎重設

版本 0.1.0 修正了已知原因：舊載入器把整個 `{ roles: ... }` 物件傳給角色正規化器，產生全空的設定。請更新到 0.1.0 或更新版本、重新啟動 DSH，並檢查：

- `$DSH_HOME/research-team-settings.json` 存在且包含已儲存的配置；
- 舊的 `{ "roles": ... }` 檔案會顯示為單一 `默认配置` 配置，並在下一次儲存時改寫為配置結構；
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
- 團隊模型配置存放在 `$DSH_HOME` 下的獨立 JSON 檔；它們不屬於 DSH 標準設定匯出／備份的一部分。移動機器時請複製該檔案。
- 模型選單是原生 `<select>` 加上 provider 群組，不是可搜尋的自訂選擇器。
- 此模式不會在工作階段開始時自動 spawn 七名隊友。Lead 會依任務需要建立角色。
- 此模式不會在既有儲存庫內部再初始化儲存庫，也不會自行提交工作日誌或儲存庫腳手架。
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

語意化版本。目前版本是 **0.1.0**；參見 [CHANGELOG.md](../CHANGELOG.md)。`docs/` 下的文件帶有相同版本。

## 授權

MIT。參見 [LICENSE](../LICENSE)。

## 致謝

建構於 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 與 [Cordis](https://github.com/cordiverse/cordis) 之上。任務看板整合使用 [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) 外掛；團隊工具來自官方 Agent Teams profile bundle。感謝外掛作者，以及所有在真實研究專案上測試此模式的人。
