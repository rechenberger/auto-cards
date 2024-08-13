import { Game } from '@/db/GameData'
import { db } from '@/db/db'

export const getGameFromDb = async ({ id }: { id: string }) => {
  const game = await db.query.games.findFirst({
    where: (s, { eq }) => eq(s.id, id),
  })
  if (!game) {
    throw new Error('Game not found')
  }
  return Game.parse(game)
}
