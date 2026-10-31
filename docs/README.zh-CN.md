# Research Team Mode

**一个 DSH agent preset，把一次会话变成一个小型、协同工作的研究团队。**

**版本 0.1.0** · **更新 2026-10-31**

<p align="center"><a href="../README.md">English</a> · <strong>简体中文</strong> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिन्दी</a></p>

---

## 概述

Research Team Mode 是一个 DSH agent preset，用于以团队而非单个聊天的方式运行端到端研究。Lead 负责规划工作、维护任务看板、分派卡片、整合结果并与用户沟通。七名默认专家分别覆盖顾问评估、文献与证据、数据获取、代码、运行、独立复核和论文写作。

该模式面向持续数天或数周、需要可追溯证据、并能从清晰角色边界中获益的研究工作。它不是一次性问答模式：Lead 只创建任务真正需要的角色。

## 一览

| | |
| --- | --- |
| **默认角色** | 7 个：advisor、researcher、data、builder、runner、reviewer、writer |
| **工作流** | 任务看板优先：建卡、认领、执行、报告、复核、用户验收 |
| **完成** | `in_review` 是 agent 的最后一站；只有用户才能把卡片移到 `done` |
| **模型路由** | 通过「插件」页的设置表单，按角色配置 provider、model 和推理强度 |
| **Git** | 实质性工作开始时由 agent 初始化；破坏性改动走分支；验收通过后才合并 |
| **Worklog** | `worklog/PLAN.md` + `INDEX.md` + 每卡一个有界文件；恢复时先读 PLAN 和 INDEX |
| **运行时** | PTC（`run_code` + 生成的 SDK），每名成员一层 subagent |

## 适用对象

- 同时包含文献调研、实现、实验和论文产出的研究项目。
- 需要把主张追溯到来源、运行记录或日志的证据链的团队。
- 希望有独立顾问和独立 reviewer，而不是只有一个通用 agent 的用户。
- 最终验收决定应由用户而非 agent 做出的工作。

**不适用：** 快速事实性问题、单文件修改，或一次性回答就足够的任务。该模式会要求 Lead 直接回答简单问题，只在实质性研究时调动团队。

## 运行要求

Research Team Mode 是一个 **profile 级 DSH bundle**。该 bundle 不会安装或启用它所用到的 profile bundle；DSH 的包安装器处理的是 npm 依赖，而不是功能 bundle。请先在同一 profile 中启用这些依赖。

