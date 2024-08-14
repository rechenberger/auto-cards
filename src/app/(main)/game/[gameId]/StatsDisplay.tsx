import { Stats } from '@/game/stats'
import { map } from 'lodash-es'
import { Fragment } from 'react'
import { StatDisplay } from './StatDisplay'

export const StatsDisplay = ({
  stats,
  relative,
}: {
  stats: Stats
  relative?: boolean
}) => {
  return (
    <>
      <div className="flex flex-row gap-2 flex-wrap">
        {map(stats, (value, key) => (
          <Fragment key={key}>
            <StatDisplay label={key} value={value} relative={relative} />
          </Fragment>
        ))}
      </div>
    </>
  )
}
