import { Game } from '@/db/schema-zod'
import { getGameFromDb } from '@/game/getGame'
import { updateGame } from '@/game/updateGame'
import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { streamRevalidatePath } from '@/super-action/action/streamRevalidatePath'
import { cloneDeep } from 'lodash-es'
import { revalidatePath } from 'next/cache'

type GameActionContext = {
  game: Game
}

type GameAction = (params: { ctx: GameActionContext }) => Promise<void> | void

export const gameAction = async ({
  gameId,
  action,
  checkUpdatedAt,
}: {
  gameId: string
  action: GameAction
  checkUpdatedAt?: string | null
}) => {
  return superAction(async () => {
    const game = await getGameFromDb({ id: gameId }).then(cloneDeep)
    if (checkUpdatedAt && game.updatedAt !== checkUpdatedAt) {
      streamToast({
        title: 'Game has been updated',
        description: 'Refreshing...',
      })
      revalidatePath('/', 'layout')
      return
    }
    const ctx = { game }
    await action({ ctx })
    await updateGame({ game: ctx.game })

    streamRevalidatePath('/game')
    streamRevalidatePath(`/game/${gameId}`)
  })
}
