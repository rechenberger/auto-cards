import { Trigger } from '@/game/ItemDefinition'
import { capitalCase } from 'change-case'
import { StatsDisplay } from './StatsDisplay'
import { TextKeywordDisplay } from './TextKeywordDisplay'

export const TriggerDisplay = ({ trigger }: { trigger: Trigger }) => {
  return (
    <>
      <div className="px-2 py-2 bg-border/40 rounded-md flex flex-col gap-1 items-center min-w-40">
        <div className="flex flex-row gap-1 justify-center">
          <div className="">
            {trigger.type === 'interval'
              ? `Every ${trigger.cooldown / 1000}s`
              : `${capitalCase(trigger.type)}`}
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
        {trigger.modifiers && (
          <div className="flex flex-col gap-1 text-xs">
            {trigger.modifiers.map((modifier) => (
              <TextKeywordDisplay
                key={modifier.description}
                text={modifier.description}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
