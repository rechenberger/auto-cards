import { GameViewDto } from '@/contracts/game-api'
import { DungeonName } from '@/game/dungeons/dungeonSchema'
import { Rarity } from '@/game/rarities'
import { z } from 'zod'

export const CollectorStarterId = z.enum(['blacksmith', 'hunter', 'farmer'])
export type CollectorStarterId = z.infer<typeof CollectorStarterId>

/**
 * Collector mutations intentionally use stable ids/names instead of accepting
 * item or dungeon state from the browser. The server always applies a command
 * to a freshly loaded, authoritative game snapshot.
 */
export const CollectorCommand = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('choose-starter'),
    starterId: CollectorStarterId,
  }),
  z.object({
    type: z.literal('toggle-loadout-item'),
    itemId: z.string().min(1),
  }),
  z.object({
    type: z.literal('toggle-favorite-item'),
    itemId: z.string().min(1),
  }),
  z.object({ type: z.literal('salvage-item'), itemId: z.string().min(1) }),
  z.object({ type: z.literal('upgrade-item'), itemId: z.string().min(1) }),
  z.object({ type: z.literal('convert-parts'), rarity: Rarity }),
  z.object({ type: z.literal('salvage-unprotected'), rarity: Rarity }),
  z.object({
    type: z.literal('set-dungeon-level'),
    dungeonName: DungeonName,
    level: z.number().int().positive(),
  }),
  z.object({ type: z.literal('enter-dungeon'), dungeonName: DungeonName }),
  z.object({ type: z.literal('advance-dungeon') }),
  z.object({
    type: z.literal('admin-generate-items'),
    count: z.number().int().min(1).max(50).default(10),
  }),
  z.object({ type: z.literal('admin-reset') }),
  z.object({ type: z.literal('admin-enter-dungeon') }),
  z.object({ type: z.literal('admin-exit-dungeon') }),
  z.object({ type: z.literal('admin-unlock-dungeon') }),
  z.object({
    type: z.literal('admin-turbo-dungeon'),
    dungeonName: DungeonName,
    count: z.number().int().min(1).max(100).default(100),
  }),
])
export type CollectorCommand = z.infer<typeof CollectorCommand>

export const CollectorCommandRequest = z.object({
  expectedRevision: z.number().int().nonnegative(),
  rulesetVersion: z.number().int().positive(),
  command: CollectorCommand,
})
export type CollectorCommandRequest = z.infer<typeof CollectorCommandRequest>

export const CollectorCommandResult = z.object({
  type: z.string(),
  message: z.string().optional(),
  details: z.record(z.unknown()).optional(),
})
export type CollectorCommandResult = z.infer<typeof CollectorCommandResult>

export const CollectorCommandResponse = z.object({
  view: GameViewDto,
  result: CollectorCommandResult,
})
export type CollectorCommandResponse = z.infer<typeof CollectorCommandResponse>
