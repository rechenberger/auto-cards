import { Game } from '@/db/schema-zod'
import { getGameFromDb } from '@/game/getGame'
import { updateGame } from '@/game/updateGame'
import { superAction } from '@/super-action/action/createSuperAction'
import { revalidatePath } from 'next/cache'

type GameActionContext = {
  game: Game
}

type GameAction = (params: { ctx: GameActionContext }) => Promise<void> | void

export const gameAction = async ({
  gameId,
  action,
}: {
  gameId: string
  action: GameAction
}) => {
  return superAction(async () => {
    const game = await getGameFromDb({ id: gameId })
    const ctx = { game }
    await action({ ctx })
    await updateGame({ game: ctx.game })
    revalidatePath('/game')
    revalidatePath(`/game/${gameId}`)
  })
}
