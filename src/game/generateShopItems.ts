import { Game, GameData } from '@/db/schema-zod'
import { floor } from 'lodash-es'
import { ItemAspect, allAspects } from './aspects'
import { NO_OF_SHOP_ITEMS, SALE_CHANCE } from './config'
import { generateShopItemsRaw } from './generateShopItemsRaw'
import { getSpecialBuyRound } from './getSpecialBuyRound'
import { rngFloat, rngItems, rngItemsWithWeights } from './seed'

export const generateShopItems = async ({
  game,
  skipRarityWeights,
}: {
  game: Game
  skipRarityWeights?: boolean
}) => {
  const specialBuyRound = getSpecialBuyRound({ game })

  const shopSeed = [
    game.data.seed,
    game.data.roundNo,
    game.data.shopRerolls,
    'shop',
  ]

  const oldItems = game.data.shopItems.filter((item) => item.isReserved)

  const itemsToGenerate = specialBuyRound
    ? specialBuyRound.noOfItems
    : NO_OF_SHOP_ITEMS - oldItems.length

  let itemsWeighted = await generateShopItemsRaw({
    game,
    skipRarityWeights,
  })

  itemsWeighted = itemsWeighted.filter((i) => i.weight > 0)

  const newItems = rngItemsWithWeights({
    seed: shopSeed,
    items: itemsWeighted,
    count: itemsToGenerate,
  })

  const shopItems: GameData['shopItems'] = newItems.map((newItem, idx) => {
    const itemSeed = [...shopSeed, idx]

    const isOnSale = specialBuyRound
      ? false
      : rngFloat({
          seed: [...itemSeed, 'isOnSale'],
        }) < SALE_CHANCE

    let aspects: ItemAspect[] | undefined = undefined
    if (game.gameMode === 'collector') {
      const noOfAspects = specialBuyRound ? 0 : 3
      const aspectDefs = rngItems({
        seed: [...itemSeed, 'aspects'],
        items: allAspects,
        count: noOfAspects,
      })
      aspects = aspectDefs.map((aspectDef, idx) => ({
        name: aspectDef.name,
        rnd: floor(
          rngFloat({
            seed: [...itemSeed, 'aspectPower', idx],
            min: 0,
            max: 1,
          }),
          3,
        ),
      }))
    }

    return {
      name: newItem.name,
      isOnSale,
      isSpecial: !!specialBuyRound,
      aspects,
    }
  })
  shopItems.push(...oldItems)

  return shopItems
}
