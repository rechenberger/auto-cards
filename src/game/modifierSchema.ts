import { z } from 'zod'
import { Stat } from './statSchemas'
import { Tag } from './tags'

export const ModifierTargetStats = z.enum([
  'statsSelf',
  'statsEnemy',
  'statsTarget',
  'statsItem',
  'statsRequired',
  'attack',
  'statsForItem',
  'statsRequiredTarget',
])
export type ModifierTargetStats = z.infer<typeof ModifierTargetStats>

export const Modifier = z.object({
  arithmetic: z.enum(['multiply', 'add', 'subtract', 'divide']),
  targetStat: Stat,
  targetStats: ModifierTargetStats,

  sourceSide: z.enum(['self', 'enemy', 'target']),

  valueBase: z.number().optional(),
  valueAddingItems: z.array(z.string()).optional(),
  valueAddingTags: z.array(Tag).optional(),
  valueAddingStats: z.array(Stat).optional(),
  valueMultiplier: z.number().optional(),
  valueMax: z.number().optional(),

  description: z.string(),
})
export type Modifier = z.infer<typeof Modifier>
