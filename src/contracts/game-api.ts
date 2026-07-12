import { GameData } from '@/game/GameData'
import { ItemName } from '@/game/allItems'
import { ItemAspect } from '@/game/aspects'
import { GameMode } from '@/game/gameMode'
import { z } from 'zod'

export const GameDto = z.object({
  id: z.string(),
  userId: z.string(),
  data: GameData,
  liveMatchId: z.string().nullable(),
  version: z.number().int(),
  revision: z.number().int().nonnegative().default(0),
  gameMode: GameMode,
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})
export type GameDto = z.infer<typeof GameDto>

export const GamePhase = z.enum(['shop', 'match', 'ended', 'collector'])
export type GamePhase = z.infer<typeof GamePhase>

export const GameViewDto = z.object({
  game: GameDto,
  phase: GamePhase,
  currentMatchId: z.string().nullable(),
  rounds: z.array(
    z.object({
      roundNo: z.number().int().nonnegative(),
      status: z.enum(['won', 'lost']).nullable(),
      matchId: z.string().nullable(),
      loadoutId: z.string(),
    }),
  ),
  latestLoadoutId: z.string().nullable(),
  isAdmin: z.boolean(),
  isOldVersion: z.boolean(),
})
export type GameViewDto = z.infer<typeof GameViewDto>

export const GameListDto = z.object({
  games: z.array(GameViewDto),
  isAdmin: z.boolean(),
})
export type GameListDto = z.infer<typeof GameListDto>

export const CreateGameRequest = z.object({
  gameMode: GameMode.default('shopper'),
})
export type CreateGameRequest = z.infer<typeof CreateGameRequest>

export const GameCommand = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('buy'),
    shopItemIndex: z.number().int().nonnegative(),
  }),
  z.object({
    type: z.literal('toggle-reserve'),
    shopItemIndex: z.number().int().nonnegative(),
  }),
  z.object({ type: z.literal('reroll') }),
  z.object({
    type: z.literal('sell'),
    itemName: ItemName,
    aspects: z.array(ItemAspect).optional(),
  }),
  z.object({
    type: z.literal('craft'),
    recipeIndex: z.number().int().nonnegative(),
  }),
  z.object({ type: z.literal('fight') }),
  z.object({ type: z.literal('next-round') }),
  z.object({
    type: z.literal('admin-add-gold'),
    amount: z.number().int().positive().max(10_000),
  }),
])
export type GameCommand = z.infer<typeof GameCommand>

export const GameCommandRequest = z.object({
  expectedRevision: z.number().int().nonnegative(),
  command: GameCommand,
})
export type GameCommandRequest = z.infer<typeof GameCommandRequest>

export const GameCommandResponse = z.object({
  view: GameViewDto,
  result: z
    .object({
      type: z.string(),
      message: z.string().optional(),
      matchId: z.string().optional(),
    })
    .optional(),
})
export type GameCommandResponse = z.infer<typeof GameCommandResponse>
