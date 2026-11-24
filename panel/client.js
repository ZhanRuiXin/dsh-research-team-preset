window.__ModuleLoader__.load({
  id: 'dsh-research-team-panel',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    const React = require('react')
    const h = React.createElement
    /* A render error inside this bundle must not blank the whole pane: show it. */
    class RenderBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { error: '' }
      }
      static getDerivedStateFromError(error) {
        return { error: error instanceof Error ? error.message : String(error) }
      }
      componentDidCatch(error, info) {
        console.error('research-team render failed', error, info)
      }
      render() {
        if (this.state.error !== '') return h('div', { className: 'rtp-error' }, `面板渲染失败：${this.state.error}`)
        return this.props.children
      }
    }

    /* --- panel copy: generated from panel/i18n.js by tmp/build-panel-i18n.mjs --- */
    const MESSAGES = {
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
        '团队状态：架构、工作项与实验': '团队状态：架构、工作项与实验',
        '阻塞项决策方式': '阻塞项决策方式',
        '人工决策': '人工决策',
        '智能决策': '智能决策',
        '阻塞项改由 advisor 决策。': '阻塞项改由 advisor 决策。',
        '阻塞项改由你决策。': '阻塞项改由你决策。'
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
        '团队状态：架构、工作项与实验': 'Team status: architecture, work items and experiments',
        '阻塞项决策方式': 'Blocker decisions',
        '人工决策': 'Human',
        '智能决策': 'Advisor',
        '阻塞项改由 advisor 决策。': 'Blockers are decided by the advisor now.',
        '阻塞项改由你决策。': 'Blockers are yours to decide now.'
      }
    }

    /* Chinese unless the code explicitly asks for another language: the panel is
       Chinese by default, exactly as it was before it followed the DSH setting. */
    function normalizeLocale(value) {
      const code = String(value === undefined || value === null ? '' : value).trim().toLowerCase()
      if (code === '') return 'zh'
      return code.startsWith('zh') ? 'zh' : 'en'
    }

    let active = 'zh'
    const listeners = new Set()

    /* Snapshot for React: `get` is the store's current locale code. */
    function get() {
      return active
    }

    /* Push the DSH locale into the store; subscribers re-render only on a change. */
    function setLocale(value) {
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

    function subscribe(listener) {
      if (typeof listener !== 'function') return () => {}
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    }

    /* `english` is the escape hatch for one Chinese word with two English senses
       (引用 is "Quote" on the architecture card and "Cite" in the literature list). */
    function t(text, english) {
      if (active !== 'en') return text
      if (english !== undefined && english !== null) return english
      const translated = MESSAGES.en[text]
      return translated === undefined ? text : translated
    }

    /* Chinese templates stay the keys; the English dictionary replaces the whole
       pattern before the variables are filled in. */
    function tf(pattern, vars) {
      const template = t(pattern)
      if (vars === undefined || vars === null) return template
      return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (whole, name) => {
        const value = vars[name]
        return value === undefined || value === null ? whole : String(value)
      })
    }
    /* --- end panel copy --- */

    /* ---------------------------------------------------------------- */
    /* Research sidebar: team state and architecture cards.              */
    /* ---------------------------------------------------------------- */

    const PANEL_ROUTE = '/api/dsh-research-team-panel'
const LITERATURE_ROUTE = '/api/dsh-research-team-literature'

    const KIND_LABELS = {
      input: '输入',
      module: '模块',
      output: '输出',
      data: '数据',
      loss: '目标',
      note: '说明'
    }
    const CARD_KIND_LABELS = {
      method: '方法',
      model: '模型',
      experiment: '实验',
      pipeline: '流程'
    }

    function pad(value) {
      return String(value).padStart(2, '0')
    }

    function formatSince(iso) {
      if (typeof iso !== 'string' || iso === '') return ''
      const then = Date.parse(iso)
      if (Number.isNaN(then)) return ''
      const seconds = Math.max(0, Math.round((Date.now() - then) / 1000))
      if (seconds < 60) return tf('{seconds} 秒前', { seconds })
      const minutes = Math.round(seconds / 60)
      if (minutes < 60) return tf('{minutes} 分钟前', { minutes })
      const hours = Math.round(minutes / 60)
      if (hours < 48) return tf('{hours} 小时前', { hours })
      const date = new Date(then)
      return tf('{month}月{day}日', { month: date.getMonth() + 1, day: date.getDate() })
    }

    const NODE_FONT = 14
    const NODE_PAD_X = 12
    const NODE_MIN_W = 96
    const NODE_MAX_W = 220
    const NODE_LINE_H = 15
    const NODE_MIN_H = 42

    /* Deterministic box metrics mirrored from plugin/index.js ARCH_NODE_TEXT:
       the panel and the layout tool must agree, or a card that checks clean
       server-side draws as overlapped boxes here. */
    function nodeWidthOf(text) {
      let width = 0
      for (const char of String(text ?? '')) width += /[\u3400-\u9fff]/.test(char) ? NODE_FONT : NODE_FONT * 0.55
      return width
    }

    /* CJK breaks per character, Latin per word, over-long lines split by width. */
    function wrapNodeLabel(label) {
      const limit = Math.max(24, NODE_MAX_W - NODE_PAD_X * 2)
      const words = []
      let buffer = ''
      for (const char of String(label ?? '')) {
        if (/[\u3400-\u9fff]/.test(char) || char === ' ') {
          if (buffer !== '') { words.push(buffer); buffer = '' }
          words.push(char)
        } else buffer += char
      }
      if (buffer !== '') words.push(buffer)
      const lines = []
      let line = ''
      let width = 0
      for (const word of words) {
        const advance = nodeWidthOf(word)
        if (word !== ' ' && width > 0 && width + advance > limit) { lines.push(line.trimEnd()); line = ''; width = 0 }
        line += word
        width += advance
        while (width > limit && line.length > 1) {
          let keep = ''
          let used = 0
          for (const char of line) {
            const size = /[\u3400-\u9fff]/.test(char) ? NODE_FONT : NODE_FONT * 0.55
            if (used + size > limit && keep !== '') break
            keep += char
            used += size
          }
          lines.push(keep.trimEnd())
          line = line.slice(keep.length)
          width = nodeWidthOf(line)
        }
      }
      lines.push(line.trimEnd())
      return lines.length === 0 ? [''] : lines
    }

    /* Width follows the label, height the wrapped lines; same rule as the server. */
    function sizeNode(node) {
      const label = String(node.label ?? '')
      const w = Math.min(NODE_MAX_W, Math.max(NODE_MIN_W, Math.ceil(nodeWidthOf(label) + NODE_PAD_X * 2)))
      const lines = wrapNodeLabel(label)
      return {
        id: node.id,
        label: node.label,
        kind: node.kind,
        x: Number(node.x) || 0,
        y: Number(node.y) || 0,
        w,
        h: Math.max(NODE_MIN_H, lines.length * NODE_LINE_H + 20),
        lines,
        fontSize: NODE_FONT
      }
    }

    function statusTone(status) {
      const value = String(status ?? '').toLowerCase()
      if (value === 'awaiting_approval' || value === 'planned') return 'var(--dsw-alias-state-warn-primary)'
      if (value === 'approved') return 'var(--dsw-alias-state-success-primary)'
      if (value === 'completed') return 'var(--dsw-alias-state-success-primary)'
      if (value === 'stopped') return 'var(--dsw-alias-label-secondary)'
      if (value === 'rejected' || value === 'failed') return 'var(--dsw-alias-state-error-primary)'
      if (value === 'in_progress' || value === 'running') return 'var(--dsw-alias-brand-primary)'
      if (value === 'blocked' || value === 'failed') return 'var(--dsw-alias-state-error-primary)'
      if (value === 'in_review' || value === 'waiting') return 'var(--dsw-alias-state-warn-primary)'
      if (value === 'done' || value === 'passed') return 'var(--dsw-alias-state-success-primary)'
      return 'var(--dsw-alias-label-tertiary)'
    }

    const STATUS_LABELS = {
      planned: '已登记',
      awaiting_approval: '待批准',
      approved: '已批准待启动',
      running: '运行中',
      completed: '已完成',
      stopped: '已停止',
      failed: '失败',
      rejected: '已拒绝',
      in_progress: '进行中',
      in_review: '待确认',
      blocked: '阻塞',
      todo: '待办',
      done: '完成',
      failed: '失败',
      passed: '通过',
      waiting: '等待',
      canceled: '已取消'
    }

    /* One line of detail shown only when a work item row is expanded. */
function entryExtra(entry, depth = 0) {
  return [
    depth > 0 ? t('内部步骤') : entry.kind === 'gated' ? t('需要你验收') : entry.kind === 'internal' ? t('内部步骤') : '',
    entry.blocked ? tf('阻塞：{text}', { text: entry.blocked }) : '',
    entry.reason ? tf('取消：{text}', { text: entry.reason }) : '',
    entry.evidenceCount ? tf('证据 {count} 条', { count: entry.evidenceCount }) : '',
    entry.checklistTotal ? tf('清单 {done}/{total}', { done: entry.checklistDone || 0, total: entry.checklistTotal }) : ''
  ].filter(Boolean).join(' · ')
}

