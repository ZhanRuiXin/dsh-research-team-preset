# Research Team Mode

[![powered by dsh](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness) [![DSH 0.2.x](https://img.shields.io/badge/DSH-0.2.x-4D6BFE?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness) [![license MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../LICENSE)

**一个 DSH agent preset，把一次会话变成一个小型、协同工作的研究团队。**

**版本 0.1.1** · **更新 2026-11-10**

<p align="center"><a href="../README.md">English</a> · <strong>简体中文</strong> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिन्दी</a></p>

---

## 概述

Research Team Mode 是一个 DSH agent preset，用于以团队而非单个聊天的方式运行端到端研究。Lead 负责规划工作、维护工作日志记录（用户关卡用卡片文件，内部步骤用 INDEX 行）、分派工作、整合结果并与用户沟通。八名默认专家分别覆盖顾问评估、文献与证据、数据获取、实验设计、代码、运行、独立复核和论文写作。

该模式面向持续数天或数周、需要可追溯证据、并能从清晰角色边界中获益的研究工作。它不是一次性问答模式：Lead 只创建任务真正需要的角色。

## 一览

| | |
| --- | --- |
| **默认角色** | 8 个：advisor、designer、researcher、data、builder、runner、reviewer、writer |
| **工作流** | 关卡制：内部步骤是工作日志索引行，用户关卡是卡片文件；建卡、认领、执行、报告、复核、用户验收 |
| **完成** | `in_review` 是 agent 的最后一站；只有用户才能把卡片移到 `done` |
| **模型路由** | 通过「插件」页的设置表单，按角色配置 provider、model 和推理强度 |
| **Git** | 实质性工作开始时由 agent 初始化；破坏性改动走分支；验收通过后才合并 |
| **工作日志** | `.research/worklog/` 下的 JSON 存储；`PLAN.md` 与 `INDEX.md` 是生成视图；恢复时先读 `research_state` |
| **运行时** | PTC（`run_code` + 生成的 SDK），每名成员一层 subagent |

## 适用对象

- 同时包含文献调研、实现、实验和论文产出的研究项目。
- 需要把主张追溯到来源、运行记录或日志的证据链的团队。
- 希望有独立顾问和独立 reviewer，而不是只有一个通用 agent 的用户。
- 最终验收决定应由用户而非 agent 做出的工作。

**不适用：** 快速事实性问题、单文件修改，或一次性回答就足够的任务。该模式会要求 Lead 直接回答简单问题，只在实质性研究时调动团队。

## Lead 如何与你沟通

Lead 的回复是科学性沟通，而不是状态播报：先给结论或结果，再给支撑它的证据（run id、数据集、指标及其不确定度与样本量、来源），然后说明哪里仍不确定，最后是需要你决定的事项。每句话都标明其性质——已观察到的事实、推断、假设或尚未解决的问题——方法要讲到你能跟上并持续学习为止。

内部机制留在内部。agent 之间的交接、重试、工具报错、工作日志记账，以及团队在工作中得到的经验，除非会改变某个结果的解读或阻碍决策，否则不转发给你。成员报告会被转述为“主张—证据—边界”，而不是原样粘贴。

分工是明确的：你确定科学方向并判断证据，团队承担检索、实现、实验和验证的工作量。

你的问题就是这一轮的契约。你要的是综述、可拓展方向或一个决定，回答就先交付这些；研究计划、门槛或终止条件只是补充，不能替代。回复按你的问题逐条作答，每条给出证据和完整细节所在文件；暂时答不了的，直说还缺什么。

长回合不等于沉默。团队连续工作超过约十分钟，Lead 先给一条简短的中间答复，说明已经定了什么、还在收集什么、下一条答复何时来，让你能在算力花完之前改变方向。

前人的否定性结果约束的是产生它的方法、数据和预算，不是这个想法本身。关闭一个方向之前，要先把想法的最强版本写出来并证明它仍然失败；每一句“无法主张”都要配上一句“在什么条件下可以主张”以及需要什么证据。

## 运行要求

| 能力 | 提供方 | 说明 |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | 基于 `0.2.1-rc.5` 开发；其他版本可能可用，但不保证 |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | 提供 `spawn_teammate`、`send_message`、`wait_agent`、`interrupt_agent` 以及 Team 服务；本预设把工作记录在工作日志里，而不是团队任务中 |
| PTC 运行时 | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) 和 [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | DSH 基础组件的一部分；用于启用 `run_code` |

**可选联动插件。** 这些是他人开发的插件；本 preset 不依赖它们，也不会安装它们，安装只为与团队联动：

- **Zotero**（`dsh-zotero`）——提供共享文献库工具（`zotero_*`）与 paper-fetch 导入路径。没有它时，文献工作改用 Semantic Scholar、arXiv 与网络检索，证据表仍记录 claim、来源与位置。
- **Mnemon**（`dsh-mnemon`）——提供跨会话的持久笔记（`mnemon_*`）。没有它时，由 worklog 与 `CHANGELOG.md` 承担连续性。

如果缺少某个依赖，该模式仍可部分加载，但团队工具、工作日志或设置页将不可用。插件管理器不会提示这些 bundle，也不会自动链接它们。

## 安装

本 preset 以 DSH bundle 形式发布，npm 包名为 `dsh-research-team-preset`。

### 从 DSH 插件页面安装

2. 打开 **设置 → 插件**，点击 **添加**。
3. 粘贴安装源：npm 包用 `dsh-research-team-preset@0.1.1`；固定源码用 `github:ZhanRuiXin/dsh-research-team-preset#v0.1.1`；本地 checkout 用 `link:/absolute/path/to/dsh-research-team-preset`。
4. **重启 DSH。** preset 行与 bundle 的客户端部分在启动时加载。
5. **确认 bundle 在同一 profile 中已启用**，然后**新建会话**，在模式选择器中选择 **Research Team Mode**。

### 从命令行安装

```text
dsh plugin add dsh-research-team-preset@0.1.1
```

若要固定源码而不是从 registry 安装：

```text
dsh plugin add github:ZhanRuiXin/dsh-research-team-preset#v0.1.1
```

> 该模式是 profile 级 bundle：在一个 profile 中安装不会在另一个 profile 中启用。每个 profile 都要重复安装与前置步骤。

## 首次运行

在开始实际工作前，让 Lead 检查环境和工作日志：

```text
list_agents                    # create only the roles the task needs
research_project               # resolve the current project root
research_workspace_init        # seed .research/worklog/ and render the views if missing
```

一个典型的第一项任务：

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> research_state -> research_worklog op=update (status=todo, next) + send_message
Members: research_worklog op=claim -> work -> research_worklog op=gate (evidence, next) + send_message
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (research_worklog op=update, by="user")
```

## 默认团队

| 角色 | 职责 |
| --- | --- |
| `advisor` | 独立评估研究方向、问题框定、核心主张、证据充分性与论文策略。默认以建设性方式给意见：先说站得住的部分，再指出少数会威胁结果的问题，并为每个问题给出最小修补或一个具体替代方案，最后给出 proceed / revise / stop。仅提供建议，不是关卡 |
| `researcher` | 文献检索、获取、精读、证据提取，并维护「主张 → 来源 → 位置」证据表；优先检索共享 Zotero 文库，在缺少所需文献时导入附带 PDF 的正式版全文，按 DOI/标题去重，并与团队共享 `zotero://` 引用 |
| `data` | 外部数据集与模型权重的获取，含来源可得性与许可/访问状态跟踪、带续传与限速处理的下载工具、按发布方哈希做的完整性校验、解压、manifest 契约、一个小样本与磁盘账本；不写训练代码，也不改评估协议 |
| `designer` | 拥有实验设计文档：问题与假设、协议与对照、基线、消融、指标与统计计划、算力预算，以及运行进行中的设计变更控制；不写生产代码，也不运行实验 |
| `builder` | 代码、配置、数据管线、测试和可复现的入口；不负责长时间训练 |
| `runner` | 启动并监控训练/评估；记录 run id、配置、随机种子、指标、日志、检查点和产物路径 |
| `reviewer` | 独立核验文献笔记、代码、结果和论文主张/引用；给出带阻断性证据的 PASS/FAIL |
| `writer` | LaTeX 论文草稿：正文、章节、表格、图注、引用和图表代码；不运行实验，也不修改代码/模型 |

Lead 负责目标澄清、任务拆解、工作日志管理、分派、整合、总结、最终产物组装和交付。成员可以为一个限定范围的子任务使用一层 subagent；成员不能创建新的 teammate。 Lead 控制自己的工具调用量，能用一句进展回复说清的事不再多跑一次工具，深入的工作交给对应成员。

### 共享 Zotero 文库

researcher 把用户的 Zotero 文库作为团队的共享文献源：先检索现有的分类和条目，再检索公开网络；复用已附带的 PDF 和批注片段；只有在缺少某篇文献时，才导入正式版（version of record）全文，附带 PDF 并归档到项目分类中。导入按 DOI 和标题去重，不改动用户的标签和分类，并把 `zotero://` 条目引用记录到证据表和工作日志卡片上，让每位团队成员读到同一篇论文，reviewer 也能抽查相同的页面。当全文受付费墙限制或只有元数据时，researcher 会记录链接，并将证据标记为仅元数据，而不是导入替代品。

### 顾问评审

顾问是科学上的共同思考者，而不是守门人。它先说明计划中哪些部分成立、为什么成立，然后按对结果的威胁程度排序，最多指出三个问题，每个问题都锚定到具体的步骤、主张或数字。每个问题都附带能让计划变得可接受的最小修补，或一个带有取舍说明的具体替代方案；只给否决不构成一次评审。它把“这个方案回答不了问题”与“这个方案可行，但更弱或更昂贵”区分开，说明计划在什么条件下可以接受，最后给出 proceed、revise（列出必须的修改）或 stop（并给出应改走的方向）。它按项目实际承诺的标准评判并说出该标准，而不是假定最苛刻的标准：一个对其既定目标成立的计划，不会因为更强的主张需要更多证据就算失败；目标本身不对时，单独作为范围决策交给你。判断所需的证据缺失时，它指出能定论的最便宜实验或来源。方案成立就明确背书，而不是制造疑虑；stop 一定附带替代方向。它仍然只是建议：由 Lead 决定，reviewer 仍是独立的 PASS/FAIL 关卡。

每次咨询都由 Lead 准备，而不是把对话直接转交。Lead 把用户的问题翻译成 advisor 必须回答的决策，并附上涉及的论断或方案、当前证据及其范围、摆在桌面上的选项、约束，以及用户需要从这个回答里得到什么；含糊或过载的问题先被收窄，用户的原始消息和团队内部经过不会一并转过去。每个决策点只咨询一次，不用来确认 Lead 已有证据能自己辩护的结论，也不让 advisor 替 Lead 总结它自己的工作；advisor 的回复以科学结论的形式回到用户面前，说明它带来什么改变、还留下什么决定，而不是转发原文。

## 设计归属

Lead 不撰写实验设计。对于以设计为主的工作，designer 在项目工作区中拥有一份设计文档（`docs/design/<name>.md` 或项目已有的设计位置）：问题与假设、协议与对照、基线、消融、指标与统计计划、算力预算，以及在运行进行中做出的设计变更日志。

builder 实现该设计，runner 执行该设计，reviewer 在提案关卡检查该设计能否回答所提出的问题，并在结果关卡检查执行是否与设计一致。advisor 在提案关卡给出独立的科学判断。Lead 确认设计文档存在，且 researcher 和 data 的输入已就位，然后接纳或退回该步骤。对于以实现为主的工作，由 builder 起草设计，advisor 审阅一次。

## 写入范围

每个角色只在自己的写入范围内写文件：advisor 和 reviewer 不写任何文件；researcher 拥有 `literature/`、`notes/` 和 `docs/evidence`；data 拥有 `data/`、`manifests/`、`scripts/` 下的下载脚本和 `reports/`；designer 拥有 `docs/design/`；builder 拥有 `src/`、`configs/` 和 `tests/`；runner 拥有 `runs/`、`logs/` 和 `checkpoints/`；writer 拥有 `paper/` 和 `figures/`；Lead 不受限制。读取、检索和卡片评论对所有人开放。

写入范围是契约而不是偏好：属于其他角色的改动要报告给该所有者，而不是由错误的成员直接写。advisor 和 reviewer 以只读方式启动，所以评审只报告需要改什么，而不去改；确实需要越界写入的队友，必须在开工前拿到 Lead 的明确豁免，并记录在卡片上。 其他所有角色继承 Lead 的 sandbox 权限，因此除非角色要求，队友永远不会比 Lead 受到更强限制。

卡片进入 in_review 之前，由所有者或 Lead 用角色名加上改动路径（或 base 与 head 提交）运行 `research_scope_check`。越界要么把改动交给所属角色，要么记录 Lead 批准的豁免，绝不在卡片进行中放宽范围。项目可以在 `AGENTS.md` 或卡片上收窄或扩展某个范围，该步骤以卡片为准，后续会话读到同一条规则。

## 实验准入

算力花在决策上，而不是花在忙碌上。超出简单冒烟测试的任何运行，在写下决策规则之前都不开始，而且规则必须能够给出"停止"这个结果。启动前把预检记录在设计文档或工作日志里：这次运行要结算的问题、假设、预期结果以及算作支持所需的效应量、能推翻它的结果、停止条件、必须超过的基线、能结算它的最小试点，以及算力预算。没有这份记录的运行不予准入。

先跑试点：用仍有可能证伪假设的最小配置（一个种子、一个划分、一个子集、更短的训练时长），对照预注册阈值读结果，然后明确决定是否放大。若试点没有达到阈值，就停止这条线，记录负结果并上报，不得增加种子或变体去把差距平均掉。一次只改一个变量，跑之前先说明混淆因素，中途改动协议要记录原因；运行同时受预算、同一失败重复两次、指标停止变化这三条边界约束。

由 Lead 准入运行，runner 在缺少预检记录时拒绝启动，reviewer 在结果关口核对执行是否与预注册规则一致、停止决定是否被遵守而不是被推翻。

## 会话连续性

会话只是一次对话，不是项目本身：`.research/worklog/`、git 与架构卡片承载工作；聊天、团队与后台任务只存在于当前会话。恢复项目时先调用 `research_state`，再读相关项与证据。

会话只是一次对话，不是项目本身：`.research/worklog/`、git 与架构卡片承载工作；聊天、团队与后台任务只存在于当前会话。恢复项目时先调用 `research_state`。

跨轮次仍运行的实验或长任务，要在卡片文件或 PLAN 里留下任务或终端句柄、主机、开始时间、预计完成时间和它服务的决策规则。恢复时先确认存活；句柄已消失的运行标记为孤儿，核对产物后交给用户决定采用、重启还是停止，绝不能悄悄重跑一遍。由已不存在会话持有的卡片，报告给用户重新打开，绝不接管。

## 研究侧栏

预设会在右侧边栏新增一个「研究面板」标签页。它回答团队现在在做什么、卡在哪里、下一步是什么：目标与里程碑、活动工作项、最近的运行和架构卡片，全部来自工具写下的记录；某个板块为空，说明还没有人记录过那项状态。

左侧栏还会增加一个「看板」页面：每个已注册项目一张卡片，显示目标、工作项计数、进行中的实验、架构卡片数量和最后一次记录的时间。它读取同一批 `.research/` 记录，是跨项目的总览，不与某个会话绑定，每 10 秒刷新一次。

架构卡片是以 JSON 形式存放在 `.research/architecture/` 下的节点-连线图，一张卡片一个文件。智能体通过 `research_architecture` 工具读取和更新它们，因此图会与设计保持同步，而不是散落在幻灯片里。卡片在面板内以 SVG 渲染；在节点上拖出选框即可选中，你写下的备注会作为批注存到卡片上，智能体在回答前会读取它。安装了 `dsh-better-sidebar` 时标签页通过它注册，否则回退到原生右侧边栏。

面板还会显示当前团队：每位成员的名称、角色、模型与状态（运行中或空闲），以及该成员负责的工作项。

实验区按时间从晚到早列出每个实验，并显示已进行或已用的时间。每个实验都有明确的生命周期（已登记、待批准、已批准、运行中、已完成、已停止、失败、已拒绝），由 `research_experiment` 工具推进：登记写决策规则、seed 与预算，启动在未获批时被拒绝，结束时记录完成、停止或失败及原因。区块标题右侧可以切换「需要审批 / 自动审批」，等待批准的实验带批准与拒绝按钮，结果写进该实验的 manifest；条目变多后列表在自己的框内滚动。

面板作为独立模块放在 `panel/` 下，与设置页分开，可以单独启用或停用；它在每个会话的右侧栏中作为标签页出现。

方法卡由 designer 维护，实现卡由 builder 维护；advisor 在评审设计或实现决定前先读这两张卡，reviewer 在结果门禁处核对它们。按住鼠标中键拖动可平移画布，滚轮缩放，在节点上拖出选框即可选中并写批注。

## 工作日志与协作

可能跨会话的工作记录在 `.research/worklog/` 的 JSON 存储里：`plan.json` 存目标、里程碑、下一步与决策，`items/<id>.json` 一项一个文件。`PLAN.md`、`INDEX.md` 与卡片视图由工具生成，不要手工编辑。

状态迁移遵循固定表（`todo → in_progress → in_review → done`），`blocked` 与 `canceled` 是旁路状态；`blocked` 必须写明原因，进入 `in_review` 至少要有一条证据，每次迁移都记录在该项的历史里。

预设会在右侧边栏新增一个「研究面板」标签页。它回答团队现在在做什么、卡在哪里、下一步是什么：目标与里程碑、活动工作项、最近的运行和架构卡片，全部来自工具写下的记录；某个板块为空，说明还没有人记录过那项状态。

左侧栏还会增加一个「看板」页面：每个已注册项目一张卡片，显示目标、工作项计数、进行中的实验、架构卡片数量和最后一次记录的时间。它读取同一批 `.research/` 记录，是跨项目的总览，不与某个会话绑定，每 10 秒刷新一次。

到达关卡时，负责人在卡片文件里写入带证据的清单、执行摘要、提交范围和下一步，对改动路径运行 `research_scope_check`，再把状态设为 `in_review`。reviewer 写入带证据的 PASS/FAIL 结论；Lead 只在到达关卡或需要用户行动时报告卡片 id、状态和证据。`done` 只属于用户的验收动作；`blocked` 表示无法继续，`canceled` 表示不再继续。

```text
User goal
Lead:  research_project -> research_state
       -> research_worklog op=update (status=todo, next) + send_message
Member: research_worklog op=claim -> work
        -> research_worklog op=gate (evidence, summary, base..head, next)
Internal steps stay index rows; only items waiting for the user get a card view
Reviewer: independent PASS/FAIL with evidence
Advisor: optional independent recommendation at key decisions or final review
Lead:  scientific summary (claim, evidence, uncertainty) -> item id/status when a gate needs the user
User:  accept -> research_worklog op=update with by="user" (agents can never do that)
```

## Git 工作流

可能跨会话的工作记录在 `.research/worklog/` 的 JSON 存储里：`plan.json` 存目标、里程碑、下一步与决策，`items/<id>.json` 一项一个文件。`PLAN.md`、`INDEX.md` 与卡片视图由工具生成，不要手工编辑。

破坏性或风险较高的改动在按步骤命名的分支上进行，例如 `task/<title>+<id>`（有用户关卡的工作用卡片，内部工作用团队任务），不直接改默认分支。卡片或团队任务记录 base 和 head 提交，reviewer 以 `git diff <base>..<head>` 作为代码审查的依据，并仍然复跑验收检查。

分支只在卡片被验收后合并，合并后删除。数据集、checkpoint、日志、缓存等生成物不入库。项目不是 git 仓库时，审查退回用文件哈希快照加卡片上记录的证据。

## 工作日志

会话只是一次对话，不是项目本身：`.research/worklog/`、git 与架构卡片承载工作；聊天、团队与后台任务只存在于当前会话。恢复项目时先调用 `research_state`，再读相关项与证据。

恢复时先调用 `research_state`，再按需 `research_worklog op=get` 读目标项与最新证据。视图只是给人看的镜像，以 JSON 为准。

## 团队模型配置

设置页为默认团队成员保留多个具名模型配置，下一次 spawn 时使用选中的那一个。

打开：

```text
Plugins → dsh-research-team-preset → research-team-settings → Configure
```

页面顶部的配置栏：

- **切换**：选择下一次默认 teammate 使用的配置（`团队配置` 下拉框）。
- **新建配置**：追加一个含八个空角色行的配置。
- **配置名称**：重命名选中的配置。名称必填、唯一，且最多 60 个字符。
- **删除配置**：二次确认点击后删除选中的配置。最后一个配置无法删除。

每个配置中，每个默认成员各占一行：

- **Model**：一个下拉框，包含所有 provider 的模型，provider 分组标题不可点击。选择一个模型会同时设置 provider 和 model。
- **Reasoning effort**：第二个下拉框，包含所选模型声明的推理强度，外加一个「模型默认」选项。

空的 model 表示「继承 Lead 的路由」；空的 effort 表示「使用模型默认值」。省略 `model` 时，`spawn_teammate_with_model` 会读取选中配置中该角色的默认值；显式传入的 `model` 会覆盖它。直接调用 `spawn_teammate` 始终继承 Lead。

路由在 spawn 时解析，先直接读 `$DSH_HOME/research-team-settings.json`，读不到才退回进程内的快照，因此即使会话是在「插件」页首次保存之前打开的，也能取到已配置的路由。队友名字里出现完整角色词（`advisor`、`ELHA-R advisor`、`advisor-hi`）就会匹配到该角色；名字里没有标准角色时该队友继承 Lead 路由，工具结果会带一条 `diagnostics` 说明匹配到哪个角色、为什么没有配置。Lead 可以调用 `research_team_routes` 查看当前配置表，不必猜 provider 和 model 名称。

建议的能力层级，仅作为起点而非规则：

| 角色 | 建议层级 | 理由 |
| --- | --- | --- |
| `designer` | 最强 | 设计上的错误会让每一次运行都失效 |
| `advisor` | 最强，且与 designer 属于不同模型家族 | 独立批评需要不同的视角 |
| `builder` | 高 | 代码正确性与长上下文 |
| `reviewer` | 高，且与 builder、runner 属于不同模型家族 | 证据审计需要自己的视角 |
| `researcher` | 中高 | 基线与 SOTA 判断 |
| `writer` | 中 | 依据已核对证据进行有条理的写作 |
| `data` | 中低 | 借助工具进行流程化获取 |
| `runner` | 中低 | 工具可靠性重于深度推理 |

整个配置列表会一起保存，因此切换配置不会丢弃在另一个配置中所做的修改。页面在保存前校验名称，保存被拒绝时显示服务端的错误文本。

行名称很重要：`research-team-settings` 必须保持在**包根目录** `dsh-research-team-preset`。DSH 的 client 模块扫描器只会为精确的包根行发现 `dsh.client`；子路径名称会启动 host 插件，但永远不会加载页面。

### 设置存储位置

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

- `activeProfileId` 指定下一个 teammate 使用的配置。该值缺失或未知时，服务端回退到第一个配置。
- 旧文件（`{ "roles": { ... } }` 或裸的角色映射）会在内存中迁移为单个名为 `默认配置` 的配置；文件会在下一次保存时改写为配置结构。旧的 `POST { "roles": ... }` 只更新活动配置，因此旧脚本不会丢掉其他配置。
- JSON 文件是唯一事实来源。host 插件在启动时加载它；`getSettings()` 和 `modelForRole()` 会从中刷新，因此页面和下一个 teammate 都能看到最新值。
- 文件缺失或暂时无法读取时，会保留最后一次有效的内存快照，而不是将其清空。
- 设置文件**不在**本仓库中。请单独备份。它按 `DSH_HOME` 区分，而不是按 profile 区分。
- 不存储任何凭据；只保存配置名称和 provider/model/effort 字符串。
- 保存设置无需重启 DSH 即可生效：设置存储会重新读取文件，下一次 spawn 会解析活动配置。修改本插件自身的代码仍需重启 DSH，因为 host 部分在 host 层注册 WebSocket/HTTP 路由和「插件」页插槽。
- 0.1.0 版本修复了早期构建中的一个加载器 bug：文件把角色包在 `"roles"` 下，而旧加载器把整个对象传给角色规范化器，导致重启后设置全部为空。当前加载器会解包 `"roles"`，迁移旧文件，并兼容裸的角色映射。

## 配置参考

| 设置 | 位置 | 说明 |
| --- | --- | --- |
| Preset id | `cordis.patch.yml` | `research-team`；任务卡应使用 `presetId=research-team` |
| Persona | `cordis.patch.yml` | 英文 system prompt；模式级规则 |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | 设为 `false` 可移除 `spawn_teammate_with_model` 及其服务包装 |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | modeled spawn 工具使用的 subagent provider；默认 `spawn` / `fork` |
| `research-team-settings` 行 | `cordis.patch.yml` | 顶层 host 行；保持包根名称 |
| 团队模型配置 | `$DSH_HOME/research-team-settings.json` | 具名配置；活动配置为八个默认角色提供 provider/model/reasoningEffort |

## 工作原理

- **Preset**：`cordis.patch.yml` 声明 persona、工具行、modeled-teammates 子模块和顶层设置行。
- **按角色路由**：`plugin/modeled-teammates.js` 通过 `AsyncLocalStorage` 包装 `subagents.startActivation`，只对 `spawn_teammate_with_model` 调用注入 `agentOptions`。路由由 `plugin/settings-file.js` 在 spawn 时直接读配置 JSON 解析，读不到才退回进程内快照，因此 preset 子模块不再依赖顶层设置行先填好快照。官方 Agent Teams 包未被修改。 Cordis 对服务返回可追踪代理，因此包装器校验自身属性描述符，而不比较方法身份。
- **设置**：`settings/index.js` 加载/保存配置 JSON 文件并提供 `GET/POST /api/dsh-research-team-settings`；`client/index.js` 通过 `plugins.row.config` 注册「插件」页的配置编辑器。
- **刷新**：`plugin/settings-store.js` 持有内存快照，在每次读取和 spawn 时解析活动配置，并在读取失败时保留最后一次有效快照。

## 故障排查

### 设置似乎在重启后被重置

0.1.0 版本修复了已知原因：旧加载器把整个 `{ roles: ... }` 对象传给角色规范化器，导致设置全部为空。请更新到 0.1.0 或更高版本，重启 DSH，并检查：

- `$DSH_HOME/research-team-settings.json` 存在并且包含已保存的配置；
- 旧的 `{ "roles": ... }` 文件会显示为单个 `默认配置` 配置，并在下一次保存时改写为配置结构；
- `research-team-settings` 行的名称完全为 `dsh-research-team-preset`；
- 当前 host 运行的是本 checkout，而不是过期的已安装副本。

### 每个队友都跑在 Lead 的模型上

先看 spawn 结果里第一行上方的文字。应用了配置或显式路由时会打印 `requested=<provider>/<model> effort=<effort>`；没有匹配到路由时会打印 `requested=inherit (Lead route)` 并附一条 `note:`。`note:` 里点名某个角色，说明活动配置里该角色没有填 provider/model；提示名字不是标准角色，说明队友名字里没有出现角色词。

另外两种原因与配置文件无关。一是 Lead 调用了普通的 `spawn_teammate`，它永远继承 Lead；persona 已要求 Lead 使用 modeled 工具并且不要传 `model`，也不要因为不确定名字就退回。二是保存设置时所处的 `DSH_HOME` 与运行中的 host 读取的不是同一个，可以对比 `research_team_routes` 打印的 `settings file:` 与 `echo $DSH_HOME`。

### 设置页没有出现在「插件」中

- 该行必须是包根，而不是 `dsh-research-team-preset/settings`。
- client 部分在安装后需要重启 DSH 并刷新浏览器。
- 检查 bundle 是否已在 profile 中启用。

### 团队工具缺失

### 任务工作日志工具缺失

工作日志条目显示在「研究」侧栏里，来自 `worklog/INDEX.md`

### `spawn_teammate_with_model` 不可用

该子模块包装了一个内部 subagent 服务。DSH 升级可能改变激活结构。检查失败信息；如果包装器无法安装，请设置 `research-modeled-teammates.enabled: false`，重启，并使用普通的 `spawn_teammate`。

### 预设未列出

确认 bundle 已安装并启用，重启 DSH，然后新建会话。Preset 声明在启动时加载。

### `research_project` 无法解析工作区

在 GUI 中把工作目录作为 DSH 项目/工作区打开，或传入已知项目；该工具不会猜测。

## 已知限制

- 按角色的模型路由是一个内部服务包装，不是官方的 Agent Teams 扩展。DSH 升级可能破坏它；回退方案见上文。
- profile 级依赖不会被自动安装或启用。本仓库记录它们，但不负责管理。
- 团队模型配置保存在 `$DSH_HOME` 下的独立 JSON 文件中；它们不属于 DSH 标准配置导出/备份的一部分。更换机器时请复制该文件。
- 模型菜单是带 provider 分组的原生 `<select>`，不是可搜索的自定义选择器。
- 该模式不会在会话启动时自动创建八名 teammate。Lead 按任务需要创建角色。
- 该模式不会在已有仓库内部再初始化仓库，也不会自行提交工作日志或仓库脚手架。
- 成员可以使用一层 subagent；更深层的委派被有意禁用。

## 许可证

MIT。参见 [LICENSE](../LICENSE)。

## 致谢

工作日志条目显示在「研究」侧栏里，来自 `worklog/INDEX.md`

贡献与内部开发说明见 [DEVELOPMENT.md](../DEVELOPMENT.md)。
