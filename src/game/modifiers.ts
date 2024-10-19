import { filter, floor, some, sumBy } from 'lodash-es'
import { z } from 'zod'
import { cloneStats, hasAnyStats } from './calcStats'
import { MatchState } from './generateMatch'
import { Stat, Stats } from './stats'
import { Tag } from './tags'

// Für jede Waffe oder Schild (bis zu 3) addiere 3 Damage
// Für jedes Thorns addiere 1 Damage
// Für jedes Food multipliziere die Damage mit 1.5

export const ModifierTargetStats = z.enum([
  'statsSelf',
  'statsEnemy',
  'statsTarget',
  'statsItem',
  'statsRequired',
  'attack',
  'statsForItem',
  'statsRequiredTarget',
])
export type ModifierTargetStats = z.infer<typeof ModifierTargetStats>

export const Modifier = z.object({
  arithmetic: z.enum(['multiply', 'add', 'subtract', 'divide']),
  targetStat: Stat,
  targetStats: ModifierTargetStats,

  sourceSide: z.enum(['self', 'enemy', 'target']),

  valueBase: z.number().optional(), // value = base
  valueAddingItems: z.array(z.string()).optional(), // value += count(item)
  valueAddingTags: z.array(Tag).optional(), // value += count(tag)
  valueAddingStats: z.array(Stat).optional(), // value += sum(stats)
  valueMultiplier: z.number().optional(), // value *= multiplier
  valueMax: z.number().optional(), // value = min(value, max)

  description: z.string(),
})
export type Modifier = z.infer<typeof Modifier>

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
      const itemsWithTags = filter(sourceSide.items, (i) =>
        some(i.tags, (tag) => modifier.valueAddingTags?.includes(tag)),
      )
      sourceCount += sumBy(itemsWithTags, (i) => i.count ?? 1)
    }
    if (modifier.valueAddingItems) {
      for (const itemName of modifier.valueAddingItems) {
        const item = sourceSide.items.find((i) => i.name === itemName)
        if (item) {
          sourceCount += item.count ?? 1
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
