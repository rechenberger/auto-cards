'use client'

import { useCollectorCommand } from '@/client/api/collector'
import { CollectorDungeonMatch } from '@/components/game/collector/CollectorDungeonMatch'
import { CollectorOverview } from '@/components/game/collector/CollectorOverview'
import { CollectorStartingOptionsSelect } from '@/components/game/collector/CollectorStartingOptionsSelect'
import { CatalogResponse } from '@/contracts/catalog'
import { GameViewDto } from '@/contracts/game-api'

export const CollectorGameClient = ({
  view,
  catalog,
}: {
  view: GameViewDto
  catalog: CatalogResponse
}) => {
  const mutation = useCollectorCommand(view.game.id)
  const onCommand = mutation.mutateAsync
  const pending = mutation.isPending

  return (
    <div
      id="collector-game-root"
      data-game-id={view.game.id}
      className="flex w-full flex-1 flex-col"
      aria-busy={pending}
    >
      {!view.game.data.currentLoadout.items.length ? (
        <CollectorStartingOptionsSelect
          catalog={catalog}
          onCommand={onCommand}
          pending={pending}
        />
      ) : view.game.data.dungeon ? (
        <CollectorDungeonMatch
          view={view}
          catalog={catalog}
          onCommand={onCommand}
          pending={pending}
        />
      ) : (
        <CollectorOverview
          view={view}
          catalog={catalog}
          onCommand={onCommand}
          pending={pending}
        />
      )}
    </div>
  )
}
