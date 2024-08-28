import { Game, GameData } from '@/db/schema-zod'
import { range } from 'lodash-es'
import { getAllItems } from './allItems'
import { NO_OF_SHOP_ITEMS, SALE_CHANCE } from './config'
import { rngFloat, rngItems } from './seed'

export const generateShopItems = async ({ game }: { game: Game }) => {
  const allItems = await getAllItems()
  const itemsForSale = allItems.filter((item) => !!item.price)

  const shopSeed = [
    game.data.seed,
    game.data.roundNo,
    game.data.shopRerolls,
    'shop',
  ]

  // no duplicates
  const items = rngItems({
    seed: shopSeed,
    items: itemsForSale,
    count: NO_OF_SHOP_ITEMS,
  })

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
