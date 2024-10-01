import { authenticateWithApiKey } from '@/auth/getMyUserFromApiKey'
import { addPriceToGame } from '@/game/addPriceToGame'
import { createGame } from '@/game/createGame'

export async function POST(req: Request) {
  try {
    const user = await authenticateWithApiKey(req)
    const g = await createGame({ userId: user.id })
    const game = await addPriceToGame(g)
    return Response.json(game)
  } catch (e) {
    if (e instanceof Error) {
      return Response.json({ error: e.message }, { status: 400 })
    }
    return Response.json({ error: 'Unknown error' }, { status: 500 })
  }
}
