/* Research panel copy.
 *
 * `panel/client.js` ships as one prebuilt classic module loaded through
 * `window.__ModuleLoader__`, so it cannot import a sibling file in the browser.
 * This module is the source of truth for the panel's user-visible copy: a
 * verbatim copy of everything below the header lives in `panel/client.js`
 * between two "generated from panel/i18n.js" markers. Regenerate or verify it
 * with:
 *
 *   node tmp/build-panel-i18n.mjs          # rewrite the copy in panel/client.js
 *   node tmp/build-panel-i18n.mjs --check  # fail when the copy has drifted
 *
 * Chinese is the source language: the keys of both dictionaries are the exact
 * Chinese strings the panel renders, so `t()` can return its argument unchanged
 * for zh / zh-TW / zh-CN and the Chinese output stays byte-identical.
 *
 * The panel follows the DSH language setting: `normalizeLocale` maps every code
 * that does not start with "zh" to English, `setLocale` publishes a change to
 * every subscriber, and React re-renders through `subscribe` + `get`.
 */

export const MESSAGES = {
  zh: {
    '输入': '输入',
    '模块': '模块',
    '输出': '输出',
    '数据': '数据',
    '目标': '目标',
    '说明': '说明',
    '方法': '方法',
    '模型': '模型',
    '实验': '实验',
    '流程': '流程',
    '已登记': '已登记',
    '待批准': '待批准',
    '已批准待启动': '已批准待启动',
    '运行中': '运行中',
    '已完成': '已完成',
    '已停止': '已停止',
    '失败': '失败',
    '已拒绝': '已拒绝',
    '进行中': '进行中',
    '待确认': '待确认',
    '阻塞': '阻塞',
    '待办': '待办',
    '完成': '完成',
    '通过': '通过',
    '等待': '等待',
    '已取消': '已取消',
    '空闲': '空闲',
    '启动中': '启动中',
    '需要你验收': '需要你验收',
    '内部步骤': '内部步骤',
    '阻塞：{text}': '阻塞：{text}',
    '取消：{text}': '取消：{text}',
    '证据 {count} 条': '证据 {count} 条',
    '清单 {done}/{total}': '清单 {done}/{total}',
    '未命名成员': '未命名成员',
    '未分配工作项': '未分配工作项',
    '旧版成员：名册来自会话早期的 team/member 记录': '旧版成员：名册来自会话早期的 team/member 记录',
    '模型：未知': '模型：未知',
    '模型：{model}': '模型：{model}',
    '正在': '正在',
    '上次': '上次',
    '{prefix}：#{id} {title}{when}': '{prefix}：#{id} {title}{when}',
    '状态：{status}': '状态：{status}',
    '下一步：{next}': '下一步：{next}',
    '（{since}更新）': '（{since}更新）',
    '（{effort}）': '（{effort}）',
    '刚刚': '刚刚',
    '{seconds} 秒前': '{seconds} 秒前',
    '{minutes} 分钟前': '{minutes} 分钟前',
    '{hours} 小时前': '{hours} 小时前',
    '{month}月{day}日': '{month}月{day}日',
    '{minutes} 分钟': '{minutes} 分钟',
    '{hours} 小时': '{hours} 小时',
    '{hours} 小时 {rest} 分': '{hours} 小时 {rest} 分',
    '{days} 天 {hours} 小时': '{days} 天 {hours} 小时',
    '缩小': '缩小',
    '放大': '放大',
    '中键拖动平移，工具栏缩放，双击适应窗口': '中键拖动平移，工具栏缩放，双击适应窗口',
    '文献接口未就绪，重启 DSH 后可用': '文献接口未就绪，重启 DSH 后可用',
    '实验审批方式已设为自动审批。': '实验审批方式已设为自动审批。',
    '实验审批方式已设为需要审批。': '实验审批方式已设为需要审批。',
    '工作项已确认完成。': '工作项已确认完成。',
    '工作项已退回进行中。': '工作项已退回进行中。',
    '实验已批准。': '实验已批准。',
    '实验已拒绝。': '实验已拒绝。',
    '打不开 {path}': '打不开 {path}',
    '无法在侧栏打开': '无法在侧栏打开',
    '已加入输入框': '已加入输入框',
    '已复制引用，粘贴到输入框': '已复制引用，粘贴到输入框',
    '尚未设置研究目标': '尚未设置研究目标',
    '架构': '架构',
    '标题：{title}': '标题：{title}',
    '已归档「{label}」。': '已归档「{label}」。',
    '已恢复「{label}」。': '已恢复「{label}」。',
    '团队': '团队',
    '还没有队友': '还没有队友',
    '把这张架构卡移出面板，可用 research_architecture 的 restore 操作恢复': '把这张架构卡移出面板，可用 research_architecture 的 restore 操作恢复',
    '归档': '归档',
    '暂无架构卡片': '暂无架构卡片',
    '单击或框选节点，针对它提问': '单击或框选节点，针对它提问',
    '已选择 {count} 个节点': '已选择 {count} 个节点',
    '引用': '引用',
    '工作项': '工作项',
    '隐藏已完成': '隐藏已完成',
  '暂无进行中的实验': '暂无进行中的实验',
    '已完成 {count}': '已完成 {count}',
    '暂无工作项': '暂无工作项',
    ' · 下一步 {next}': ' · 下一步 {next}',
    ' · 附件 {count}': ' · 附件 {count}',
    '交付文件': '交付文件',
    '{path}（未找到）': '{path}（未找到）',
    '确认完成': '确认完成',
    '退回': '退回',
    '实验审批方式': '实验审批方式',
    '需要审批': '需要审批',
    '自动审批': '自动审批',
    '暂无实验记录': '暂无实验记录',
    '已进行 {elapsed}': '已进行 {elapsed}',
    '用时 {elapsed}': '用时 {elapsed}',
    '预算 {budget}': '预算 {budget}',
    '已批准': '已批准',
    '问题：{text}': '问题：{text}',
    '假设：{text}': '假设：{text}',
    '判定：{text}': '判定：{text}',
    '原因：{text}': '原因：{text}',
    '证据：{text}': '证据：{text}',
    '开始 {time}': '开始 {time}',
    ' · 结束 {time}': ' · 结束 {time}',
    '批准': '批准',
    '拒绝': '拒绝',
    '文献': '文献',
    '读取文献…': '读取文献…',
    '还没有文献分类': '还没有文献分类',
    '暂无条目': '暂无条目',
    '未署名': '未署名',
    '复制 {citation}': '复制 {citation}',
    '已复制 {citation} 引用': '已复制 {citation} 引用',
    '插入引用到会话输入框': '插入引用到会话输入框',
    '打开': '打开',
    '在 Zotero 中打开': '在 Zotero 中打开',
    '已在 Zotero 中打开': '已在 Zotero 中打开',
    '已用默认应用打开': '已用默认应用打开',
    '打开失败': '打开失败',
    '科研': '科研',
    '团队状态：架构、工作项与实验': '团队状态：架构、工作项与实验'
  },
  en: {
    '输入': 'Input',
    '模块': 'Module',
    '输出': 'Output',
    '数据': 'Data',
    '目标': 'Target',
    '说明': 'Note',
    '方法': 'Method',
    '模型': 'Model',
    '实验': 'Experiment',
    '流程': 'Pipeline',
    '已登记': 'Registered',
    '待批准': 'Needs approval',
    '已批准待启动': 'Approved, not started',
    '运行中': 'Running',
    '已完成': 'Completed',
    '已停止': 'Stopped',
    '失败': 'Failed',
    '已拒绝': 'Rejected',
    '进行中': 'In progress',
    '待确认': 'Needs review',
    '阻塞': 'Blocked',
    '待办': 'To do',
    '完成': 'Done',
    '通过': 'Passed',
    '等待': 'Waiting',
    '已取消': 'Canceled',
    '空闲': 'Idle',
    '启动中': 'Starting',
    '需要你验收': 'Needs your sign-off',
    '内部步骤': 'Internal step',
    '阻塞：{text}': 'Blocked: {text}',
    '取消：{text}': 'Canceled: {text}',
    '证据 {count} 条': 'Evidence: {count}',
    '清单 {done}/{total}': 'Checklist {done}/{total}',
    '未命名成员': 'Unnamed member',
    '未分配工作项': 'No work item assigned',
    '旧版成员：名册来自会话早期的 team/member 记录': 'Legacy member: this roster entry comes from early team/member records in the session',
    '模型：未知': 'Model: unknown',
    '模型：{model}': 'Model: {model}',
    '正在': 'Working',
    '上次': 'Last',
    '{prefix}：#{id} {title}{when}': '{prefix}: #{id} {title}{when}',
    '状态：{status}': 'Status: {status}',
    '下一步：{next}': 'Next: {next}',
    '（{since}更新）': ' (updated {since})',
    '（{effort}）': ' ({effort})',
    '刚刚': 'Just now',
    '{seconds} 秒前': '{seconds}s ago',
    '{minutes} 分钟前': '{minutes} min ago',
    '{hours} 小时前': '{hours} h ago',
    '{month}月{day}日': '{month}/{day}',
    '{minutes} 分钟': '{minutes} min',
    '{hours} 小时': '{hours} h',
    '{hours} 小时 {rest} 分': '{hours} h {rest} min',
    '{days} 天 {hours} 小时': '{days} d {hours} h',
    '缩小': 'Zoom out',
    '放大': 'Zoom in',
    '中键拖动平移，工具栏缩放，双击适应窗口': 'Middle-drag to pan, the toolbar to zoom, double-click to fit',
    '文献接口未就绪，重启 DSH 后可用': 'The literature API is not ready yet; restart DSH to enable it',
    '实验审批方式已设为自动审批。': 'Experiment approval is now automatic.',
    '实验审批方式已设为需要审批。': 'Experiment approval is now required.',
    '工作项已确认完成。': 'Work item confirmed complete.',
    '工作项已退回进行中。': 'Work item moved back to in progress.',
    '实验已批准。': 'Experiment approved.',
    '实验已拒绝。': 'Experiment rejected.',
    '打不开 {path}': 'Cannot open {path}',
    '无法在侧栏打开': 'Cannot open it in the sidebar',
    '已加入输入框': 'Added to the input box',
    '已复制引用，粘贴到输入框': 'Quote copied; paste it into the input box',
    '尚未设置研究目标': 'No research objective yet',
    '架构': 'Architecture',
    '标题：{title}': 'Title: {title}',
    '已归档「{label}」。': 'Archived "{label}".',
    '已恢复「{label}」。': 'Restored "{label}".',
    '团队': 'Team',
    '还没有队友': 'No teammates yet',
    '把这张架构卡移出面板，可用 research_architecture 的 restore 操作恢复': 'Take this architecture card off the panel; bring it back with the restore operation of research_architecture',
    '归档': 'Archive',
    '暂无架构卡片': 'No architecture cards yet',
    '单击或框选节点，针对它提问': 'Click or drag-select nodes to ask about them',
    '已选择 {count} 个节点': 'Nodes selected: {count}',
    '引用': 'Cite',
    '工作项': 'Work items',
    '隐藏已完成': 'Hide completed',
  '暂无进行中的实验': 'No runs in progress',
    '已完成 {count}': 'Completed: {count}',
    '暂无工作项': 'No work items yet',
    ' · 下一步 {next}': ' · Next: {next}',
    ' · 附件 {count}': ' · Attachments: {count}',
    '交付文件': 'Deliverables',
    '{path}（未找到）': '{path} (not found)',
    '确认完成': 'Confirm',
    '退回': 'Send back',
    '实验审批方式': 'Experiment approval',
    '需要审批': 'Requires approval',
    '自动审批': 'Automatic',
    '暂无实验记录': 'No experiments yet',
    '已进行 {elapsed}': 'Running for {elapsed}',
    '用时 {elapsed}': 'Took {elapsed}',
    '预算 {budget}': 'Budget {budget}',
    '已批准': 'Approved',
    '问题：{text}': 'Question: {text}',
    '假设：{text}': 'Hypothesis: {text}',
    '判定：{text}': 'Decision rule: {text}',
    '原因：{text}': 'Reason: {text}',
    '证据：{text}': 'Evidence: {text}',
    '开始 {time}': 'Started {time}',
    ' · 结束 {time}': ' · ended {time}',
    '批准': 'Approve',
    '拒绝': 'Reject',
    '文献': 'Literature',
    '读取文献…': 'Loading literature…',
    '还没有文献分类': 'No literature categories yet',
    '暂无条目': 'No entries',
    '未署名': 'No author',
    '复制 {citation}': 'Copy {citation}',
    '已复制 {citation} 引用': 'Copied {citation}',
    '插入引用到会话输入框': 'Insert the citation into the chat input',
    '打开': 'Open',
    '在 Zotero 中打开': 'Open in Zotero',
    '已在 Zotero 中打开': 'Opened in Zotero',
    '已用默认应用打开': 'Opened with the default application',
    '打开失败': 'Could not open',
    '科研': 'Research',
    '团队状态：架构、工作项与实验': 'Team status: architecture, work items and experiments'
  }
}

