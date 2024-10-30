import { Game } from '@/db/schema-zod'
import { randomRarityByWeight } from '@/game/randomRarityByWeight'
import { RarityWeights } from '@/game/rarities'
import { Seed, rngGenerator } from '@/game/seed'
import { generateCollectorItem } from './generateCollectorItem'

export const generateCollectorItemByRarityWeight = async ({
  game,
  seed: _seed,
  rarityWeights,
}: {
  game: Game
  seed: Seed
  rarityWeights: RarityWeights
}) => {
  const seed = rngGenerator({ seed: _seed })

  const rarity = randomRarityByWeight({
    rarityWeights,
    seed,
  })

  const item = await generateCollectorItem({
    game,
    seed,
    rarity,
  })

  return item
}
