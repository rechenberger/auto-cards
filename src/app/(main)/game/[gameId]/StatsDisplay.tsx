import { Stats } from '@/game/zod-schema'
import { capitalCase } from 'change-case'
import { map } from 'lodash-es'
import { Fragment } from 'react'
import { StatDisplay } from './StatDisplay'

export const StatsDisplay = ({ stats }: { stats: Stats }) => {
  return (
    <>
      <div className="flex flex-row gap-2">
        {map(stats, (value, key) => (
          <Fragment key={key}>
            <StatDisplay key={key} value={value} />
          </Fragment>
        ))}
      </div>
    </>
  )
}
