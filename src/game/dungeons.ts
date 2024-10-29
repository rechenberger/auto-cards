import { ItemData } from '@/components/game/ItemData'
import { map } from 'remeda'
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

type DungeonDefinitionRaw = {
  name: string
  levelMax?: number
  levelAutoIncrement?: boolean
  generate: (ctx: { seed: SeedArray; level: number }) => {
    rooms: DungeonRoom[]
  }
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

const allDungeonsRaw = [
  {
    name: 'trainingGrounds',
    levelMax: 5,
    levelAutoIncrement: true,
    generate: ({ seed, level }) => {
      const simpleRooms: { monsters: ItemName[] }[] = [
        { monsters: ['scarecrow'] },
      ]
      const rooms: DungeonRoom[] = [
        ...simpleRoomsToRooms({ simpleRooms, seed, level }),
        {
          type: 'reward',
          items: [{ name: 'woodenSword', aspects: [], rarity: 'common' }],
        },
      ]
      return {
        rooms,
      }
    },
  },
  {
    name: 'adventureTrail',
    generate: ({ seed, level }) => {
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
] as const satisfies DungeonDefinitionRaw[]

const allDungeonNames = map(allDungeonsRaw, (dungeon) => dungeon.name)
export const DungeonName = z.enum(allDungeonNames)
export type DungeonName = z.infer<typeof DungeonName>

export type DungeonDefinition = DungeonDefinitionRaw & {
  name: DungeonName
}

export const allDungeons: DungeonDefinition[] = allDungeonsRaw

export const getDungeon = (name: DungeonName) => {
  const dungeon = allDungeons.find((dungeon) => dungeon.name === name)
  if (!dungeon) {
    throw new Error(`Dungeon ${name} not found`)
  }
  return dungeon
}
