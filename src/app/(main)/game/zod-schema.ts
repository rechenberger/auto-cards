import { z } from 'zod'

export const Stats = z.object({
  gold: z.number().optional(),
  health: z.number().optional(),
  stamina: z.number().optional(),
  staminaRegen: z.number().optional(),
  block: z.number().optional(),
  regen: z.number().optional(),
  luck: z.number().optional(),
  thorns: z.number().optional(),
  poison: z.number().optional(),
  space: z.number().optional(),
  haste: z.number().optional(),
})

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
  cooldown: z.number().optional(),
  statsSelf: Stats.optional(),
  statsEnemy: Stats.optional(),
  attack: Attack.optional(),
})

export const ItemTag = z.enum(['hero', 'weapon', 'food', 'bag'])

export const Item = z.object({
  id: z.string(),
  name: z.string().optional(),
  tags: z.array(ItemTag).optional(),
  triggers: z.array(Trigger).optional(),
  price: z.number(),
  stats: Stats.optional(),
})
export type Item = z.infer<typeof Item>

export const RoundState = z.object({
  roundNo: z.number(),
  itemIds: z.array(z.string()),
  gold: z.number(),
})

export const MatchState = z.object({
  logs: z.array(
    z.object({
      message: z.string(),
    }),
  ),
})

export const GameState = z.object({
  rounds: z.array(RoundState),
  matches: z.array(MatchState),
})
