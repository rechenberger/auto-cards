import { getStatDefinition, Stat } from '@/game/stats'
import { capitalCase } from 'change-case'
import { Fragment } from 'react'
import { StatsDisplay } from './StatsDisplay'

export const StatDescriptions = ({ stats }: { stats: Stat[] }) => {
  return (
    <>
      <div className="grid grid-cols-[auto_1fr] gap-2">
        {stats.map((stat) => {
          const def = getStatDefinition(stat)
          if (def.hidden) return null
          return (
            <Fragment key={stat}>
              <div>
                <StatsDisplay stats={{ [stat]: 1 }} hideCount />
              </div>
              <div className="flex flex-col">
                <div className="text-xs md:text-base font-bold">{capitalCase(stat)}</div>
                <div className='text-xs md:text-base'>{def.tooltip}</div>
              </div>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
