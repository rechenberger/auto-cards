import { Game } from '@/db/schema-zod'
import { getGameFromDb } from '@/game/getGame'
import { updateGame } from '@/game/updateGame'
import { superAction } from '@/super-action/action/createSuperAction'
import { streamRevalidatePath } from '@/super-action/action/streamRevalidatePath'
import { cloneDeep } from 'lodash-es'

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
    const game = await getGameFromDb({ id: gameId }).then(cloneDeep)
    const ctx = { game }
    await action({ ctx })
    await updateGame({ game: ctx.game })

    streamRevalidatePath('/game')
    streamRevalidatePath(`/game/${gameId}`)
  })
}
