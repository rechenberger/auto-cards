'use client'

import { DoorOpen, Plus, Swords, Trash, Unlock } from 'lucide-react'
import {
  CollectorCommandButton,
  CollectorCommandHandler,
} from './CollectorCommandButton'

export const CollectorAdminButtons = ({
  isAdmin,
  onCommand,
  pending,
}: {
  isAdmin: boolean
  onCommand: CollectorCommandHandler
  pending: boolean
}) => {
  if (!isAdmin) return null
  return (
    <div
      className="flex flex-row flex-wrap gap-2"
      aria-label="Collector admin tools"
    >
      <CollectorCommandButton
        variant="outline"
        size="icon"
        accessibleLabel="Generate ten collector items"
        command={{ type: 'admin-generate-items', count: 10 }}
        onCommand={onCommand}
        pending={pending}
      >
        <Plus className="size-4" aria-hidden="true" />
      </CollectorCommandButton>
      <CollectorCommandButton
        variant="outline"
        size="icon"
        accessibleLabel="Reset collector game"
        command={{ type: 'admin-reset' }}
        onCommand={onCommand}
        pending={pending}
        confirm={{
          title: 'Reset Game?',
          description: 'Lose all items and start over?',
          action: 'Reset game',
        }}
      >
        <Trash className="size-4" aria-hidden="true" />
      </CollectorCommandButton>
      <CollectorCommandButton
        variant="outline"
        size="icon"
        accessibleLabel="Enter a test dungeon"
        command={{ type: 'admin-enter-dungeon' }}
        onCommand={onCommand}
        pending={pending}
      >
        <Swords className="size-4" aria-hidden="true" />
      </CollectorCommandButton>
      <CollectorCommandButton
        variant="outline"
        size="icon"
        accessibleLabel="Exit the current dungeon"
        command={{ type: 'admin-exit-dungeon' }}
        onCommand={onCommand}
        pending={pending}
      >
        <DoorOpen className="size-4" aria-hidden="true" />
      </CollectorCommandButton>
      <CollectorCommandButton
        variant="outline"
        size="icon"
        accessibleLabel="Unlock all adventure trail levels"
        command={{ type: 'admin-unlock-dungeon' }}
        onCommand={onCommand}
        pending={pending}
      >
        <Unlock className="size-4" aria-hidden="true" />
      </CollectorCommandButton>
    </div>
  )
}
