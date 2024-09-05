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
  attack: Stats.optional(),

  /**
   * Remove this part when refactor is done
   * just keeping it so not everything explodes
   */
  statsSelf: Stats.optional(),
  statsEnemy: Stats.optional(),
  statsEnemyOnHit: Stats.optional(),
  statsItem: Stats.optional(),
  /**
   * Until here
   */

  statsHandler: z
    .array(
      z.object({
        target: z.enum(['self', 'enemy', 'item']),

        statRngApply: z.array(Stats).optional(),
        applyChance: z.number().positive().max(100).default(100).optional(),

        attackIncreasePerStat: z.array(Stats).optional(),

        requiresHit: z.boolean().optional(),
        requiresCrit: z.boolean().optional(),
        requiresBlock: z.boolean().optional(),
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
