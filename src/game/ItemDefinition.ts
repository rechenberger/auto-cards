import { z } from 'zod'
import { Modifier } from './modifiers'
import { Rarity } from './rarities'
import { Stats } from './stats'
import { Tag } from './tags'

const triggerEvents = [
  'onAttackBeforeHit',
  'onAttackAfterHit',
  'onDefendBeforeHit',
  'onDefendAfterHit',
  'use', // meant to be used with required stats
  // 'gainedStats',
  // 'onSelfStun', 'onEnemyStun'
] as const

export type TriggerEventType = (typeof triggerEvents)[number]

const TriggerWithoutCooldown = z.object({
  type: z.enum(['startOfBattle', ...triggerEvents]),
})
const TriggerWithCooldown = z.object({
  type: z.enum(['interval']),
  cooldown: z.number(),
})

export const Trigger = z
  .object({
    chancePercent: z.number().optional(),
    chanceGroup: z.string().optional(),
    statsRequired: Stats.optional(),
    statsSelf: Stats.optional(),
    statsEnemy: Stats.optional(),
    attack: Stats.optional(),
    statsItem: Stats.optional(),
    maxCount: z.number().optional(),
    modifiers: z.array(Modifier).optional(),
  })
  .and(TriggerWithCooldown.or(TriggerWithoutCooldown))
export type Trigger = z.infer<typeof Trigger>

export const ItemDefinition = z.object({
  name: z.string(),
  prompt: z.string().optional(),
  tags: z.array(Tag).optional(),
  triggers: z.array(Trigger).optional(),
  price: z.number(),
  shop: z.boolean(),
  stats: Stats.optional(),
  statsItem: Stats.optional(),
  rarity: Rarity.optional(),
})
export type ItemDefinition = z.infer<typeof ItemDefinition>
