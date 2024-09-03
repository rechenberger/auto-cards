import { Trigger } from '@/game/ItemDefinition'
import { capitalCase } from 'change-case'
import { StatsDisplay } from './StatsDisplay'

export const TriggerDisplay = ({ trigger }: { trigger: Trigger }) => {
  const seconds = `${trigger.cooldown / 1000}s`
  return (
    <>
      <div className="px-2 py-2 bg-border/40 rounded-md flex flex-col gap-1 items-center min-w-40">
        <div>
          {trigger.type === 'interval'
            ? `Every ${seconds}`
            : `${capitalCase(trigger.type)}${
                trigger.cooldown ? ` (${seconds} cooldown)` : ''
              }`}
        </div>
        {trigger.statsSelf && (
          <div className="flex flex-row gap-2">
            {/* <div>Self:</div> */}
            <StatsDisplay relative stats={trigger.statsSelf} />
          </div>
        )}
        {trigger.statsItem && (
          <div className="flex flex-row gap-2">
            <div>Item:</div>
            <StatsDisplay relative stats={trigger.statsItem} />
          </div>
        )}
        {trigger.statsEnemy && (
          <div className="flex flex-row gap-2">
            <div>Enemy:</div>
            <StatsDisplay relative stats={trigger.statsEnemy} />
          </div>
        )}
        {trigger.statsEnemyOnHit && (
          <div className="flex flex-row gap-2">
            <div>Enemy (on hit):</div>
            <StatsDisplay relative stats={trigger.statsEnemyOnHit} />
          </div>
        )}
        {trigger.attack && (
          <div className="flex flex-row gap-2">
            {/* <div>Attack:</div> */}
            <StatsDisplay stats={trigger.attack as any} />
          </div>
        )}
      </div>
    </>
  )
}
