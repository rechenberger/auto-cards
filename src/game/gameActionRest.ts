import { Game } from '@/db/schema-zod'
import { getGameFromDb } from './getGame'
import { cloneDeep } from 'lodash-es'
import { updateGame } from './updateGame'

type GameActionContext = {
  game: Game
}

type GameAction = (params: { ctx: GameActionContext }) => Promise<void> | void

export const gameActionRest = async ({
  gameId,
  action,
}: {
  gameId: string
  action: GameAction
}) => {
  const game = await getGameFromDb({ id: gameId }).then(cloneDeep)
  const ctx = { game }
  await action({ ctx })
  return updateGame({ game: ctx.game })
}
