import { range } from 'lodash-es'
import { RarityWeights, allRarities } from './rarities'
import { Seed, rngItemWithWeights } from './seed'

export const rarityCountsByWeights = ({
  rarityWeights,
  seed,
}: {
  rarityWeights: RarityWeights
  seed: Seed
}) => {
  const result: RarityWeights = {}
  range(5).forEach(() => {
    const randomRarity = rngItemWithWeights({
      seed,
      items: allRarities.map((rarity) => ({
        item: rarity,
        weight: rarityWeights[rarity] || 0,
      })),
    })
    result[randomRarity] = (result[randomRarity] || 0) + 1
  })
  return result
}
