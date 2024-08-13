import { Game, GameData } from '@/db/schema-zod'
import { range } from 'lodash-es'
import { getAllItems } from './allItems'
import { NO_OF_SHOP_ITEMS, SALE_CHANCE } from './config'
import { rngFloat, rngItem } from './seed'

export const generateShopItems = async ({ game }: { game: Game }) => {
  const allItems = await getAllItems()
  const itemsForSale = allItems.filter((item) => !!item.price)

  const shopItems: GameData['shopItems'] = range(NO_OF_SHOP_ITEMS).map(
    (idx) => {
      const oldItem = game.data.shopItems[idx]
      if (oldItem?.isReserved) {
        return oldItem
      }

      const item = rngItem({
        seed: [game.data.seed, 'shopItem', idx],
        items: itemsForSale,
      })

      const isOnSale =
        rngFloat({
          seed: [game.data.seed, 'shopItem', idx, 'isOnSale'],
        }) < SALE_CHANCE

      return {
        name: item.name,
        isOnSale,
      }
    },
  )

  return shopItems
}
