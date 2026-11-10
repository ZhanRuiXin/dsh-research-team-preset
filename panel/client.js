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

    function wrapLabel(label, perLine) {
      const text = String(label ?? '').replace(/\s+/g, ' ').trim()
      if (text.length <= perLine) return [text]
      const first = text.slice(0, perLine)
      const rest = text.slice(perLine, perLine * 2 - 1)
      return [first, text.length > perLine * 2 - 1 ? `${rest}…` : rest]
    }

    /* Rough advance width: a CJK glyph is about one em, Latin about half. */
    function labelCharsPerLine(width, fontSize) {
      const usable = Math.max(40, width - 22)
      let leftover = usable
      let count = 0
      for (const char of 'XWML方法架构数据') {
        leftover -= /[\u3400-\u9fff]/.test(char) ? fontSize : fontSize * 0.55
        count += 1
      }
      const average = (usable - leftover) / count
      return Math.max(5, Math.floor(usable / average))
    }

    function statusTone(status) {
      const value = String(status ?? '').toLowerCase()
      if (value === 'in_progress' || value === 'running') return 'var(--dsw-alias-brand-primary)'
      if (value === 'blocked' || value === 'failed') return 'var(--dsw-alias-state-error-primary)'
      if (value === 'in_review' || value === 'waiting') return 'var(--dsw-alias-state-warn-primary)'
      if (value === 'done' || value === 'passed') return 'var(--dsw-alias-state-success-primary)'
      return 'var(--dsw-alias-label-tertiary)'
    }

    const STATUS_LABELS = {
      in_progress: '进行中',
      running: '运行中',
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

    const PANEL_CSS = `
.rtp-root{display:flex;flex-direction:column;height:100%;min-height:0;overflow-y:auto;box-sizing:border-box;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased}
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
.rtp-seeds{display:inline-flex;gap:3px;align-items:center;vertical-align:middle}
.rtp-seed{width:7px;height:7px;border-radius:2px;background:var(--dsw-alias-border-l3)}
.rtp-seed.on{background:var(--dsw-alias-brand-primary)}
.rtp-seg{display:inline-flex;padding:2px;gap:2px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1)}
.rtp-seg button{height:27px;padding:0 10px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:14px;cursor:pointer;white-space:nowrap;max-width:150px;overflow:hidden;text-overflow:ellipsis}
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
.rtp-annot{margin-top:8px;display:flex;align-items:center;gap:6px;font-size:13.5px;color:var(--dsw-alias-label-tertiary)}
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
      const auto = fitBox(card.nodes, aspect)
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
          const hits = (card.nodes || []).filter((node) => {
            const left = Number(node.x) || 0
            const top = Number(node.y) || 0
            const w = Number(node.w) || 0
            const hgt = Number(node.h) || 0
            return left < x1 && left + w > x0 && top < y1 && top + hgt > y0
          }).map((node) => node.id)
          props.onMarquee(hits)
        }
        setMarquee(null)
        if (svgRef.current !== null && pointerId !== null) {
          try { svgRef.current.releasePointerCapture(pointerId) } catch {}
        }
        setPointerId(null)
      }

      const nodes = Array.isArray(card.nodes) ? card.nodes : []
      const edges = Array.isArray(card.edges) ? card.edges : []
      const byId = new Map(nodes.map((node) => [node.id, node]))
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

      const nodeElements = nodes.map((node, index) => {
        const isSelected = selected.indexOf(node.id) >= 0
        const w = Number(node.w) || 160
        const hgt = Number(node.h) || 56
        const x = Number(node.x) || 0
        const y = Number(node.y) || 0
        const fontSize = hgt >= 64 ? 15 : hgt >= 48 ? 14 : 12.5
        const lines = wrapLabel(node.label, labelCharsPerLine(w, fontSize))
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
      const waiting = cards.filter((entry) => /waiting|in_review|blocked/i.test(entry.status))
      const fresh = state === null ? '' : formatSince(state.fetchedAt || new Date().toISOString())

      function toggleNode(id) {
        setSelectedNodes((current) => (current.indexOf(id) >= 0 ? current.filter((item) => item !== id) : [...current, id]))
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
          setToast('标注已记录，模型下一轮会读到')
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
          h('span', { key: 'label' }, 'Research team')
        ]),
        h('div', { key: 'objective', className: 'rtp-title' }, worklog.objective || '还没有写目标（worklog/PLAN.md）'),
        h('div', { key: 'sub', className: 'rtp-sub' }, [
          worklog.milestone ? h('span', { key: 'm' }, ['里程碑 ', h('b', { key: 'b' }, worklog.milestone)]) : null,
          worklog.next ? h('span', { key: 'n' }, ['下一步 ', h('b', { key: 'b' }, worklog.next)]) : null
        ].filter(Boolean)),
        waiting.length === 0
          ? null
          : h('div', { key: 'waiting', className: 'rtp-wait' }, [
              h('span', { key: 'i' }, '◷'),
              h('span', { key: 't' }, `等你处理 ${waiting.length} 项：${waiting.slice(0, 2).map((entry) => entry.title || entry.id).join('、')}${waiting.length > 2 ? '…' : ''}`)
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

      const archSection = h(Section, {
        key: 'arch',
        title: '架构',
        count: architectures.length === 0 ? 0 : `${architectures.length} 张`
      }, [
        architectures.length === 0
          ? h('div', { key: 'empty', className: 'rtp-empty' }, '还没有架构卡片。让设计者用 research_architecture 建一张方法图，或在 .research/architecture/ 放一个 JSON。')
          : h('div', { key: 'body' }, [
              archChips,
              h('div', {
                key: 'meta',
                style: { display: 'flex', justifyContent: 'space-between', padding: '6px 1px 0', fontSize: '13px', color: 'var(--dsw-alias-label-tertiary)' }
              }, [
                h('span', { key: 'kind' }, `${CARD_KIND_LABELS[card.kind] || card.kind} · ${(card.nodes || []).length} 节点 · ${(card.edges || []).length} 连线`),
                h('span', { key: 'when' }, card.updatedAt ? formatSince(card.updatedAt) : '')
              ]),
              h(ArchitectureCanvas, {
                key: 'canvas',
                card,
                selected: selectedNodes,
                onToggle: toggleNode,
                onMarquee: (ids) => setSelectedNodes((current) => Array.from(new Set([...current, ...ids]))),
                onClear: () => setSelectedNodes([])
              }),
              h('div', { key: 'annot', className: 'rtp-annot' }, [
                h('span', { key: 'l' }, selectedNodes.length === 0 ? '点击或框选节点即可提问，点空白处清空' : '已选'),
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
                      placeholder: '针对选中的节点提问，例如：这一层的输入是不是漏了 mask',
                      onChange: (event) => setNote(event.target.value)
                    }),
                    h('div', { key: 'bar', className: 'rtp-composebar' }, [
                      h('span', { key: 'hint', style: { fontSize: '13px', color: 'var(--dsw-alias-label-tertiary)' } }, '写入卡片注解，下一轮由 Lead 读取'),
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
                      }, busy ? '保存中…' : '发送标注')
                    ])
                  ])
            ])
      ])

      const cardsSection = h(Section, {
        key: 'cards',
        title: '卡片',
        count: cards.length === 0 ? 0 : cards.length
      }, cards.length === 0
        ? h('div', { key: 'empty', className: 'rtp-empty' }, '没有活动卡片。用 taskboard 建卡，或在 worklog/INDEX.md 里登记。')
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
            h('span', {
              key: 'chip',
              className: 'rtp-chip',
              style: { color: statusTone(entry.status), borderColor: 'color-mix(in srgb,currentColor 30%,transparent)', background: 'color-mix(in srgb,currentColor 9%,transparent)' }
            }, statusLabel(entry.status))
          ])))

      const runsSection = h(Section, {
        key: 'runs',
        title: '实验',
        count: runs.length === 0 ? 0 : runs.length
      }, runs.length === 0
        ? h('div', { key: 'empty', className: 'rtp-empty' }, '当前没有实验在跑。')
        : runs.map((entry) => h('div', { key: entry.name, className: 'rtp-row' }, [
            h('span', { key: 'dot', className: 'rtp-dot', style: { background: statusTone(entry.status) } }),
            h('div', { key: 'main', className: 'rtp-rowmain' }, [
              h('div', { key: 't', className: 'rtp-rowtitle' }, [
                h('span', { key: 'name', style: { fontFamily: 'var(--dsw-font-family-mono)', fontSize: '14px' } }, entry.name),
                seedDots(entry.seeds) === null ? null : h('span', { key: 'seeds', className: 'rtp-seeds' }, seedDots(entry.seeds))
              ]),
              h('div', { key: 'm', className: 'rtp-rowmeta' }, [statusLabel(entry.status), entry.seeds ? `seed ${entry.seeds}` : '', entry.budget ? `预算 ${entry.budget}` : ''].filter(Boolean).join(' · '))
            ])
          ])))

      const designsSection = h(Section, {
        key: 'designs',
        title: '设计',
        count: designs.length === 0 ? 0 : designs.length
      }, designs.length === 0
        ? h('div', { key: 'empty', className: 'rtp-empty' }, '还没有设计文档。设计者会写 docs/design/<name>.md。')
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
        : [archSection, cardsSection, runsSection, designsSection]

      return h('div', { className: 'rtp-root' }, [
        header,
        error === '' ? null : h('div', { key: 'error', className: 'rtp-error' }, error),
        ...(Array.isArray(body) ? body : [body]),
        h('div', { key: 'footer', className: 'rtp-footer' }, [
          h('span', { key: 'live', className: 'rtp-live' }),
          h('span', { key: 'fresh' }, state === null ? '连接中…' : `更新于 ${fresh} · 每 5 秒自动刷新`),
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
          description: '团队状态：架构卡片、任务、实验与设计文档',
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
