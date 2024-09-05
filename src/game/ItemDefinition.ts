import { z } from 'zod'
import { Rarity } from './rarities'
import { Stats } from './stats'
import { Tag } from './tags'

const triggerEvents = [
  'onHit',
  // 'useStats',
  // 'gainedStats',
  // 'onSelfStun', 'onEnemyStun'
] as const

export type TriggerEventType = (typeof triggerEvents)[number]

export const Trigger = z.object({
  type: z.enum(['interval', 'startOfBattle', ...triggerEvents]),
  chance: z.number().optional(),
  cooldown: z.number(),
  statsRequired: Stats.optional(),
  statsSelf: Stats.optional(),
  statsEnemy: Stats.optional(),
  statsEnemyOnHit: Stats.optional(),
  attack: Stats.optional(),
  statsItem: Stats.optional(),
  maxCount: z.number().optional(),
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
