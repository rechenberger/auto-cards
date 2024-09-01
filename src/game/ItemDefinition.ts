import { z } from 'zod'
import { Stats } from './stats'
import { Tag } from './tags'

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
  statsItem: Stats.optional(),
  chance: z.number().optional(),
})
export type Trigger = z.infer<typeof Trigger>

export const ItemDefinition = z.object({
  name: z.string(),
  tags: z.array(Tag).optional(),
  triggers: z.array(Trigger).optional(),
  price: z.number(),
  stats: Stats.optional(),
  statsItem: Stats.optional(),
})
export type ItemDefinition = z.infer<typeof ItemDefinition>
