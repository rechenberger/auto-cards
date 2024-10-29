import { ItemData } from '@/components/game/ItemData'
import { generateCollectorItem } from '@/components/game/collector/generateCollectorItem'
import { Game } from '@/db/schema-zod'
import { z } from 'zod'
import { LoadoutData } from './LoadoutData'
import { ItemName } from './allItems'
import { SeedArray, rngFloat } from './seed'

export const DungeonRoom = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('fight'),
    loadout: LoadoutData,
  }),
  z.object({
    type: z.literal('reward'),
    items: z.array(ItemData),
  }),
])
type DungeonRoom = z.infer<typeof DungeonRoom>

const allDungeonNames = ['trainingGrounds', 'adventureTrail'] as const
export const DungeonName = z.enum(allDungeonNames)
export type DungeonName = z.infer<typeof DungeonName>

export type DungeonDefinition = {
  name: DungeonName
  description: string
  levelMax: number
  levelOnlyOnce?: boolean
  generate: (ctx: { game: Game; seed: SeedArray; level: number }) => Promise<{
    rooms: DungeonRoom[]
  }>
}

const simpleRoomsToRooms = ({
  simpleRooms,
  seed,
  level,
}: {
  simpleRooms: { monsters: ItemName[] }[]
  seed: SeedArray
  level: number
}) => {
  const rooms: DungeonRoom[] = simpleRooms.map((simpleRoom, roomIdx) => {
    const monsters: ItemData[] = simpleRoom.monsters.map(
      (monster, monsterIdx) => ({
        name: monster,
        aspects: [
          {
            name: 'monsterPower',
            rnd: rngFloat({
              seed: [...seed, 'room', roomIdx, 'monster', monsterIdx],
            }),
            multiplier: 1.2 ** level,
          },
        ],
      }),
    )

    return {
      type: 'fight',
      loadout: {
        items: [{ name: 'hero' }, ...monsters],
      },
    }
  })

  return rooms
}

const allDungeonsRaw: DungeonDefinition[] = [
  {
    name: 'trainingGrounds',
    description:
      'A little training never hurt nobody. Play through this once and get some basic equipment.',
    levelMax: 5,
    levelOnlyOnce: true,
    generate: async ({ game, seed, level }) => {
      const loadout: LoadoutData = {
        items: [{ name: 'hero' }],
      }
      if (level >= 2) {
        loadout.items.push({
          name: 'woodenSword',
          rarity: 'common',
          aspects: [],
        })
      }
      if (level >= 3) {
        loadout.items.push({
          name: 'woodenBuckler',
          rarity: 'common',
          aspects: [],
        })
      }
      if (level >= 4) {
        loadout.items.push({
          name: 'leatherArmor',
          rarity: 'common',
          aspects: [],
        })
      }
      if (level >= 5) {
        loadout.items.push(
          { name: 'beer', rarity: 'common', aspects: [] },
          { name: 'beerFest', rarity: 'common', aspects: [] },
        )
      }

      const reward = await generateCollectorItem({
        game,
        seed,
        rarity: level === 5 ? 'uncommon' : 'common',
      })
      const rooms: DungeonRoom[] = [
        {
          type: 'fight',
          loadout,
        },
        {
          type: 'reward',
          items: [reward],
        },
      ]
      return {
        rooms,
      }
    },
  },
  {
    name: 'adventureTrail',
    description:
      'An infinitely repeatable trail of adventure that leads to the greatest of treasures.',
    levelMax: 100,
    generate: async ({ seed, level }) => {
      const simpleRooms: { monsters: ItemName[] }[] = [
        { monsters: ['scarecrow'] },
        { monsters: ['wilma'] },
        { monsters: ['scarecrow', 'wilma'] },
      ]
      const rooms: DungeonRoom[] = [
        ...simpleRoomsToRooms({ simpleRooms, seed, level }),
        {
          type: 'reward',
          items: [{ name: 'banana', aspects: [], rarity: 'common' }],
        },
      ]
      return {
        rooms,
      }
    },
  },
]

export const allDungeons: DungeonDefinition[] = allDungeonsRaw

export const getDungeon = (name: DungeonName) => {
  const dungeon = allDungeons.find((dungeon) => dungeon.name === name)
  if (!dungeon) {
    throw new Error(`Dungeon ${name} not found`)
  }
  return dungeon
}
