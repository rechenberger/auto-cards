import { authenticateWithApiKey } from '@/auth/getMyUserFromApiKey'
import { getGameFromDb } from '@/game/getGame'

export async function GET(
  req: Request,
  { params }: { params: { gameId: string } },
) {
  try {
    await authenticateWithApiKey(req)

    const game = await getGameFromDb({ id: params.gameId })

    return Response.json(game)
  } catch (e) {
    if (e instanceof Error) {
      return Response.json({ error: e.message }, { status: 400 })
    }
    return Response.json({ error: 'Unknown error' }, { status: 500 })
  }
}
