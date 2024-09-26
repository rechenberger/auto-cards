import { Trigger } from '@/game/ItemDefinition'
import { Stat } from '@/game/stats'
import { capitalCase } from 'change-case'
import { every } from 'lodash-es'
import { MatchCardCooldown } from './MatchCardCooldown'
import { StatsDisplay } from './StatsDisplay'
import { TextKeywordDisplay } from './TextKeywordDisplay'

export const TriggerDisplay = ({
  trigger,
  sideIdx,
  itemIdx,
  triggerIdx,
  disableTooltip,
}: {
  trigger: Trigger
  sideIdx?: number
  itemIdx?: number
  triggerIdx?: number
  disableTooltip?: boolean
}) => {
  if (trigger.hidden) {
    return null
  }

  const hideRequiredStats = every(trigger.statsRequired ?? {}, (value, key) => {
    if (!value) return true
    const k = key as Stat
    const statSelf = trigger.statsSelf?.[k]
    if (!statSelf) return false
    return statSelf === -1 * value
  })

  if (trigger.description) {
    return (
      <div className="px-2 py-2 bg-border/40 rounded-md flex flex-col gap-1 items-center min-w-40">
        <div className="text-center text-xs">
          <TextKeywordDisplay
            text={trigger.description}
            disableTooltip={disableTooltip}
          />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-2 py-2 bg-border/40 rounded-md flex flex-col gap-1 items-center min-w-40">
        <div className="flex flex-row gap-1 justify-center">
          <div className="font-bold">
            {trigger.type === 'interval' ? (
              sideIdx !== undefined &&
              itemIdx !== undefined &&
              triggerIdx !== undefined ? (
                <MatchCardCooldown
                  sideIdx={sideIdx}
                  itemIdx={itemIdx}
                  triggerIdx={triggerIdx}
                />
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
        {trigger.statsRequired && !hideRequiredStats && (
          <div className="flex flex-row gap-2 items-center">
            <div>Required:</div>
            <StatsDisplay
              size="sm"
              relative
              stats={trigger.statsRequired}
              disableTooltip={disableTooltip}
            />
          </div>
        )}
        {trigger.statsSelf && (
          <div className="flex flex-row gap-2 items-center">
            {/* <div>Self:</div> */}
            <StatsDisplay
              size="sm"
              relative
              stats={trigger.statsSelf}
              disableTooltip={disableTooltip}
            />
          </div>
        )}
        {trigger.statsItem && (
          <div className="flex flex-row gap-2 items-center">
            <div>Item:</div>
            <StatsDisplay
              size="sm"
              relative
              stats={trigger.statsItem}
              disableTooltip={disableTooltip}
            />
          </div>
        )}
        {trigger.statsEnemy && (
          <div className="flex flex-row gap-2 items-center">
            <div>Enemy:</div>
            <StatsDisplay
              size="sm"
              relative
              stats={trigger.statsEnemy}
              disableTooltip={disableTooltip}
            />
          </div>
        )}
        {trigger.attack && (
          <div className="flex flex-row gap-2 items-center">
            {/* <div>Attack:</div> */}
            <StatsDisplay
              size="sm"
              stats={trigger.attack as any}
              disableTooltip={disableTooltip}
            />
          </div>
        )}
        {trigger.modifiers && (
          <div className="flex flex-col gap-1 text-xs text-center">
            {trigger.modifiers.map((modifier) => (
              <TextKeywordDisplay
                key={modifier.description}
                text={modifier.description}
                disableTooltip={disableTooltip}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
