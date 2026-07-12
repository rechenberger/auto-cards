import { z } from 'zod'
import { ItemName } from './allItems'
import { ItemAspect } from './aspects'
import { Rarity } from './rarities'

/** Persisted item state. Item presentation lives in `src/components`. */
export const ItemData = z.object({
  id: z.string().optional(),
  name: ItemName,
  count: z.number().optional(),
  aspects: z.array(ItemAspect).optional(),
  rarity: Rarity.optional(),
  favorite: z.boolean().optional(),
  createdAt: z.string().optional(),
})
export type ItemData = z.infer<typeof ItemData>
