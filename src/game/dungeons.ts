import { ItemData } from '@/components/game/ItemData'
import { LoadoutData } from '@/db/schema-zod'
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
        items: [...monsters],
      },
    }
  })

  return rooms
}

const allDungeonsRaw = [
  {
    name: 'Adventure Trail',
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
