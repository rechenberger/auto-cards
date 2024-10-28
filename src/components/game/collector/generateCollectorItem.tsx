import { Game } from '@/db/schema-zod'
import { allAspects } from '@/game/aspects'
import { generateShopItemsRaw } from '@/game/generateShopItemsRaw'
import { Rarity, allRarities, getRarityDefinition } from '@/game/rarities'
import { SeedArray, rngFloat, rngItem, rngItems } from '@/game/seed'
import { floor } from 'lodash-es'
import { ItemData } from '../ItemData'

export const generateCollectorItem = async ({
  game,
  seed,
  rarity,
}: {
  game: Game
  seed: SeedArray
  rarity: Rarity
}) => {
  let items = await generateShopItemsRaw({
    game,
    skipRarityWeights: true,
    skipSpecialBuyRound: true,
    skipUniqueCheck: true,
  })

  items = items.filter((i) => !i.isSpecial)
  items = items.filter((i) => !i.locked)

  const rarityDef = getRarityDefinition(rarity)
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

  const noOfAspects = rarityDef.aspects.normal
  const aspectDefs = rngItems({
    seed: [...seed, 'aspects'],
    items: allAspects,
    count: noOfAspects,
  })
  const aspects = aspectDefs.map((aspectDef, idx) => ({
    name: aspectDef.name,
    rnd: floor(
      rngFloat({
        seed: [...seed, 'aspectPower', idx],
        min: 0,
        max: 1,
      }),
      3,
    ),
  }))

  const itemData: ItemData = {
    name: item.item.name,
    aspects,
  }

  return itemData
}
