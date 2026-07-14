import { z } from 'zod'
import { ItemData } from './ItemData'

export const LoadoutData = z.object({
  items: z.array(ItemData),
})
export type LoadoutData = z.infer<typeof LoadoutData>
