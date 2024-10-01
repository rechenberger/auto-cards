import { authenticateWithApiKey } from '@/auth/getMyUserFromApiKey'
import { getShopItemByName } from '@/components/game/getShopItemByName'
import { addPriceToGame } from '@/game/addPriceToGame'
import { gameActionRest } from '@/game/gameActionRest'

export async function POST(
  req: Request,
  { params }: { params: { gameId: string; itemName: string } },
) {
  try {
    await authenticateWithApiKey(req)

    const g = await gameActionRest({
      gameId: params.gameId,
      action: async ({ ctx }) => {
        const shopItem = await getShopItemByName(ctx.game, params.itemName)

        const s = ctx.game.data.shopItems[shopItem.idx]
        s.isReserved = !s.isReserved
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
