'use client'

import { SimpleTooltip } from '@/components/simple/SimpleTooltip'
import { Card } from '@/components/ui/card'
import { GameDto } from '@/contracts/game-api'
import { ItemData } from '@/game/ItemData'
import { allRarityDefinitions } from '@/game/rarities'
import { COLLECTOR_UPGRADE_COSTS_DIRECT } from '@/game/rules'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { ArrowUp, Recycle } from 'lucide-react'
import {
  CollectorCommandButton,
  CollectorCommandHandler,
} from './CollectorCommandButton'

export const CollectorSalvageButtons = ({
  game,
  inventoryItems,
  loadoutItems,
  onCommand,
  pending,
}: {
  game: GameDto
  inventoryItems: ItemData[]
  loadoutItems: ItemData[]
  onCommand: CollectorCommandHandler
  pending: boolean
}) => {
  const loadoutIds = new Set(
    loadoutItems.flatMap((item) => (item.id ? [item.id] : [])),
  )

  return (
    <div className="grid gap-2 lg:grid-cols-5">
      {[...allRarityDefinitions].reverse().map((rarity, index) => {
        const salvageCount = inventoryItems.filter(
          (item) =>
            item.rarity === rarity.name &&
            item.id &&
            !item.favorite &&
            !loadoutIds.has(item.id),
        ).length
        const originalIndex = allRarityDefinitions.length - index - 1
        const nextRarity = allRarityDefinitions[originalIndex + 1]
        const amount = game.data.salvagedParts?.[rarity.name] ?? 0
        const upgrades = Math.floor(amount / COLLECTOR_UPGRADE_COSTS_DIRECT)

        return (
          <Card key={rarity.name} className="px-2 py-1 text-sm">
            <div
              className={cn(
                'flex min-h-11 flex-row items-center gap-1',
                rarity.textClass,
              )}
            >
              {nextRarity && (
                <SimpleTooltip
                  tooltip={`Convert ${
                    upgrades * COLLECTOR_UPGRADE_COSTS_DIRECT
                  } parts into ${upgrades} ${capitalCase(
                    nextRarity.name,
                  )} parts.`}
                >
                  <CollectorCommandButton
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    accessibleLabel={`Convert ${capitalCase(
                      rarity.name,
                    )} parts`}
                    disabled={upgrades <= 0}
                    pending={pending}
                    onCommand={onCommand}
                    command={{ type: 'convert-parts', rarity: rarity.name }}
                  >
                    <ArrowUp
                      className="size-4 lg:-rotate-90"
                      aria-hidden="true"
                    />
                  </CollectorCommandButton>
                </SimpleTooltip>
              )}
              <span className="flex-1 truncate">
                {capitalCase(rarity.name)} Parts
              </span>
              <span className="tabular-nums">{amount}</span>
              <SimpleTooltip tooltip="Salvage unequipped, non-favorite items.">
                <CollectorCommandButton
                  variant="ghost"
                  className="gap-1 px-2"
                  accessibleLabel={`Salvage ${salvageCount} ${rarity.name} items`}
                  disabled={!salvageCount}
                  pending={pending}
                  onCommand={onCommand}
                  command={{
                    type: 'salvage-unprotected',
                    rarity: rarity.name,
                  }}
                  confirm={{
                    title: `Salvage ${salvageCount} ${rarity.name} items?`,
                    description:
                      'Only unequipped items that are not favorites will be salvaged.',
                    action: 'Salvage items',
                  }}
                >
                  <Recycle className="size-4" aria-hidden="true" />
                  <span className="tabular-nums">+ {salvageCount}</span>
                </CollectorCommandButton>
              </SimpleTooltip>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
