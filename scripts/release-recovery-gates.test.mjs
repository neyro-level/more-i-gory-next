import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const operations = await readFile(new URL('../docs/OPERATIONS.md', import.meta.url), 'utf8')
const checklist = await readFile(
  new URL('../docs/05_RELEASE_CHECKLIST.md', import.meta.url),
  'utf8',
)

test('restore proof is release-only, isolated and temporary', () => {
  assert.match(operations, /Выпускаем production/)
  assert.match(operations, /ephemeral recovery target/i)
  assert.match(operations, /Never restore over the managed database resolved from `DATABASE_URI`/)
  assert.match(operations, /Delete the temporary target/)
  assert.match(operations, /No standing\s+staging\/test\/restore database/)
  assert.match(checklist, /ephemeral recovery target/)
})

test('jobs owner stays disabled until the release command and fails closed', () => {
  assert.match(operations, /every candidate and preview runtime keeps\s+`JOBS_AUTORUN=false`/)
  assert.match(operations, /zero owners before activation/)
  assert.match(operations, /exactly one\s+owner after it/)
  assert.match(operations, /duplicate or unreachable owner is a hard stop/)
})
