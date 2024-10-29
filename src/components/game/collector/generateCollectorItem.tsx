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

  const possibleAspects = allAspects.filter(
    (a) => a.tags?.some((t) => item.item.tags?.includes(t)),
  )

  if (possibleAspects.length < noOfAspects) {
    console.warn(
      `Not enough possible aspects for ${
        item.item.name
      } (${item.item.tags?.join(', ')})`,
    )
  }

  const aspectDefs = rngItems({
    seed: [...seed, 'aspects'],
    items: possibleAspects,
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
    rarity,
  }

  return itemData
}
