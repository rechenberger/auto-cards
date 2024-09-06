import { filter, some, sumBy } from 'lodash-es'
import { z } from 'zod'
import { MatchState } from './generateMatch'
import { Stat, Stats } from './stats'
import { Tag } from './tags'

// Für jede Waffe oder Schild (bis zu 3) addiere 3 Damage
// Für jedes Thorns addiere 1 Damage
// Für jedes Food multipliziere die Damage mit 1.5

export const ModifierTargetStats = z.enum([
  'statsSelf',
  'statsEnemy',
  'statsItem',
  'statsRequired',
  'attack',
  'statsForItem',
])
export type ModifierTargetStats = z.infer<typeof ModifierTargetStats>

export const Modifier = z.object({
  arithmetic: z.enum(['multiply', 'add', 'subtract', 'divide']),
  targetStat: Stat,
  targetStats: ModifierTargetStats,

  valueBase: z.number().optional(), // value = base
  valueAddingTags: z.array(Tag).optional(), // value += count(tag)
  valueAddingStats: z.array(Stat).optional(), // value += sum(stats)
  valueMultiplier: z.number().optional(), // value *= multiplier
  valueMax: z.number().optional(), // value = min(value, max)
})
export type Modifier = z.infer<typeof Modifier>

export const getModifiedStats = ({
  state,
  sideIdx,
  itemIdx,
  triggerIdx,
  stats,
  statsForItem,
}: {
  state: MatchState
  sideIdx: number
  itemIdx: number
  triggerIdx: number
  stats: ModifierTargetStats
  statsForItem: Stats
}) => {
  const side = state.sides[sideIdx]
  const item = side.items[itemIdx]
  const trigger = item.triggers![triggerIdx]

  let result = stats === 'statsForItem' ? statsForItem : trigger[stats]
  const modifiers = filter(trigger.modifiers, (m) => m.targetStats === stats)
  if (!modifiers.length) return result

  result = { ...result }

  for (const modifier of modifiers) {
    let sourceCount = modifier.valueBase ?? 0
    if (modifier.valueAddingStats) {
      for (const stat of modifier.valueAddingStats) {
        sourceCount += statsForItem[stat] ?? 0
      }
    }
    if (modifier.valueAddingTags) {
      const itemsWithTags = filter(side.items, (i) =>
        some(item.tags, (tag) => !!modifier.valueAddingTags?.includes(tag)),
      )
      sourceCount += sumBy(itemsWithTags, (i) => i.count ?? 1)
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
  }

  return result
}

export const getAllModifiedStats = (props: {
  state: MatchState
  sideIdx: number
  itemIdx: number
  triggerIdx: number
  statsForItem: Stats
}) => {
  return {
    statsSelf: getModifiedStats({
      ...props,
      stats: 'statsSelf',
    }),
    statsEnemy: getModifiedStats({
      ...props,
      stats: 'statsEnemy',
    }),
    statsItem: getModifiedStats({
      ...props,
      stats: 'statsItem',
    }),
    statsRequired: getModifiedStats({
      ...props,
      stats: 'statsRequired',
    }),
    attack: getModifiedStats({
      ...props,
      stats: 'attack',
    }),
    statsForItem: getModifiedStats({
      ...props,
      stats: 'statsForItem',
    }),
  }
}
