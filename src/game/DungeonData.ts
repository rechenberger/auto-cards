import { LoadoutData } from '@/game/LoadoutData'
import { z } from 'zod'
import { DungeonName } from './dungeons'

export const DungeonData = z.object({
  name: DungeonName,
  level: z.number(),
  seed: z.string(),

  room: z.object({
    idx: z.number(),
    seed: z.string(),
    loadout: LoadoutData.optional(),
    won: z.boolean(),
  }),
})
export type DungeonData = z.infer<typeof DungeonData>
