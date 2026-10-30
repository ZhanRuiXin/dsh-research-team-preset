# Research Team Mode — 简体中文

**版本：** 1.0.0 · **更新：** 2026-10-31

**语言：** [English](../README.md) · **简体中文** · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md)

## 简介

科研团队模式是一个 DSH agent preset，把一次会话变成一个小型、分工明确的研究团队。Lead 负责目标澄清、任务拆解、看板管理、分派跟进、结果整合和与用户沟通；六名默认成员分别覆盖顾问评估、文献与证据、代码构建、训练与运行、独立复核和论文写作。

它适合跨越数天或数周、需要可追溯证据和清晰角色边界的研究工作，不适合简单问答或一次性小改动。

## 适合谁

- 同时包含文献调研、实现、实验和论文产出的研究项目。
- 需要把主张追溯到论文、日志或运行记录的团队。
- 希望有独立顾问和独立 reviewer，而不是只有一个通用 agent 的用户。
- 最终验收权应该留给用户，而不是 agent 自动完成的工作。

## 主要能力

- **六名默认成员**：advisor（学术顾问）、researcher（资料员）、builder（代码构建）、runner（训练与运行）、reviewer（审查）、writer（论文写作）。
- **任务看板优先**：Lead 建卡，成员认领、执行、提交执行报告，reviewer 独立复核。
- **按角色选择模型**：在插件设置页为每名成员选择 provider、model 和思考强度。
- **完成权归用户**：agent 最多把卡片移到 `in_review`，`done` 只能由用户在 GUI 确认。
- **PTC 运行时**：以 `run_code` 和生成的 SDK 执行批量操作，减少往返。
- **可追溯**：证据、运行记录和决策留在任务卡评论里，而不是只留在聊天中。

## 快速开始

1. 在同一个 DSH profile 中启用 Agent Teams（`@deepseek-ai/dsh-experimental-agent-team-profile`）和 `dsh-taskboard`。
2. 安装本 bundle（本地路径或 `link:`），重启 DSH。
3. 新建会话，选择「科研团队模式」；任务卡使用 `presetId=research-team`。
4. 打开「插件 → @local/dsh-research-team-preset → research-team-settings → 配置」，为成员设置默认模型。

完整的安装、配置、任务板流程和已知问题见 [English README](../README.md)。本页是 AI 辅助翻译，欢迎修正。
