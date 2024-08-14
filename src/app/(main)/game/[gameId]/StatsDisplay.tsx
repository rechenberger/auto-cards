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
}: {
  stats: Stats
  relative?: boolean
  showZero?: boolean
}) => {
  return (
    <>
      <div className="flex flex-row gap-2 justify-center">
        {allStatsDefinition.map((stat) => {
          const value = stats[stat.name]
          if (showZero ? value === undefined : !value) return null

          return (
            <Fragment key={stat.name}>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className={cn(
                      'rounded-full border px-1 py-0.5 flex flex-row items-center',
                      stat.bgClass,
                    )}
                  >
                    <stat.icon className="w-4 h-4" />
                    <div className="text-sm px-1 font-bold">{value}</div>
                  </div>
                </TooltipTrigger>
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
