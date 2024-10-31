import { Game } from '@/db/schema-zod'
import { gameAction } from '@/game/gameAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { fightDungeon } from './fightDungeon'

export const NextRoundButtonCollector = ({ game }: { game: Game }) => {
  const dungeonData = game.data.dungeon

  if (!dungeonData) {
    throw new Error('NextRoundButtonCollector: No dungeon data')
  }

  const status = dungeonData.status

  return (
    <>
      <ActionButton
        catchToast
        variant="outline"
        action={async () => {
          'use server'
          return gameAction({
            gameId: game.id,
            checkUpdatedAt: game.updatedAt,
            action: async ({ ctx }) => {
              if (status === 'active') {
                await fightDungeon({
                  game: ctx.game,
                  roomIdx: dungeonData.room.idx + 1,
                })
              } else {
                ctx.game.data.dungeon = undefined
              }
            },
          })
        }}
        command={{
          shortcut: {
            key: 'n',
          },
        }}
      >
        {status === 'active' ? 'Next Room' : 'Exit Dungeon'}
      </ActionButton>
    </>
  )
}
