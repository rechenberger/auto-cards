import { Game } from '@/db/schema-zod'
import { generateShopItemsRaw } from '@/game/generateShopItemsRaw'
import { Rarity, allRarities } from '@/game/rarities'
import { Seed, rngGenerator, rngItem } from '@/game/seed'
import { generateCollectorItemAspects } from './generateCollectorItemAspects'

export const generateCollectorItem = async ({
  game,
  seed: _seed,
  rarity,
}: {
  game: Game
  seed: Seed
  rarity: Rarity
}) => {
  const seed = rngGenerator({ seed: _seed })

  let items = await generateShopItemsRaw({
    game,
    skipRarityWeights: true,
    skipSpecialBuyRound: true,
    skipUniqueCheck: true,
  })

  items = items.filter((i) => !i.isSpecial)
  items = items.filter((i) => !i.locked)

  const rarityIdx = allRarities.indexOf(rarity)
  items = items.filter(
    (i) => i.item.rarity && allRarities.indexOf(i.item.rarity) <= rarityIdx,
  )

  const item = rngItem({
    seed,
    items,
  })

  if (!item) {
    throw new Error('No item found')
  }

  const itemData = await generateCollectorItemAspects({
    item: item.item,
    seed,
    rarity,
  })

  return itemData
}
