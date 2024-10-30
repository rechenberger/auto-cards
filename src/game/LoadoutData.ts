import { ItemData } from '@/components/game/ItemData'
import { z } from 'zod'

export const LoadoutData = z.object({
  items: z.array(ItemData),
})
export type LoadoutData = z.infer<typeof LoadoutData>
