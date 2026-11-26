import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
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
  assert.equal(expanded.children[1].children[0], body)
  head.props.onClick()
  assert.equal(toggled, 1)

  const collapsed = Section({ title: '工作项', onToggle: () => {}, collapsed: true, children: body })
  assert.equal(collapsed.children.length, 1)
  assert.equal(collapsed.children[0].props['aria-expanded'], 'false')
  assert.equal(collapsed.children[0].props.title, '展开')
  assert.equal(chevronOf(collapsed.children[0]).props.className, 'rtp-secchev is-collapsed')
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

test('work items, experiments and literature are the collapsible sections', () => {
  for (const [title, name] of [['工作项', 'cards'], ['实验', 'runs'], ['文献', 'literature']]) {
    const pattern = new RegExp(
      `title: t\\('${title}'\\),[\\s\\S]{0,140}?collapsed: folded\\.${name} === true,[\\s\\S]{0,90}?onToggle: \\(\\) => toggleSection\\('${name}'\\)`
    )
    assert.match(source, pattern, `${title} is not wired to a collapse toggle`)
  }
  assert.match(source, /const \[folded, setFolded\] = React\.useState\(\{\}\)/, 'the folded state is missing')
})

test('the work item and experiment lists scroll with the panel', () => {
  assert.doesNotMatch(source, /max-height:320px/, 'the work item list still has its own scroller')
  assert.doesNotMatch(source, /max-height:304px/, 'the experiment list still has its own scroller')
  assert.doesNotMatch(source, /rtp-exp::-webkit-scrollbar/, 'the experiment list still styles a scrollbar')
})
