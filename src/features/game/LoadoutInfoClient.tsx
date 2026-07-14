'use client'

import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { StatsDisplay } from '@/components/game/StatsDisplay'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CatalogResponse } from '@/contracts/catalog'
import { LoadoutData } from '@/game/LoadoutData'
import { Stats } from '@/game/stats'
import { Calculator } from 'lucide-react'

export const LoadoutInfoClient = ({
  loadout,
  catalog,
  stats,
}: {
  loadout: LoadoutData
  catalog: CatalogResponse
  stats: Stats
}) => {
  const staminaPerSecond = loadout.items.flatMap((loadoutItem) => {
    const item = catalog.items.find(
      (candidate) => candidate.name === loadoutItem.name,
    )

    return (
      item?.triggers?.flatMap((trigger) => {
        if (trigger.type !== 'interval') return []
        const stamina = trigger.statsSelf?.stamina ?? 0
        if (!stamina) return []

        return [
          {
            value: stamina / (trigger.cooldown / 1000),
            tags: item.tags,
          },
        ]
      }) ?? []
    )
  })

  const totalForTag = (tag: 'food' | 'weapon') =>
    staminaPerSecond
      .filter((entry) => entry.tags?.includes(tag))
      .reduce((total, entry) => total + entry.value, 0)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 touch-manipulation"
          aria-label="Show loadout stats"
        >
          <Calculator className="size-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stats</DialogTitle>
          <DialogDescription className="sr-only">
            Starting stats and stamina generation for this loadout.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-2">
          <hr className="my-2 self-stretch" />
          <div className="text-lg">Starting stats</div>
          <StatsDisplay stats={stats} showZero canWrap />
          <hr className="my-2 self-stretch" />
          <div className="text-lg">Stamina per second</div>
          <SimpleDataCard
            data={{
              regen: (stats.staminaRegen ?? 0).toFixed(1),
              food: totalForTag('food').toFixed(1),
              weapons: totalForTag('weapon').toFixed(1),
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
