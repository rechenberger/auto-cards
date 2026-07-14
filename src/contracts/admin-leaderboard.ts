import { z } from 'zod'

export const AdminLeaderboardCommand = z.discriminatedUnion('type', [
  z.object({ type: z.literal('refresh') }),
  z.object({ type: z.literal('clean-duplicates') }),
  z.object({ type: z.literal('score-loadout'), loadoutId: z.string() }),
])

export const AdminLeaderboardResult = z.object({
  queued: z.number().int().nonnegative().optional(),
  removed: z.number().int().nonnegative().optional(),
})