/* Chinese unless the code explicitly asks for another language: the panel is
   Chinese by default, exactly as it was before it followed the DSH setting. */
export function normalizeLocale(value) {
  const code = String(value === undefined || value === null ? '' : value).trim().toLowerCase()
  if (code === '') return 'zh'
  return code.startsWith('zh') ? 'zh' : 'en'
}

let active = 'zh'
const listeners = new Set()

/* Snapshot for React: `get` is the store's current locale code. */
export function get() {
  return active
}

/* Push the DSH locale into the store; subscribers re-render only on a change. */
export function setLocale(value) {
  const next = normalizeLocale(value)
  if (next === active) return active
  active = next
  for (const listener of Array.from(listeners)) {
    try {
      listener()
    } catch (error) {
      void error
    }
  }
  return active
}

export function subscribe(listener) {
  if (typeof listener !== 'function') return () => {}
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/* `english` is the escape hatch for one Chinese word with two English senses
   (引用 is "Quote" on the architecture card and "Cite" in the literature list). */
export function t(text, english) {
  if (active !== 'en') return text
  if (english !== undefined && english !== null) return english
  const translated = MESSAGES.en[text]
  return translated === undefined ? text : translated
}

/* Chinese templates stay the keys; the English dictionary replaces the whole
   pattern before the variables are filled in. */
export function tf(pattern, vars) {
  const template = t(pattern)
  if (vars === undefined || vars === null) return template
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (whole, name) => {
    const value = vars[name]
    return value === undefined || value === null ? whole : String(value)
  })
}