| 能力 | 提供方 | 说明 |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | 基于 `0.2.1-rc.5` 开发；其他版本可能可用，但不保证 |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | 提供 `spawn_teammate`、`send_message`、`wait_agent`、`interrupt_agent` 以及 Team 服务 |
| 任务看板 | [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) | 提供 `taskboard_*` 和 Web GUI 看板 |
| PTC 运行时 | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) 和 [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | DSH 基础组件的一部分；用于启用 `run_code` |
| Git Bash（可选，Windows） | [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) | 为需要它的 agent 增加 `bash` 工具 |
| Web GUI | DSH Web/Desktop | 设置表单和任务看板需要它 |

如果缺少某个依赖，该模式仍可部分加载，但团队工具、看板或设置页将不可用。插件管理器不会提示这些 bundle，也不会自动链接它们。

## 安装

本仓库是一个本地 DSH bundle。从 checkout 开始：

1. **在目标 profile 中启用前置依赖：**
   - Agent Teams：[`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness)
   - 任务看板：[`dsh-taskboard`](https://github.com/cloader/dsh-taskboard)
   - 在 Windows 上可选安装 [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell)。
2. **安装本 bundle**：使用「插件」页/插件管理器的安装操作，通过本地链接安装：

   ```text
   link:/absolute/path/to/research-team-preset
   ```

   本地文件夹路径同样可用。如果你打算从该 checkout 更新，请保留该 link；替换文件夹后需要重新安装。
3. **重启 DSH。** Preset 行和 bundle 的 client 部分会在启动时加载。
4. **确认该 bundle 已在同一 profile 中启用。**
5. **新建会话**，并在模式选择器中选择 **Research Team Mode**。
6. 对于任务看板执行会话，创建卡片时使用 `presetId=research-team`，使执行使用相同的 persona 和工具。

> 该模式是 profile 级 bundle：在一个 profile 中安装并不会在另一个 profile 中启用它。请按 profile 重复安装和前置依赖步骤。

## 首次运行

在开始实际工作前，让 Lead 检查环境和看板：

```text
list_agents        # create only the roles the task needs
research_project   # resolve the current project/workspaceId
taskboard_list     # check existing cards in this project
```

一个典型的第一项任务：

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> taskboard_create(presetId=research-team) -> dispatch
Members: claim cards -> execute -> checklist + execution report -> in_review
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## 默认团队

| 角色 | 职责 |
| --- | --- |
| `advisor` | 独立评估方向、框架、核心主张、证据充分性和论文策略；给出继续 / 修改 / 停止的建议。仅提供建议，不是关卡 |
| `researcher` | 文献检索、获取、精读、证据提取，并维护「主张 → 来源 → 位置」证据表 |
| `data` | 外部数据集与模型权重的获取，含来源可得性与许可/访问状态跟踪、带续传与限速处理的下载工具、按发布方哈希做的完整性校验、解压、manifest 契约、一个小样本与磁盘账本；不写训练代码，也不改评估协议 |
| `builder` | 代码、配置、数据管线、测试和可复现的入口；不负责长时间训练 |
| `runner` | 启动并监控训练/评估；记录 run id、配置、随机种子、指标、日志、检查点和产物路径 |
| `reviewer` | 独立核验文献笔记、代码、结果和论文主张/引用；给出带阻断性证据的 PASS/FAIL |
| `writer` | LaTeX 论文草稿：正文、章节、表格、图注、引用和图表代码；不运行实验，也不修改代码/模型 |

Lead 负责目标澄清、任务拆解、看板管理、分派、整合、总结、最终产物组装和交付。成员可以为一个限定范围的子任务使用一层 subagent；成员不能创建新的 teammate。

## 任务看板工作流

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

看板是唯一的任务账本。不要只在聊天中跟踪交付物。`team_task_*` 用于临时协作，不用于交付物。

## Git 工作流

该模式在实质性工作开始时初始化耐久记录，由 agent 判断请求是真正的工作还是简单问题。工作区还不在任何仓库里时，agent 调用 `research_workspace_init`，它会创建 `worklog/PLAN.md` 和 `worklog/INDEX.md`，并执行 `git init`。它不会创建嵌套仓库，也不会提交脚手架。

破坏性或风险较高的改动在按卡片命名的分支上进行，例如 `task/<标题>+<id>`，不直接改默认分支。卡片记录 base 和 head 提交，reviewer 以 `git diff <base>..<head>` 作为代码审查的依据，并仍然复跑验收检查。

分支只在卡片被验收后合并，合并后删除。数据集、checkpoint、日志、缓存等生成物不入库。项目不是 git 仓库时，审查退回用文件哈希快照加卡片上记录的证据。

## 工作日志

可能跨会话的工作会在代码旁边保留一份小而受限的记录。`worklog/PLAN.md` 存目标、当前里程碑、活跃卡片、阻塞项和带日期的决策；`worklog/INDEX.md` 每张活跃卡一行。每张卡有 `worklog/<task-id>.md`，顶部是当前状态块，下面是简短的追加条目。

恢复时 agent 先读 PLAN 和 INDEX，再只读目标卡的状态块和尾部，不整读文件也不整读目录。PLAN 控制在约一百行，单卡文件约两百行，完成的卡从索引里撤掉。三种文件的精简模板就在预设 persona 里，任何会话都能直接创建或更新，不需要读本仓库。

## 按角色的模型设置

打开：

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

每个默认成员占一行：

- **Model**：一个下拉框，包含所有 provider 的模型，provider 分组标题不可点击。选择一个模型会同时设置 provider 和 model。
- **Reasoning effort**：第二个下拉框，包含所选模型声明的推理强度，外加一个「模型默认」选项。

空的 model 表示「继承 Lead 的路由」；空的 effort 表示「使用模型默认值」。省略 `model` 时，`spawn_teammate_with_model` 会读取该角色的默认值；显式传入的 `model` 会覆盖它。直接调用 `spawn_teammate` 始终继承 Lead。

行名称很重要：`research-team-settings` 必须保持在**包根目录** `@local/dsh-research-team-preset`。DSH 的 client 模块扫描器只会为精确的包根行发现 `dsh.client`；子路径名称会启动 host 插件，但永远不会加载页面。

### 设置存储位置

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

- JSON 文件是唯一事实来源。host 插件在启动时加载它；`getSettings()` 和 `modelForRole()` 会从中刷新，因此页面和下一个 teammate 都能看到最新值。
- 文件缺失或暂时无法读取时，会保留最后一次有效的内存快照，而不是将其清空。
- 设置文件**不在**本仓库中。请单独备份。它按 `DSH_HOME` 区分，而不是按 profile 区分。
- 不存储任何凭据；只保存 provider/model/effort 字符串。
- 保存设置无需重启 DSH 即可生效。首次安装设置行/client 页面，以及修改 preset/插件后，需要重启。
- 0.1.0 版本修复了早期构建中的一个加载器 bug：文件把角色包在 `"roles"` 下，而旧加载器把整个对象传给角色规范化器，导致重启后设置全部为空。当前加载器会解包 `"roles"`，并兼容只包含角色映射的裸格式。

## 配置参考

| 设置 | 位置 | 说明 |
| --- | --- | --- |
| Preset id | `cordis.patch.yml` | `research-team`；任务卡应使用 `presetId=research-team` |
| Persona | `cordis.patch.yml` | 英文 system prompt；模式级规则 |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | 设为 `false` 可移除 `spawn_teammate_with_model` 及其服务包装 |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | modeled spawn 工具使用的 subagent provider；默认 `spawn` / `fork` |
| `research-team-settings` 行 | `cordis.patch.yml` | 顶层 host 行；保持包根名称 |
| 按角色路由 | `$DSH_HOME/research-team-settings.json` | 七个默认角色的 provider/model/reasoningEffort |

## 仓库结构

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

## 工作原理

- **Preset**：`cordis.patch.yml` 声明 persona、工具行、modeled-teammates 子模块和顶层设置行。
- **任务看板提示**：`plugin/index.js` 在 preset 作用域注册英文协议段（`plugin:dsh-taskboard`），并提供 `research_project` 用于解析当前工作区。
- **按角色路由**：`plugin/modeled-teammates.js` 通过 `AsyncLocalStorage` 包装 `subagents.startActivation`，只对 `spawn_teammate_with_model` 调用注入 `agentOptions`。官方 Agent Teams 包未被修改。
- **设置**：`settings/index.js` 加载/保存 JSON 文件并提供 `GET/POST /api/dsh-research-team-settings`；`client/index.js` 通过 `plugins.row.config` 注册「插件」页的行表单。
- **刷新**：`plugin/settings-store.js` 持有内存快照，在读取和 spawn 时从磁盘刷新，读取失败时保留最后一次有效快照。

## 验证清单

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

无需 UI 也可以检查设置的持久化路径：

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## 故障排查

### 设置似乎在重启后被重置

0.1.0 版本修复了已知原因：旧加载器把整个 `{ roles: ... }` 对象传给角色规范化器，导致设置全部为空。请更新到 0.1.0 或更高版本，重启 DSH，并检查：

- `$DSH_HOME/research-team-settings.json` 存在并且包含已保存的角色；
- `research-team-settings` 行的名称完全为 `@local/dsh-research-team-preset`；
- 当前 host 运行的是本 checkout，而不是过期的已安装副本。

### 设置页没有出现在「插件」中

- 该行必须是包根，而不是 `@local/dsh-research-team-preset/settings`。
- client 部分在安装后需要重启 DSH 并刷新浏览器。
- 检查 bundle 是否已在 profile 中启用。

### 团队工具缺失

在同一 profile 中启用 [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) 并重启。安装器不会提示安装它。

### 任务看板工具缺失

在同一 profile 中启用 [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) 并重启。

### `spawn_teammate_with_model` 不可用

该子模块包装了一个内部 subagent 服务。DSH 升级可能改变激活结构。检查失败信息；如果包装器无法安装，请设置 `research-modeled-teammates.enabled: false`，重启，并使用普通的 `spawn_teammate`。

### 预设未列出

确认 bundle 已安装并启用，重启 DSH，然后新建会话。Preset 声明在启动时加载。

### `research_project` 无法解析工作区

在 GUI 中把工作目录作为 DSH 项目/工作区打开，或传入已知项目；该工具不会猜测。

## 已知限制

- 按角色的模型路由是一个内部服务包装，不是官方的 Agent Teams 扩展。DSH 升级可能破坏它；回退方案见上文。
- profile 级依赖不会被自动安装或启用。本仓库记录它们，但不负责管理。
- 角色设置保存在 `$DSH_HOME` 下的独立 JSON 文件中；它们不属于 DSH 标准配置导出/备份的一部分。更换机器时请复制该文件。
- 模型菜单是带 provider 分组的原生 `<select>`，不是可搜索的自定义选择器。
- 该模式不会在会话启动时自动创建七名 teammate。Lead 按任务需要创建角色。
- 该模式不会在已有仓库内部再初始化仓库，也不会自行提交工作日志或仓库脚手架。
- 成员可以使用一层 subagent；更深层的委派被有意禁用。

## 开发

本仓库是一个本地 DSH bundle，host 代码没有构建步骤。client 页面是 `client/index.js` 中的预构建 `window.__ModuleLoader__.load` 模块。

典型循环：

1. 将 checkout 作为 `link:` 依赖安装到 DSH profile 中。
2. 编辑 host/client 文件。
3. 重启 DSH（preset 和 client 模块在启动时加载；HMR 可能处理部分 host 变更）。
4. 检查设置路由和「插件」页。

有用的检查：

```bash
node --check settings/index.js
node --check plugin/index.js
node --check plugin/modeled-teammates.js
node --check client/index.js
```

目前还没有自动化测试套件。设置路由、模型目录、任务看板流程和重启后的持久化是最有价值的人工检查项。

## 版本管理

采用语义化版本。当前版本为 **0.1.0**；参见 [CHANGELOG.md](../CHANGELOG.md)。`docs/` 下的文档使用相同版本。

## 许可证

MIT。参见 [LICENSE](../LICENSE)。

## 致谢

构建于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 和 [Cordis](https://github.com/cordiverse/cordis) 之上。任务看板集成使用 [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) 插件；团队工具来自官方 Agent Teams profile bundle。感谢插件作者，以及所有在真实研究项目中测试该模式的人。
