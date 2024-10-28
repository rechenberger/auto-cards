import { getMyUserIdOrLogin } from '@/auth/getMyUser'
import { ButtonProps } from '@/components/ui/button'
import { createGame } from '@/game/createGame'
import { GameMode } from '@/game/gameMode'
import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { redirect } from 'next/navigation'

export const NewGameButton = ({
  variant,
  gameMode,
}: {
  variant?: ButtonProps['variant']
  gameMode?: GameMode
}) => {
  return (
    <ActionButton
      variant={variant}
      hideIcon
      action={async () => {
        'use server'

        return superAction(async () => {
          const userId = await getMyUserIdOrLogin()
          const game = await createGame({ userId, gameMode })
          redirect(`/game/${game.id}`)
        })
      }}
    >
      {gameMode === 'collector' ? 'New Collector Game' : 'New Game'}
    </ActionButton>
  )
}
