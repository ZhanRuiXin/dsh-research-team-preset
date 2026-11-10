/**
 * The settings row mounts once per process in the normal case, but the host can
 * re-apply the bundle on a profile reload or a hot reload. The second mount must
 * reuse the live route instead of failing the row with a duplicate-route error.
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import os from 'node:os'
import path from 'node:path'

process.env.DSH_HOME = path.join(os.tmpdir(), `research-team-settings-${process.pid}`)

const { apply } = await import('../settings/index.js')
const { getSettings } = await import('../plugin/settings-store.js')

const ROUTE = '/api/dsh-research-team-settings'

function context(register) {
  return { webServer: { register } }
}

test('the settings row registers its exact route once', () => {
  const seen = []
  const dispose = apply(context((route) => {
    seen.push(route)
    return () => {}
  }))
  assert.equal(seen.length, 1)
  assert.equal(seen[0].kind, 'exact')
  assert.equal(seen[0].path, ROUTE)
  assert.equal(typeof seen[0].handler, 'function')
  dispose()
})

test('a repeated mount reuses the live route instead of failing the row', () => {
  const duplicate = () => {
    throw new Error(`webserver: duplicate exact route "${ROUTE}"`)
  }
  const dispose = apply(context(duplicate))
  assert.equal(typeof getSettings(), 'object')
  dispose()
})

test('an unrelated registration failure still surfaces', () => {
  const failing = () => {
    throw new Error('webserver: port already in use')
  }
  assert.throws(() => apply(context(failing)), /port already in use/)
})
