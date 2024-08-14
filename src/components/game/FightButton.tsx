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
              title: 'Match report',
              content: (
                <div className="overflow-auto max-h-96">
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
