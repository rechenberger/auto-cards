import { authenticateWithApiKey } from '@/auth/getMyUserFromApiKey'
import { gameActionRest } from '@/game/gameActionRest'
import { getCraftingRecipesGame } from '@/game/getCraftingRecipesGame'
import { getGameFromDb } from '@/game/getGame'
import { negativeItems, sumItems } from '@/game/sumItems'
import { find } from 'lodash-es'

export async function POST(
  req: Request,
  { params }: { params: { gameId: string; recipeId: string } },
) {
  try {
    await authenticateWithApiKey(req)

    const game = await getGameFromDb({ id: params.gameId })
    const recipes = await getCraftingRecipesGame({ game })
    const recipe = find(recipes, (r) => r.id === parseInt(params.recipeId))

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    const updatedGame = await gameActionRest({
      gameId: params.gameId,
      action: async ({ ctx }) => {
        ctx.game.data.currentLoadout.items = sumItems(
          ctx.game.data.currentLoadout.items,
          negativeItems(recipe.input),
          recipe.output,
        )
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
