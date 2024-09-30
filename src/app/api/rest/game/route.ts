import { authenticateWithApiKey } from '@/auth/getMyUserFromApiKey'
import { createGame } from '@/game/createGame'

export async function POST(req: Request) {
  try {
    const user = await authenticateWithApiKey(req)
    const game = await createGame({ userId: user.id })

    return Response.json({
      id: game.id,
    })
  } catch (e) {
    if (e instanceof Error) {
      return Response.json({ error: e.message }, { status: 400 })
    }
    return Response.json({ error: 'Unknown error' }, { status: 500 })
  }
}
