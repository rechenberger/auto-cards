import { z } from 'zod'
import { Rarity } from './rarities'
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
  statsEnemyOnHit: Stats.optional(),
  attack: Stats.optional(),
  statsItem: Stats.optional(),
})
export type Trigger = z.infer<typeof Trigger>

export const ItemDefinition = z.object({
  name: z.string(),
  tags: z.array(Tag).optional(),
  triggers: z.array(Trigger).optional(),
  price: z.number(),
  stats: Stats.optional(),
  statsItem: Stats.optional(),
  rarity: Rarity.optional(),
})
export type ItemDefinition = z.infer<typeof ItemDefinition>
