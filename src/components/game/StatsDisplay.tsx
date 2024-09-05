'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { allStatsDefinition, Stats } from '@/game/stats'
import { cn } from '@/lib/utils'
import { Fragment } from 'react'
import { CardTooltip } from './CardTooltip'

export const StatsDisplay = ({
  stats,
  relative,
  showZero,
  size = 'default',
  canWrap,
  disableTooltip,
  statClassName,
  hideBars,
  hideCount,
}: {
  stats: Stats
  relative?: boolean
  showZero?: boolean
  size?: 'sm' | 'default'
  canWrap?: boolean
  disableTooltip?: boolean
  statClassName?: string
  hideBars?: boolean
  hideCount?: boolean
}) => {
  return (
    <>
      <div
        className={cn(
          'flex flex-row gap-2 justify-center dark text-white',
          canWrap && 'flex-wrap',
        )}
      >
        {allStatsDefinition
          .filter((stat) => !stat.hidden)
          .filter((stat) => !hideBars || !stat.bar)
          .map((stat) => {
            const value = stats[stat.name]
            if (showZero ? value === undefined : !value) return null

            const inner = (
              <div
                className={cn(
                  'rounded-full border px-1 py-0.5 flex flex-row items-center',
                  stat.bgClass,
                  '[text-shadow:_0px_0px_2px_rgb(0_0_0_/_80%)]',
                  statClassName,
                )}
              >
                <stat.icon
                  className={cn('size-4', size === 'sm' && 'size-3')}
                />
                {!hideCount && !stat.hideCount && (
                  <div
                    className={cn(
                      'text-sm px-1 font-bold',
                      size === 'sm' && 'text-xs',
                    )}
                  >
                    {value}
                  </div>
                )}
              </div>
            )

            if (disableTooltip) {
              return <Fragment key={stat.name}>{inner}</Fragment>
            }

            return (
              <Fragment key={stat.name}>
                <Tooltip>
                  <TooltipTrigger tabIndex={-1}>{inner}</TooltipTrigger>
                  <TooltipContent className="bg-none border-none shadow-none p-0">
                    <CardTooltip name={stat.name} text={stat.tooltip} />
                  </TooltipContent>
                </Tooltip>
              </Fragment>
            )
          })}
      </div>
    </>
  )
}
