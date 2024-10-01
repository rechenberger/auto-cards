import { Game } from '@/db/schema-zod'
import { getItemByName } from './allItems'

export const addPriceToGame = async (game: Game) => {
  const shopItems = await Promise.all(
    game.data.shopItems.map(async (s) => {
      const item = await getItemByName(s.name)

      let price = item.price
      if (s.isOnSale) {
        price = Math.ceil(price * 0.5)
      }

      return {
        ...s,
        price,
      }
    }),
  )

  return {
    ...game,
    data: {
      ...game.data,
      shopItems,
    },
  }
}
