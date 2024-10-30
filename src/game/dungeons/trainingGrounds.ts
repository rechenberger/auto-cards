import { generateCollectorItemByRarityWeight } from '@/components/game/collector/generateCollectorItemByRarityWeight'
import { LoadoutData } from '../LoadoutData'
import { DungeonDefinition, DungeonRoom } from './DungeonDefinition'

export const trainingGrounds: DungeonDefinition = {
  name: 'trainingGrounds',
  description:
    'A little training never hurt nobody. Play through this once and get some basic equipment.',
  levelMax: 5,
  levelOnlyOnce: true,
  rewards: ({ level }) => ({
    rarityWeights:
      level >= 5
        ? { uncommon: 1 }
        : {
            common: 1,
          },
  }),
  generate: async ({ game, seed, level, rewards }) => {
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

    const reward = await generateCollectorItemByRarityWeight({
      game,
      seed,
      rarityWeights: rewards.rarityWeights,
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
