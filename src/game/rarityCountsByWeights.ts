import { range } from 'lodash-es'
import { RarityWeights, allRarities } from './rarities'
import { Seed, rngItemWithWeights } from './seed'

export const rarityCountsByWeights = ({
  rarityWeights,
  seed,
  count,
}: {
  rarityWeights: RarityWeights
  seed: Seed
  count: number
}) => {
  const result: RarityWeights = {}
  range(count).forEach((idx) => {
    const randomRarity = rngItemWithWeights({
      seed: [seed, idx],
      items: allRarities.map((rarity) => ({
        item: rarity,
        weight: rarityWeights[rarity] || 0,
      })),
    })
    if (randomRarity) {
      result[randomRarity] = (result[randomRarity] || 0) + 1
    }
  })
  return result
}
