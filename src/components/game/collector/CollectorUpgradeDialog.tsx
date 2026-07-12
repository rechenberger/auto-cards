'use client'

import { SimpleTooltip } from '@/components/simple/SimpleTooltip'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CatalogResponse } from '@/contracts/catalog'
import { GameDto } from '@/contracts/game-api'
import { ItemData } from '@/game/ItemData'
import { getPossibleCollectorAspects } from '@/game/collector/items'
import {
  allRarities,
  allRarityDefinitions,
  getRarityDefinition,
} from '@/game/rarities'
import { COLLECTOR_UPGRADE_COSTS } from '@/game/rules'
import { ItemCardClient } from '@/features/game/ItemCardClient'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { ArrowDown, Info } from 'lucide-react'
import {
  CollectorCommandButton,
  CollectorCommandHandler,
} from './CollectorCommandButton'

export const CollectorUpgradeDialog = ({
  item,
  game,
  catalog,
  open,
  onOpenChange,
  onCommand,
  pending,
}: {
  item: ItemData | undefined
  game: GameDto
  catalog: CatalogResponse
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommand: CollectorCommandHandler
  pending: boolean
}) => {
  if (!item?.id || !item.rarity) return null
  const rarity = item.rarity
  const rarityDefinition = getRarityDefinition(rarity)
  const nextRarity = allRarityDefinitions[allRarities.indexOf(rarity) + 1]
  const possibleAspects = getPossibleCollectorAspects(
    item,
    game.version,
  ).filter(
    (aspect) => !item.aspects?.some((current) => current.name === aspect.name),
  )
  const currentParts = game.data.salvagedParts?.[rarity] ?? 0
  const partsEnough = currentParts >= COLLECTOR_UPGRADE_COSTS

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade {capitalCase(item.name)}</DialogTitle>
          <DialogDescription>
            Increase its rarity and add a random compatible aspect.
          </DialogDescription>
        </DialogHeader>
        {!nextRarity ? (
          <div className="flex flex-col items-center gap-4">
            <ItemCardClient itemData={item} catalog={catalog} size="200" />
            <p>Fully upgraded!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col gap-8 lg:flex-row">
              <ItemCardClient itemData={item} catalog={catalog} size="200" />
              <ArrowDown
                className="size-8 self-center lg:-rotate-90"
                aria-hidden="true"
              />
              <div className="flex flex-col items-center gap-2">
                <ItemCardClient
                  itemData={{ ...item, rarity: nextRarity.name }}
                  catalog={catalog}
                  size="200"
                />
                <SimpleTooltip
                  tooltip={
                    <div className="flex flex-col gap-1">
                      <span>Possible aspects:</span>
                      {possibleAspects.map((aspect) => (
                        <span key={aspect.name} className="text-sm opacity-80">
                          {capitalCase(aspect.name)}
                        </span>
                      ))}
                    </div>
                  }
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11 gap-2"
                  >
                    <Info className="size-4" aria-hidden="true" />
                    +1 of {possibleAspects.length} random aspects
                  </Button>
                </SimpleTooltip>
              </div>
            </div>
            <Card className="px-2 py-1 text-sm">
              <div
                className={cn(
                  'flex flex-row items-center gap-1 tabular-nums',
                  rarityDefinition.textClass,
                )}
              >
                <span className="flex-1 truncate">
                  {capitalCase(rarity)} Parts
                </span>
                <span>
                  {COLLECTOR_UPGRADE_COSTS} / {currentParts}
                </span>
              </div>
            </Card>
            <CollectorCommandButton
              disabled={!partsEnough || !possibleAspects.length}
              pending={pending}
              onCommand={onCommand}
              command={{ type: 'upgrade-item', itemId: item.id }}
            >
              {!possibleAspects.length
                ? 'No compatible aspect available'
                : partsEnough
                  ? 'Upgrade'
                  : 'Not enough parts'}
            </CollectorCommandButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
