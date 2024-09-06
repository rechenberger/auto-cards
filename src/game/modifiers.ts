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
  sourceMultiplier: z.number().optional(),
  sourceTags: z.array(Tag).optional(),
  sourceStats: z.array(Stat).optional(),
  sourceCountMax: z.number().optional(),
  sourceBase: z.number().optional(),
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
    let sourceCount = modifier.sourceBase ?? 0
    if (modifier.sourceStats) {
      for (const stat of modifier.sourceStats) {
        sourceCount += statsForItem[stat] ?? 0
      }
    }
    if (modifier.sourceTags) {
      const itemsWithTags = filter(side.items, (i) =>
        some(item.tags, (tag) => !!modifier.sourceTags?.includes(tag)),
      )
      sourceCount += sumBy(itemsWithTags, (i) => i.count ?? 1)
    }
    if (modifier.sourceCountMax) {
      sourceCount = Math.min(sourceCount, modifier.sourceCountMax)
    }
    if (modifier.sourceMultiplier) {
      sourceCount *= modifier.sourceMultiplier
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
