import { allRarityDefinitions, RarityWeights } from './rarities'
import { rngItemWithWeights, Seed } from './seed'

export const randomRarityDefByWeight = ({
  rarityWeights,
  seed,
}: {
  rarityWeights: RarityWeights
  seed: Seed
}) => {
  const item = rngItemWithWeights({
    seed,
    items: allRarityDefinitions
      .map((rarity) => ({
        item: rarity,
        weight: rarityWeights[rarity.name] ?? 0,
      }))
      .filter((r) => r.weight > 0),
  })
  if (!item) {
    throw new Error('No rarity found')
  }

  return item
}

export const randomRarityByWeight = ({
  rarityWeights,
  seed,
}: {
  rarityWeights: RarityWeights
  seed: Seed
}) => {
  const rarityDef = randomRarityDefByWeight({ rarityWeights, seed })
  return rarityDef.name
}
