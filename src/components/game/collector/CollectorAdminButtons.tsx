import { Game } from '@/db/schema-zod'
import { gameAction } from '@/game/gameAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { Plus } from 'lucide-react'

export const CollectorAdminButtons = ({ game }: { game: Game }) => {
  return (
    <>
      <ActionButton
        icon={<Plus />}
        variant="outline"
        action={async () => {
          'use server'
          return gameAction({
            gameId: game.id,
            action: async ({ ctx }) => {},
          })
        }}
      />
    </>
  )
}
