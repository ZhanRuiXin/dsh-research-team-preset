import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import { MESSAGES } from '../panel/i18n.js'

/*
 * `panel/client.js` is a prebuilt classic module, so it cannot import
 * `panel/i18n.js`; its copy of the module sits between these two markers and is
 * regenerated with `node tmp/build-panel-i18n.mjs`. This test fails when the two
 * copies drift apart, before the browser ever sees the stale one.
 */
const BEGIN = '/* --- panel copy: generated from panel/i18n.js'
const END = '/* --- end panel copy --- */'

function loadCopy() {
  const source = fs
    .readFileSync(new URL('../panel/client.js', import.meta.url), 'utf8')
    .replace(/\r\n/g, '\n')
  const from = source.indexOf(BEGIN)
  const to = source.indexOf(END)
  assert.ok(from > -1 && to > from, 'panel/client.js carries the generated i18n block')
  const body = source.slice(source.indexOf('\n', from) + 1, to)
  const factory = new Function(
    `${body}\nreturn { MESSAGES, normalizeLocale, setLocale, get, t, tf, subscribe }`
  )
  return factory()
}

const copy = loadCopy()

test('the panel bundle carries the i18n module verbatim', () => {
  assert.deepEqual(copy.MESSAGES, MESSAGES)
})

test('every Chinese key keeps an English translation', () => {
  const zh = Object.keys(MESSAGES.zh)
  const en = Object.keys(MESSAGES.en)
  assert.equal(zh.length, en.length)
  assert.deepEqual(zh.filter((key) => !(key in MESSAGES.en)), [])
  assert.deepEqual(en.filter((key) => !(key in MESSAGES.zh)), [])
  for (const key of zh) {
    assert.equal(MESSAGES.zh[key], key, `MESSAGES.zh is the identity table for "${key}"`)
    const value = MESSAGES.en[key]
    assert.ok(typeof value === 'string' && value.trim() !== '', `empty translation for "${key}"`)
    assert.ok(!/[\u3400-\u9fff]/.test(value), `Chinese left in English for "${key}": ${value}`)
    assert.notEqual(value, key, `untranslated entry for "${key}"`)
  }
})

test('t and tf translate only when the locale is English', () => {
  copy.setLocale('zh-CN')
  assert.equal(copy.get(), 'zh')
  assert.equal(copy.t('团队'), '团队')
  assert.equal(copy.tf('已进行 {elapsed}', { elapsed: '3 小时' }), '已进行 3 小时')

  copy.setLocale('en')
  assert.equal(copy.get(), 'en')
  assert.equal(copy.t('团队'), 'Team')
  assert.equal(copy.t('引用'), 'Cite')
  assert.equal(copy.t('引用', 'Quote'), 'Quote')
  assert.equal(copy.t('not in the table'), 'not in the table')
  assert.equal(copy.tf('已进行 {elapsed}', { elapsed: '3 h' }), 'Running for 3 h')
  assert.equal(copy.tf('已选择 {count} 个节点', { count: 2 }), 'Nodes selected: 2')
  assert.equal(copy.tf('一个 {missing} 占位符', {}), '一个 {missing} 占位符')
})

test('normalizeLocale keeps Chinese variants and maps the rest to English', () => {
  assert.equal(copy.normalizeLocale(undefined), 'zh')
  assert.equal(copy.normalizeLocale(''), 'zh')
  assert.equal(copy.normalizeLocale('zh'), 'zh')
  assert.equal(copy.normalizeLocale('zh-TW'), 'zh')
  assert.equal(copy.normalizeLocale('zh-CN'), 'zh')
  assert.equal(copy.normalizeLocale('en'), 'en')
  assert.equal(copy.normalizeLocale('en-US'), 'en')
  assert.equal(copy.normalizeLocale('ja'), 'en')
})

test('subscribers fire once per real locale change', () => {
  copy.setLocale('zh')
  let calls = 0
  const unsubscribe = copy.subscribe(() => { calls += 1 })
  copy.setLocale('zh-TW')
  assert.equal(calls, 0, 'a Chinese variant is not a change')
  copy.setLocale('en')
  assert.equal(calls, 1)
  copy.setLocale('en-US')
  assert.equal(calls, 1, 'another English variant is not a change')
  copy.setLocale('zh')
  assert.equal(calls, 2)
  unsubscribe()
  copy.setLocale('en')
  assert.equal(calls, 2, 'unsubscribed listeners stay quiet')
})
