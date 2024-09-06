import { Trigger } from '@/game/ItemDefinition'
import { capitalCase } from 'change-case'
import { MatchCardCooldown } from './MatchCardCooldown'
import { StatsDisplay } from './StatsDisplay'

export const TriggerDisplay = ({
  trigger,
  sideIdx,
  itemIdx,
}: {
  trigger: Trigger
  sideIdx?: number
  itemIdx?: number
}) => {
  return (
    <>
      <div className="px-2 py-2 bg-border/40 rounded-md flex flex-col gap-1 items-center min-w-40">
        <div className="flex flex-row gap-1 justify-center">
          <div className="">
            {trigger.type === 'interval' ? (
              sideIdx !== undefined && itemIdx !== undefined ? (
                <MatchCardCooldown sideIdx={sideIdx} itemIdx={itemIdx} />
              ) : (
                `Every ${trigger.cooldown / 1000}s`
              )
            ) : (
              `${capitalCase(trigger.type)}`
            )}
          </div>
          {trigger.chancePercent && (
            <div className="">({Math.round(trigger.chancePercent)}%)</div>
          )}
        </div>
        {trigger.statsSelf && (
          <div className="flex flex-row gap-2 items-center">
            {/* <div>Self:</div> */}
            <StatsDisplay relative stats={trigger.statsSelf} />
          </div>
        )}
        {trigger.statsItem && (
          <div className="flex flex-row gap-2 items-center">
            <div>Item:</div>
            <StatsDisplay relative stats={trigger.statsItem} />
          </div>
        )}
        {trigger.statsEnemy && (
          <div className="flex flex-row gap-2 items-center">
            <div>Enemy:</div>
            <StatsDisplay relative stats={trigger.statsEnemy} />
          </div>
        )}
        {trigger.attack && (
          <div className="flex flex-row gap-2 items-center">
            {/* <div>Attack:</div> */}
            <StatsDisplay stats={trigger.attack as any} />
          </div>
        )}
      </div>
    </>
  )
}
