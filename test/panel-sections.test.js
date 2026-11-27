import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(here, '..', 'panel', 'client.js'), 'utf8')

/* The panel ships as one prebuilt module, so Section is not exported. Slice the
 * function out of the real source and run it with a minimal createElement: the
 * assertions then cover the shipped code, not a copy of it. */
function sectionFactory() {
  const start = source.indexOf('function Section(props) {')
  assert.notEqual(start, -1, 'Section is missing from panel/client.js')
  const end = source.indexOf('\n    function ', start + 10)
  assert.notEqual(end, -1, 'cannot find where Section ends')
  const body = source.slice(start, end)
  const h = (type, props, ...children) => ({
    type,
    props: props || {},
    children: children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false)
  })
  const t = (text) => text
  return new Function('h', 't', `${body}\nreturn Section`)(h, t)
}

const chevronOf = (head) => head.children.find((child) => child.type === 'svg')

test('a collapsible section hides its body and toggles from its head', () => {
  const Section = sectionFactory()
  let toggled = 0
  const body = { type: 'div', props: { className: 'rows' }, children: [] }
  const expanded = Section({ title: '工作项', onToggle: () => { toggled += 1 }, collapsed: false, children: body })
  assert.equal(expanded.type, 'section')
  assert.equal(expanded.children.length, 2)
  const head = expanded.children[0]
  assert.equal(head.props.role, 'button')
  assert.equal(head.props['aria-expanded'], 'true')
  assert.equal(head.props.title, '收起')
  assert.equal(head.props.className, 'rtp-sechead is-foldable')
  const chevron = chevronOf(head)
  assert.ok(chevron, 'the head lost its chevron')
  assert.equal(chevron.props.className, 'rtp-secchev')
  const down = chevron.children[0].props.d
  assert.equal(expanded.children[1].children[0], body)
  head.props.onClick()
  assert.equal(toggled, 1)

  const collapsed = Section({ title: '工作项', onToggle: () => {}, collapsed: true, children: body })
  assert.equal(collapsed.children.length, 1)
  assert.equal(collapsed.children[0].props['aria-expanded'], 'false')
  assert.equal(collapsed.children[0].props.title, '展开')
  const closedChevron = chevronOf(collapsed.children[0])
  assert.equal(closedChevron.props.className, 'rtp-secchev is-collapsed')
  const right = closedChevron.children[0].props.d
  assert.notEqual(down, right, 'the open and closed heads draw the same chevron')
  /* Open points down, closed points right: no rotation trick, two real shapes. */
  assert.ok(down.indexOf('M2.5 4') === 0, `the open chevron is not a down arrow: ${down}`)
  assert.ok(right.indexOf('M4 2.5') === 0, `the closed chevron is not a right arrow: ${right}`)
})

test('a section without a toggle keeps its plain head and body', () => {
  const Section = sectionFactory()
  const body = { type: 'div', props: {}, children: [] }
  const plain = Section({ title: '团队', children: body })
  assert.equal(plain.children.length, 2)
  const head = plain.children[0]
  assert.equal(head.props.role, undefined)
  assert.equal(head.props.className, 'rtp-sechead')
  assert.equal(chevronOf(head), undefined)
  assert.equal(plain.children[1].children[0], body)
})

test('the head keeps its action controls out of the toggle', () => {
  const Section = sectionFactory()
  let toggled = 0
  const action = { type: 'button', props: { className: 'rtp-toggle' }, children: [] }
  const tree = Section({ title: '实验', onToggle: () => { toggled += 1 }, action, children: { type: 'div', props: {}, children: [] } })
  const wrapper = tree.children[0].children.find((child) => child.props.className === 'rtp-secacts')
  assert.ok(wrapper, 'the action is not wrapped')
  assert.equal(wrapper.children[0], action)
  let stopped = 0
  wrapper.props.onClick({ stopPropagation: () => { stopped += 1 } })
  assert.equal(stopped, 1)
  assert.equal(toggled, 0)
})

test('architecture, work items, experiments and literature are the collapsible sections', () => {
  for (const [title, name] of [['架构', 'arch'], ['工作项', 'cards'], ['实验', 'runs'], ['文献', 'literature']]) {
    const pattern = new RegExp(
      `title: t\\('${title}'\\),[\\s\\S]{0,140}?collapsed: folded\\.${name} === true,[\\s\\S]{0,90}?onToggle: \\(\\) => toggleSection\\('${name}'\\)`
    )
    assert.match(source, pattern, `${title} is not wired to a collapse toggle`)
  }
  assert.match(source, /const \[folded, setFolded\] = React\.useState\(readFolded\)/, 'the folded state is not restored from storage')
  assert.match(source, /store\.setItem\(FOLDED_KEY/, 'a toggle does not persist the folded state')
  assert.match(source, /window\.localStorage/, 'the folded state is not stored locally')
  assert.match(source, /op: 'fold'/, 'a toggle is not written to the host store')
  assert.match(source, /stored = state === null \? null : state\.folded/, 'the stored set is not adopted on load')
})

test('the list sections scroll inside their own taller boxes', () => {
  assert.match(source, /\.rtp-items,\.rtp-exp,\.rtp-lit\{[^}]*max-height:min\(520px,62vh\)/, 'the shared scroller lost its height')
  assert.match(source, /\.rtp-items,\.rtp-exp,\.rtp-lit\{[^}]*overflow-y:auto/, 'the shared scroller lost its overflow')
  assert.doesNotMatch(source, /max-height:320px/, 'an older, shorter cap is still in the stylesheet')
  assert.match(source, /className: 'rtp-lit'/, 'the literature list is not wrapped in the scroller')
})

test('every section is drawn as a bordered card', () => {
  assert.match(source, /\.rtp-section\{[^}]*border:1px solid var\(--dsw-alias-border-l2\)/, 'the sections lost their border')
  assert.match(source, /\.rtp-section\{[^}]*border-radius:12px/, 'the sections lost their radius')
})

test('the host keeps the folded set under ~/.dsh and reads it back', async () => {
  const { readPanelUi, writePanelUi, buildPanelState } = await import('../plugin/index.js')
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-fold-'))
  const file = path.join(root, 'panel-ui.json')
  assert.deepEqual(readPanelUi({ file }).folded, {}, 'a missing file must read as nothing folded')

  writePanelUi({ folded: { arch: true, runs: true, nonsense: true } }, { file })
  assert.deepEqual(readPanelUi({ file }).folded, { arch: true, runs: true }, 'only the known sections are kept')
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { folded: { arch: true, runs: true } })

  writePanelUi({ folded: { arch: true } }, { file })
  assert.deepEqual(readPanelUi({ file }).folded, { arch: true }, 'an unfolded section is dropped, not merged')

  writePanelUi({ folded: {} }, { file })
  assert.deepEqual(readPanelUi({ file }).folded, {}, 'unfolding everything clears the file')

  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-foldproj-'))
  assert.deepEqual(buildPanelState(project, { uiFile: file }).folded, {}, 'the panel state reports the stored set')
})
