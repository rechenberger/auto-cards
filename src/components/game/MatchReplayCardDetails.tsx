'use client'

import { ShopEffect, Trigger } from '@/game/ItemDefinition'
import { SHOP_EFFECT_BOOST_MULTIPLIER } from '@/game/rules'
import { Stat } from '@/game/statSchemas'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { every } from 'lodash-es'
import { Fragment, ReactNode } from 'react'
import { MatchCardCooldown } from './MatchCardCooldown'
import { StatsDisplay } from './StatsDisplay'
import { TagDisplay } from './TagDisplay'
import { TextKeywordDisplay } from './TextKeywordDisplay'

export const MatchReplayTriggerDisplay = ({
  trigger,
  sideIdx,
  itemIdx,
  triggerIdx,
  disableTooltip,
  disableLinks,
  className,
  children,
}: {
  trigger: Trigger
  sideIdx?: number
  itemIdx?: number
  triggerIdx?: number
  disableTooltip?: boolean
  disableLinks?: boolean
  className?: string
  children?: ReactNode
}) => {
  if (trigger.hidden) return null

  const hideRequiredStats = every(trigger.statsRequired ?? {}, (value, key) => {
    if (!value) return true
    const stat = key as Stat
    const statSelf = trigger.statsSelf?.[stat]
    return Boolean(statSelf && statSelf === -value)
  })

  if (trigger.description) {
    return (
      <div
        className={cn(
          'flex min-w-40 flex-col items-center gap-1 rounded-md bg-border/40 p-2',
          className,
        )}
      >
        <div className="text-center text-xs">
          <TextKeywordDisplay
            text={trigger.description}
            disableTooltip={disableTooltip}
            disableLinks={disableLinks}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex min-w-40 flex-col items-center gap-1 rounded-md bg-border/40 p-2',
        className,
      )}
    >
      {trigger.type !== 'startOfBattle' && (
        <div className="flex flex-row justify-center gap-1">
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
              capitalCase(trigger.type)
            )}
          </div>
          {Boolean(trigger.chancePercent) && (
            <div>({Math.round(trigger.chancePercent ?? 0)}%)</div>
          )}
        </div>
      )}
      {trigger.statsRequiredTarget && (
        <div className="flex flex-row items-center gap-2">
          <div>If Target has:</div>
          <StatsDisplay
            size="sm"
            relative
            stats={trigger.statsRequiredTarget}
            disableTooltip={disableTooltip}
          />
        </div>
      )}
      {trigger.statsRequired && !hideRequiredStats && (
        <div className="flex flex-row items-center gap-2">
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
        <StatsDisplay
          size="sm"
          relative
          stats={trigger.statsSelf}
          disableTooltip={disableTooltip}
        />
      )}
      {trigger.statsItem && (
        <div className="flex flex-row items-center gap-2">
          <div>Item:</div>
          <StatsDisplay
            size="sm"
            relative
            stats={trigger.statsItem}
            disableTooltip={disableTooltip}
          />
        </div>
      )}
      {trigger.statsTarget && (
        <div className="flex flex-row items-center gap-2">
          <div>Target:</div>
          <StatsDisplay
            size="sm"
            relative
            stats={trigger.statsTarget}
            disableTooltip={disableTooltip}
          />
        </div>
      )}
      {trigger.statsEnemy && (
        <div className="flex flex-row items-center gap-2">
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
        <StatsDisplay
          size="sm"
          stats={trigger.attack}
          disableTooltip={disableTooltip}
        />
      )}
      {trigger.modifiers && (
        <div className="flex flex-col gap-1 text-center text-xs">
          {trigger.modifiers.map((modifier) => (
            <TextKeywordDisplay
              key={modifier.description}
              text={modifier.description}
              disableTooltip={disableTooltip}
              disableLinks={disableLinks}
            />
          ))}
        </div>
      )}
      {trigger.maxCount && (
        <div>
          {trigger.maxCount === 1
            ? 'max once'
            : `max ${trigger.maxCount} times`}
        </div>
      )}
      {children}
    </div>
  )
}

export const MatchReplayShopEffectDisplay = ({
  shopEffect,
  disableLinks,
}: {
  shopEffect: ShopEffect
  disableLinks?: boolean
}) => {
  const prefix = {
    unlock: 'Unlocks',
    boost: `${SHOP_EFFECT_BOOST_MULTIPLIER}x More`,
    ban: 'Removes',
  }[shopEffect.type]
  const postfix = {
    unlock: 'items in shop',
    boost: 'items in shop',
    ban: 'items from shop',
  }[shopEffect.type]

  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-1 text-center">
      <div className="text-nowrap">{prefix}</div>
      {shopEffect.tags.map((tag, index) => (
        <Fragment key={tag}>
          {index > 0 && <span>and</span>}
          <TagDisplay tag={tag} disableLinks={disableLinks} />
        </Fragment>
      ))}
      <div className="text-nowrap">{postfix}</div>
    </div>
  )
}
