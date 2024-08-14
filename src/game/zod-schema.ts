import { z } from 'zod'
import { Stats } from './stats'

export const Attack = z.object({
  damage: z.number().optional(),
  accuracy: z.number().optional(),
  critChance: z.number().optional(),
  critDamage: z.number().optional(),
  stunChance: z.number().optional(),
  stunDuration: z.number().optional(),
})

export const Trigger = z.object({
  type: z.enum(['interval', 'onSelfStun', 'onEnemyStun']),
  cooldown: z.number(),
  statsSelf: Stats.optional(),
  statsEnemy: Stats.optional(),
  attack: Attack.optional(),
})
export type Trigger = z.infer<typeof Trigger>

export const ItemTag = z.enum(['hero', 'weapon', 'food', 'bag', 'shield'])

export const ItemDefinition = z.object({
  name: z.string(),
  tags: z.array(ItemTag).optional(),
  triggers: z.array(Trigger).optional(),
  price: z.number(),
  stats: Stats.optional(),
})
export type ItemDefinition = z.infer<typeof ItemDefinition>
