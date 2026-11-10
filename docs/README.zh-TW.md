# Research Team Mode

[![powered by dsh](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness) [![DSH 0.2.x](https://img.shields.io/badge/DSH-0.2.x-4D6BFE?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness) [![license MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../LICENSE)

**一個把單一工作階段變成小型、協同研究團隊的 DSH agent preset。**

**版本 0.1.1** · **更新 2026-11-10**

<p align="center"><a href="../README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <strong>繁體中文</strong> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिन्दी</a></p>

---

## 概觀

Research Team Mode 是一個 DSH agent preset，用來以團隊而非單一對話的方式執行端到端研究。Lead 負責規劃工作、維護兩套記錄（使用者關卡用看板卡片，內部步驟用團隊任務）、分派工作、整合結果，並與使用者溝通。八名預設專家分別涵蓋顧問審查、文獻與證據、資料取得、實驗設計、程式碼、執行、獨立複核與論文寫作。

此模式是為橫跨數天或數週、需要可追溯證據，且受益於清楚角色界線的研究而打造。它不是一次問答模式：Lead 只會建立任務實際需要的角色。

## 一覽

| | |
| --- | --- |
| **預設角色** | 8 名：advisor、designer、researcher、data、builder、runner、reviewer、writer |
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

## Lead 如何與你溝通

Lead 的回覆是科學性溝通，而不是狀態播報：先給結論或結果，再給支撐它的證據（run id、資料集、指標及其不確定度與樣本量、來源），然後說明哪裡仍不確定，最後是需要你決定的事項。每句話都標明其性質——觀察到的事實、推論、假設或尚未解決的問題——方法要講到你能跟上並持續學習為止。

內部機制留在內部。agent 之間的交接、重試、工具報錯、看板記帳，以及團隊在工作中得到的經驗，除非會改變某個結果的解讀或阻礙決策，否則不轉發給你。成員報告會被轉述為「主張—證據—邊界」，而不是原樣貼上。

分工是明確的：你決定科學方向並判斷證據，團隊承擔檢索、實作、實驗與驗證的工作量。

你的問題就是這一輪的契約。你要的是綜述、可拓展方向或一個決定，回答就先交付這些；研究計畫、門檻或終止條件只是補充，不能替代。回覆按你的問題逐條作答，每條給出證據和完整細節所在檔案；暫時答不了的，直說還缺什麼。

長回合不等於沉默。團隊連續工作超過約十分鐘，Lead 先給一條簡短的中間答覆，說明已經定了什麼、還在收集什麼、下一條答覆何時來，讓你能在算力花完之前改變方向。

前人的否定性結果約束的是產生它的方法、資料和預算，不是這個想法本身。關閉一個方向之前，要先把想法的最強版本寫出來並證明它仍然失敗；每一句「無法主張」都要配上一句「在什麼條件下可以主張」以及需要什麼證據。

## 需求

Research Team Mode 是一個 **profile 層級的 DSH bundle**。此 bundle 不會安裝或啟用它所使用的 profile bundle；DSH 的套件安裝器處理的是 npm 相依套件，而非功能 bundle。請先在同一個 profile 中啟用相依項目。

| 能力 | 提供者 | 備註 |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | 以 `0.2.1-rc.5` 為開發基準；其他版本可能可用但不保證 |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | 提供 `spawn_teammate`、`send_message`、`wait_agent`、`interrupt_agent`、`team_task_*` 與 Team 服務 |
| PTC runtime | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) 與 [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | 屬於 DSH 基礎的一部分；啟用 `run_code` |

**可選聯動外掛。** 這些是他人開發的外掛；本 preset 不依賴它們，也不會安裝它們，安裝只為與團隊聯動：

- **任務看板**（[`dsh-taskboard`](https://github.com/cloader/dsh-taskboard)）——提供 `taskboard_*`、面向使用者的卡片、驗收清單和 `presetId=research-team` 執行工作階段。沒有它時，worklog（`PLAN.md`、`INDEX.md`、逐卡檔案）是持久記錄。
- **Zotero**（`dsh-zotero`）——提供共享文獻庫工具（`zotero_*`）與 paper-fetch 匯入路徑。沒有它時，文獻工作改用 Semantic Scholar、arXiv 與網路檢索，證據表仍記錄 claim、來源與位置。
- **Mnemon**（`dsh-mnemon`）——提供跨工作階段的持久筆記（`mnemon_*`）。沒有它時，由 worklog 與 `CHANGELOG.md` 承擔連續性。

若缺少相依項目，此模式仍可部分載入，但團隊工具、看板或設定頁面將無法使用。外掛管理員不會提示這些 bundle，也不會自動連結它們。

## 安裝

此 preset 以 DSH bundle 形式發佈，npm 套件名為 `dsh-research-team-preset`。

### 從 DSH 外掛頁面安裝

1. **啟用必需的 bundle**：在目標 profile 中啟用 Agent Teams [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness)。上面的可選聯動外掛可以現在安裝，也可以之後再加。
2. 開啟 **設定 → 外掛**，點擊 **新增**。
3. 貼上安裝來源：npm 套件用 `dsh-research-team-preset@0.1.1`；固定原始碼用 `github:ZhanRuiXin/dsh-research-team-preset#v0.1.1`；本機 checkout 用 `link:/absolute/path/to/dsh-research-team-preset`。
4. **重新啟動 DSH。** preset 列與 bundle 的用戶端部分在啟動時載入。
5. **確認 bundle 在同一個 profile 中已啟用**，然後**開啟新工作階段**，在模式選擇器中選擇 **Research Team Mode**。

### 從命令列安裝

```text
dsh plugin add dsh-research-team-preset@0.1.1
```

若要固定原始碼而不是從 registry 安裝：

```text
dsh plugin add github:ZhanRuiXin/dsh-research-team-preset#v0.1.1
```

任務看板的執行工作階段請建立帶 `presetId=research-team` 的卡片，讓執行沿用同一套 persona 與工具。

> 此模式是 profile 層級的 bundle：在一個 profile 中安裝不會在另一個 profile 中啟用。每個 profile 都要重複安裝與前置步驟。

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
| `advisor` | 獨立評估研究方向、問題框定、核心主張、證據充分性與論文策略。預設以建設性方式給意見：先說站得住的部分，再指出少數會威脅結果的問題，並為每個問題給出最小修補或一個具體替代方案，最後給出 proceed / revise / stop。僅提供建議，不是關卡 |
| `researcher` | 文獻搜尋、取得、精讀、證據擷取，以及「主張 → 來源 → 位置」證據表；優先搜尋共享 Zotero 文獻庫，缺少所需文獻時匯入附帶 PDF 的正式版全文，依 DOI／標題去重，並與團隊分享 `zotero://` 參照 |
| `data` | 外部資料集與模型權重的取得，包含來源可得性與授權／存取狀態追蹤、含續傳與限速處理的下載工具、依發布方雜湊值做的完整性校驗、解壓縮、manifest 契約、小型驗證樣本與磁碟帳本；不寫訓練程式碼，也不改評估協定 |
| `designer` | 擁有實驗設計文件：問題與假設、協定與對照、基線、消融、指標與統計計畫、算力預算，以及執行進行中的設計變更控制；不寫正式程式碼，也不執行實驗 |
| `builder` | 程式碼、設定、資料管線、測試與可重現的進入點；不負責長時間訓練 |
| `runner` | 啟動並監控訓練／評估；記錄 run id、config、seed、指標、日誌、checkpoint 與產物路徑 |
| `reviewer` | 獨立驗證文獻筆記、程式碼、結果與論文主張／引用；以阻擋性證據給出 PASS/FAIL |
| `writer` | LaTeX 論文草稿：行文、章節、表格、圖說、引用與圖表程式碼；不執行實驗或修改程式碼／模型 |

Lead 負責目標釐清、拆解、看板管理、分派、整合、摘要、最終資產組裝與交付。成員可使用一層 subagent 處理界定清楚的子任務；他們不能建立隊友。 Lead 控制自己的工具呼叫量，能用一句進度回覆說清的事不再多跑一次工具，深入的工作交給對應成員。

### 共享 Zotero 文獻庫

researcher 把使用者的 Zotero 文獻庫當作團隊的共享文獻來源：先搜尋既有的分類與條目，再搜尋公開網路；重複使用已附加的 PDF 與註記片段；只有在缺少某篇文獻時，才匯入正式版本（version of record）全文，附上 PDF 並歸檔到專案分類中。匯入時依 DOI 與標題去重，不去更動使用者的標籤與分類，並把 `zotero://` 條目參照記錄到證據表和看板卡片上，讓每位隊友讀到同一篇論文，reviewer 也能抽查相同的頁面。當全文受付費牆限制或只有中繼資料時，researcher 會記錄連結，並將證據標記為僅中繼資料，而不是匯入替代品。

### 顧問審查

顧問是科學上的共同思考者，而不是守門人。它先說明計畫中哪些部分成立、為什麼成立，然後按對結果的威脅程度排序，最多指出三個問題，每個問題都錨定到具體的步驟、主張或數字。每個問題都附帶能讓計畫變得可接受的最小修補，或一個帶有取捨說明的具體替代方案；只給否決不構成一次審查。它把「這個方案回答不了問題」與「這個方案可行，但更弱或更昂貴」區分開，說明計畫在什麼條件下可以接受，最後給出 proceed、revise（列出必須的修改）或 stop（並給出應改走的方向）。它按專案實際承諾的標準評判並說出該標準，而不是假定最嚴苛的標準：一個對其既定目標成立的計畫，不會因為更強的主張需要更多證據就算失敗；目標本身不對時，單獨作為範圍決策交給你。判斷所需的證據缺失時，它指出能定論的最便宜實驗或來源。方案成立就明確背書，而不是製造疑慮；stop 一定附帶替代方向。它仍然只是建議：由 Lead 決定，reviewer 仍是獨立的 PASS/FAIL 關卡。

每次諮詢都由 Lead 準備，而不是把對話直接轉交。Lead 把使用者的問題翻譯成 advisor 必須回答的決策，並附上涉及的論斷或方案、當前證據及其範圍、擺在桌面上的選項、限制，以及使用者需要從這個回答裡得到什麼；含糊或過載的問題先被收窄，使用者的原始訊息和團隊內部經過不會一併轉過去。每個決策點只諮詢一次，不用來確認 Lead 已有證據能自己辯護的結論，也不讓 advisor 替 Lead 總結它自己的工作；advisor 的回覆以科學結論的形式回到使用者面前，說明它帶來什麼改變、還留下什麼決定，而不是轉發原文。

## 設計歸屬

Lead 不撰寫實驗設計。對於以設計為主的工作，designer 在專案工作區中擁有一份設計文件（`docs/design/<name>.md` 或專案既有的設計位置）：問題與假設、協定與對照、基線、消融、指標與統計計畫、算力預算，以及執行進行中所做的設計變更日誌。

builder 實作該設計，runner 執行該設計，reviewer 在提案關卡檢查該設計能否回答所提出的問題，並在結果關卡檢查執行是否與設計一致。advisor 在提案關卡給出獨立的科學判斷。Lead 確認設計文件存在，且 researcher 與 data 的輸入已就位，然後接納或退回該步驟。對於以實作為主的工作，由 builder 起草設計，advisor 審閱一次。

## 寫入範圍

每個角色只在自己的寫入範圍內寫檔案：advisor 和 reviewer 不寫任何檔案；researcher 擁有 `literature/`、`notes/` 和 `docs/evidence`；data 擁有 `data/`、`manifests/`、`scripts/` 下的下載腳本和 `reports/`；designer 擁有 `docs/design/`；builder 擁有 `src/`、`configs/` 和 `tests/`；runner 擁有 `runs/`、`logs/` 和 `checkpoints/`；writer 擁有 `paper/` 和 `figures/`；Lead 不受限制。讀取、檢索和卡片評論對所有人開放。

寫入範圍是契約而不是偏好：屬於其他角色的變更要回報給該擁有者，而不是由錯誤的成員直接寫。advisor 和 reviewer 以唯讀方式啟動，所以評審只回報需要改什麼，而不去改；確實需要越界寫入的隊友，必須在開工前拿到 Lead 的明確豁免，並記錄在卡片上。 其他所有角色繼承 Lead 的 sandbox 權限，因此除非角色要求，隊友永遠不會比 Lead 受到更強限制。

卡片進入 in_review 之前，由擁有者或 Lead 用角色名加上變更路徑（或 base 與 head 提交）執行 `research_scope_check`。越界要嘛把變更交給所屬角色，要嘛記錄 Lead 批准的豁免，絕不在卡片進行中放寬範圍。專案可以在 `AGENTS.md` 或卡片上收窄或擴展某個範圍，該步驟以卡片為準，後續工作階段讀到同一條規則。

## 實驗准入

算力花在決策上，而不是花在忙碌上。超出簡單冒煙測試的任何執行，在寫下決策規則之前都不開始，而且規則必須能夠給出「停止」這個結果。啟動前把預檢記錄在設計文件或工作日誌裡：這次執行要結算的問題、假設、預期結果以及算作支持所需的效應量、能推翻它的結果、停止條件、必須超過的基準線、能結算它的最小試點，以及算力預算。沒有這份記錄的執行不予准入。

先跑試點：用仍有可能證偽假設的最小配置（一個種子、一個劃分、一個子集、更短的訓練時長），對照預註冊閾值讀結果，然後明確決定是否放大。若試點沒有達到閾值，就停止這條線，記錄負結果並上報，不得增加種子或變體去把差距平均掉。一次只改一個變量，跑之前先說明混淆因素，中途改動協議要記錄原因；執行同時受預算、同一失敗重複兩次、指標停止變化這三條邊界約束。

由 Lead 准入執行，runner 在缺少預檢記錄時拒絕啟動，reviewer 在結果關口核對執行是否與預註冊規則一致、停止決定是否被遵守而不是被推翻。

## 跨工作階段延續

工作階段只是一次對話，不是專案本身：工作日誌、任務板和 git 承載工作，而聊天、團隊和背景工作不會隨工作階段保留。在一個已有 `worklog/PLAN.md` 的專案裡，第一次實質動作之前，先讀 PLAN 和 INDEX，再讀目前卡片的目前狀態區塊，然後才做計畫或消耗算力。

工作日誌放在 `research_project` 回傳的專案根目錄，而不是工作階段的子目錄，這樣專案上的每個工作階段共用一份 PLAN 和一份 INDEX。PLAN、INDEX、卡片檔案、任務板、git 和記憶是持久的；`team_task_*` 項目、隊友對話和背景工作只存在於目前工作階段。後續工作階段需要知道的任何東西，都要在工作階段結束前寫進 PLAN 或卡片檔案。

跨回合仍在執行的實驗或長任務，要在卡片檔案或 PLAN 裡留下任務或終端控制代碼、主機、開始時間、預計完成時間和它服務的決策規則。恢復時先確認存活；控制代碼已消失的執行標記為孤兒，核對產物後交給使用者決定採用、重新啟動還是停止，絕不能悄悄重跑一遍。由已不存在工作階段持有的卡片，回報給使用者重新開啟，絕不接管。

## 研究側欄

預設會在右側邊欄新增一個「研究」標籤頁。它回答團隊現在在做什麼、卡在哪裡、下一步是什麼：`worklog/PLAN.md` 中的目標與里程碑、`worklog/INDEX.md` 中的活動卡片、最近的執行、設計文件與架構卡片。

架構卡片是以 JSON 形式存放在 `.research/architecture/` 下的節點-連線圖，一張卡片一個檔案。代理透過 `research_architecture` 工具讀取與更新它們，因此圖會與設計保持同步，而不是散落在簡報裡。卡片在面板內以 SVG 呈現；在節點上拖出選取框即可選取，你寫下的備註會作為註解存到卡片上，代理在回答前會先讀取它。安裝了 `dsh-better-sidebar` 時標籤頁透過它註冊，否則回退到原生右側邊欄。

## 任務看板流程

```text
User goal
Lead:  research_project -> taskboard_create only at user gates (checklist, presetId=research-team)
       -> team_task_create (owner, blocked_by, write scopes) -> send_message
Member: team_task_update (claim) -> work -> team_task_update (complete) + send_message
Internal steps and member handoffs stay off the board; only user gates get cards
At a user gate: taskboard_get -> taskboard_move in_progress -> checklist/report -> in_review
Reviewer: independent PASS/FAIL with evidence on gated cards
Advisor: optional independent recommendation at key decisions or final review
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
Plugins → dsh-research-team-preset → research-team-settings → Configure
```

頁面頂端的配置列：

- **切換**：選取下一次預設隊友要使用的配置（`团队配置` 下拉選單）。
- **新建配置**：追加一個含八個空白角色列的配置。
- **配置名称**：重新命名選取的配置。名稱為必填、唯一，且最多 60 個字元。
- **删除配置**：二次確認點擊後刪除選取的配置。最後一個配置無法刪除。

每個配置中，每個預設成員各佔一列：

- **Model**：一個下拉選單，包含所有 provider 的模型，並有不可點擊的 provider 群組標題。選擇模型會同時設定 provider 與 model。
- **Reasoning effort**：第二個下拉選單，列出所選模型宣告支援的推理強度，外加一個模型預設選項。

模型留空表示「沿用 Lead 的路由」；強度留空表示「使用模型預設值」。`spawn_teammate_with_model` 在省略 `model` 時會讀取所選配置中各角色的預設值；明確指定 `model` 則會覆寫。單純的 `spawn_teammate` 一律沿用 Lead。

建議的能力層級，僅作為起點而非規則：

| 角色 | 建議層級 | 理由 |
| --- | --- | --- |
| `designer` | 最強 | 設計上的錯誤會讓每一次執行都失效 |
| `advisor` | 最強，且與 designer 屬於不同模型家族 | 獨立批評需要不同的視角 |
| `builder` | 高 | 程式碼正確性與長上下文 |
| `reviewer` | 高，與 builder、runner 屬於不同模型家族 | 證據審計需要自己的視角 |
| `researcher` | 中高 | 基線與 SOTA 判斷 |
| `writer` | 中 | 依據已核對證據進行有條理的寫作 |
| `data` | 中低 | 藉由工具進行流程化取得 |
| `runner` | 中低 | 工具可靠性重於深度推理 |

整份配置清單會一起儲存，因此切換配置不會丟棄在另一個配置中所做的編輯。頁面在儲存前會驗證名稱，儲存被拒絕時會顯示伺服器的錯誤文字。

列名很重要：`research-team-settings` 必須保持在**套件根目錄** `dsh-research-team-preset`。DSH 的用戶端模組掃描器只會為套件根目錄的列探索 `dsh.client`；子路徑名稱會啟動主機外掛，但永遠不會載入頁面。

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
| 團隊模型配置 | `$DSH_HOME/research-team-settings.json` | 具名配置；作用中的配置為八個預設角色提供 provider/model/reasoningEffort |

## 運作原理

- **Preset**：`cordis.patch.yml` 宣告 persona、工具列、modeled-teammates 子模組與頂層設定列。
- **任務看板提示詞**：`plugin/index.js` 在 preset 範圍註冊英文協定區段（`plugin:dsh-taskboard`），並提供 `research_project` 以解析目前工作區。
- **各角色路由**：`plugin/modeled-teammates.js` 以 `AsyncLocalStorage` 包裝 `subagents.startActivation`，僅在 `spawn_teammate_with_model` 呼叫時注入 `agentOptions`。官方 Agent Teams 套件未被改動。 Cordis 對服務回傳可追蹤代理，因此包裝器改為檢查自身屬性描述符，而不比較方法身分。
- **設定**：`settings/index.js` 載入／儲存配置 JSON 檔並提供 `GET/POST /api/dsh-research-team-settings`；`client/index.js` 透過 `plugins.row.config` 註冊 Plugins 頁面的配置編輯器。
- **重新整理**：`plugin/settings-store.js` 持有記憶體快照，在每次讀取與 spawn 時解析作用中的配置，並在讀取失敗時保留上一次良好的快照。

## 疑難排解

### 重新啟動後設定似乎重設

版本 0.1.0 修正了已知原因：舊載入器把整個 `{ roles: ... }` 物件傳給角色正規化器，產生全空的設定。請更新到 0.1.0 或更新版本、重新啟動 DSH，並檢查：

- `$DSH_HOME/research-team-settings.json` 存在且包含已儲存的配置；
- 舊的 `{ "roles": ... }` 檔案會顯示為單一 `默认配置` 配置，並在下一次儲存時改寫為配置結構；
- `research-team-settings` 列的名稱完全是 `dsh-research-team-preset`；
- 目前主機執行的是此 checkout，而不是過時的已安裝副本。

### 每個隊友都跑在 Lead 的模型上

先看 spawn 結果裡第一行上方的文字。套用了設定或明確路由時會印出 `requested=<provider>/<model> effort=<effort>`；沒有匹配到路由時會印出 `requested=inherit (Lead route)` 並附一條 `note:`。`note:` 裡點名某個角色，表示作用中的設定檔裡該角色沒有填 provider/model；提示名字不是標準角色，表示隊友名字裡沒有出現角色詞。

另外兩種原因與設定檔無關。一是 Lead 呼叫了普通的 `spawn_teammate`，它永遠繼承 Lead；persona 已要求 Lead 使用 modeled 工具並且不要傳 `model`，也不要因為不確定名字就退回。二是儲存設定時所處的 `DSH_HOME` 與執行中的 host 讀取的不是同一個，可以對比 `research_team_routes` 印出的 `settings file:` 與 `echo $DSH_HOME`。

### Plugins 中沒有出現設定頁面

- 列必須是套件根目錄，而不是 `dsh-research-team-preset/settings`。
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
- 此模式不會在工作階段開始時自動 spawn 八名隊友。Lead 會依任務需要建立角色。
- 此模式不會在既有儲存庫內部再初始化儲存庫，也不會自行提交工作日誌或儲存庫腳手架。
- 成員可使用一層 subagent；更深的委派會被刻意停用。

## 授權

MIT。參見 [LICENSE](../LICENSE)。

## 致謝

建構於 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 與 [Cordis](https://github.com/cordiverse/cordis) 之上。任務看板整合使用 [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) 外掛；團隊工具來自官方 Agent Teams profile bundle。感謝外掛作者，以及所有在真實研究專案上測試此模式的人。

貢獻與內部開發說明見 [DEVELOPMENT.md](../DEVELOPMENT.md)。
