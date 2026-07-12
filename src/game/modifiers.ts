import { floor } from 'lodash-es'
import { cloneStats, hasAnyStats } from './calcStats'
import type { MatchState } from './generateMatch'
import { ModifierTargetStats } from './modifierSchema'
import { Stats } from './statSchemas'

export { Modifier, ModifierTargetStats } from './modifierSchema'

export const getModifiedStats = (
  {
    state,
    sideIdx,
    itemIdx,
    triggerIdx,
    statsForItem,
    statsEnemy,
    statsTarget,
  }: {
    state: MatchState
    sideIdx: number
    itemIdx: number
    triggerIdx: number
    statsForItem: Stats
    statsEnemy: Stats
    statsTarget: Stats
  },
  stats: ModifierTargetStats,
) => {
  const side = state.sides[sideIdx]
  const item = side.items[itemIdx]
  const trigger = item.triggers![triggerIdx]

  let result: Stats | undefined =
    stats === 'statsForItem' ? statsForItem : trigger[stats]
  const modifiers = trigger.modifiers?.filter((m) => m.targetStats === stats)
  if (!modifiers?.length) return result

  result = cloneStats(result)

  for (const modifier of modifiers) {
    const sourceSideIdx = modifier.sourceSide === 'self' ? sideIdx : 1 - sideIdx
    const sourceSide = state.sides[sourceSideIdx]

    let sourceCount = modifier.valueBase ?? 0
    if (modifier.valueAddingStats) {
      for (const stat of modifier.valueAddingStats) {
        if (modifier.sourceSide === 'self') {
          sourceCount += statsForItem[stat] ?? 0
        } else if (modifier.sourceSide === 'enemy') {
          sourceCount += statsEnemy[stat] ?? 0
        } else if (modifier.sourceSide === 'target') {
          sourceCount += statsTarget[stat] ?? 0
        } else {
          const _exhaustiveCheck: never = modifier.sourceSide
        }
      }
    }
    if (modifier.valueAddingTags) {
      for (const item of sourceSide.items) {
        for (const tag of modifier.valueAddingTags) {
          if (item.tags?.includes(tag)) {
            sourceCount += item.count ?? 1
          }
        }
      }
    }
    if (modifier.valueAddingItems) {
      for (const itemName of modifier.valueAddingItems) {
        for (const item of sourceSide.items) {
          if (item.name === itemName) {
            sourceCount += item.count ?? 1
          }
        }
      }
    }
    if (modifier.valueMultiplier) {
      sourceCount *= modifier.valueMultiplier
    }
    if (modifier.valueMax) {
      sourceCount = Math.min(sourceCount, modifier.valueMax)
    }

    if (modifier.arithmetic === 'multiply') {
      result[modifier.targetStat] =
        (result[modifier.targetStat] ?? 0) * sourceCount
    } else if (modifier.arithmetic === 'add') {
      result[modifier.targetStat] =
        (result[modifier.targetStat] ?? 0) + sourceCount
    } else if (modifier.arithmetic === 'subtract') {
      result[modifier.targetStat] =
        (result[modifier.targetStat] ?? 0) - sourceCount
    } else if (modifier.arithmetic === 'divide') {
      result[modifier.targetStat] =
        (result[modifier.targetStat] ?? 0) / sourceCount
    } else {
      const exhaustiveCheck: never = modifier.arithmetic
    }
    result[modifier.targetStat] = floor(result[modifier.targetStat] ?? 0)
  }

  if (!hasAnyStats({ stats: result })) return undefined

  return result
}

export const getAllModifiedStats = (props: {
  state: MatchState
  sideIdx: number
  itemIdx: number
  triggerIdx: number
  statsForItem: Stats
  statsEnemy: Stats
  statsTarget: Stats
}) => {
  return {
    statsSelf: getModifiedStats(props, 'statsSelf'),
    statsEnemy: getModifiedStats(props, 'statsEnemy'),
    statsItem: getModifiedStats(props, 'statsItem'),
    statsRequired: getModifiedStats(props, 'statsRequired'),
    attack: getModifiedStats(props, 'attack'),
    statsForItem: getModifiedStats(props, 'statsForItem'),
    statsTarget: getModifiedStats(props, 'statsTarget'),
    statsRequiredTarget: getModifiedStats(props, 'statsRequiredTarget'),
  }
}
