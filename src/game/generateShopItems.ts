import { Game, GameData } from '@/db/schema-zod'
import { getAllItems } from './allItems'
import { NO_OF_SHOP_ITEMS, SALE_CHANCE } from './config'
import { roundStats } from './roundStats'
import { rngFloat, rngItemsWithWeights } from './seed'

export const generateShopItems = async ({
  game,
  skipRarityWeights,
}: {
  game: Game
  skipRarityWeights?: boolean
}) => {
  const allItems = await getAllItems()
  let itemsForSale = allItems.filter((item) => !!item.shop)

  // Check for unique items
  itemsForSale = itemsForSale.filter((item) => {
    if (!item.unique) return true
    const alreadyInHand = game.data.currentLoadout.items.some(
      (i) => i.name === item.name,
    )
    if (alreadyInHand) return false
    const alreadyInShop = game.data.shopItems.some(
      (i) => i.name === item.name && i.isReserved,
    )
    if (alreadyInShop) return false
    return true
  })

  const shopSeed = [
    game.data.seed,
    game.data.roundNo,
    game.data.shopRerolls,
    'shop',
  ]

  const oldItems = game.data.shopItems.filter((item) => item.isReserved)
  const itemsToGenerate = NO_OF_SHOP_ITEMS - oldItems.length

  const roundStat = roundStats[game.data.roundNo]
  const itemsWeighted = itemsForSale
    .map((item) => {
      let weight = 1

      if (!skipRarityWeights && roundStat.rarityWeights) {
        if (!item.rarity) {
          throw new Error(`Item ${item.name} has no rarity`)
        }
        const rarityWeight = roundStat.rarityWeights[item.rarity]
        weight *= rarityWeight ?? 0

        // const rarityItems = itemsForSale.filter((i) => i.rarity === item.rarity)
        // weight /= rarityItems.length

        // if (item.tags?.includes('weapon')) {
        //   weight *= 2
        // }
      }

      return {
        item,
        weight,
      }
    })
    .filter((i) => i.weight > 0)

  const newItems = rngItemsWithWeights({
    seed: shopSeed,
    items: itemsWeighted,
    count: itemsToGenerate,
  })

  const shopItems: GameData['shopItems'] = newItems.map((newItem, idx) => {
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
