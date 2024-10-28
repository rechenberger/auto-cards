import { ItemAspect } from '@/game/aspects'
import { Rarity } from '@/game/rarities'
import { z } from 'zod'

export const ItemData = z.object({
  name: z.string(),
  count: z.number().optional(),
  aspects: z.array(ItemAspect).optional(),
  rarity: Rarity.optional(),
})
export type ItemData = z.infer<typeof ItemData>
