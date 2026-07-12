import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createClient } from '@libsql/client'

test('summaries expose only the active season and retain current fallback scores', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'auto-cards-leaderboard-'))
  const url = `file:${join(directory, 'test.sqlite')}`
  process.env.DB_URL = url
  process.env.DB_TOKEN = ''
  process.env.GAME_VERSION = '3'

  const client = createClient({ url })
  try {
    await client.execute(`
      CREATE TABLE leaderboardEntry (
        id TEXT PRIMARY KEY NOT NULL,
        createdAt TEXT,
        updatedAt TEXT,
        userId TEXT NOT NULL,
        roundNo INTEGER NOT NULL,
        loadoutId TEXT NOT NULL,
        type TEXT NOT NULL,
        score INTEGER NOT NULL,
        version INTEGER NOT NULL,
        gameId TEXT,
        gameMode TEXT NOT NULL
      )
    `)

    const insert = async ({
      id,
      loadoutId,
      score,
      version = 3,
    }: {
      id: string
      loadoutId: string
      score: number
      version?: number
    }) => {
      await client.execute({
        sql: `
          INSERT INTO leaderboardEntry (
            id, userId, roundNo, loadoutId, type, score, version, gameMode
          ) VALUES (?, 'user', 4, ?, 'rollingTopAcc', ?, ?, 'shopper')
        `,
        args: [id, loadoutId, score, version],
      })
    }

    await insert({ id: 'top-entry', loadoutId: 'current-top', score: 100 })
    for (let index = 0; index < 50; index += 1) {
      await insert({
        id: `higher-entry-${index}`,
        loadoutId: `higher-${index}`,
        score: 99 - index,
      })
    }
    await insert({
      id: 'fallback-entry',
      loadoutId: 'current-fallback',
      score: 1,
    })
    await insert({
      id: 'legacy-entry',
      loadoutId: 'legacy-loadout',
      score: 88,
      version: 2,
    })

    const { getLeaderboardSummaries } = await import('./getLeaderboardSummary')
    const summaries = await getLeaderboardSummaries({
      loadouts: [
        { id: 'current-top', roundNo: 4, version: 3 },
        { id: 'current-fallback', roundNo: 4, version: 3 },
        { id: 'legacy-loadout', roundNo: 4, version: 2 },
      ],
    })

    assert.deepEqual(summaries.get('current-top'), {
      rank: 1,
      score: 100,
      isTop: true,
    })
    assert.deepEqual(summaries.get('current-fallback'), {
      rank: 99,
      score: 1,
      isTop: false,
    })
    assert.equal(summaries.has('legacy-loadout'), false)
  } finally {
    client.close()
    await rm(directory, { recursive: true, force: true })
  }
})
