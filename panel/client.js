window.__ModuleLoader__.load({
  id: 'dsh-research-team-panel',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    const React = require('react')
    const h = React.createElement

    /* ---------------------------------------------------------------- */
    /* Research sidebar: team state and architecture cards.              */
    /* ---------------------------------------------------------------- */

    const PANEL_ROUTE = '/api/dsh-research-team-panel'

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
      if (seconds < 60) return `${seconds} 秒前`
      const minutes = Math.round(seconds / 60)
      if (minutes < 60) return `${minutes} 分钟前`
      const hours = Math.round(minutes / 60)
      if (hours < 48) return `${hours} 小时前`
      const date = new Date(then)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }

    let measureCanvas = null

    /* Real glyph widths beat an average: mixed CJK/Latin labels wrap badly otherwise. */
    function textWidthOf(text, fontSize, fontFamily) {
      try {
        if (measureCanvas === null) measureCanvas = document.createElement('canvas')
        const context = typeof measureCanvas.getContext === 'function' ? measureCanvas.getContext('2d') : null
        if (context === null) return null
        context.font = `${fontSize}px ${fontFamily}`
        return context.measureText(String(text)).width
      } catch (error) {
        return null
      }
    }

    function estimateWidth(text, fontSize) {
      let width = 0
      for (const char of String(text)) width += /[\u3400-\u9fff]/.test(char) ? fontSize : fontSize * 0.55
      return width
    }

    function fontFamilyOf(element) {
      try {
        if (typeof window !== 'undefined' && window.getComputedStyle && element) {
          const family = String(window.getComputedStyle(element).fontFamily || '')
          if (family !== '') return family
        }
      } catch (error) {
        /* fall through to the default stack */
      }
      return 'system-ui, sans-serif'
    }

    /* Split at spaces and CJK boundaries so a line never cuts a Latin word. */
    function labelParts(text) {
      const parts = []
      let buffer = ''
      const flush = () => { if (buffer !== '') { parts.push(buffer); buffer = '' } }
      for (const char of String(text)) {
        if (char === ' ') { flush(); parts.push(' ') }
        else if (/[\u3400-\u9fff]/.test(char)) { flush(); parts.push(char) }
        else buffer += char
      }
      flush()
      return parts
    }

    function fitLabel(label, maxWidth, fontSize, fontFamily) {
      const text = String(label ?? '').replace(/\s+/g, ' ').trim()
      if (text === '') return ['']
      const limit = Math.max(24, maxWidth)
      const measured = (value) => {
        const width = textWidthOf(value, fontSize, fontFamily)
        return width === null ? estimateWidth(value, fontSize) : width
      }
      if (measured(text) <= limit) return [text]
      const parts = []
      for (const part of labelParts(text)) {
        if (measured(part) <= limit) { parts.push(part); continue }
        for (const char of part) parts.push(char)
      }
      const lines = []
      let index = 0
      while (index < parts.length && lines.length < 2) {
        let line = ''
        while (index < parts.length) {
          if (line === '' && parts[index].trim() === '') { index += 1; continue }
          const candidate = line + parts[index]
          if (line !== '' && measured(candidate.replace(/\s+$/, '')) > limit) break
          line = candidate
          index += 1
        }
        if (line === '' && index < parts.length) { line = parts[index]; index += 1 }
        lines.push(line.replace(/\s+$/, ''))
      }
      if (index < parts.length && lines.length > 0) {
        const last = lines.length - 1
        let tail = lines[last]
        while (tail !== '' && measured(`${tail}…`) > limit) tail = tail.slice(0, -1)
        lines[last] = `${tail.replace(/\s+$/, '')}…`
      }
      return lines.length === 0 ? [''] : lines
    }

    const NODE_FONT = 14
    const NODE_PAD_X = 12
    const NODE_MIN_W = 96
    const NODE_MAX_W = 220
    const NODE_LINE_H = 15
    const NODE_MIN_H = 42

    /* Boxes that share a column are centred on one axis, so a vertical flow reads
       as a column instead of a left-aligned staircase. */
    function alignColumns(nodes) {
      const list = nodes.map((node) => ({ ...node }))
      if (list.length < 2) return list
      const parent = list.map((_, index) => index)
      const find = (index) => (parent[index] === index ? index : (parent[index] = find(parent[index])))
      for (let i = 0; i < list.length; i += 1) {
        for (let j = i + 1; j < list.length; j += 1) {
          const a = list[i]
          const b = list[j]
          const overlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
          if (overlap > Math.min(a.w, b.w) * 0.4) {
            const ra = find(i)
            const rb = find(j)
            if (ra !== rb) parent[ra] = rb
          }
        }
      }
      const groups = new Map()
      for (let index = 0; index < list.length; index += 1) {
        const root = find(index)
        if (!groups.has(root)) groups.set(root, [])
        groups.get(root).push(index)
      }
      for (const indices of groups.values()) {
        if (indices.length < 2) continue
        let sum = 0
        for (const index of indices) sum += list[index].x + list[index].w / 2
        const axis = sum / indices.length
        for (const index of indices) list[index].x = axis - list[index].w / 2
      }
      return list
    }

    /* Width and height follow the label: one line if it fits, two if it must wrap. */
    function sizeNode(node, fontFamily) {
      const label = String(node.label ?? '')
      const natural = textWidthOf(label, NODE_FONT, fontFamily)
      const single = (natural === null ? estimateWidth(label, NODE_FONT) : natural) + NODE_PAD_X * 2
      const w = Math.min(NODE_MAX_W, Math.max(NODE_MIN_W, single))
      const lines = fitLabel(label, w - NODE_PAD_X * 2, NODE_FONT, fontFamily)
      const h = Math.max(NODE_MIN_H, lines.length * NODE_LINE_H + 20)
      return {
        id: node.id,
        label: node.label,
        kind: node.kind,
        x: Number(node.x) || 0,
        y: Number(node.y) || 0,
        w,
        h,
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

    function statusLabel(status) {
      const value = String(status ?? '').toLowerCase()
      return STATUS_LABELS[value] || String(status || '')
    }

    const MEMBER_LABELS = {
      running: '运行中',
      inactive: '空闲',
      provisioning: '启动中',
      failed: '失败'
    }

    function memberLabel(status) {
      const value = String(status ?? '').toLowerCase()
      return MEMBER_LABELS[value] || '空闲'
    }

    function memberBrief(member) {
      const lines = []
      lines.push(member.role === 'lead'
        ? `Lead · ${memberLabel(member.status)}`
        : `${member.name || '未命名成员'} · 成员 · ${memberLabel(member.status)}`)
      const item = member.item
      if (item !== null && item !== undefined) {
        const when = item.updated ? `（${formatSince(item.updated)}更新）` : ''
        lines.push(`${memberLabel(member.status) === '运行中' ? '正在' : '上次'}：#${item.id} ${item.title}${when}`)
        lines.push(`状态：${statusLabel(item.status)}`)
        if (item.next) lines.push(`下一步：${item.next}`)
      } else {
        lines.push('未分配工作项')
      }
      const model = shortModel(member.model)
      if (model !== '') {
        const suffix = member.effort ? `（${member.effort}）` : ''
        lines.push(`模型：${model}${suffix}${member.modelSource === 'configured' ? '（按角色配置，成员空闲）' : ''}`)
      } else {
        lines.push('模型：未知')
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
      if (value < 60 * 1000) return '刚刚'
      const minutes = Math.floor(value / 60000)
      if (minutes < 60) return `${minutes} 分钟`
      const hours = Math.floor(minutes / 60)
      const rest = minutes % 60
      if (hours < 24) return rest === 0 ? `${hours} 小时` : `${hours} 小时 ${rest} 分`
      const days = Math.floor(hours / 24)
      return `${days} 天 ${hours % 24} 小时`
    }

    const PANEL_CSS = `
.rtp-root{position:relative;display:flex;flex-direction:column;height:100%;min-height:0;overflow-y:auto;overflow-x:hidden;box-sizing:border-box;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased}
.rtp-root *{box-sizing:border-box}
.rtp-root ::-webkit-scrollbar{width:8px;height:8px}
.rtp-root ::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l3);border-radius:8px}
.rtp-header{position:relative;padding:16px 16px 13px;border-bottom:.5px solid var(--dsw-alias-border-l2);background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-bg-layer-1) 92%,transparent),transparent)}
.rtp-eyebrow{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;letter-spacing:.12em;color:var(--dsw-alias-label-tertiary);text-transform:uppercase}
.rtp-live{width:5px;height:5px;border-radius:50%;background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-success-primary) 18%,transparent)}
.rtp-title{margin-top:8px;font-size:18px;font-weight:600;line-height:1.4;letter-spacing:-.01em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rtp-sub{margin-top:8px;display:flex;flex-wrap:wrap;gap:4px 10px;font-size:14px;color:var(--dsw-alias-label-secondary)}
.rtp-sub b{font-weight:500;color:var(--dsw-alias-label-primary)}
.rtp-wait{margin-top:12px;display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:8px;font-size:14px;line-height:1.45;color:var(--dsw-alias-state-warn-primary);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 9%,transparent);border:.5px solid color-mix(in srgb,var(--dsw-alias-state-warn-primary) 30%,transparent)}
.rtp-section{padding:14px 16px 2px}
.rtp-sechead{display:flex;align-items:center;gap:8px;margin-bottom:9px}
.rtp-seclabel{font-size:13px;font-weight:600;letter-spacing:.08em;color:var(--dsw-alias-label-tertiary)}
.rtp-count{font-size:13px;line-height:1;padding:3px 6px;border-radius:999px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1);font-variant-numeric:tabular-nums}
.rtp-grow{flex:1}
.rtp-ghost{height:27px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:13.5px;cursor:pointer}
.rtp-ghost:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.rtp-empty{padding:18px 12px;border:.5px dashed var(--dsw-alias-border-l2);border-radius:10px;text-align:center;font-size:14px;line-height:1.6;color:var(--dsw-alias-label-tertiary);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 60%,transparent)}
.rtp-row{display:flex;align-items:flex-start;gap:10px;padding:8px 9px;margin:0 -9px;border-radius:8px;border:.5px solid transparent;cursor:default}
.rtp-row:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l1)}
.rtp-dot{flex:0 0 auto;width:6px;height:6px;margin-top:7px;border-radius:50%}
.rtp-rowmain{min-width:0;flex:1}
.rtp-rowtitle{display:flex;align-items:baseline;gap:6px;font-size:15px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rtp-id{flex:0 0 auto;font-size:13px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-family-mono);letter-spacing:.02em}
.rtp-rowmeta{margin-top:3px;font-size:13.5px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rtp-chip{display:inline-flex;align-items:center;height:20px;padding:0 7px;border-radius:5px;font-size:13px;font-weight:500;line-height:1;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1)}
.rtp-teamgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(172px,1fr));gap:7px}
.rtp-mem{display:flex;align-items:center;gap:7px;min-width:0;padding:8px 9px;border-radius:9px;background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l1)}
.rtp-root{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.rtp-root textarea,.rtp-root input,.rtp-id,.rtp-rowtitle,.rtp-rowmeta,.rtp-rowmain,.rtp-annot,.rtp-empty{-webkit-user-select:text;user-select:text}
.rtp-mem:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}
.rtp-mem.is-lead{background:linear-gradient(180deg,var(--dsw-alias-bg-layer-2),var(--dsw-alias-bg-layer-1));border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 34%,transparent)}
.rtp-mem.is-lead .rtp-avatar{color:var(--dsw-alias-brand-primary);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 40%,transparent)}
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
.rtp-tipline{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:232px}
.rtp-pill{flex:0 0 auto;display:inline-flex;align-items:center;gap:4px;height:19px;padding:0 7px;border-radius:999px;font-size:11.5px;font-weight:500;border:.5px solid transparent}
.rtp-idle{flex:0 0 auto;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-border-l3);margin-right:3px}
.rtp-pill.on{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 30%,transparent)}
.rtp-pill.off{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1)}
.rtp-pill.warn{color:var(--dsw-alias-state-warn-primary);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 30%,transparent)}
.rtp-pill.err{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 30%,transparent)}
.rtp-seeds{display:inline-flex;gap:3px;align-items:center;vertical-align:middle}
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
.rtp-seg{display:flex;flex-wrap:wrap;max-width:100%;padding:2px;gap:2px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1)}
.rtp-seg button{flex:0 1 auto;min-width:0;height:27px;padding:0 10px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:14px;cursor:pointer;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.rtp-seg button:hover{color:var(--dsw-alias-label-primary)}
.rtp-seg button.on{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-weight:500;box-shadow:var(--dsw-shadow-lv1)}
.rtp-seg .v{color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-family-mono);font-size:12.5px;margin-left:4px}
.rtp-canvas{position:relative;margin-top:8px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;overflow:hidden;background:var(--dsw-alias-bg-layer-1)}
.rtp-canvas svg{display:block;width:100%;height:320px;touch-action:none;cursor:crosshair}
.rtp-canvas,.rtp-canvas *{user-select:none;-webkit-user-select:none}
.rtp-canvas.rtp-panning svg{cursor:grabbing}
.rtp-tools{position:absolute;top:8px;right:8px;display:flex;gap:2px;padding:2px;border-radius:7px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 82%,transparent);border:.5px solid var(--dsw-alias-border-l2);backdrop-filter:blur(6px)}
.rtp-tools button{width:27px;height:27px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:16px;line-height:1;cursor:pointer}
.rtp-tools button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.rtp-annot{margin-top:8px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:13.5px;color:var(--dsw-alias-label-tertiary)}
.rtp-pill{display:inline-flex;align-items:center;gap:4px;height:23px;padding:0 7px;border-radius:6px;font-size:13px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);border:.5px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 32%,transparent);color:var(--dsw-alias-brand-primary)}
.rtp-compose{margin-top:9px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}
.rtp-compose textarea{display:block;width:100%;min-height:80px;padding:9px 11px;border:0;outline:none;resize:vertical;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:14.5px;line-height:1.5}
.rtp-compose textarea::placeholder{color:var(--dsw-alias-label-tertiary)}
.rtp-composebar{display:flex;align-items:center;gap:8px;padding:7px 9px;border-top:.5px solid var(--dsw-alias-border-l1);background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 60%,transparent)}
.rtp-primary{height:29px;padding:0 12px;border:0;border-radius:7px;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font:inherit;font-size:14px;font-weight:500;cursor:pointer}
.rtp-primary:disabled{opacity:.45;cursor:default}
.rtp-footer{position:sticky;bottom:0;margin-top:14px;padding:9px 16px;display:flex;align-items:center;gap:8px;font-size:13px;color:var(--dsw-alias-label-tertiary);border-top:.5px solid var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-bg-base) 88%,transparent);backdrop-filter:blur(8px)}
.rtp-error{margin:10px 16px 0;padding:8px 10px;border-radius:8px;font-size:14px;color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent);border:.5px solid color-mix(in srgb,var(--dsw-alias-state-error-primary) 28%,transparent)}
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
      const fontFamily = fontFamilyOf(svgRef.current)
      const sized = alignColumns(nodes.map((node) => sizeNode(node, fontFamily)))
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

      function onWheel(event) {
        event.preventDefault()
        zoomTo((auto.w / box.w) * (event.deltaY > 0 ? 0.9 : 1.11), point(event))
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
          h('title', { key: 'tip' }, `${KIND_LABELS[node.kind] || node.kind || '模块'} · ${node.id}`)
        ])
      })

      return h('div', { className: 'rtp-canvas', ref: wrapRef }, [
        h('svg', {
          key: 'svg',
          ref: svgRef,
          viewBox: `${box.x} ${box.y} ${box.w} ${box.h}`,
          onWheel,
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
          h('button', { key: 'out', type: 'button', title: '缩小', onClick: () => zoomTo((auto.w / box.w) * 0.85) }, '−'),
          h('button', { key: 'pct', type: 'button', title: '中键拖动平移，滚轮缩放，双击适应窗口', onClick: () => setView(null), style: { width: '42px', fontSize: '13px' } }, `${zoom}%`),
          h('button', { key: 'in', type: 'button', title: '放大', onClick: () => zoomTo((auto.w / box.w) * 1.15) }, '+')
        ])
      ])
    }

    function ResearchPanel(props) {
      const sessionId = props.sessionId
      const [state, setState] = React.useState(null)
      const [error, setError] = React.useState('')
      const [selectedCard, setSelectedCard] = React.useState('')
      const [selectedNodes, setSelectedNodes] = React.useState([])
      const [note, setNote] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      const [toast, setToast] = React.useState('')
      const [hover, setHover] = React.useState(null)
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
        if (toast === '') return undefined
        const timer = setTimeout(() => setToast(''), 2600)
        return () => clearTimeout(timer)
      }, [toast])

      const architectures = (state && state.architectures) || []
      const card = architectures.find((entry) => entry.id === selectedCard) || architectures[0]
      const worklog = (state && state.worklog) || {}
      const cards = (state && state.cards) || []
      const runs = (state && state.runs) || []
      const designs = (state && state.designs) || []
      const team = (state && state.team) || []
      const experimentSettings = (state && state.experimentSettings) || { approval: 'required' }
      const waiting = cards.filter((entry) => /waiting|in_review|blocked/i.test(entry.status))
      const fresh = state === null ? '' : formatSince(state.fetchedAt || new Date().toISOString())

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
        postPanel({ op: 'approval-mode', mode }, mode === 'auto' ? '实验审批方式已设为自动审批。' : '实验审批方式已设为需要审批。')
      }

      function decideItem(itemId, decision) {
        postPanel({ op: 'item', itemId, decision }, decision === 'accept' ? '工作项已确认完成。' : '工作项已退回进行中。')
      }

      function decideRun(runId, decision) {
        postPanel({ op: 'approve', runId, decision }, decision === 'approved' ? '实验已批准。' : '实验已拒绝。')
      }

      async function submitNote() {
        if (card === undefined || note.trim() === '' || busy) return
        setBusy(true)
        try {
          const response = await fetch(PANEL_ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ op: 'annotate', sessionId, id: card.id, text: note.trim(), targets: selectedNodes })
          })
          const data = await response.json()
          if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`)
          setNote('')
          setSelectedNodes([])
          setToast('标注已记录，将在模型下一轮读取。')
          load()
        } catch (failure) {
          setToast(failure.message)
        } finally {
          setBusy(false)
        }
      }

      const header = h('div', { key: 'header', className: 'rtp-header' }, [
        h('div', { key: 'eyebrow', className: 'rtp-eyebrow' }, [
          h('span', { key: 'live', className: 'rtp-live' }),
          h('span', { key: 'label' }, '研究团队')
        ]),
        h('div', { key: 'objective', className: 'rtp-title' }, worklog.objective || '尚未设置研究目标'),
        h('div', { key: 'sub', className: 'rtp-sub' }, [
          worklog.milestone ? h('span', { key: 'm' }, ['里程碑 ', h('b', { key: 'b' }, worklog.milestone)]) : null,
          worklog.next ? h('span', { key: 'n' }, ['下一步 ', h('b', { key: 'b' }, worklog.next)]) : null
        ].filter(Boolean)),
        waiting.length === 0
          ? null
          : h('div', { key: 'waiting', className: 'rtp-wait' }, [
              h('span', { key: 'i' }, '◷'),
              h('span', { key: 't' }, `待你验收 ${waiting.length} 项：${waiting.slice(0, 2).map((entry) => entry.title || entry.id).join('、')}${waiting.length > 2 ? '…' : ''}`)
            ])
      ])

      const archChips = architectures.length === 0 ? null : h('div', { key: 'seg', className: 'rtp-seg', style: { marginBottom: '2px' } },
        architectures.map((entry) => h('button', {
          key: entry.id,
          type: 'button',
          className: entry.id === (card && card.id) ? 'on' : '',
          onClick: () => {
            setSelectedCard(entry.id)
            setSelectedNodes([])
          }
        }, [entry.title, h('span', { key: 'v', className: 'v' }, `v${entry.version}`)])))

      const teamOn = team.filter((member) => String(member.status).toLowerCase() === 'running').length
      const teamPill = (status) => {
        const value = String(status ?? '').toLowerCase()
        const tone = value === 'running' ? 'on' : value === 'provisioning' ? 'warn' : value === 'failed' ? 'err' : 'off'
        if (value === 'inactive') {
          return h('span', { key: 'pill', className: 'rtp-idle', title: '空闲' })
        }
        return h('span', { key: 'pill', className: `rtp-pill ${tone}` }, [
          value === 'running' ? h('span', { key: 'd', className: 'rtp-pulse' }) : null,
          memberLabel(value)
        ].filter(Boolean))
      }
      const teamSection = h(Section, {
        key: 'team',
        title: '团队',
        action: null
      }, team.length === 0
        ? h('div', { key: 'empty', className: 'rtp-empty' }, '当前会话还没有队友。Lead 用带团队的模型启动后，这里会显示每位成员的运行状态。')
        : h('div', { key: 'grid', className: 'rtp-teamgrid' }, team.map((member) => {
            const on = String(member.status).toLowerCase() === 'running'
            const model = shortModel(member.model)
            return h('div', {
              key: member.id || member.name,
              className: `rtp-mem${member.role === 'lead' ? ' is-lead' : ''}`,
              'aria-label': memberBrief(member).replaceAll('\n', '; '),
              onMouseEnter: (event) => {
                const rootEl = rootRef.current
                const rect = event.currentTarget.getBoundingClientRect()
                const height = 104
                if (rootEl === null) return
                const box = rootEl.getBoundingClientRect()
                const width = Math.min(244, Math.max(160, box.width - 16))
                const scrollTop = rootEl.scrollTop || 0
                const anchor = rect.left - box.left + 21
                const left = Math.max(8, Math.min(anchor - 26, box.width - width - 8))
                const arrow = Math.max(12, Math.min(anchor - left - 5, width - 20))
                const below = rect.bottom - box.top + scrollTop + 9
                const top = below + height > box.height + scrollTop
                  ? Math.max(8, rect.top - box.top + scrollTop - height - 9)
                  : below
                setHover({ member, left, top, arrow })
              },
              onMouseLeave: () => setHover(null)
            }, [
              h('span', { key: 'av', className: `rtp-avatar${on ? ' is-on' : ''}` }, [
                h('span', { key: 'ch' }, (member.name || '?').slice(0, 1)),
                on ? h('span', { key: 'p', className: 'rtp-pulse' }) : null
              ].filter(Boolean)),
              h('span', { key: 'nm', className: 'rtp-membername' }, member.name || '未命名成员'),
              h('span', { key: 'grow', style: { flex: '1 1 auto' } }),
              teamPill(member.status)
            ].filter(Boolean))
          })))

      const archSection = h(Section, {
        key: 'arch',
        title: '架构',
        count: 0
      }, [
        architectures.length === 0
          ? h('div', { key: 'empty', className: 'rtp-empty' }, '当前项目暂无架构卡片。卡片由 research_architecture 维护，存储于 .research/architecture/。')
          : h('div', { key: 'body' }, [
              archChips,
              card.updatedAt
                ? h('div', {
                    key: 'meta',
                    style: { textAlign: 'right', padding: '6px 1px 0', fontSize: '12.5px', color: 'var(--dsw-alias-label-tertiary)' }
                  }, formatSince(card.updatedAt))
                : null,
              h(ArchitectureCanvas, {
                key: 'canvas',
                card,
                selected: selectedNodes,
                onToggle: toggleNode,
                onMarquee: (ids) => setSelectedNodes((current) => Array.from(new Set([...current, ...ids]))),
                onClear: () => setSelectedNodes([])
              }),
              h('div', { key: 'annot', className: 'rtp-annot' }, [
                selectedNodes.length === 0
                  ? h('span', { key: 'l' }, '单击或框选节点，针对它提问')
                  : h('span', { key: 'l' }, `已选择 ${selectedNodes.length} 个节点`),
                ...selectedNodes.slice(0, 4).map((id) => h('span', { key: id, className: 'rtp-pill' }, id)),
                selectedNodes.length > 4 ? h('span', { key: 'more', className: 'rtp-pill' }, `+${selectedNodes.length - 4}`) : null
              ]),
              selectedNodes.length === 0
                ? null
                : h('div', { key: 'compose', className: 'rtp-compose' }, [
                    h('textarea', {
                      key: 'text',
                      value: note,
                      rows: 3,
                      placeholder: '针对所选节点提问，例如：这一层的输入是否漏掉了 mask',
                      onChange: (event) => setNote(event.target.value)
                    }),
                    h('div', { key: 'bar', className: 'rtp-composebar' }, [
                      h('span', { key: 'grow', className: 'rtp-grow' }),
                      h('button', {
                        key: 'clear',
                        type: 'button',
                        className: 'rtp-ghost',
                        onClick: () => { setSelectedNodes([]); setNote('') }
                      }, '清空'),
                      h('button', {
                        key: 'send',
                        type: 'button',
                        className: 'rtp-primary',
                        disabled: busy || note.trim() === '',
                        onClick: submitNote
                      }, busy ? '提交中…' : '提交标注')
                    ])
                  ])
            ])
      ])

      const cardsSection = h(Section, {
        key: 'cards',
        title: '工作项',
        count: cards.length === 0 ? 0 : cards.length
      }, cards.length === 0
        ? h('div', { key: 'empty', className: 'rtp-empty' }, '当前项目暂无工作项。工作项由 research_worklog 登记于 .research/worklog/。')
        : cards.map((entry) => h('div', { key: entry.id, className: 'rtp-row' }, [
            h('span', { key: 'dot', className: 'rtp-dot', style: { background: statusTone(entry.status) } }),
            h('div', { key: 'main', className: 'rtp-rowmain' }, [
              h('div', { key: 't', className: 'rtp-rowtitle' }, [
                h('span', { key: 'id', className: 'rtp-id' }, entry.id),
                h('span', { key: 'title', style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, entry.title)
              ]),
              h('div', { key: 'm', className: 'rtp-rowmeta' },
                [entry.owner ? `@${entry.owner}` : '', entry.next ? `下一步 ${entry.next}` : '', entry.updated ? formatSince(entry.updated) : ''].filter(Boolean).join(' · ') || statusLabel(entry.status))
            ]),
            entry.status === 'in_review'
              ? h('span', { key: 'decide', style: { display: 'flex', gap: '5px' } }, [
                  h('button', { key: 'ok', type: 'button', className: 'rtp-mini ok', disabled: busy, onClick: () => decideItem(entry.id, 'accept') }, '确认完成'),
                  h('button', { key: 'no', type: 'button', className: 'rtp-mini no', disabled: busy, onClick: () => decideItem(entry.id, 'return') }, '退回')
                ])
              : h('span', {
                  key: 'chip',
                  className: 'rtp-chip',
                  style: { color: statusTone(entry.status), borderColor: 'color-mix(in srgb,currentColor 30%,transparent)', background: 'color-mix(in srgb,currentColor 9%,transparent)' }
                }, statusLabel(entry.status))
          ])))

      const approvalSelect = h('select', {
        key: 'mode',
        className: 'rtp-sel',
        value: experimentSettings.approval,
        onChange: (event) => setApprovalMode(event.target.value),
        title: '实验审批方式'
      }, [
        h('option', { key: 'required', value: 'required' }, '需要审批'),
        h('option', { key: 'auto', value: 'auto' }, '自动审批')
      ])

      const runsSection = h(Section, {
        key: 'runs',
        title: '实验',
        count: runs.length === 0 ? 0 : runs.length,
        action: approvalSelect
      }, runs.length === 0
        ? h('div', { key: 'empty', className: 'rtp-empty' }, '当前项目暂无实验记录。运行前由 research_experiment 登记，记录写入 runs/<line>/manifest.json。')
        : h('div', { key: 'list', className: 'rtp-exp' }, runs.map((entry) => {
            const state = entry.state === undefined ? entry.status : entry.state
            const pending = state === 'awaiting_approval'
            const elapsed = formatElapsed(entry.elapsedMs)
            const timed = state === 'running' ? `已进行 ${elapsed}` : state === 'completed' || state === 'stopped' || state === 'failed' ? `用时 ${elapsed}` : ''
            const meta = [
              elapsed === '' ? '' : timed,
              entry.seeds ? `seed ${entry.seeds}` : '',
              entry.budget ? `预算 ${entry.budget}` : '',
              state === 'stopped' || state === 'failed' ? entry.reason || '' : '',
              entry.approval === 'approved' && state !== 'approved' ? '已批准' : entry.approval === 'rejected' ? '已拒绝' : ''
            ].filter(Boolean).join(' · ')
            return h('div', { key: entry.name, className: 'rtp-row' }, [
              h('span', { key: 'dot', className: 'rtp-dot', style: { background: statusTone(state) } }),
              h('div', { key: 'main', className: 'rtp-rowmain' }, [
                h('div', { key: 't', className: 'rtp-rowtitle' }, [
                  h('span', { key: 'name', style: { fontFamily: 'var(--dsw-font-family-mono)', fontSize: '14px' } }, entry.name),
                  seedDots(entry.seeds) === null ? null : h('span', { key: 'seeds', className: 'rtp-seeds' }, seedDots(entry.seeds))
                ]),
                h('div', { key: 'm', className: 'rtp-rowmeta' }, meta)
              ]),
              pending
                ? h('div', { key: 'act', style: { display: 'flex', gap: '6px', flexShrink: 0 } }, [
                    h('button', { key: 'ok', type: 'button', className: 'rtp-mini ok', disabled: busy, onClick: () => decideRun(entry.name, 'approved') }, '批准'),
                    h('button', { key: 'no', type: 'button', className: 'rtp-mini no', disabled: busy, onClick: () => decideRun(entry.name, 'rejected') }, '拒绝')
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

      const designsSection = h(Section, {
        key: 'designs',
        title: '设计',
        count: designs.length === 0 ? 0 : designs.length
      }, designs.length === 0
        ? h('div', { key: 'empty', className: 'rtp-empty' }, '当前项目暂无设计文档。设计文档位于 docs/design/。')
        : designs.map((entry) => h('div', { key: entry.name, className: 'rtp-row' }, [
            h('div', { key: 'main', className: 'rtp-rowmain' }, [
              h('div', { key: 't', className: 'rtp-rowtitle' }, [
                h('span', { key: 'name', style: { fontFamily: 'var(--dsw-font-family-mono)', fontSize: '14px' } }, entry.name)
              ]),
              h('div', { key: 'm', className: 'rtp-rowmeta' }, [entry.question, entry.updated ? formatSince(entry.updated) : ''].filter(Boolean).join(' · '))
            ])
          ])))

      const body = state === null && error === ''
        ? h('div', { key: 'skel', className: 'rtp-section' }, [
            h('div', { key: 'a', className: 'rtp-skel', style: { width: '46%', height: '8px' } }),
            h('div', { key: 'b', className: 'rtp-skel', style: { width: '86%', height: '13px', marginTop: '12px' } }),
            h('div', { key: 'c', className: 'rtp-skel', style: { width: '64%', height: '10px', marginTop: '10px' } })
          ])
        : [teamSection, archSection, cardsSection, runsSection, designsSection]

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
          h('div', { key: 'lines', className: 'rtp-tipbody' }, memberBrief(hover.member).split('\n').map((line, index) => h('div', { key: `l${index}`, className: index === 0 ? 'rtp-tiptitle' : 'rtp-tipline' }, line)))
        ]),
        h('div', { key: 'footer', className: 'rtp-footer' }, [
          h('span', { key: 'live', className: 'rtp-live' }),
          h('span', { key: 'fresh' }, state === null ? '正在连接…' : `更新于 ${fresh}`),
          h('span', { key: 'grow', className: 'rtp-grow' }),
          h('button', {
            key: 'refresh',
            type: 'button',
            className: 'rtp-ghost',
            onClick: load,
            title: (state && state.root) || ''
          }, '刷新')
        ]),
        toast === ''
          ? null
          : h('div', { key: 'toast', role: 'status', className: 'rtp-toast' }, toast)
      ])
    }

    function apply(ctx) {
      const sessionIdOf = (props) => {
        const value = props || {}
        if (typeof value.sessionId === 'string') return value.sessionId
        if (value.session && typeof value.session.id === 'string') return value.session.id
        if (value.scope && typeof value.scope.sessionId === 'string') return value.scope.sessionId
        return ''
      }

      /* better-sidebar may activate after this module does, so wait for its service
         instead of deciding once at apply time: an immediate ctx.get() misses it on
         a cold start and the tab only reappears when the module is toggled. */
      let registeredFor = null
      const registerBetterTab = (service) => {
        if (service === undefined || service === null || typeof service.registerTab !== 'function') return
        if (registeredFor === service) return
        registeredFor = service
        ctx.effect(() => service.registerTab({
          id: 'research-team:panel',
          title: '研究',
          description: '团队状态：架构、工作项、实验与设计文档',
          order: 40,
          single: true,
          component: (props) => h(ResearchPanel, { sessionId: sessionIdOf(props) })
        }))
      }

      if (typeof ctx.inject === 'function') {
        ctx.inject(['betterSidebar'], (inner) => {
          registerBetterTab(inner.betterSidebar)
        })
      }
      const immediate = typeof ctx.get === 'function' ? ctx.get('betterSidebar') : undefined
      if (immediate !== undefined) registerBetterTab(immediate)

      ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
        name: 'sidebar.right.pane.tab',
        key: 'research-team#panel'
      }, (props) => h(ResearchPanel, { sessionId: sessionIdOf(props) })))
      ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({
        name: 'sidebar.right.pane.tab.title',
        key: 'research-team#panel'
      }, () => '研究'))
    }


    exports.apply = apply
    exports.name = 'research-team-panel-client'
    exports.inject = ["slots"]
    return module.exports
  }
})