function statusLabel(status) {
      const value = String(status ?? '').toLowerCase()
      return t(STATUS_LABELS[value] || String(status || ''))
    }

    const MEMBER_LABELS = {
      running: '运行中',
      inactive: '空闲',
      provisioning: '启动中',
      failed: '失败'
    }

    function memberLabel(status) {
      const value = String(status ?? '').toLowerCase()
      return t(MEMBER_LABELS[value] || '空闲')
    }

    function memberBrief(member) {
      const lines = []
      const running = String(member.status ?? '').toLowerCase() === 'running'
      lines.push(member.role === 'lead'
        ? `${member.name || 'lead'} · ${memberLabel(member.status)}`
        : `${member.name || t('未命名成员')} · ${memberLabel(member.status)}`)
      const item = member.item
      if (item !== null && item !== undefined) {
        const when = item.updated ? tf('（{since}更新）', { since: formatSince(item.updated) }) : ''
        const prefix = running ? t('正在') : t('上次')
        lines.push(tf('{prefix}：#{id} {title}{when}', { prefix, id: item.id, title: item.title, when }))
        lines.push(tf('状态：{status}', { status: statusLabel(item.status) }))
        if (item.next) lines.push(tf('下一步：{next}', { next: item.next }))
      } else {
        lines.push(t('未分配工作项'))
      }
      if (member.legacy === true) lines.push(t('旧版成员：名册来自会话早期的 team/member 记录'))
      const model = shortModel(member.model)
      if (model !== '') {
        const suffix = member.effort ? tf('（{effort}）', { effort: member.effort }) : ''
        lines.push(tf('模型：{model}', { model: model + suffix }))
      } else {
        lines.push(t('模型：未知'))
      }
      return lines.join('\n')
    }

    function shortModel(model) {
      const text = String(model ?? '')
      if (text === '') return ''
      const tail = text.split('/').pop()
      return tail.length > 22 ? `${tail.slice(0, 21)}…` : tail
    }

    function memberTone(status) {
      const value = String(status ?? '').toLowerCase()
      if (value === 'running') return 'var(--dsw-alias-state-success-primary)'
      if (value === 'provisioning') return 'var(--dsw-alias-state-warn-primary)'
      if (value === 'failed') return 'var(--dsw-alias-state-error-primary)'
      return 'var(--dsw-alias-label-tertiary)'
    }

    function formatElapsed(ms) {
      const value = Number(ms)
      if (!Number.isFinite(value) || value < 0) return ''
      if (value < 60 * 1000) return t('刚刚')
      const minutes = Math.floor(value / 60000)
      if (minutes < 60) return tf('{minutes} 分钟', { minutes })
      const hours = Math.floor(minutes / 60)
      const rest = minutes % 60
      if (hours < 24) return rest === 0 ? tf('{hours} 小时', { hours }) : tf('{hours} 小时 {rest} 分', { hours, rest })
      const days = Math.floor(hours / 24)
      return tf('{days} 天 {hours} 小时', { days, hours: hours % 24 })
    }

    const PANEL_CSS = `
.rtp-root{position:relative;display:flex;flex-direction:column;height:100%;min-height:0;overflow-y:auto;overflow-x:hidden;box-sizing:border-box;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased}
.rtp-root *{box-sizing:border-box}
.rtp-root ::-webkit-scrollbar{width:8px;height:8px}
.rtp-root ::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l3);border-radius:8px}
.rtp-header{position:relative;padding:16px 16px 13px;border-bottom:.5px solid var(--dsw-alias-border-l2);background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-bg-layer-1) 92%,transparent),transparent)}
.rtp-eyebrow{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;letter-spacing:.12em;color:var(--dsw-alias-label-tertiary);text-transform:uppercase}
.rtp-live{width:5px;height:5px;border-radius:50%;background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-success-primary) 18%,transparent)}
.rtp-title{margin-top:0;font-size:18px;font-weight:600;line-height:1.4;letter-spacing:-.01em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rtp-section{padding:14px 16px 2px}
.rtp-sechead{display:flex;align-items:center;gap:8px;margin-bottom:9px}
.rtp-seclabel{font-size:13px;font-weight:600;letter-spacing:.08em;color:var(--dsw-alias-label-tertiary)}
.rtp-count{font-size:13px;line-height:1;padding:3px 6px;border-radius:999px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1);font-variant-numeric:tabular-nums}
.rtp-grow{flex:1}
.rtp-ghost{height:27px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:13.5px;cursor:pointer}
.rtp-ghost:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.rtp-empty{padding:18px 12px;border:.5px dashed var(--dsw-alias-border-l2);border-radius:10px;text-align:center;font-size:14px;line-height:1.6;color:var(--dsw-alias-label-tertiary);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 60%,transparent)}
.rtp-row{display:flex;align-items:flex-start;gap:9px;padding:9px 10px;margin:0 0 6px;border-radius:10px;border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);cursor:pointer}
.rtp-row:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}
.rtp-dot{flex:0 0 auto;width:6px;height:6px;margin-top:7px;border-radius:50%}
.rtp-rowmain{min-width:0;flex:1}
.rtp-rowtitle{display:flex;align-items:flex-start;gap:8px;font-size:15px;line-height:1.35;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rtp-rowtitletext{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rtp-rowtitle > .rtp-chip,.rtp-rowtitle > .rtp-rowdecide{flex:0 0 auto;margin-top:1px;display:inline-flex;align-items:center;gap:5px}
.rtp-id{flex:0 0 auto;font-size:13px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-family-mono);letter-spacing:.02em}
.rtp-rowmeta{margin-top:3px;font-size:13.5px;line-height:1.45;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rtp-row.open > .rtp-rowmain > .rtp-rowtitle{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere}
.rtp-row.open > .rtp-rowmain > .rtp-rowtitle > .rtp-rowtitletext{white-space:normal;overflow:visible;overflow-wrap:anywhere}
.rtp-row.open{flex-wrap:wrap}
.rtp-row.open > .rtp-rowmain > .rtp-rowmeta{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere}
.rtp-subrow.open > .rtp-rowmain > .rtp-rowtitle{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere}
.rtp-subrow.open > .rtp-rowmain > .rtp-rowtitle > .rtp-rowtitletext{white-space:normal;overflow:visible;overflow-wrap:anywhere}
.rtp-subrow.open > .rtp-rowmain > .rtp-rowmeta{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere}
.rtp-subitems{flex:0 0 auto;width:calc(100% - 15px);margin:6px 0 2px 15px;display:flex;flex-direction:column;gap:6px}
.rtp-subrow{display:flex;align-items:flex-start;gap:8px;padding:7px 9px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);cursor:pointer}
.rtp-subrow:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}
.rtp-subrow.open{flex-wrap:wrap;background:var(--dsw-alias-bg-layer-1)}
.rtp-subrow .rtp-rowtitle{font-size:15px;line-height:1.4}
.rtp-subrow .rtp-rowmeta{font-size:13px;margin-top:2px}
.rtp-itemextra{margin-top:5px;font-size:13px;line-height:1.5;color:var(--dsw-alias-label-secondary);white-space:normal;overflow-wrap:anywhere}
.rtp-files{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:8px}
.rtp-fileslabel{font-size:12.5px;line-height:1.4;color:var(--dsw-alias-label-tertiary)}
.rtp-file{display:inline-flex;align-items:center;max-width:100%;height:24px;padding:0 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}
.rtp-file:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}
.rtp-file.missing{opacity:.55;cursor:default}
.rtp-chip{display:inline-flex;align-items:center;height:20px;padding:0 7px;border-radius:5px;font-size:13px;font-weight:500;line-height:1;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1)}
.rtp-teamgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:7px}
.rtp-mem{display:flex;align-items:center;gap:7px;min-width:0;padding:8px 9px;border-radius:9px;background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l1)}
.rtp-archgrid{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;max-width:100%;align-items:center}
.rtp-hint{margin:2px 0 5px;font-size:12.5px;line-height:1.4;color:var(--dsw-alias-state-warn-primary)}
    .rtp-archg{flex:0 0 100%;font-size:11.5px;line-height:1.4;color:var(--dsw-alias-label-tertiary);margin:2px 0 0}
.rtp-arch{display:inline-flex;align-items:center;gap:6px;flex:0 1 auto;min-width:0;max-width:200px;height:26px;padding:0 11px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;cursor:pointer;white-space:nowrap;overflow:hidden}
.rtp-arch-t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rtp-arch:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}
.rtp-arch:focus-visible{outline:2px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);outline-offset:1px}
.rtp-arch.on{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 45%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);color:var(--dsw-alias-label-primary);font-weight:500}
.rtp-arch.on::before{content:'';flex:0 0 auto;width:5px;height:5px;border-radius:50%;background:var(--dsw-alias-brand-primary)}
.rtp-root{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.rtp-root textarea,.rtp-root input,.rtp-id,.rtp-rowtitle,.rtp-rowmeta,.rtp-rowmain,.rtp-annot,.rtp-empty{-webkit-user-select:text;user-select:text}
.rtp-mem:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}
.rtp-mem.is-lead{background:linear-gradient(180deg,var(--dsw-alias-bg-layer-2),var(--dsw-alias-bg-layer-1));border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 34%,transparent)}
.rtp-mem.is-lead .rtp-avatar{color:var(--dsw-alias-brand-primary);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 40%,transparent)}
.rtp-mem.is-lead .rtp-avatar.is-on{border-color:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-success-primary) 16%,transparent)}
.rtp-avatar{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;font-size:12.5px;font-weight:600;text-transform:uppercase;background:var(--dsw-alias-bg-layer-3);border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}
.rtp-avatar.is-on{border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-label-primary)}
.rtp-pulse{position:absolute;right:-2px;bottom:-2px;width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 0 var(--dsw-alias-state-success-primary);animation:rtp-pulse 1.6s ease-out infinite}
@keyframes rtp-pulse{0%{box-shadow:0 0 0 0 rgba(74,222,128,.5)}70%{box-shadow:0 0 0 5px rgba(74,222,128,0)}100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}}
@media (prefers-reduced-motion: reduce){.rtp-pulse{animation:none}}
.rtp-membody{min-width:0;flex:1}
.rtp-memname{display:flex;align-items:center;gap:5px;min-width:0;margin-top:3px}
.rtp-membername{font-size:13.5px;font-weight:600;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rtp-rolechip{flex:0 0 auto;display:inline-flex;align-items:center;height:17px;padding:0 5px;border-radius:4px;font-size:11.5px;font-weight:500;background:var(--dsw-alias-bg-layer-3);border:.5px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-tertiary)}
.rtp-memmeta{display:flex;align-items:center;gap:5px;margin-top:3px;min-width:0;font-size:12px;color:var(--dsw-alias-label-tertiary)}
.rtp-memitem{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rtp-tip{position:absolute;z-index:80;width:244px;max-width:calc(100% - 16px);padding:8px 10px;border-radius:9px;background:var(--dsw-alias-bg-layer-3);border:.5px solid var(--dsw-alias-border-l2);box-shadow:var(--dsw-shadow-lv2);font-size:12px;line-height:1.55;color:var(--dsw-alias-label-secondary);pointer-events:none;animation:rtp-tip-in .12s ease-out}
.rtp-tiparrow{position:absolute;top:-5px;width:9px;height:9px;transform:rotate(45deg);background:var(--dsw-alias-bg-layer-3);border-left:.5px solid var(--dsw-alias-border-l2);border-top:.5px solid var(--dsw-alias-border-l2)}
.rtp-tipbody{position:relative}
@keyframes rtp-tip-in{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.rtp-tip{animation:none}}
.rtp-tiptitle{margin-bottom:3px;font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-primary)}
.rtp-tipline{white-space:normal;overflow-wrap:anywhere}
.rtp-pill{flex:0 0 auto;display:inline-flex;align-items:center;gap:4px;height:19px;padding:0 7px;border-radius:999px;font-size:11.5px;font-weight:500;border:.5px solid transparent}
.rtp-idle{flex:0 0 auto;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-border-l3);margin-right:3px}
.rtp-idle.on{background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-success-primary) 18%,transparent)}
.rtp-pill.on{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 30%,transparent)}
.rtp-pill.off{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1)}
.rtp-pill.warn{color:var(--dsw-alias-state-warn-primary);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 30%,transparent)}
.rtp-pill.err{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 30%,transparent)}
.rtp-seeds{display:inline-flex;gap:3px;align-items:center;vertical-align:middle}
 .rtp-items{max-height:320px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l2) transparent;padding-right:4px;margin-right:-6px}
    .rtp-tag{padding:1px 7px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}
 .rtp-tag.warn{color:var(--dsw-alias-state-warn);border-color:color-mix(in srgb,var(--dsw-alias-state-warn) 35%,transparent)}
 .rtp-toggle{height:22px;padding:0 9px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer}
 .rtp-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
 .rtp-exp{max-height:304px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l2) transparent;padding-right:4px;margin-right:-6px}
.rtp-exp::-webkit-scrollbar{width:8px}
.rtp-exp::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:8px}
.rtp-exp::-webkit-scrollbar-track{background:transparent}
.rtp-sel{height:24px;border-radius:6px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border:.5px solid var(--dsw-alias-border-l1);font:inherit;font-size:12.5px;padding:0 4px;outline:none;cursor:pointer}
.rtp-sel:hover{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}
.rtp-mini{height:24px;padding:0 9px;border-radius:6px;font:inherit;font-size:12.5px;line-height:1;cursor:pointer;background:transparent;border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}
.rtp-mini:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.rtp-mini.ok{border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 45%,transparent);color:var(--dsw-alias-state-success-primary)}
.rtp-mini.no{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 45%,transparent);color:var(--dsw-alias-state-error-primary)}
.rtp-approval{font-size:12.5px;color:var(--dsw-alias-label-tertiary);margin-left:2px}
.rtp-seed{width:7px;height:7px;border-radius:2px;background:var(--dsw-alias-border-l3)}
.rtp-seed.on{background:var(--dsw-alias-brand-primary)}
.rtp-canvas{position:relative;margin-top:8px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;overflow:hidden;background:var(--dsw-alias-bg-layer-1)}
.rtp-canvas svg{display:block;width:100%;height:320px;touch-action:none;cursor:crosshair}
.rtp-canvas,.rtp-canvas *{user-select:none;-webkit-user-select:none}
.rtp-canvas.rtp-panning svg{cursor:grabbing}
.rtp-tools{position:absolute;top:8px;right:8px;display:flex;gap:2px;padding:2px;border-radius:7px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 82%,transparent);border:.5px solid var(--dsw-alias-border-l2);backdrop-filter:blur(6px)}
.rtp-tools button{width:27px;height:27px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:16px;line-height:1;cursor:pointer}
.rtp-tools button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.rtp-annot{margin-top:8px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:13.5px;color:var(--dsw-alias-label-tertiary)}
.rtp-pill{display:inline-flex;align-items:center;gap:4px;height:23px;padding:0 7px;border-radius:6px;font-size:13px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);border:.5px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 32%,transparent);color:var(--dsw-alias-brand-primary)}
.rtp-primary{height:29px;padding:0 12px;border:0;border-radius:7px;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font:inherit;font-size:14px;font-weight:500;cursor:pointer}
.rtp-primary:disabled{opacity:.45;cursor:default}
.rtp-error{margin:10px 16px 0;padding:8px 10px;border-radius:8px;font-size:14px;color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent);border:.5px solid color-mix(in srgb,var(--dsw-alias-state-error-primary) 28%,transparent)}
.rtp-litgroup{margin:0 0 12px}
.rtp-litcat{margin:0 0 6px;font-size:12.5px;font-weight:600;letter-spacing:.02em;color:var(--dsw-alias-label-secondary)}
.rtp-litnone{padding:2px 2px 6px;font-size:13px;color:var(--dsw-alias-label-tertiary)}
.rtp-litrow{align-items:center;cursor:pointer}
.rtp-litact{display:flex;gap:4px;flex:none}
.rtp-litact .rtp-ghost{height:24px;padding:0 6px;font-size:12.5px}
.rtp-litnote{margin-top:6px;font-size:13.5px;line-height:1.6;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;overflow-wrap:anywhere}
.rtp-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:64px;z-index:60;padding:7px 12px;border-radius:8px;font-size:14px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border:.5px solid var(--dsw-alias-border-l2);box-shadow:var(--dsw-shadow-lv2)}
.rtp-skel{height:10px;border-radius:5px;background:linear-gradient(90deg,var(--dsw-alias-bg-layer-2) 25%,var(--dsw-alias-bg-layer-3) 37%,var(--dsw-alias-bg-layer-2) 63%);background-size:400% 100%;animation:rtp-shine 1.2s ease-in-out infinite}
@keyframes rtp-shine{0%{background-position:100% 0}100%{background-position:0 0}}
`

    function ensurePanelStyles() {
      if (typeof document === 'undefined') return
      if (document.getElementById('rtp-panel-style') !== null) return
      const style = document.createElement('style')
      style.id = 'rtp-panel-style'
      style.textContent = PANEL_CSS
      document.head.appendChild(style)
    }

    function seedDots(seeds) {
      const match = /^(\d+)\s*\/\s*(\d+)$/.exec(String(seeds ?? ''))
      if (match === null) return null
      const done = Math.min(Number(match[1]), Number(match[2]))
      const total = Math.min(Number(match[2]), 12)
      return Array.from({ length: total }, (_, index) =>
        h('span', { key: `s${index}`, className: index < done ? 'rtp-seed on' : 'rtp-seed' }))
    }

    function PanelIcon(props) {
      const size = props && props.size ? props.size : 15
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        fill: 'none',
        'aria-hidden': 'true',
        style: { display: 'inline-block', verticalAlign: 'middle', flex: '0 0 auto' }
      }, [
        h('rect', { key: 'r', x: 2.1, y: 3.1, width: 11.8, height: 9.8, rx: 2, stroke: 'currentColor', strokeWidth: 1.3 }),
        h('path', { key: 'd', d: 'M6.2 3.4v9.2', stroke: 'currentColor', strokeWidth: 1.3 }),
        h('path', { key: 'l1', d: 'M8.3 6.3h4.6', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
        h('path', { key: 'l2', d: 'M8.3 9.1h3.2', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' })
      ])
    }

    function Section(props) {
      return h('section', { className: 'rtp-section' }, [
        h('div', { key: 'head', className: 'rtp-sechead' }, [
          h('span', { key: 'label', className: 'rtp-seclabel' }, props.title),
          props.count === undefined || props.count === 0
            ? null
            : h('span', { key: 'count', className: 'rtp-count' }, props.count),
          h('span', { key: 'grow', className: 'rtp-grow' }),
          props.action === undefined ? null : props.action
        ]),
        h('div', { key: 'body' }, props.children)
      ])
    }

    function edgePath(from, to) {
      const fc = { x: Number(from.x) + Number(from.w) / 2, y: Number(from.y) + Number(from.h) / 2 }
      const tc = { x: Number(to.x) + Number(to.w) / 2, y: Number(to.y) + Number(to.h) / 2 }
      const dx = tc.x - fc.x
      const dy = tc.y - fc.y
      if (Math.abs(dx) >= Math.abs(dy)) {
        const sx = dx >= 0 ? Number(from.x) + Number(from.w) : Number(from.x)
        const tx = dx >= 0 ? Number(to.x) : Number(to.x) + Number(to.w)
        const bend = Math.max(28, Math.abs(tx - sx) * 0.45)
        const sign = dx >= 0 ? 1 : -1
        return `M${sx},${fc.y} C${sx + sign * bend},${fc.y} ${tx - sign * bend},${tc.y} ${tx},${tc.y}`
      }
      const sy = dy >= 0 ? Number(from.y) + Number(from.h) : Number(from.y)
      const ty = dy >= 0 ? Number(to.y) : Number(to.y) + Number(to.h)
      const bend = Math.max(28, Math.abs(ty - sy) * 0.45)
      const sign = dy >= 0 ? 1 : -1
      return `M${fc.x},${sy} C${fc.x},${sy + sign * bend} ${tc.x},${ty - sign * bend} ${tc.x},${ty}`
    }

    const KIND_ACCENTS = {
      input: 'var(--dsw-alias-state-success-primary)',
      module: 'var(--dsw-alias-brand-primary)',
      output: 'var(--dsw-alias-state-warn-primary)',
      data: 'var(--dsw-alias-state-business-primary)',
      loss: 'var(--dsw-alias-state-error-primary)',
      note: 'var(--dsw-alias-label-tertiary)'
    }

    function fitBox(nodes, aspect) {
      const list = Array.isArray(nodes) ? nodes : []
      let x0 = Infinity
      let y0 = Infinity
      let x1 = -Infinity
      let y1 = -Infinity
      for (const node of list) {
        const x = Number(node.x) || 0
        const y = Number(node.y) || 0
        const w = Number(node.w) || 160
        const hgt = Number(node.h) || 56
        x0 = Math.min(x0, x)
        y0 = Math.min(y0, y)
        x1 = Math.max(x1, x + w)
        y1 = Math.max(y1, y + hgt)
      }
      if (!Number.isFinite(x0)) { x0 = 0; y0 = 0; x1 = 320; y1 = 220 }
      x0 -= Math.max(40, (x1 - x0) * 0.06)
      y0 -= Math.max(30, (y1 - y0) * 0.08)
      x1 += Math.max(40, (x1 - x0) * 0.06)
      y1 += Math.max(30, (y1 - y0) * 0.08)
      let w = x1 - x0
      let hgt = y1 - y0
      if (w / hgt > aspect) {
        const next = w / aspect
        y0 -= (next - hgt) / 2
        hgt = next
      } else {
        const next = hgt * aspect
        x0 -= (next - w) / 2
        w = next
      }
      return { x: x0, y: y0, w, h: hgt }
    }

    function ArchitectureCanvas(props) {
      const card = props.card
      const selected = props.selected
      const svgRef = React.useRef(null)
      const [view, setView] = React.useState(null)
      const [marquee, setMarquee] = React.useState(null)
      const [pointerId, setPointerId] = React.useState(null)
      const panRef = React.useRef(null)

      const wrapRef = React.useRef(null)
      const [aspect, setAspect] = React.useState(520 / 300)
      React.useEffect(() => {
        const el = wrapRef.current
        if (el === null || typeof ResizeObserver === 'undefined') return undefined
        const observer = new ResizeObserver((entries) => {
          const rect = entries[0].contentRect
          if (rect.width > 80) setAspect(rect.width / 300)
        })
        observer.observe(el)
        return () => observer.disconnect()
      }, [])
      const nodes = Array.isArray(card.nodes) ? card.nodes : []
      const sized = nodes.map((node) => sizeNode(node))
      const auto = fitBox(sized, aspect)
      const box = view || auto
      const zoom = Math.round((auto.w / box.w) * 100)

      function point(event) {
        const svg = svgRef.current
        if (svg === null) return { x: 0, y: 0 }
        const matrix = svg.getScreenCTM()
        if (matrix === null) return { x: 0, y: 0 }
        const pt = svg.createSVGPoint()
        pt.x = event.clientX
        pt.y = event.clientY
        const mapped = pt.matrixTransform(matrix.inverse())
        return { x: mapped.x, y: mapped.y }
      }

      function zoomTo(next, anchor) {
        const target = Math.min(4, Math.max(1, next))
        const w = auto.w / target
        const hgt = auto.h / target
        const ratioX = anchor === undefined ? 0.5 : (anchor.x - box.x) / box.w
        const ratioY = anchor === undefined ? 0.5 : (anchor.y - box.y) / box.h
        setView({ x: (anchor === undefined ? auto.x + auto.w / 2 : anchor.x) - ratioX * w, y: (anchor === undefined ? auto.y + auto.h / 2 : anchor.y) - ratioY * hgt, w, h: hgt })
      }

      function onDown(event) {
        if (event.button === 1) {
          event.preventDefault()
          const svg = svgRef.current
          const rect = svg === null ? null : svg.getBoundingClientRect()
          panRef.current = {
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            box,
            scale: rect === null || rect.width === 0 ? 1 : box.w / rect.width
          }
          if (svg !== null) {
            try { svg.setPointerCapture(event.pointerId) } catch {}
          }
          return
        }
        if (event.button !== 0) return
        const target = event.target
        if (target !== null && typeof target.closest === 'function' && target.closest('[data-node]') !== null) return
        const start = point(event)
        setPointerId(event.pointerId)
        setMarquee({ x0: start.x, y0: start.y, x1: start.x, y1: start.y })
        if (svgRef.current !== null) svgRef.current.setPointerCapture(event.pointerId)
      }

      function onMove(event) {
        const pan = panRef.current
        if (pan !== null && pan.pointerId === event.pointerId) {
          event.preventDefault()
          setView({
            x: pan.box.x - (event.clientX - pan.clientX) * pan.scale,
            y: pan.box.y - (event.clientY - pan.clientY) * pan.scale,
            w: pan.box.w,
            h: pan.box.h
          })
          return
        }
        if (marquee === null) return
        const current = point(event)
        setMarquee({ ...marquee, x1: current.x, y1: current.y })
      }

      function onUp() {
        const pan = panRef.current
        if (pan !== null) {
          panRef.current = null
          if (svgRef.current !== null) {
            try { svgRef.current.releasePointerCapture(pan.pointerId) } catch {}
          }
          return
        }
        if (marquee === null) return
        const x0 = Math.min(marquee.x0, marquee.x1)
        const x1 = Math.max(marquee.x0, marquee.x1)
        const y0 = Math.min(marquee.y0, marquee.y1)
        const y1 = Math.max(marquee.y0, marquee.y1)
        /* Pointer capture retargets the click to the SVG, so the background rect's
           onClick never fires: treat a press without movement as a click on empty
           space and clear the selection here. */
        const moved = x1 - x0 > 6 || y1 - y0 > 6
        if (!moved && typeof props.onClear === 'function') {
          props.onClear()
        } else if (x1 - x0 > 6 && y1 - y0 > 6) {
          const hits = sized.filter((node) => (
            node.x < x1 && node.x + node.w > x0 && node.y < y1 && node.y + node.h > y0
          )).map((node) => node.id)
          props.onMarquee(hits)
        }
        setMarquee(null)
        if (svgRef.current !== null && pointerId !== null) {
          try { svgRef.current.releasePointerCapture(pointerId) } catch {}
        }
        setPointerId(null)
      }

      const edges = Array.isArray(card.edges) ? card.edges : []
      const byId = new Map(sized.map((node) => [node.id, node]))
      const gridId = `rtp-grid-${String(card.id).replace(/[^a-zA-Z0-9_-]/g, '')}`

      const edgeElements = edges.map((edge, index) => {
        const from = byId.get(edge.from)
        const to = byId.get(edge.to)
        if (from === undefined || to === undefined) return null
        return h('path', {
          key: `e${index}`,
          d: edgePath(from, to),
          fill: 'none',
          stroke: 'var(--dsw-alias-border-l3)',
          strokeWidth: 1.2,
          markerEnd: `url(#rtp-arrow)`
        })
      })

      const nodeElements = sized.map((node, index) => {
        const isSelected = selected.indexOf(node.id) >= 0
        const w = node.w
        const hgt = node.h
        const x = node.x
        const y = node.y
        const fontSize = node.fontSize
        const lines = node.lines
        const clipId = `rtp-clip-${String(card.id).replace(/[^a-zA-Z0-9_-]/g, '')}-${index}`
        const accent = KIND_ACCENTS[node.kind] || KIND_ACCENTS.module
        return h('g', {
          key: node.id,
          'data-node': node.id,
          onClick: (event) => {
            event.stopPropagation()
            props.onToggle(node.id)
          },
          onPointerDown: (event) => event.stopPropagation(),
          onMouseEnter: (event) => props.onNodeHover(event, [node.label, `${t(KIND_LABELS[node.kind] || node.kind || '模块')} · ${node.id}`]),
          onMouseLeave: () => props.onNodeHoverEnd(),
          style: { cursor: 'pointer' }
        }, [
          h('defs', { key: 'clipdef' }, [
            h('clipPath', { key: 'cp', id: clipId }, [
              h('rect', { x: x + 2, y: y + 2, width: Math.max(0, w - 4), height: Math.max(0, hgt - 4), rx: 7 })
            ])
          ]),
          h('rect', {
            key: 'hit',
            x, y, width: w, height: hgt, rx: 9,
            fill: isSelected ? 'color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,var(--dsw-alias-bg-layer-2))' : 'var(--dsw-alias-bg-layer-2)',
            stroke: isSelected ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-border-l2)',
            strokeWidth: isSelected ? 1.5 : 1
          }),
          h('rect', { key: 'accent', x: x + 0.5, y: y + 8, width: 3, height: hgt - 16, rx: 1.5, fill: accent, opacity: 0.9 }),
          h('g', { key: 'text', clipPath: `url(#${clipId})` }, [
            h('text', {
              key: 'l1',
              x: x + 13,
              y: y + (lines.length > 1 ? hgt / 2 - 4 : hgt / 2 + 5),
              fill: 'var(--dsw-alias-label-primary)',
              fontSize,
              fontWeight: 500,
              fontFamily: 'inherit'
            }, lines[0]),
            lines.length > 1
              ? h('text', {
                  key: 'l2',
                  x: x + 13,
                  y: y + hgt / 2 + 13,
                  fill: 'var(--dsw-alias-label-secondary)',
                  fontSize,
                  fontFamily: 'inherit'
                }, lines[1])
              : null
          ]),
        ])
      })

      return h('div', { className: 'rtp-canvas', ref: wrapRef }, [
        h('svg', {
          key: 'svg',
          ref: svgRef,
          viewBox: `${box.x} ${box.y} ${box.w} ${box.h}`,
          onAuxClick: (event) => event.preventDefault(),
          onContextMenu: (event) => event.preventDefault(),
          onPointerDown: onDown,
          onPointerMove: onMove,
          onPointerUp: onUp,
          onPointerLeave: onUp,
          onDoubleClick: () => setView(null)
        }, [
          h('defs', { key: 'defs' }, [
            h('pattern', { key: 'grid', id: gridId, width: 24, height: 24, patternUnits: 'userSpaceOnUse' }, [
              h('circle', { key: 'd', cx: 1, cy: 1, r: 1, fill: 'var(--dsw-alias-border-l1)' })
            ]),
            h('marker', {
              key: 'arrow',
              id: 'rtp-arrow',
              markerWidth: 7,
              markerHeight: 7,
              refX: 6,
              refY: 3.5,
              orient: 'auto'
            }, [h('path', { key: 'p', d: 'M0,0 L7,3.5 L0,7 z', fill: 'var(--dsw-alias-border-l3)' })])
          ]),
          h('rect', {
            key: 'bg',
            x: box.x,
            y: box.y,
            width: box.w,
            height: box.h,
            fill: `url(#${gridId})`,
            onClick: (event) => {
              event.stopPropagation()
              props.onClear()
            }
          }),
          ...edgeElements,
          ...nodeElements,
          marquee === null ? null : h('rect', {
            key: 'marquee',
            x: Math.min(marquee.x0, marquee.x1),
            y: Math.min(marquee.y0, marquee.y1),
            width: Math.abs(marquee.x1 - marquee.x0),
            height: Math.abs(marquee.y1 - marquee.y0),
            fill: 'color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent)',
            stroke: 'var(--dsw-alias-brand-primary)',
            strokeWidth: 1,
            strokeDasharray: '4 3'
          })
        ]),
        h('div', { key: 'tools', className: 'rtp-tools' }, [
          h('button', { key: 'out', type: 'button', title: t('缩小'), onClick: () => zoomTo((auto.w / box.w) * 0.85) }, '−'),
          h('button', { key: 'pct', type: 'button', title: t('中键拖动平移，工具栏缩放，双击适应窗口'), onClick: () => setView(null), style: { width: '42px', fontSize: '13px' } }, `${zoom}%`),
          h('button', { key: 'in', type: 'button', title: t('放大'), onClick: () => zoomTo((auto.w / box.w) * 1.15) }, '+')
        ])
      ])
    }

    let pluginCtx = null

    function focusComposer() {
      if (typeof document === 'undefined') return
      const card = document.querySelector('[data-composer-card]')
      const box = card === null ? null : card.querySelector('[contenteditable="true"], textarea')
      if (box !== null) box.focus()
    }

    function ResearchPanel(props) {
      const sessionId = props.sessionId
      /* The store pushes a locale change; the state bump re-renders the copy. */
      const [, localeTick] = React.useState(0)
      React.useEffect(() => subscribe(() => localeTick((value) => value + 1)), [])
      const [state, setState] = React.useState(null)
      const [error, setError] = React.useState('')
      const [selectedCard, setSelectedCard] = React.useState('')
      const [selectedNodes, setSelectedNodes] = React.useState([])
      const [busy, setBusy] = React.useState(false)
      const [toast, setToast] = React.useState('')
      const [hover, setHover] = React.useState(null)
      const [showFinished, setShowFinished] = React.useState(false)
      const [showFinishedRuns, setShowFinishedRuns] = React.useState(false)
      const [openItems, setOpenItems] = React.useState(null)
      const [openRun, setOpenRun] = React.useState('')
      const [literature, setLiterature] = React.useState({ loading: true, categories: [], count: 0, error: '' })
      const [openLit, setOpenLit] = React.useState('')
      const rootRef = React.useRef(null)

      React.useEffect(() => { ensurePanelStyles() }, [])

      const load = React.useCallback(async () => {
        try {
          const response = await fetch(`${PANEL_ROUTE}?session=${encodeURIComponent(sessionId || '')}`)
          const data = await response.json()
          if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`)
          setState(data)
          setError('')
          setSelectedCard((current) => {
            if (current !== '' && (data.architectures || []).some((card) => card.id === current)) return current
            const first = (data.architectures || [])[0]
            return first === undefined ? '' : first.id
          })
        } catch (failure) {
          setError(failure.message)
        }
      }, [sessionId])

      React.useEffect(() => {
        load()
        const timer = setInterval(() => {
          if (document.visibilityState === 'visible') load()
        }, 5000)
        const onVisible = () => {
          if (document.visibilityState === 'visible') load()
        }
        document.addEventListener('visibilitychange', onVisible)
        return () => {
          clearInterval(timer)
          document.removeEventListener('visibilitychange', onVisible)
        }
      }, [load])

      React.useEffect(() => {
        let cancelled = false
        const loadLiterature = async () => {
          try {
            const response = await fetch(`${LITERATURE_ROUTE}?session=${encodeURIComponent(sessionId || '')}`)
            const body = await response.text()
            let data = null
            try { data = JSON.parse(body) } catch { data = null }
            if (!response.ok || data === null || !data.ok) {
              const message = data !== null && typeof data.error === 'string'
                ? data.error
                : response.status === 404
                  ? t('文献接口未就绪，重启 DSH 后可用')
                  : `HTTP ${response.status}`
              throw new Error(message)
            }
            if (!cancelled) setLiterature({ loading: false, categories: data.categories || [], count: data.count || 0, error: '' })
          } catch (failure) {
            if (!cancelled) setLiterature({ loading: false, categories: [], count: 0, error: failure.message })
          }
        }
        loadLiterature()
        const timer = setInterval(() => {
          if (document.visibilityState === 'visible') loadLiterature()
        }, 8000)
        return () => { cancelled = true; clearInterval(timer) }
      }, [sessionId])

      React.useEffect(() => {
        if (toast === '') return undefined
        const timer = setTimeout(() => setToast(''), 2600)
        return () => clearTimeout(timer)
      }, [toast])

      const architectures = (state && state.architectures) || []
      const visibleArch = architectures.filter((entry) => entry.archived !== true)
      const card = visibleArch.find((entry) => entry.id === selectedCard) || visibleArch[0]
      const worklog = (state && state.worklog) || {}
      const cards = (state && state.cards) || []
      const runs = (state && state.runs) || []
      const runState = (entry) => (entry.state === undefined ? entry.status : entry.state)
      const finishedRuns = runs.filter((entry) => /^(completed|stopped|failed|rejected)$/.test(runState(entry)))
      const visibleRuns = showFinishedRuns ? runs : runs.filter((entry) => /^(completed|stopped|failed|rejected)$/.test(runState(entry)) === false)
      const team = (state && state.team) || []
      const experimentSettings = (state && state.experimentSettings) || { approval: 'required' }
      const decisionMode = state && state.decisionMode === 'advisor' ? 'advisor' : 'human'

      function toggleNode(id) {
        setSelectedNodes((current) => (current.indexOf(id) >= 0 ? current.filter((item) => item !== id) : [...current, id]))
      }

      async function postPanel(payload, message) {
        setBusy(true)
        try {
          const response = await fetch(PANEL_ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ...payload, sessionId })
          })
          const data = await response.json()
          if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`)
          setState(data)
          setError('')
          setToast(message)
        } catch (failure) {
          setToast(failure.message)
        } finally {
          setBusy(false)
        }
      }

      function setApprovalMode(mode) {
        postPanel({ op: 'approval-mode', mode }, mode === 'auto' ? t('实验审批方式已设为自动审批。') : t('实验审批方式已设为需要审批。'))
      }

      function setDecisionMode(mode) {
        postPanel({ op: 'decision-mode', mode }, mode === 'advisor' ? t('阻塞项改由 advisor 决策。') : t('阻塞项改由你决策。'))
      }

      function decideItem(itemId, decision) {
        postPanel({ op: 'item', itemId, decision }, decision === 'accept' ? t('工作项已确认完成。') : t('工作项已退回进行中。'))
      }

      function decideRun(runId, decision) {
        postPanel({ op: 'approve', runId, decision }, decision === 'approved' ? t('实验已批准。') : t('实验已拒绝。'))
      }

      // The sidebar preview handles text and images; a PDF, an archive or an
    // office file has no preview tab, so opening it there did nothing.
      const NATIVE_OPEN = /\.(pdf|docx?|xlsx?|pptx?|zip|7z|rar|tar|gz|epub|mp4|mov|mp3|wav)$/i

      function openThroughHost(filePath) {
        void fetch(PANEL_ROUTE, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ op: 'open-file', path: filePath, sessionId })
        })
          .then((response) => response.json().catch(() => ({})).then((body) => {
            if (body !== null && body.ok === true) setToast(t('已用默认应用打开'))
            else setToast(String(body !== null && body.error ? body.error : t('打开失败')))
          }))
          .catch(() => setToast(t('打开失败')))
      }

      function openDeliverable(event, file) {
        if (event !== undefined && typeof event.stopPropagation === 'function') event.stopPropagation()
        if (file === null || typeof file !== 'object') return
        const api = pluginCtx === null || typeof pluginCtx.get !== 'function' ? undefined : pluginCtx.get('sidebarRight')
        if (String(file.kind) === 'url' && typeof file.url === 'string' && file.url.length > 0
          && api !== undefined && typeof api.openTab === 'function') {
          api.openTab('browser', { params: { url: file.url } })
          return
        }
        const filePath = typeof file.path === 'string' ? file.path : ''
        if (filePath !== '' && NATIVE_OPEN.test(filePath)) {
          openThroughHost(filePath)
          return
        }
        // openResource takes a dsh-resource:// address, never a plain file URL;
        // the host sends the address it resolved for the deliverable.
        if (typeof file.address === 'string' && file.address.length > 0
          && api !== undefined && typeof api.openResource === 'function') {
          try {
            api.openResource(file.address)
            return
          } catch (failure) {
            void failure
          }
        }
        if (filePath !== '') {
          openThroughHost(filePath)
          return
        }
        setToast(t('打开失败'))
      }

      function quoteSelection() {
        if (card === undefined || selectedNodes.length === 0) return
        const text = `Architecture: ${card.id} (v${card.version})\nNodes: ${selectedNodes.join(', ')}`
        try {
          const actx = pluginCtx !== null && typeof pluginCtx.sessions?.scope === 'function' ? pluginCtx.sessions.scope(sessionId) : undefined
          const conversation = actx !== undefined && typeof actx.get === 'function' ? actx.get('conversation') : undefined
          const shell = conversation !== undefined && typeof conversation.input?.for === 'function' ? conversation.input.for(actx) : undefined
          const actions = shell === undefined ? undefined : shell.actions
          if (actions !== undefined && typeof actions.insertQuote === 'function' && actions.insertQuote(text) !== false) {
            setSelectedNodes([])
            setToast(t('已加入输入框'))
            if (typeof window !== 'undefined') window.setTimeout(focusComposer, 30)
            return
          }
        } catch (failure) {
          void failure
        }
        try {
          navigator.clipboard.writeText(text)
          setToast(t('已复制引用，粘贴到输入框'))
        } catch (failure) {
          void failure
          setToast(text)
        }
      }

      function insertIntoComposer(text, message) {
        try {
          const actx = pluginCtx !== null && typeof pluginCtx.sessions?.scope === 'function' ? pluginCtx.sessions.scope(sessionId) : undefined
          const conversation = actx !== undefined && typeof actx.get === 'function' ? actx.get('conversation') : undefined
          const shell = conversation !== undefined && typeof conversation.input?.for === 'function' ? conversation.input.for(actx) : undefined
          const actions = shell === undefined ? undefined : shell.actions
          if (actions !== undefined && typeof actions.insertQuote === 'function' && actions.insertQuote(text) !== false) {
            setToast(message)
            if (typeof window !== 'undefined') window.setTimeout(focusComposer, 30)
            return true
          }
        } catch (failure) {
          void failure
        }
        try {
          navigator.clipboard.writeText(text)
          setToast(t('已复制引用，粘贴到输入框'))
        } catch (failure) {
          void failure
          setToast(text)
        }
        return false
      }

      function copyCitation(text, message) {
        try {
          navigator.clipboard.writeText(text)
          setToast(message)
        } catch (failure) {
          void failure
          setToast(text)
        }
      }

      function citationOf(entry) {
        return entry.citationKey || entry.key
      }

      function citeOf(entry) {
        return `\\cite{${citationOf(entry)}}`
      }

      function insertCitation(entry) {
        insertIntoComposer(citeOf(entry), t('已加入输入框'))
      }

      function openLiteratureItem(entry) {
        // A web page cannot follow zotero://: the browser refuses the scheme and
        // Electron only hands http(s) links to the OS. The host builds the fixed
        // link from the item key and starts it, so the desktop app opens the item.
        const key = String(entry.key || '')
        if (key === '') return
        void fetch(PANEL_ROUTE, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ op: 'open-zotero', id: key, sessionId })
        })
          .then((response) => response.json().catch(() => ({})).then((body) => {
            if (body !== null && body.ok === true) setToast(t('已在 Zotero 中打开'))
            else setToast(String(body !== null && body.error ? body.error : t('打开失败')))
          }))
          .catch(() => setToast(t('打开失败')))
      }

      const header = h('div', { key: 'header', className: 'rtp-header' }, [
        h('div', { key: 'objective', className: 'rtp-title' }, worklog.objective || t('尚未设置研究目标'))
      ])

      const archLabel = (entry) => {
        const title = String(entry.title || entry.id || '').trim()
        if (title === '') return String(entry.id || t('架构'))
        const chars = (text) => Array.from(text)
        let label = title
        // The chip already sits in its group row, so a leading "实现：" adds no
        // information and made every card in the group look identical. Drop it
        // and keep the specific part of the title.
        const report = String(entry.group || '').trim()
        const strip = (prefix) => {
          if (prefix === '') return ''
          const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          return label.replace(new RegExp(`^${escaped}\\s*[:：·|/-]\\s*`), '')
        }
        const withoutGroup = strip(report)
        if (withoutGroup !== '' && withoutGroup !== label) label = withoutGroup
        else {
          const parts = label.split(/[:：]/)
          if (parts.length > 1 && parts[0].trim() !== '' && chars(parts[0].trim()).length <= 8) {
            const rest = parts.slice(1).join('：').trim()
            if (rest !== '') label = rest
          }
        }
        label = label.trim() || title
        return chars(label).length <= 14 ? label : `${chars(label).slice(0, 14).join('')}…`
      }
      const archBrief = (entry) => {
        const label = archLabel(entry)
        const lines = [`${label} · v${entry.version}`]
        const title = entry.title || entry.id
        if (title !== label) lines.push(tf('标题：{title}', { title }))
        lines.push(t(entry.description || entry.summary || CARD_KIND_LABELS[entry.kind] || '架构'))
        return lines
      }
      const archiveCard = (entry, archived) => {
        if (archived) setSelectedCard('')
        else setSelectedCard(entry.id)
        setSelectedNodes([])
        void postPanel(
          { op: 'archive', id: entry.id, archived },
          archived ? tf('已归档「{label}」。', { label: archLabel(entry) }) : tf('已恢复「{label}」。', { label: archLabel(entry) })
        )
      }
      const archGroups = () => {
        const groups = new Map()
        for (const entry of visibleArch) {
          const name = t(entry.group || CARD_KIND_LABELS[entry.kind] || '架构')
          const list = groups.get(name) || []
          list.push(entry)
          groups.set(name, list)
        }
        return Array.from(groups.entries())
      }
      const archGroupList = archGroups()
      const showArchGroupNames = archGroupList.length > 1
      const archChips = visibleArch.length === 0 ? null : h('div', { key: 'seg', className: 'rtp-archgrid' },
        archGroupList.flatMap(([groupName, entries]) => [
          showArchGroupNames ? h('span', { key: `group-${groupName}`, className: 'rtp-archg' }, groupName) : null,
          ...entries.map((entry) => h('button', {
            key: entry.id,
            type: 'button',
            className: `rtp-arch${entry.id === (card && card.id) ? ' on' : ''}`,
            'aria-label': archBrief(entry).join('; '),
            onClick: () => {
              setSelectedCard(entry.id)
              setSelectedNodes([])
            },
            onMouseEnter: (event) => openTip(event, archBrief(entry)),
            onMouseLeave: () => setHover(null)
          }, h('span', { key: 't', className: 'rtp-arch-t' }, archLabel(entry))))
        ].filter(Boolean)))

      const teamOn = team.filter((member) => String(member.status).toLowerCase() === 'running').length
      const teamPill = (status) => {
        const value = String(status ?? '').toLowerCase()
        const tone = value === 'running' ? 'on' : value === 'provisioning' ? 'warn' : value === 'failed' ? 'err' : 'off'
        if (value === 'inactive') {
          return h('span', { key: 'pill', className: 'rtp-idle', title: t('空闲') })
        }
        if (value === 'running') {
          // The word 运行中 ate the width the member name needs; the dot keeps the
          // state visible and the hover card still spells it out.
          return h('span', { key: 'pill', className: 'rtp-idle on', title: t('运行中') })
        }
        return h('span', { key: 'pill', className: `rtp-pill ${tone}` }, memberLabel(value))
      }
      const estimateTipHeight = (lines, width) => {
        const inner = Math.max(40, width - 20)
        const unitsOf = (text) => {
          let units = 0
          for (const ch of String(text)) units += /[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? 2 : 1
          return units
        }
        const perLine = Math.max(10, inner / 6.4)
        let linesCount = 0
        lines.forEach((line) => { linesCount += Math.max(1, Math.ceil(unitsOf(line) / perLine)) })
        return 16 + 18 + linesCount * 18.6 + 4
      }
      const openTip = (event, lines) => {
        const rootEl = rootRef.current
        if (rootEl === null) return
        const rect = event.currentTarget.getBoundingClientRect()
        const box = rootEl.getBoundingClientRect()
        const width = Math.min(244, Math.max(160, box.width - 16))
        const height = estimateTipHeight(lines, width)
        const scrollTop = rootEl.scrollTop || 0
        const anchor = rect.left - box.left + 21
        const left = Math.max(8, Math.min(anchor - 26, box.width - width - 8))
        const arrow = Math.max(12, Math.min(anchor - left - 5, width - 20))
        const below = rect.bottom - box.top + scrollTop + 9
        const top = below + height > box.height + scrollTop
          ? Math.max(8, rect.top - box.top + scrollTop - height - 9)
          : below
        setHover({ lines, left, top, arrow })
      }

      const teamSection = h(Section, {
        key: 'team',
        title: t('团队'),
        action: null
      }, team.length === 0
        ? h('div', { key: 'empty', className: 'rtp-empty' }, t('还没有队友'))
        : h('div', { key: 'grid', className: 'rtp-teamgrid' }, team.map((member) => {
            const on = String(member.status).toLowerCase() === 'running'
            const model = shortModel(member.model)
            return h('div', {
              key: member.id || member.name,
              className: `rtp-mem${member.role === 'lead' ? ' is-lead' : ''}`,
              'aria-label': memberBrief(member).replaceAll('\n', '; '),
              onMouseEnter: (event) => openTip(event, memberBrief(member).split('\n')),
              onMouseLeave: () => setHover(null)
            }, [
              h('span', { key: 'av', className: `rtp-avatar${on ? ' is-on' : ''}` }, [
                h('span', { key: 'ch' }, (member.name || '?').slice(0, 1)),
                on ? h('span', { key: 'p', className: 'rtp-pulse' }) : null
              ].filter(Boolean)),
              h('span', { key: 'nm', className: 'rtp-membername' }, member.name || t('未命名成员')),
              h('span', { key: 'grow', style: { flex: '1 1 auto' } }),
              teamPill(member.status)
            ].filter(Boolean))
          })))

      const archSection = h(Section, {
        key: 'arch',
        title: t('架构'),
        count: 0,
        action: card === undefined
          ? undefined
          : h('button', {
              key: 'archive',
              type: 'button',
              className: 'rtp-ghost',
              title: t('把这张架构卡移出面板，可用 research_architecture 的 restore 操作恢复'),
              onClick: () => archiveCard(card, true)
            }, t('归档'))
      }, [
        visibleArch.length === 0
          ? h('div', { key: 'empty', className: 'rtp-empty' }, t('暂无架构卡片'))
          : h('div', { key: 'body' }, [
              archChips,
              h(ArchitectureCanvas, {
                key: 'canvas',
                card,
                selected: selectedNodes,
                onToggle: toggleNode,
                onNodeHover: (event, lines) => openTip(event, lines),
                onNodeHoverEnd: () => setHover(null),
                onMarquee: (ids) => setSelectedNodes((current) => Array.from(new Set([...current, ...ids]))),
                onClear: () => setSelectedNodes([])
              }),
              h('div', { key: 'annot', className: 'rtp-annot' }, [
                selectedNodes.length === 0
                  ? h('span', { key: 'l' }, t('单击或框选节点，针对它提问'))
                  : h('span', { key: 'l' }, tf('已选择 {count} 个节点', { count: selectedNodes.length })),
                ...selectedNodes.slice(0, 4).map((id) => h('span', { key: id, className: 'rtp-pill' }, id)),
                selectedNodes.length > 4 ? h('span', { key: 'more', className: 'rtp-pill' }, `+${selectedNodes.length - 4}`) : null,
                selectedNodes.length === 0
                  ? null
                  : h('button', {
                      key: 'quote',
                      type: 'button',
                      className: 'rtp-primary',
                      style: { marginLeft: 'auto', height: '27px', padding: '0 10px', fontSize: '13.5px' },
                      onClick: quoteSelection
                    }, t('引用', 'Quote'))
              ])
            ])
      ])

      const isFinishedCard = (entry) => /^(done|canceled)$/.test(entry.status)
      const parentIdOf = (entry) => (typeof entry.parent === 'string' ? entry.parent : '')
      const cardById = new Map(cards.map((entry) => [entry.id, entry]))
      const isChildCard = (entry) => {
        const parent = parentIdOf(entry)
        return parent !== '' && parent !== entry.id && cardById.has(parent)
      }
      // A step belongs to its gated item: hide it only when that item is hidden,
      // never because the step itself finished (the 已完成 toggle is about items).
      const parentHidden = (entry) => {
        const parent = parentIdOf(entry)
        if (parent === '' || parent === entry.id || cardById.has(parent) === false) return false
        return showFinished === false && isFinishedCard(cardById.get(parent))
      }
      const visibleCards = cards.filter((entry) => parentHidden(entry) === false && (isChildCard(entry) || showFinished || isFinishedCard(entry) === false))
      const finishedCount = cards.filter((entry) => isChildCard(entry) === false && isFinishedCard(entry)).length
      const visibleIds = new Set(visibleCards.map((entry) => entry.id))
      const childrenOf = new Map()
      const nested = new Set()
      for (const entry of visibleCards) {
        const parent = typeof entry.parent === 'string' ? entry.parent : ''
        if (parent === '' || parent === entry.id || visibleIds.has(parent) === false) continue
        if (childrenOf.has(parent) === false) childrenOf.set(parent, [])
        childrenOf.get(parent).push(entry)
        nested.add(entry.id)
      }
      const STEP_BUCKET = { in_progress: 0, todo: 1, blocked: 2, in_review: 3, done: 4, canceled: 5 }
      const stepOrder = (a, b) => (STEP_BUCKET[a.status] ?? 9) - (STEP_BUCKET[b.status] ?? 9)
        || String(a.created || a.updated || '').localeCompare(String(b.created || b.updated || ''))
      for (const list of childrenOf.values()) list.sort(stepOrder)
      const topCards = visibleCards.filter((entry) => nested.has(entry.id) === false)
      const autoOpen = (entry, depth) => depth === 0 && entry.status === 'in_progress'
      const isOpen = (entry, depth) => openItems === null ? autoOpen(entry, depth) : openItems.has(entry.id)
      const toggleItem = (entry, depth) => {
        const next = openItems === null
          ? new Set(visibleCards.filter((card) => autoOpen(card, 0)).map((card) => card.id))
          : new Set(openItems)
        if (isOpen(entry, depth)) next.delete(entry.id)
        else next.add(entry.id)
        setOpenItems(next)
      }
      const itemRow = (entry, depth) => {
        const kids = childrenOf.get(entry.id) || []
        const open = isOpen(entry, depth)
        return h('div', {
          key: entry.id,
          className: `${depth === 0 ? 'rtp-row' : 'rtp-subrow'}${open ? ' open' : ''}`,
          onClick: (event) => {
            if (depth > 0) event.stopPropagation()
            toggleItem(entry, depth)
          }
        }, [
          h('span', { key: 'dot', className: 'rtp-dot', style: { background: statusTone(entry.status) } }),
          h('div', { key: 'main', className: 'rtp-rowmain' }, [
            h('div', { key: 't', className: 'rtp-rowtitle' }, [
              h('span', { key: 'text', className: 'rtp-rowtitletext' }, entry.title),
              depth === 0 && entry.kind === 'gated' && entry.status === 'in_review'
                ? h('span', { key: 'decide', className: 'rtp-rowdecide' }, [
                    h('button', { key: 'ok', type: 'button', className: 'rtp-mini ok', disabled: busy, onClick: (event) => { event.stopPropagation(); decideItem(entry.id, 'accept') } }, t('确认完成')),
                    h('button', { key: 'no', type: 'button', className: 'rtp-mini no', disabled: busy, onClick: (event) => { event.stopPropagation(); decideItem(entry.id, 'return') } }, t('退回'))
                  ])
                : h('span', {
                    key: 'chip',
                    className: 'rtp-chip',
                    style: { color: statusTone(entry.status), borderColor: 'color-mix(in srgb,currentColor 30%,transparent)', background: 'color-mix(in srgb,currentColor 9%,transparent)' }
                  }, statusLabel(entry.status))
            ]),
            h('div', { key: 'm', className: 'rtp-rowmeta' }, [
              h('span', { key: 'id', className: 'rtp-id' }, entry.id),
              entry.owner ? ` · @${entry.owner}` : '',
              entry.next ? tf(' · 下一步 {next}', { next: entry.next }) : '',
              entry.deliverables && entry.deliverables.length ? tf(' · 附件 {count}', { count: entry.deliverables.length }) : '',
              entry.updated ? ` · ${formatSince(entry.updated)}` : '',
            ]),
            open && entryExtra(entry, depth) !== ''
              ? h('div', { key: 'extra', className: 'rtp-itemextra' }, entryExtra(entry, depth))
              : null,
            open && Array.isArray(entry.deliverables) && entry.deliverables.length > 0
              ? h('div', { key: 'files', className: 'rtp-files' }, [
                  h('span', { key: 'l', className: 'rtp-fileslabel' }, t('交付文件')),
                  ...entry.deliverables.map((file, index) => h('button', {
                    key: `file-${index}`,
                    type: 'button',
                    className: file.exists === false ? 'rtp-file missing' : 'rtp-file',
                    title: file.exists === false ? tf('{path}（未找到）', { path: file.path || file.url }) : (file.path || file.url),
                    onClick: (event) => openDeliverable(event, file)
                  }, file.label || file.path || file.url))
                ])
              : null
          ]),
          open && kids.length > 0
            ? h('div', { key: 'kids', className: 'rtp-subitems' }, kids.map((kid) => itemRow(kid, depth + 1)))
            : null
        ])
      }
      const cardsSection = h(Section, {
        key: 'cards',
        title: t('工作项'),
        action: h('div', { key: 'acts', style: { display: 'flex', alignItems: 'center', gap: '6px' } }, [
          finishedCount === 0 ? null : h('button', {
            key: 'finished',
            type: 'button',
            className: 'rtp-toggle',
            onClick: () => setShowFinished(!showFinished)
          }, showFinished ? t('隐藏已完成') : tf('已完成 {count}', { count: finishedCount })),
          h('select', {
            key: 'decision',
            className: 'rtp-sel',
            value: decisionMode,
            title: t('阻塞项决策方式'),
            onChange: (event) => setDecisionMode(event.target.value)
          }, [
            h('option', { key: 'human', value: 'human' }, t('人工决策')),
            h('option', { key: 'advisor', value: 'advisor' }, t('智能决策'))
          ])
        ])
      }, topCards.length === 0
        ? h('div', { key: 'empty', className: 'rtp-empty' }, t('暂无工作项'))
        : h('div', { key: 'list', className: 'rtp-items' }, topCards.map((entry) => itemRow(entry, 0))))

      const approvalSelect = h('select', {
        key: 'mode',
        className: 'rtp-sel',
        value: experimentSettings.approval,
        onChange: (event) => setApprovalMode(event.target.value),
        title: t('实验审批方式')
      }, [
        h('option', { key: 'required', value: 'required' }, t('需要审批')),
        h('option', { key: 'auto', value: 'auto' }, t('自动审批'))
      ])

      const runsSection = h(Section, {
        key: 'runs',
        title: t('实验'),
        action: h('div', { key: 'acts', style: { display: 'flex', alignItems: 'center', gap: '6px' } }, [
          finishedRuns.length === 0 ? null : h('button', {
            key: 'finished',
            type: 'button',
            className: 'rtp-toggle',
            onClick: () => setShowFinishedRuns(!showFinishedRuns)
          }, showFinishedRuns ? t('隐藏已完成') : tf('已完成 {count}', { count: finishedRuns.length })),
          approvalSelect
        ])
      }, runs.length === 0
        ? h('div', { key: 'empty', className: 'rtp-empty' }, t('暂无实验记录'))
        : visibleRuns.length === 0
        ? h('div', { key: 'empty', className: 'rtp-empty' }, t('暂无进行中的实验'))
        : h('div', { key: 'list', className: 'rtp-exp' }, visibleRuns.map((entry) => {
            const state = entry.state === undefined ? entry.status : entry.state
            const pending = state === 'awaiting_approval'
            const elapsed = formatElapsed(entry.elapsedMs)
            const timed = state === 'running' ? tf('已进行 {elapsed}', { elapsed }) : state === 'completed' || state === 'stopped' || state === 'failed' ? tf('用时 {elapsed}', { elapsed }) : ''
            const meta = [
              elapsed === '' ? '' : timed,
              entry.seeds ? `seed ${entry.seeds}` : '',
              entry.budget ? tf('预算 {budget}', { budget: entry.budget }) : '',
              state === 'stopped' || state === 'failed' ? entry.reason || '' : '',
              entry.approval === 'approved' && state !== 'approved' ? t('已批准') : entry.approval === 'rejected' ? t('已拒绝') : ''
            ].filter(Boolean).join(' · ')
            const open = openRun === entry.name
            return h('div', {
              key: entry.name,
              className: open ? 'rtp-row open' : 'rtp-row',
              onClick: () => setOpenRun(open ? '' : entry.name)
            }, [
              h('span', { key: 'dot', className: 'rtp-dot', style: { background: statusTone(state) } }),
              h('div', { key: 'main', className: 'rtp-rowmain' }, [
                h('div', { key: 't', className: 'rtp-rowtitle' }, [
                  h('span', { key: 'name', style: { fontFamily: 'var(--dsw-font-family-mono)', fontSize: '14px' } }, entry.name),
                  seedDots(entry.seeds) === null ? null : h('span', { key: 'seeds', className: 'rtp-seeds' }, seedDots(entry.seeds))
                ]),
                h('div', { key: 'm', className: 'rtp-rowmeta' }, meta),
                open ? h('div', { key: 'x', className: 'rtp-itemextra' }, [
                  entry.question ? h('div', { key: 'q' }, tf('问题：{text}', { text: entry.question })) : null,
                  entry.hypothesis ? h('div', { key: 'h' }, tf('假设：{text}', { text: entry.hypothesis })) : null,
                  entry.decisionRule ? h('div', { key: 'd' }, tf('判定：{text}', { text: entry.decisionRule })) : null,
                  entry.reason ? h('div', { key: 'r' }, tf('原因：{text}', { text: entry.reason })) : null,
                  entry.evidence ? h('div', { key: 'e' }, tf('证据：{text}', { text: entry.evidence })) : null,
                  h('div', { key: 'a' }, [
                    entry.startedAt ? tf('开始 {time}', { time: entry.startedAt.slice(0, 16).replace('T', ' ') }) : '',
                    entry.finishedAt ? tf(' · 结束 {time}', { time: entry.finishedAt.slice(0, 16).replace('T', ' ') }) : ''
                  ].join(''))
                ]) : null
              ]),
              pending
                ? h('div', { key: 'act', style: { display: 'flex', gap: '6px', flexShrink: 0 } }, [
                    h('button', { key: 'ok', type: 'button', className: 'rtp-mini ok', disabled: busy, onClick: (event) => { event.stopPropagation(); decideRun(entry.name, 'approved') } }, t('批准')),
                    h('button', { key: 'no', type: 'button', className: 'rtp-mini no', disabled: busy, onClick: (event) => { event.stopPropagation(); decideRun(entry.name, 'rejected') } }, t('拒绝'))
                  ])
                : h('span', {
                    key: 'chip',
                    className: 'rtp-chip',
                    style: {
                      flexShrink: 0,
                      color: statusTone(state),
                      borderColor: 'color-mix(in srgb,currentColor 30%,transparent)',
                      background: 'color-mix(in srgb,currentColor 9%,transparent)'
                    }
                  }, statusLabel(state))
            ])
          })))

      const literatureSection = h(Section, { key: 'literature', title: t('文献') },
        literature.loading
          ? [h('div', { key: 'loading', className: 'rtp-empty' }, t('读取文献…'))]
          : literature.error !== ''
            ? [h('div', { key: 'error', className: 'rtp-empty' }, literature.error)]
            : literature.categories.length === 0
              ? [h('div', { key: 'empty', className: 'rtp-empty' }, t('还没有文献分类'))]
              : literature.categories.map((category) => h('div', { key: category.id, className: 'rtp-litgroup' }, [
                  h('div', { key: 'label', className: 'rtp-litcat' }, category.label),
                  category.entries.length === 0
                    ? h('div', { key: 'none', className: 'rtp-litnone' }, t('暂无条目'))
                    : h('div', { key: 'entries' }, category.entries.map((entry) => h('div', {
                        key: entry.key,
                        className: openLit === entry.key ? 'rtp-row open' : 'rtp-row',
                        onClick: () => setOpenLit(openLit === entry.key ? '' : entry.key)
                      }, [
                        h('div', { key: 'main', className: 'rtp-rowmain' }, [
                          h('div', { key: 't', className: 'rtp-rowtitle' }, entry.title || entry.key),
                          h('div', { key: 'm', className: 'rtp-rowmeta' }, [
                            entry.authors.length > 0 ? entry.authors.join(', ') : t('未署名'),
                            entry.year ? ` · ${entry.year}` : '',
                            ` · ${entry.key}`
                          ]),
                          openLit === entry.key && entry.note
                            ? h('div', { key: 'note', className: 'rtp-litnote' }, entry.note)
                            : null
                        ]),
                        h('div', { key: 'act', className: 'rtp-litact' }, [
                          h('button', {
                            key: 'quote',
                            type: 'button',
                            className: 'rtp-ghost',
                            title: t('插入引用到会话输入框'),
                            onClick: (event) => { event.stopPropagation(); insertCitation(entry) }
                          }, t('引用')),
                          h('button', {
                            key: 'open',
                            type: 'button',
                            className: 'rtp-ghost',
                            title: t('在 Zotero 中打开'),
                            onClick: (event) => { event.stopPropagation(); openLiteratureItem(entry) }
                          }, t('打开'))
                        ])
                      ])))
                ])))

      const body = state === null && error === ''
        ? h('div', { key: 'skel', className: 'rtp-section' }, [
            h('div', { key: 'a', className: 'rtp-skel', style: { width: '46%', height: '8px' } }),
            h('div', { key: 'b', className: 'rtp-skel', style: { width: '86%', height: '13px', marginTop: '12px' } }),
            h('div', { key: 'c', className: 'rtp-skel', style: { width: '64%', height: '10px', marginTop: '10px' } })
          ])
        : [teamSection, archSection, cardsSection, runsSection, literatureSection]

      return h('div', { className: 'rtp-root', ref: rootRef }, [
        header,
        error === '' ? null : h('div', { key: 'error', className: 'rtp-error' }, error),
        ...(Array.isArray(body) ? body : [body]),
        hover === null ? null : h('div', {
          key: 'tip',
          className: 'rtp-tip',
          style: { left: `${hover.left}px`, top: `${hover.top}px` }
        }, [
          h('span', { key: 'arrow', className: 'rtp-tiparrow', style: { left: `${hover.arrow}px` } }),
          h('div', { key: 'lines', className: 'rtp-tipbody' }, hover.lines.map((line, index) => h('div', { key: `l${index}`, className: index === 0 ? 'rtp-tiptitle' : 'rtp-tipline' }, line)))
        ]),
        toast === ''
          ? null
          : h('div', { key: 'toast', role: 'status', className: 'rtp-toast' }, toast)
      ])
    }

    function apply(ctx) {
      /* The panel follows the DSH language setting: read it once here and keep
         listening, so a later switch re-renders every visible string. Nothing
         here may break the panel: the locale service is optional, and reading
         ctx.locale can throw when the service is not mounted yet. */
      let locale
      try {
        locale = typeof ctx.get === 'function' ? ctx.get('locale') : ctx.locale
      } catch (error) {
        locale = undefined
      }
      try {
        if (locale !== undefined && locale !== null && typeof locale.getSnapshot === 'function') {
          setLocale(locale.getSnapshot().active)
          if (typeof ctx.effect === 'function' && typeof locale.subscribe === 'function') {
            ctx.effect(() => locale.subscribe(() => setLocale(locale.getSnapshot().active)), 'research-team-panel:locale')
          }
        }
      } catch (error) {
        setLocale('zh')
      }

      const sessionIdOf = (props) => {
        const value = props || {}
        if (typeof value.sessionId === 'string' && value.sessionId !== '') return value.sessionId
        if (value.session && typeof value.session.id === 'string') return value.session.id
        if (value.scope && typeof value.scope.sessionId === 'string') return value.scope.sessionId
        if (value.tab && typeof value.tab.sessionId === 'string') return value.tab.sessionId
        /* A tab body may be rendered without a session prop; the scope tag on the
           context it receives still names the session the pane belongs to. */
        try {
          const scoped = value.ctx && value.ctx.sessions && typeof value.ctx.sessions.scopeOf === 'function'
            ? value.ctx.sessions.scopeOf(value.ctx)
            : undefined
          if (typeof scoped === 'string' && scoped !== '') return scoped
        } catch (error) {
          /* fall through to the warning below */
        }
        return ''
      }

      pluginCtx = ctx

      /* The native pane slots are registered first and on their own: they are the
         panel's fallback home, and nothing about better-sidebar may take the tab
         down with it. */
      ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
        name: 'sidebar.right.pane.tab',
        key: 'research-team#panel'
      }, (props) => h(RenderBoundary, null, h(ResearchPanel, { sessionId: sessionIdOf(props) }))))
      /* The chip already draws the descriptor icon through better-sidebar; a second
         icon plus text overflows a narrow chip and the close button overlaps it, so
         the native fallback title stays plain text and lets the host ellipsize. */
      ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({
        name: 'sidebar.right.pane.tab.title',
        key: 'research-team#panel'
      }, () => t('科研')))

      /* better-sidebar may activate after this module does, so wait for its service
         instead of deciding once at apply time: an immediate ctx.get() misses it on
         a cold start and the tab only reappears when the module is toggled. Any
         failure here is contained: the native slots above already carry the panel. */
      let registeredFor = null
      const registerBetterTab = (service) => {
        if (service === undefined || service === null || typeof service.registerTab !== 'function') return
        if (registeredFor === service) return
        registeredFor = service
        try {
          ctx.effect(() => service.registerTab({
            id: 'research-team:panel',
            title: t('科研'),
            description: t('团队状态：架构、工作项与实验'),
            icon: (size) => h(PanelIcon, { size: size || 15 }),
            order: 40,
            single: true,
            component: (props) => h(RenderBoundary, null, h(ResearchPanel, { sessionId: sessionIdOf(props) }))
          }))
        } catch (error) {
          console.warn('research-team-panel: better-sidebar registration failed', error)
        }
      }

      try {
        if (typeof ctx.inject === 'function') {
          ctx.inject(['betterSidebar'], (inner) => {
            registerBetterTab(inner.betterSidebar)
          })
        }
        const immediate = typeof ctx.get === 'function' ? ctx.get('betterSidebar') : undefined
        if (immediate !== undefined) registerBetterTab(immediate)
      } catch (error) {
        console.warn('research-team-panel: better-sidebar unavailable', error)
      }

    }


    exports.apply = apply
    exports.name = 'research-team-panel-client'
    exports.inject = ["slots", "sessions"]
    return module.exports
  }
})
