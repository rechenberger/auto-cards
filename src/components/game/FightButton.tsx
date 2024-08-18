import { Game } from '@/db/schema-zod'
import { generateMatch } from '@/game/generateMatch'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { MatchReportDisplay } from './MatchReportDisplay'

export const FightButton = ({ game }: { game: Game }) => {
  return (
    <>
      <ActionButton
        catchToast
        action={async () => {
          'use server'
          return superAction(async () => {
            const matchReport = await generateMatch({
              seed: [game.data.seed, game.data.roundNo, 'match'],
              participants: [
                {
                  loadout: game.data.currentLoadout,
                },
                {
                  loadout: game.data.currentLoadout,
                },
              ],
            })
            streamDialog({
              title: 'Match Report',
              content: (
                <div className="overflow-auto max-h-[calc(100vh-240px)] max-sm:-mx-6">
                  <MatchReportDisplay matchReport={matchReport} />
                </div>
              ),
            })
          })
        }}
      >
        Fight
      </ActionButton>
    </>
  )
}
