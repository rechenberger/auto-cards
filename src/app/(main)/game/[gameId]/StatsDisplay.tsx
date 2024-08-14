import { Stats } from '@/game/zod-schema'
import { map } from 'lodash-es'
import { Fragment } from 'react'
import { StatDisplay } from './StatDisplay'

export const StatsDisplay = ({ stats }: { stats: Stats }) => {
  return (
    <>
      <div className="flex flex-row gap-2 flex-wrap">
        {map(stats, (value, key) => (
          <Fragment key={key}>
            <StatDisplay label={key} value={value} />
          </Fragment>
        ))}
      </div>
    </>
  )
}
