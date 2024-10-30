import { generateCollectorItem } from '@/components/game/collector/generateCollectorItem'
import { LoadoutData } from '../LoadoutData'
import { DungeonDefinition, DungeonRoom } from './DungeonDefinition'

export const trainingGrounds: DungeonDefinition = {
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
}
