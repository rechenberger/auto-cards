import assert from 'node:assert/strict'
import test from 'node:test'
import type { Game } from '@/db/schema-zod'
import { DEFAULT_GAME_VERSION } from '@/game/gameVersion'
import { ApiError } from '@/server/api/ApiError'
import { mutateGame } from './mutateGame'

const makeGame = (items: Game['data']['currentLoadout']['items']): Game => ({
  id: 'game-test',
  userId: 'user-test',
  data: {
    version: DEFAULT_GAME_VERSION,
    seed: 'test-seed',
    roundNo: 0,
    gold: 0,
    shopRerolls: 0,
    shopItems: [],
    currentLoadout: { items },
  },
  liveMatchId: null,
  version: DEFAULT_GAME_VERSION,
  gameMode: 'shopper',
  revision: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

test('selling an item that is not owned is rejected without adding gold', async () => {
  const game = makeGame([{ name: 'hero' }])

  await assert.rejects(
    mutateGame({
      game,
      command: { type: 'sell', itemName: 'woodenSword' },
      isAdmin: false,
    }),
    (error) => error instanceof ApiError && error.code === 'INVALID_COMMAND',
  )
  assert.equal(game.data.gold, 0)
  assert.deepEqual(game.data.currentLoadout.items, [{ name: 'hero' }])
})

test('selling removes only the selected aspect variant', async () => {
  const selectedAspects = [{ name: 'health' as const, rnd: 0.25 }]
  const otherAspects = [{ name: 'health' as const, rnd: 0.75 }]
  const game = makeGame([
    { name: 'woodenSword', aspects: selectedAspects },
    { name: 'woodenSword', aspects: otherAspects },
  ])

  await mutateGame({
    game,
    command: {
      type: 'sell',
      itemName: 'woodenSword',
      aspects: selectedAspects,
    },
    isAdmin: false,
  })

  assert.deepEqual(game.data.currentLoadout.items, [
    { name: 'woodenSword', aspects: otherAspects },
  ])
  assert.ok(game.data.gold > 0)
})

test('selling one copy decrements a counted loadout item', async () => {
  const game = makeGame([{ name: 'woodenSword', count: 2 }])

  await mutateGame({
    game,
    command: { type: 'sell', itemName: 'woodenSword' },
    isAdmin: false,
  })

  assert.equal(game.data.currentLoadout.items[0]?.count, 1)
})
