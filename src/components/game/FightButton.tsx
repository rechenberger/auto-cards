import { Game } from '@/db/schema-zod'
import { generateMatch } from '@/game/generateMatch'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { SimpleDataCard } from '../simple/SimpleDataCard'

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
              content: <SimpleDataCard data={matchReport.logs} />,
            })
          })
        }}
      >
        Fight
      </ActionButton>
    </>
  )
}
