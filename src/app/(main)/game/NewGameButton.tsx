import { getMyUserIdOrLogin } from '@/auth/getMyUser'
import { ButtonProps } from '@/components/ui/button'
import { createGame } from '@/game/createGame'
import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { redirect } from 'next/navigation'

export const NewGameButton = ({
  variant,
}: {
  variant?: ButtonProps['variant']
}) => {
  return (
    <ActionButton
      variant={variant}
      hideIcon
      action={async () => {
        'use server'

        return superAction(async () => {
          const userId = await getMyUserIdOrLogin()
          const game = await createGame({ userId })
          redirect(`/game/${game.id}`)
        })
      }}
    >
      New Game
    </ActionButton>
  )
}
