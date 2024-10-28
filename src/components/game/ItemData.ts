import { ItemAspect } from '@/game/aspects'
import { z } from 'zod'

export const ItemData = z.object({
  name: z.string(),
  count: z.number().optional(),
  aspects: z.array(ItemAspect).optional(),
})
export type ItemData = z.infer<typeof ItemData>
