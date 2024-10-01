import { authenticateWithApiKey } from '@/auth/getMyUserFromApiKey'
import { getShopItemByName } from '@/components/game/getShopItemByName'
import { addPriceToGame } from '@/game/addPriceToGame'
import { getItemByName } from '@/game/allItems'
import { calcStats, throwIfNegativeStats } from '@/game/calcStats'
import { gameActionRest } from '@/game/gameActionRest'
import { getGameFromDb } from '@/game/getGame'

export async function POST(
  req: Request,
  { params }: { params: { gameId: string; itemName: string } },
) {
  try {
    await authenticateWithApiKey(req)

    const game = await getGameFromDb({ id: params.gameId })

    const item = await getItemByName(params.itemName)

    const shopItem = await getShopItemByName(game, params.itemName)

    let price = item.price
    if (shopItem?.isOnSale) {
      price = Math.ceil(price * 0.5)
    }

    const g = await gameActionRest({
      gameId: params.gameId,
      action: async ({ ctx }) => {
        const game = ctx.game
        if (game.data.gold < price) {
          throw new Error('Not enough gold')
        }
        game.data.gold -= price
        const s = game.data.shopItems[shopItem.idx]
        if (s.isSold) {
          throw new Error('Already sold')
        }
        s.isSold = true
        s.isReserved = false

        const loadout = game.data.currentLoadout
        const itemInLoadout = loadout.items.find(
          (i) => i.name === shopItem.name,
        )

        if (item.unique && itemInLoadout) {
          throw new Error('You can only have a unique item once')
        }

        if (itemInLoadout) {
          itemInLoadout.count = (itemInLoadout.count ?? 1) + 1
        } else {
          loadout.items = [...loadout.items, { name: shopItem.name }]
        }
        const stats = await calcStats({
          loadout: loadout,
        })
        throwIfNegativeStats({ stats })
      },
    })

    const updatedGame = await addPriceToGame(g)

    return Response.json(updatedGame)
  } catch (e) {
    if (e instanceof Error) {
      return Response.json({ error: e.message }, { status: 400 })
    }
    return Response.json({ error: 'Unknown error' }, { status: 500 })
  }
}
