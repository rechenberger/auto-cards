import { range } from 'lodash-es'
import { RarityWeights, allRarities } from './rarities'
import { Seed, rngGenerator, rngItemWithWeights } from './seed'

export const rarityCountsByWeights = ({
  rarityWeights,
  seed: _seed,
  count,
}: {
  rarityWeights: RarityWeights
  seed: Seed
  count: number
}): RarityWeights => {
  const seed = rngGenerator({ seed: _seed })
  const result: RarityWeights = {}
  range(count).forEach(() => {
    const randomRarity = rngItemWithWeights({
      seed,
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
