import { z } from 'zod'
import { Stats } from './stats'
import { Tag } from './tags'

export const ScopedStats = z.object({
  stats: Stats,
  scope: z.enum(['both', 'self', 'enemy', 'item']),
})
export type ScopedStats = z.infer<typeof ScopedStats>

export const Trigger = z.object({
  type: z.enum([
    'interval',
    'startOfBattle',
    // 'onSelfStun', 'onEnemyStun'
  ]),
  cooldown: z.number(),
  statsRequired: Stats.optional(),
  statsSelf: Stats.optional(),
  statsEnemy: Stats.optional(),
  attack: Stats.optional(),
  scopedStats: z.array(ScopedStats).optional(),
})
export type Trigger = z.infer<typeof Trigger>

export const ItemDefinition = z.object({
  name: z.string(),
  tags: z.array(Tag).optional(),
  triggers: z.array(Trigger).optional(),
  price: z.number(),
  stats: Stats.optional(),
})
export type ItemDefinition = z.infer<typeof ItemDefinition>
