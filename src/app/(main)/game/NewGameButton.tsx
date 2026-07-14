'use client'

import { useCreateGame } from '@/client/api/games'
import { AsyncButton } from '@/components/ui/async-button'
import { ButtonProps } from '@/components/ui/button'
import { GameMode } from '@/game/gameMode'
import { useRouter } from 'next/navigation'

export const NewGameButton = ({
  variant,
  gameMode = 'shopper',
}: {
  variant?: ButtonProps['variant']
  gameMode?: GameMode
}) => {
  const router = useRouter()
  const createGame = useCreateGame()
  return (
    <AsyncButton
      variant={variant}
      className="min-h-11"
      onAction={async () => {
        const view = await createGame.mutateAsync({ gameMode })
        router.push(`/game/${view.game.id}`)
      }}
    >
      {gameMode === 'collector' ? 'New Endless Game' : 'New Game'}
    </AsyncButton>
  )
}
