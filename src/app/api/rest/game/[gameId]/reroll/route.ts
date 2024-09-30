import { authenticateWithApiKey } from '@/auth/getMyUserFromApiKey'
import { priceToReroll } from '@/components/game/ReRollButton'
import { gameActionRest } from '@/game/gameActionRest'
import { generateShopItems } from '@/game/generateShopItems'

export async function POST(
  req: Request,
  { params }: { params: { gameId: string } },
) {
  try {
    await authenticateWithApiKey(req)

    const updatedGame = await gameActionRest({
      gameId: params.gameId,
      action: async ({ ctx }) => {
        const { game } = ctx
        game.data.shopRerolls += 1
        if (game.data.gold < priceToReroll) {
          throw new Error('not enough gold')
        }
        game.data.gold -= priceToReroll
        game.data.shopItems = await generateShopItems({ game })
      },
    })

    return Response.json(updatedGame)
  } catch (e) {
    if (e instanceof Error) {
      return Response.json({ error: e.message }, { status: 400 })
    }
    return Response.json({ error: 'Unknown error' }, { status: 500 })
  }
}
