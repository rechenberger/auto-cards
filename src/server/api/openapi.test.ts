import assert from 'node:assert/strict'
import test from 'node:test'
import { openApiDocument } from './openapi'

test('live match results publish their concrete response contract', () => {
  const response = openApiDocument.paths[
    '/api/v1/live-matches/{liveMatchId}/results'
  ].get.responses['200'] as {
    content: { 'application/json': { schema: unknown } }
  }

  assert.deepEqual(response.content['application/json'].schema, {
    type: 'object',
    required: ['data'],
    properties: {
      data: { $ref: '#/components/schemas/LiveMatchResults' },
    },
  })

  const entry = openApiDocument.components.schemas.LiveMatchResultEntry
  assert.ok(entry.required.includes('leaderboard'))
  assert.deepEqual(entry.properties.leaderboard.anyOf, [
    { $ref: '#/components/schemas/LeaderboardSummary' },
    { type: 'null' },
  ])
  assert.equal('additionalProperties' in entry, false)
})
