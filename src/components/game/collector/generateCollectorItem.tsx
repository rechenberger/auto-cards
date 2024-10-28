import { Game } from '@/db/schema-zod'
import { allAspects } from '@/game/aspects'
import { generateShopItemsRaw } from '@/game/generateShopItemsRaw'
import { Rarity } from '@/game/rarities'
import { SeedArray, rngFloat, rngItem, rngItems } from '@/game/seed'
import { floor } from 'lodash-es'

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
  items = items.filter((i) => i.item.rarity === rarity)

  const item = rngItem({
    seed,
    items,
  })

  if (!item) {
    throw new Error('No item found')
  }

  const noOfAspects = 3
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

  const abc = {
    name: item.item.name,
    aspects,
  }

  return abc
}
