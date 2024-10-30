import { z } from 'zod'
import { DungeonName, DungeonRoom } from './dungeons'

export const DungeonData = z.object({
  name: DungeonName,
  level: z.number(),
  seed: z.string(),

  status: z.enum(['active', 'completed', 'failed']),

  room: DungeonRoom.and(
    z.object({
      idx: z.number(),
      seed: z.string(),
    }),
  ),
})
export type DungeonData = z.infer<typeof DungeonData>
