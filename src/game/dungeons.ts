import { ItemData } from '@/components/game/ItemData'
import { map } from 'remeda'
import { z } from 'zod'
import { LoadoutData } from './LoadoutData'
import { ItemName } from './allItems'
import { SeedArray, rngFloat } from './seed'

type DungeonRoom = {
  loadout?: LoadoutData
}

type DungeonDefinitionRaw = {
  name: string
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
      loadout: {
        items: [{ name: 'hero' }, ...monsters],
      },
    }
  })

  return rooms
}

const allDungeonsRaw = [
  {
    name: 'adventureTrail',
    generate: ({ seed, level }) => {
      const simpleRooms: { monsters: ItemName[] }[] = [
        { monsters: ['scarecrow'] },
        { monsters: ['wilma'] },
        { monsters: ['scarecrow', 'wilma'] },
      ]
      const rooms = simpleRoomsToRooms({ simpleRooms, seed, level })
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
