import { LoadoutData } from '@/game/LoadoutData'
import { ItemName } from '@/game/allItems'
import { z } from 'zod'

export const AdminUserDto = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string(),
  emailVerified: z.string().nullable(),
  isAdmin: z.boolean(),
  themeId: z.string().nullable(),
  hasPassword: z.boolean(),
  providers: z.array(z.string()),
})
export type AdminUserDto = z.infer<typeof AdminUserDto>

export const AdminUserListDto = z.object({
  users: z.array(AdminUserDto),
})
export type AdminUserListDto = z.infer<typeof AdminUserListDto>

export const CreateAdminUserRequest = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
})
export type CreateAdminUserRequest = z.infer<typeof CreateAdminUserRequest>

export const UpdateAdminUserRequest = z.object({
  isAdmin: z.boolean(),
})
export type UpdateAdminUserRequest = z.infer<typeof UpdateAdminUserRequest>

export const AdminMutationResult = z.object({
  message: z.string(),
})
export type AdminMutationResult = z.infer<typeof AdminMutationResult>

export const AdminJobStatus = z.enum([
  'queued',
  'running',
  'completed',
  'failed',
])
export type AdminJobStatus = z.infer<typeof AdminJobStatus>

export const AdminJobDto = z.object({
  id: z.string(),
  type: z.string(),
  status: AdminJobStatus,
  attempts: z.number().int().nonnegative(),
  error: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  result: z.unknown().optional(),
})
export type AdminJobDto = z.infer<typeof AdminJobDto>

export const AdminJobBatchDto = z.object({
  jobs: z.array(AdminJobDto),
  queued: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative().optional(),
})
export type AdminJobBatchDto = z.infer<typeof AdminJobBatchDto>

export const AdminJobsDto = z.object({
  jobs: z.array(AdminJobDto),
})
export type AdminJobsDto = z.infer<typeof AdminJobsDto>

const SimulationSeedPart = z.union([
  z.string(),
  z.number(),
  z.record(z.string(), z.unknown()),
])

export const SimulationInputDto = z
  .object({
    noOfBots: z.number().int().min(2).max(100),
    noOfRepeats: z.number().int().min(1).max(100),
    simulationSeed: z.array(SimulationSeedPart).min(1).max(20),
    startingGold: z.number().int().min(0).max(10_000),
    startingItems: z.array(ItemName).max(100),
    noOfBotsSelected: z.number().int().min(1).max(100),
    noOfSelectionRounds: z.number().int().min(0).max(100),
  })
  .superRefine((input, context) => {
    if (input.noOfBotsSelected > input.noOfBots) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['noOfBotsSelected'],
        message: 'Selected bots cannot exceed generated bots',
      })
    }
    const estimatedMatches =
      input.noOfBots *
      (input.noOfBots - 1) *
      input.noOfRepeats *
      (input.noOfSelectionRounds + 1)
    if (estimatedMatches > 50_000) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Simulation work budget exceeded (${estimatedMatches} > 50000 matches)`,
      })
    }
  })
export type SimulationInputDto = z.infer<typeof SimulationInputDto>

export const SimulationBotDto = z.object({
  name: z.string(),
  wins: z.number().int().nonnegative(),
  matches: z.number().int().nonnegative(),
  draws: z.number().int().nonnegative(),
  time: z.number().nonnegative(),
  simulationRounds: z.number().int().nonnegative(),
  loadout: LoadoutData,
})
export type SimulationBotDto = z.infer<typeof SimulationBotDto>

export const SimulationResultDto = z.object({
  bots: z.array(SimulationBotDto),
  tookSeconds: z.string(),
  done: z.boolean(),
  selectionRound: z.number().int().nonnegative(),
})
export type SimulationResultDto = z.infer<typeof SimulationResultDto>

export const QueueSimulationRequest = z.object({
  inputs: z.array(SimulationInputDto).min(1).max(4),
})
export type QueueSimulationRequest = z.infer<typeof QueueSimulationRequest>

export const QueueBotGenerationRequest = z.object({
  roundNos: z.array(z.number().int().nonnegative()).min(1).max(20),
})
export type QueueBotGenerationRequest = z.infer<
  typeof QueueBotGenerationRequest
>

export const AdminBotLoadoutDto = z.object({
  id: z.string(),
  roundNo: z.number().int().nonnegative(),
  data: LoadoutData,
})
export type AdminBotLoadoutDto = z.infer<typeof AdminBotLoadoutDto>

export const AdminBotRoundDto = z.object({
  roundNo: z.number().int().nonnegative(),
  gold: z.number().nonnegative(),
  loadouts: z.array(AdminBotLoadoutDto),
})
export type AdminBotRoundDto = z.infer<typeof AdminBotRoundDto>

export const AdminBotsDto = z.object({
  rulesetVersion: z.number().int().positive(),
  rounds: z.array(AdminBotRoundDto),
})
export type AdminBotsDto = z.infer<typeof AdminBotsDto>

export const AdminMigrationStatusDto = z.object({
  leaderboardMissingGameId: z.number().int().nonnegative(),
})
export type AdminMigrationStatusDto = z.infer<typeof AdminMigrationStatusDto>

export const AdminMigrationCommand = z.discriminatedUnion('type', [
  z.object({ type: z.literal('backfill-leaderboard-game-id') }),
])
export type AdminMigrationCommand = z.infer<typeof AdminMigrationCommand>

export const AdminMigrationResultDto = z.object({
  updated: z.number().int().nonnegative(),
  remaining: z.number().int().nonnegative(),
})
export type AdminMigrationResultDto = z.infer<typeof AdminMigrationResultDto>
