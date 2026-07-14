'use client'

import { GameDto } from '@/contracts/game-api'
import {
  CollectorCommandButton,
  CollectorCommandHandler,
} from './CollectorCommandButton'

export const NextRoundButtonCollector = ({
  game,
  onCommand,
  pending,
}: {
  game: GameDto
  onCommand: CollectorCommandHandler
  pending: boolean
}) => {
  const dungeon = game.data.dungeon
  if (!dungeon) return null
  const label = dungeon.status === 'active' ? 'Next Room' : 'Exit Dungeon'
  return (
    <CollectorCommandButton
      variant="outline"
      command={{ type: 'advance-dungeon' }}
      onCommand={onCommand}
      pending={pending}
      shortcut="n"
      accessibleLabel={label}
    >
      {label}
    </CollectorCommandButton>
  )
}
