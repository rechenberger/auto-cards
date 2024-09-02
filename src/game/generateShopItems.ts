import { Game, GameData } from '@/db/schema-zod'
import { forEach, range } from 'lodash-es'
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

  let items: ItemDefinition[] = []
  const roundStat = roundStats[game.data.roundNo]
  if (skipRarityWeights || !roundStat.rarityWeights) {
    items = rngItems({
      seed: shopSeed,
      items: itemsForSale,
      count: NO_OF_SHOP_ITEMS,
    })
  } else {
    const counts = rarityCountsByWeights({
      rarityWeights: roundStat.rarityWeights,
      seed: shopSeed,
    })
    forEach(counts, (count, rarity) => {
      if (!count) return
      items.push(
        ...rngItems({
          seed: [...shopSeed, rarity],
          items: itemsForSale.filter((item) => item.rarity === rarity),
          count,
        }),
      )
    })
  }

  const shopItems: GameData['shopItems'] = range(NO_OF_SHOP_ITEMS).map(
    (idx) => {
      const oldItem = game.data.shopItems[idx]
      if (oldItem?.isReserved) {
        return oldItem
      }

      const itemSeed = [...shopSeed, idx]

      const item = items[idx]

      const isOnSale =
        rngFloat({
          seed: [...itemSeed, 'isOnSale'],
        }) < SALE_CHANCE

      return {
        name: item.name,
        isOnSale,
      }
    },
  )

  return shopItems
}
