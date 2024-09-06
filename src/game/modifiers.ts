import { z } from 'zod'
import { Stat } from './stats'
import { Tag } from './tags'

// Für jede Waffe oder Schild (bis zu 3) addiere 3 Damage
// Für jedes Thorns addiere 1 Damage
// Für jedes Food multipliziere die Damage mit 1.5

export const Modifier = z.object({
  arithmetic: z.enum(['multiply', 'add']),
  targetStat: Stat,
  targetStats: z.enum([
    'statsSelf',
    'statsEnemy',
    'statsItem',
    'statsRequired',
    'attack',
  ]),
  sourceMultiplier: z.number(),
  source: z.array(Tag.or(Stat)),
  sourceCountMax: z.number().optional(),
})
export type Modifier = z.infer<typeof Modifier>
