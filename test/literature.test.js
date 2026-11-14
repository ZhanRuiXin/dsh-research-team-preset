import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  LiteratureError,
  isLiteratureKey,
  literaturePayload,
  readLiteratureIndex,
  readLiteratureNote,
  removeCategory,
  removeLiteratureEntry,
  upsertCategory,
  upsertLiteratureEntry
} from '../plugin/literature.js'

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rtp-literature-'))
}

test('a category is created from its label and can be renamed', () => {
  const root = tempRoot()
  const created = upsertCategory(root, { label: 'Related work' })
  assert.equal(created.id, 'related-work')
  assert.deepEqual(created.entries, [])
  const renamed = upsertCategory(root, { id: 'related-work', label: 'Related Work' })
  assert.equal(renamed.label, 'Related Work')
  assert.equal(readLiteratureIndex(root).categories.length, 1)
})

test('an entry keeps the Zotero key, title and markdown note', () => {
  const root = tempRoot()
  upsertCategory(root, { label: 'Methods' })
  const entry = upsertLiteratureEntry(root, {
    key: 'abcdefgh',
    category: 'methods',
    title: 'A method paper',
    authors: ['Ada Lovelace'],
    year: 2024,
    note: '# Why\n\nRead for the loss.'
  })
  assert.equal(entry.key, 'ABCDEFGH')
  const payload = literaturePayload(root)
  assert.equal(payload.count, 1)
  assert.equal(payload.categories[0].entries[0].title, 'A method paper')
  assert.match(payload.categories[0].entries[0].note, /Read for the loss/)
  assert.match(readLiteratureNote(root, 'ABCDEFGH'), /# Why/)
})

test('adding the same key again updates the entry instead of duplicating it', () => {
  const root = tempRoot()
  upsertCategory(root, { label: 'Related work' })
  upsertCategory(root, { label: 'Models' })
  upsertLiteratureEntry(root, { key: 'ABCDEFGH', category: 'related-work', title: 'First title', note: 'one' })
  upsertLiteratureEntry(root, { key: 'ABCDEFGH', category: 'models', title: 'Second title', note: 'two' })
  const payload = literaturePayload(root)
  assert.equal(payload.count, 1)
  const related = payload.categories.find((category) => category.id === 'related-work')
  const models = payload.categories.find((category) => category.id === 'models')
  assert.equal(related.entries.length, 0)
  assert.equal(models.entries.length, 1)
  assert.equal(models.entries[0].title, 'Second title')
  assert.match(models.entries[0].note, /two/)
})

test('bad keys and unknown categories are refused with a typed error', () => {
  const root = tempRoot()
  upsertCategory(root, { label: 'Methods' })
  assert.equal(isLiteratureKey('abc'), false)
  assert.equal(isLiteratureKey('abcdefgh'), true)
  assert.throws(
    () => upsertLiteratureEntry(root, { key: 'nope', category: 'methods', title: 'x' }),
    (error) => error instanceof LiteratureError && error.code === 'LITERATURE_INVALID'
  )
  assert.throws(
    () => upsertLiteratureEntry(root, { key: 'ABCDEFGH', category: 'missing', title: 'x' }),
    (error) => error instanceof LiteratureError && error.code === 'LITERATURE_INVALID'
  )
  assert.throws(
    () => removeLiteratureEntry(root, 'ABCDEFGH'),
    (error) => error instanceof LiteratureError && error.code === 'LITERATURE_NOT_FOUND'
  )
})

test('removing an entry clears its note and removing a category drops it', () => {
  const root = tempRoot()
  upsertCategory(root, { label: 'Methods' })
  upsertLiteratureEntry(root, { key: 'ABCDEFGH', category: 'methods', title: 'Paper', note: 'body' })
  removeLiteratureEntry(root, 'abcdefgh')
  assert.equal(readLiteratureNote(root, 'ABCDEFGH'), '')
  assert.equal(literaturePayload(root).count, 0)
  removeCategory(root, 'methods')
  assert.equal(readLiteratureIndex(root).categories.length, 0)
})
