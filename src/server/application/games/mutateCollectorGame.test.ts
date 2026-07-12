import assert from 'node:assert/strict'
import test from 'node:test'
import { CollectorCommandRequest } from '@/contracts/collector-api'
import { Game } from '@/db/schema-zod'
import { mutateCollectorGame } from './mutateCollectorGame'

const collectorGame = (overrides?: Partial<Game>): Game =>
  Game.parse({
    id: 'collector-game',
    userId: 'user-1',
    data: {
      version: 3,
      seed: 'game-seed',
      roundNo: 0,
      gold: 0,
      shopRerolls: 0,
      shopItems: [],
      currentLoadout: { items: [] },
      dungeonAccesses: [
        {
          name: 'trainingGrounds',
          levelMin: 1,
          levelMax: 1,
          levelCurrent: 1,
        },
        {
          name: 'adventureTrail',
          levelMin: 1,
          levelMax: 1,
          levelCurrent: 1,
        },
      ],
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    liveMatchId: null,
    version: 3,
    gameMode: 'collector',
    revision: 0,
    ...overrides,
  })

test('collector command contract requires an explicit ruleset version', () => {
  assert.equal(
    CollectorCommandRequest.safeParse({
      expectedRevision: 0,
      command: { type: 'choose-starter', starterId: 'blacksmith' },
    }).success,
    false,
  )
})

test('choosing a starter creates persistent inventory ids exactly once', async () => {
  const game = collectorGame()
  await mutateCollectorGame({
    game,
    command: { type: 'choose-starter', starterId: 'blacksmith' },
    isAdmin: false,
  })

  assert.deepEqual(
    game.data.currentLoadout.items.map((item) => item.name),
    ['hero', 'blacksmith', 'woodenSword', 'woodenBuckler'],
  )
  assert.equal(game.data.inventory?.items.length, 2)
  assert.ok(
    game.data.inventory?.items.every((item) => item.id && item.createdAt),
  )

  await assert.rejects(() =>
    mutateCollectorGame({
      game,
      command: { type: 'choose-starter', starterId: 'hunter' },
      isAdmin: false,
    }),
  )
})

test('favorite, loadout and salvage commands use the authoritative item id', async () => {
  const game = collectorGame()
  await mutateCollectorGame({
    game,
    command: { type: 'choose-starter', starterId: 'hunter' },
    isAdmin: false,
  })
  const itemId = game.data.inventory!.items[0]!.id!

  await mutateCollectorGame({
    game,
    command: { type: 'toggle-favorite-item', itemId },
    isAdmin: false,
  })
  assert.equal(
    game.data.inventory!.items.find((item) => item.id === itemId)?.favorite,
    true,
  )
  assert.equal(
    game.data.currentLoadout.items.find((item) => item.id === itemId)?.favorite,
    true,
  )

  await mutateCollectorGame({
    game,
    command: { type: 'toggle-loadout-item', itemId },
    isAdmin: false,
  })
  assert.equal(
    game.data.currentLoadout.items.some((item) => item.id === itemId),
    false,
  )

  await mutateCollectorGame({
    game,
    command: { type: 'salvage-item', itemId },
    isAdmin: false,
  })
  assert.equal(
    game.data.inventory!.items.some((item) => item.id === itemId),
    false,
  )
  assert.equal(game.data.salvagedParts?.common, 1)
})

test('upgrading consumes parts and updates inventory and equipped copies', async () => {
  const item = {
    id: 'sword-1',
    name: 'woodenSword' as const,
    rarity: 'common' as const,
    aspects: [],
  }
  const game = collectorGame({
    data: {
      version: 3,
      seed: 'game-seed',
      roundNo: 0,
      gold: 0,
      shopRerolls: 0,
      shopItems: [],
      currentLoadout: { items: [{ name: 'hero' }, { ...item }] },
      inventory: { items: [{ ...item }] },
      salvagedParts: { common: 4 },
      dungeonAccesses: [],
    },
  })

  const result = await mutateCollectorGame({
    game,
    command: { type: 'upgrade-item', itemId: item.id },
    isAdmin: false,
    seed: () => 'upgrade-seed',
  })

  assert.equal(result.type, 'item-upgraded')
  assert.equal(game.data.salvagedParts?.common, 0)
  for (const upgraded of [
    game.data.inventory!.items[0]!,
    game.data.currentLoadout.items.find(
      (candidate) => candidate.id === item.id,
    )!,
  ]) {
    assert.equal(upgraded.rarity, 'uncommon')
    assert.equal(upgraded.aspects?.length, 1)
  }
})

test('bulk salvage protects equipped items and favorites', async () => {
  const items = [
    { id: 'free', name: 'woodenSword' as const, rarity: 'common' as const },
    {
      id: 'favorite',
      name: 'shortBow' as const,
      rarity: 'common' as const,
      favorite: true,
    },
    { id: 'equipped', name: 'roseBush' as const, rarity: 'common' as const },
  ]
  const game = collectorGame({
    data: {
      version: 3,
      seed: 'game-seed',
      roundNo: 0,
      gold: 0,
      shopRerolls: 0,
      shopItems: [],
      currentLoadout: { items: [{ name: 'hero' }, items[2]!] },
      inventory: { items },
      dungeonAccesses: [],
    },
  })
  await mutateCollectorGame({
    game,
    command: { type: 'salvage-unprotected', rarity: 'common' },
    isAdmin: false,
  })

  assert.deepEqual(game.data.inventory!.items.map((item) => item.id).sort(), [
    'equipped',
    'favorite',
  ])
  assert.equal(game.data.salvagedParts?.common, 1)
})

test('admin collector commands are rejected for regular players', async () => {
  await assert.rejects(() =>
    mutateCollectorGame({
      game: collectorGame(),
      command: { type: 'admin-reset' },
      isAdmin: false,
    }),
  )
})

test('dungeon entry validates access and creates a deterministic room seed', async () => {
  const game = collectorGame()
  await mutateCollectorGame({
    game,
    command: { type: 'choose-starter', starterId: 'blacksmith' },
    isAdmin: false,
  })
  await mutateCollectorGame({
    game,
    command: { type: 'enter-dungeon', dungeonName: 'trainingGrounds' },
    isAdmin: false,
    seed: () => 'dungeon-seed',
  })

  assert.equal(game.data.dungeon?.name, 'trainingGrounds')
  assert.equal(game.data.dungeon?.seed, 'dungeon-seed')
  assert.equal(game.data.dungeon?.room.idx, 0)
  assert.ok(game.data.dungeon?.room.seed)
})
