// 'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { allStatsDefinition, StatDefinition, Stats } from '@/game/stats'
import { cn } from '@/lib/utils'
import { Fragment } from 'react'
import { CardTooltip } from './CardTooltip'

export type StatsDisplayProps = Omit<StatDisplayProps, 'value' | 'stat'> & {
  stats: Stats
  canWrap?: boolean
  showZero?: boolean
  hideBars?: boolean
}

export const StatsDisplay = (props: StatsDisplayProps) => {
  const { stats, canWrap, showZero, hideBars } = props
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
            return (
              <Fragment key={stat.name}>
                <StatDisplay {...props} stat={stat} value={stats[stat.name]} />
              </Fragment>
            )
          })}
      </div>
    </>
  )
}

export type StatDisplayProps = {
  relative?: boolean
  size?: 'sm' | 'default'
  disableTooltip?: boolean
  statClassName?: string
  hideCount?: boolean

  value?: number
  stat: StatDefinition
}

export const StatDisplay = ({
  relative,
  size = 'default',
  disableTooltip,
  statClassName,
  hideCount,
  value,
  stat,
}: StatDisplayProps) => {
  const inner = (
    <div
      className={cn(
        'rounded-full border px-1 py-0.5 flex flex-row items-center',
        stat.bgClass,
        '[text-shadow:_0px_0px_2px_rgb(0_0_0_/_80%)]',
        statClassName,
      )}
    >
      <stat.icon className={cn('size-4', size === 'sm' && 'size-3')} />
      {!hideCount && !stat.hideCount && (
        <div
          className={cn('text-sm px-1 font-bold', size === 'sm' && 'text-xs')}
        >
          {value}
        </div>
      )}
    </div>
  )

  if (disableTooltip) {
    return inner
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger tabIndex={-1}>{inner}</TooltipTrigger>
        <TooltipContent className="bg-none border-none shadow-none p-0">
          <CardTooltip name={stat.name} text={stat.tooltip} />
        </TooltipContent>
      </Tooltip>
    </>
  )
}
