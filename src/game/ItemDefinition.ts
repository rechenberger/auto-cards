import { z } from 'zod'
import { Special } from './specials'
import { Stats } from './stats'
import { Tag } from './tags'

export const SpecialData = z.object({
  name: Special,
  scope: z.enum(['global', 'self', 'enemy', 'item', 'trigger']),
})
export type SpecialData = z.infer<typeof SpecialData>

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
  specials: z.array(SpecialData).optional(),
})
export type Trigger = z.infer<typeof Trigger>

export const ItemDefinition = z.object({
  name: z.string(),
  tags: z.array(Tag).optional(),
  triggers: z.array(Trigger).optional(),
  price: z.number(),
  stats: Stats.optional(),
  specials: z.array(SpecialData).optional(),
})
export type ItemDefinition = z.infer<typeof ItemDefinition>
