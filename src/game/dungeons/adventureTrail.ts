import { ItemData } from '@/components/game/ItemData'
import { rngFloat, rngGenerator } from '../seed'
import { DungeonDefinition, DungeonRoom } from './DungeonDefinition'

export const adventureTrail: DungeonDefinition = {
  name: 'adventureTrail',
  description:
    'An infinitely repeatable trail of adventure that leads to the greatest of treasures.',
  levelMax: 100,
  generate: async ({ seed: _seed, level }) => {
    const seed = rngGenerator({ seed: _seed })

    const giveMonsterPower = (monster: ItemData) => {
      const rnd = rngFloat({
        seed,
      })
      return {
        ...monster,
        aspects: [
          ...(monster.aspects ?? []),
          { name: 'monsterPower', rnd, multiplier: 1.2 ** level },
        ],
      } satisfies ItemData
    }

    const rooms: DungeonRoom[] = [
      {
        type: 'fight',
        loadout: {
          items: [{ name: 'hero' }, giveMonsterPower({ name: 'scarecrow' })],
        },
      },
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
