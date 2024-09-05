import { z } from 'zod'
import { Rarity } from './rarities'
import { Stat, Stats } from './stats'
import { Tag } from './tags'

const triggerEvents = [
  'onAttackBeforeHit',
  'onAttackAfterHit',
  'onDefendBeforeHit',
  'onDefendAfterHit',
  // 'useStats',
  // 'gainedStats',
  // 'onSelfStun', 'onEnemyStun'
] as const

export type TriggerEventType = (typeof triggerEvents)[number]

export const Trigger = z.object({
  type: z.enum(['interval', 'startOfBattle', ...triggerEvents]),
  chancePercent: z.number().optional(),
  chanceGroup: z.string().optional(),
  cooldown: z.number(), // TODO: only for interval!
  statsRequired: Stats.optional(),
  statsSelf: Stats.optional(),
  statsEnemy: Stats.optional(),
  attack: Stats.optional(),
  statsItem: Stats.optional(),
  maxCount: z.number().optional(),

  // Für jede Waffe oder Schild (bis zu 3) addiere 3 Damage
  // Für jedes Thorns addiere 1 Damage
  // Für jedes Food multipliziere die Damage mit 1.5

  modifiers: z
    .array(
      z.object({
        arithmetic: z.enum(['multiply', 'add']),
        targetStat: Stat,
        targetStats: z.enum([
          'statsSelf',
          'statsEnemy',
          'statsItem',
          'statsRequired',
        ]),
        sourceMultiplier: z.number(),
        source: z.array(Tag.or(Stat)),
        sourceCountMax: z.number().optional(),
      }),
    )
    .optional(),
})
export type Trigger = z.infer<typeof Trigger>

export const ItemDefinition = z.object({
  name: z.string(),
  prompt: z.string().optional(),
  tags: z.array(Tag).optional(),
  triggers: z.array(Trigger).optional(),
  price: z.number(),
  stats: Stats.optional(),
  statsItem: Stats.optional(),
  rarity: Rarity.optional(),
})
export type ItemDefinition = z.infer<typeof ItemDefinition>
