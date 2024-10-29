import { z } from 'zod'
import { DungeonName, DungeonRoom } from './dungeons'

export const DungeonData = z.object({
  name: DungeonName,
  level: z.number(),
  seed: z.string(),

  room: DungeonRoom.and(
    z.object({
      idx: z.number(),
      seed: z.string(),
      won: z.boolean(),
    }),
  ),
})
export type DungeonData = z.infer<typeof DungeonData>
