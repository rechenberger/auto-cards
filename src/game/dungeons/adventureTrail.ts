import { ItemData } from '@/components/game/ItemData'
import { ItemName } from '../allItems'
import { SeedArray, rngFloat } from '../seed'
import { DungeonDefinition, DungeonRoom } from './dungeons'

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

export const adventureTrail: DungeonDefinition = {
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
}
