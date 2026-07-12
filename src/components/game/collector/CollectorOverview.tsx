'use client'

import { MatchReportResetter } from '@/components/game/MatchReportResetter'
import { CatalogResponse } from '@/contracts/catalog'
import { GameViewDto } from '@/contracts/game-api'
import { fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { AlphaTag } from '../AlphaTag'
import { CollectorAdminButtons } from './CollectorAdminButtons'
import { CollectorCommandHandler } from './CollectorCommandButton'
import { CollectorDungeonSelect } from './CollectorDungeonSelect'
import { CollectorItemGrid } from './CollectorItemGrid'

export const CollectorOverview = ({
  view,
  catalog,
  onCommand,
  pending,
}: {
  view: GameViewDto
  catalog: CatalogResponse
  onCommand: CollectorCommandHandler
  pending: boolean
}) => (
  <div className="flex w-full flex-col items-center gap-4">
    <div className="flex flex-col items-center">
      <AlphaTag />
      <div className={cn(fontLore.className, 'text-xl')}>
        keep calm and collect
      </div>
    </div>
    <CollectorAdminButtons
      isAdmin={view.isAdmin}
      onCommand={onCommand}
      pending={pending}
    />
    <CollectorDungeonSelect
      view={view}
      onCommand={onCommand}
      pending={pending}
    />
    <CollectorItemGrid
      game={view.game}
      catalog={catalog}
      onCommand={onCommand}
      pending={pending}
    />
    <MatchReportResetter />
  </div>
)
