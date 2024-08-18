import { Game } from '@/db/schema-zod'
import { fight } from '@/game/fight'
import { gameAction } from '@/game/gameAction'
import { ActionButton } from '@/super-action/button/ActionButton'

export const FightButton = ({ game }: { game: Game }) => {
  return (
    <>
      <ActionButton
        catchToast
        action={async () => {
          'use server'
          return gameAction({
            gameId: game.id,
            action: async ({ ctx }) => {
              const { game } = ctx
              const { matchReport } = await fight({ game })
              // streamDialog({
              //   title: 'Match Report',
              //   content: (
              //     <>
              //       {/* <LoadoutDisplay loadout={enemyLoadout.data} /> */}
              //       <div className="overflow-auto max-h-[calc(100vh-240px)] max-sm:-mx-6">
              //         <MatchReportDisplay matchReport={matchReport} />
              //       </div>
              //     </>
              //   ),
              // })
            },
          })
        }}
      >
        Fight
      </ActionButton>
    </>
  )
}
