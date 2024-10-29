import { ItemName } from '@/game/allItems'
import { ItemAspect } from '@/game/aspects'
import { Rarity } from '@/game/rarities'
import { z } from 'zod'

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
