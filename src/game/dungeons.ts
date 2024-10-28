import { LoadoutData } from '@/db/schema-zod'
import { range } from 'lodash-es'
import { ItemName } from './allItems'
import { SeedArray, rngFloat } from './seed'

type DungeonRoom = {
  loadout: LoadoutData
}

type DungeonDefinitionRaw = {
  name: string
  generate: (ctx: { seed: SeedArray; level: number }) => {
    rooms: DungeonRoom[]
  }
}

const allDungeonsRaw = [
  {
    name: 'Adventure Trail',
    generate: ({ seed, level }) => {
      const noOfRooms = 3
      const rooms: DungeonRoom[] = range(noOfRooms).map((roomIdx) => {
        const monsters: ItemName[] =
          roomIdx === 0
            ? ['scarecrow']
            : roomIdx === 1
              ? ['wilma']
              : ['scarecrow', 'wilma']

        return {
          loadout: {
            items: monsters.map((monster, monsterIdx) => ({
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
            })),
          },
        }
      })

      return {
        rooms,
      }
    },
  },
] as const satisfies DungeonDefinitionRaw[]
