# Research Team Mode — 繁體中文

**版本：** 1.0.0 · **更新：** 2026-10-31

**語言：** [English](../README.md) · [简体中文](README.zh-CN.md) · **繁體中文** · [日本語](README.ja.md) · [한국어](README.ko.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md)

> 本頁是簡短介紹；完整、權威的文件見 [English README](../README.md)。

## 簡介

科研團隊模式是一個 DSH agent preset，把一次工作階段變成一個小型、分工明確的研究團隊。Lead 負責目標釐清、任務拆解、看板管理、分派追蹤、結果整合和與使用者溝通；六名預設成員分別涵蓋顧問評估、文獻與證據、程式碼建構、訓練與執行、獨立複核和論文寫作。

它適合跨越數天或數週、需要可追溯證據和清楚角色界線的研究工作，不適合簡單問答或一次性的小改動。

## 適合誰

- 同時包含文獻探討、實作、實驗和論文產出的研究專案。
- 需要把主張追溯到論文、日誌或執行記錄的團隊。
- 希望有獨立顧問和獨立 reviewer，而不是只有一個通用 agent 的使用者。
- 最終驗收權應該留給使用者，而不是由 agent 自動完成的工作。

## 主要能力

- **六名預設成員**：advisor（學術顧問）、researcher（資料員）、builder（程式碼建構）、runner（訓練與執行）、reviewer（審查）、writer（論文寫作）。
- **任務看板優先**：Lead 建立卡片，成員認領、執行、提交執行報告，reviewer 獨立複核。
- **依角色選擇模型**：在外掛設定頁為每名成員選擇 provider、model 和推理強度。
- **完成權歸使用者**：agent 最多把卡片移到 `in_review`，`done` 只能由使用者在 GUI 確認。
- **PTC 執行環境**：以 `run_code` 和產生的 SDK 執行批次操作，減少往返。
- **可追溯**：證據、執行記錄和決策留在任務卡評論裡，而不是只留在聊天中。

## 快速開始

1. 在同一個 DSH profile 中啟用 Agent Teams（`@deepseek-ai/dsh-experimental-agent-team-profile`）和 `dsh-taskboard`。
2. 安裝本 bundle（本機路徑或 `link:`），重新啟動 DSH。
3. 新增工作階段，選擇「科研團隊模式」；任務卡使用 `presetId=research-team`。
4. 開啟「外掛 → @local/dsh-research-team-preset → research-team-settings → 設定」，為成員設定預設模型。

完整的安裝、設定、任務看板流程和已知問題見 [English README](../README.md)。本頁是 AI 輔助翻譯，歡迎修正。
