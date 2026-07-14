'use client'

import { SimpleTooltip } from '@/components/simple/SimpleTooltip'
import { Card } from '@/components/ui/card'
import { GameDto } from '@/contracts/game-api'
import { checkCollectorLoadout } from '@/game/collector/checkCollectorLoadout'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { CheckCircle, XCircle } from 'lucide-react'

export const CollectorLoadoutCheck = ({ game }: { game: GameDto }) => {
  const check = checkCollectorLoadout({
    loadout: game.data.currentLoadout,
    rulesetVersion: game.version,
  })
  return (
    <div className="flex flex-col flex-wrap gap-2 xl:flex-row xl:items-center">
      <SimpleTooltip
        tooltip={
          <div>
            <p>
              Your loadout weighs <strong>{check.priceCurrent}</strong> of{' '}
              <strong>{check.priceLimit}</strong>.
            </p>
            <p>
              {check.priceInBudget
                ? `You can add ${check.priceLimit - check.priceCurrent} more.`
                : `Remove ${
                    check.priceCurrent - check.priceLimit
                  } to enter a dungeon.`}
            </p>
          </div>
        }
      >
        <Card
          className={cn(
            'flex flex-col gap-1 px-2 py-1.5',
            check.priceInBudget ? 'text-green-500' : 'bg-red-500 text-white',
          )}
        >
          <div className="flex flex-row gap-2 text-sm tabular-nums">
            {check.priceInBudget ? (
              <CheckCircle className="size-4" aria-hidden="true" />
            ) : (
              <XCircle className="size-4" aria-hidden="true" />
            )}
            <span className="flex-1">Weight</span>
            <span>
              {check.priceCurrent}/{check.priceLimit}
            </span>
          </div>
        </Card>
      </SimpleTooltip>
      {check.countTooMany.map((item) => (
        <SimpleTooltip
          key={item.name}
          tooltip={
            item.def.unique
              ? 'This item is unique and can only be held once.'
              : `You can only hold up to ${item.countMax}.`
          }
        >
          <Card className="flex flex-col gap-1 bg-red-500 px-2 py-1.5 text-white">
            <div className="flex flex-row gap-2 text-sm tabular-nums">
              <XCircle className="size-4" aria-hidden="true" />
              <span className="flex-1">{capitalCase(item.name)}</span>
              <span>
                {item.count}/{item.countMax}
              </span>
            </div>
          </Card>
        </SimpleTooltip>
      ))}
    </div>
  )
}
