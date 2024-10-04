import { Game } from '@/db/schema-zod'

export const getShopItemByName = (game: Game, itemName: string) => {
  const shopItemIndex = game.data.shopItems.findIndex(
    (s) => s.name === itemName,
  )
  const shopItem =
    shopItemIndex !== -1
      ? { ...game.data.shopItems[shopItemIndex], idx: shopItemIndex }
      : null

  if (!shopItem) {
    throw new Error('Item not currently in shop')
  }
  return shopItem
}
