import { Game, GameData } from '@/db/schema-zod'
import { forEach } from 'lodash-es'
import { getAllItems } from './allItems'
import { NO_OF_SHOP_ITEMS, SALE_CHANCE } from './config'
import { ItemDefinition } from './ItemDefinition'
import { rarityCountsByWeights } from './rarityCountsByWeights'
import { roundStats } from './roundStats'
import { rngFloat, rngItems } from './seed'

export const generateShopItems = async ({
  game,
  skipRarityWeights,
}: {
  game: Game
  skipRarityWeights?: boolean
}) => {
  const allItems = await getAllItems()
  const itemsForSale = allItems.filter((item) => !!item.price)

  const shopSeed = [
    game.data.seed,
    game.data.roundNo,
    game.data.shopRerolls,
    'shop',
  ]

  const oldItems = game.data.shopItems.filter((item) => item.isReserved)
  const itemsToGenerate = NO_OF_SHOP_ITEMS - oldItems.length

  let items: ItemDefinition[] = []
  const roundStat = roundStats[game.data.roundNo]
  if (skipRarityWeights || !roundStat.rarityWeights) {
    items = rngItems({
      seed: shopSeed,
      items: itemsForSale,
      count: itemsToGenerate,
    })
  } else {
    const counts = rarityCountsByWeights({
      rarityWeights: roundStat.rarityWeights,
      seed: shopSeed,
      count: itemsToGenerate,
    })
    forEach(counts, (count, rarity) => {
      if (!count) return
      items.push(
        ...rngItems({
          seed: [...shopSeed, rarity],
          items: itemsForSale.filter((item) => item.rarity === rarity),
          count,
        }).filter(Boolean),
      )
    })
  }

  const shopItems: GameData['shopItems'] = items.map((newItem, idx) => {
    const itemSeed = [...shopSeed, idx]

    const isOnSale =
      rngFloat({
        seed: [...itemSeed, 'isOnSale'],
      }) < SALE_CHANCE

    return {
      name: newItem.name,
      isOnSale,
    }
  })
  shopItems.push(...oldItems)

  return shopItems
}
