import { ItemData } from '@/components/game/ItemData'
import { SeedArray, rngFloat } from './seed'

type DungeonDefinitionRaw = {
  name: string
  generate: (ctx: { seed: SeedArray; level: number }) => {
    rooms: {
      items: ItemData[]
    }[]
  }
}

const allDungeonsRaw = [
  {
    name: 'Adventure Trail',
    generate: ({ seed, level }) => {
      return {
        rooms: [
          {
            items: [
              {
                name: 'scarecrow',
                aspects: [
                  {
                    name: 'monsterPower',
                    rnd: rngFloat({ seed: [...seed, 'room', 0, 'item', 0] }),
                    multiplier: 1.2 ** level,
                  },
                ],
              },
            ],
          },
          {
            items: [
              {
                name: 'wilma',
                aspects: [
                  {
                    name: 'monsterPower',
                    rnd: rngFloat({ seed: [...seed, 'room', 1, 'item', 0] }),
                    multiplier: 1.2 ** level,
                  },
                ],
              },
            ],
          },
        ],
      }
    },
  },
] as const satisfies DungeonDefinitionRaw[]
