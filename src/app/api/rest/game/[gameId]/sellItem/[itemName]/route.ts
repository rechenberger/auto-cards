import { authenticateWithApiKey } from '@/auth/getMyUserFromApiKey'
import { addPriceToGame } from '@/game/addPriceToGame'
import { getItemByName } from '@/game/allItems'
import { gameActionRest } from '@/game/gameActionRest'
import { negativeItems, sumItems } from '@/game/sumItems'

export async function POST(
  req: Request,
  { params }: { params: { gameId: string; itemName: string } },
) {
  try {
    await authenticateWithApiKey(req)

    const item = await getItemByName(params.itemName)

    const sellPrice = item.sellPrice ?? Math.ceil(item.price / 2)

    const g = await gameActionRest({
      gameId: params.gameId,
      action: async ({ ctx }) => {
        ctx.game.data.currentLoadout.items = sumItems(
          ctx.game.data.currentLoadout.items,
          negativeItems([item]),
        )
        ctx.game.data.gold += sellPrice
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
