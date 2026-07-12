import {
  AdminJobDto,
  SimulationInputDto,
  SimulationResultDto,
} from '@/contracts/admin'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Job } from '@/db/schema-zod'
import { countifyItems } from '@/game/countifyItems'
import { GAME_VERSION } from '@/game/config'
import { DefaultGameMode } from '@/game/gameMode'
import { getSimulationStartForRound } from '@/game/simulationConfig'
import { enqueueJob } from '@/server/jobs/queue'
import { and, eq, isNull } from 'drizzle-orm'
import { runSimulation } from './simulation'

export const ADMIN_SIMULATION_JOB = 'admin.simulation'
export const ADMIN_BOT_GENERATION_JOB = 'admin.bot-generation'

export const toAdminJobDto = (
  job: Job,
  { includeResult = false }: { includeResult?: boolean } = {},
): AdminJobDto =>
  AdminJobDto.parse({
    id: job.id,
    type: job.type,
    status: job.status,
    attempts: job.attempts,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    result: includeResult ? job.payload.result : undefined,
  })

const setJobResult = async ({
  jobId,
  result,
}: {
  jobId: string
  result: unknown
}) => {
  const job = await db.query.job.findFirst({
    where: eq(schema.job.id, jobId),
  })
  if (!job) throw new Error('Job no longer exists')
  await db
    .update(schema.job)
    .set({ payload: { ...job.payload, result } })
    .where(eq(schema.job.id, jobId))
}

export const enqueueAdminSimulation = async ({
  input,
  requestedBy,
  requestKey,
  index,
}: {
  input: SimulationInputDto
  requestedBy: string
  requestKey: string
  index: number
}) =>
  enqueueJob({
    type: ADMIN_SIMULATION_JOB,
    payload: { input, requestedBy },
    idempotencyKey: `${ADMIN_SIMULATION_JOB}:${requestedBy}:${requestKey}:${index}`,
  })

export const enqueueAdminBotGeneration = async ({
  roundNo,
  requestedBy,
  requestKey,
}: {
  roundNo: number
  requestedBy: string
  requestKey: string
}) => {
  const input = SimulationInputDto.parse({
    noOfBots: 10,
    noOfRepeats: 1,
    simulationSeed: ['bot', roundNo],
    ...getSimulationStartForRound(roundNo),
    noOfBotsSelected: 5,
    noOfSelectionRounds: 20,
  })
  return enqueueJob({
    type: ADMIN_BOT_GENERATION_JOB,
    payload: { input, roundNo, requestedBy },
    idempotencyKey: `${ADMIN_BOT_GENERATION_JOB}:${GAME_VERSION}:${roundNo}:${requestedBy}:${requestKey}`,
  })
}

const parseSimulationPayload = (payload: Record<string, unknown>) =>
  SimulationInputDto.parse(payload.input)

export const processAdminSimulationJob = async (job: Job) => {
  const result = await runSimulation(parseSimulationPayload(job.payload))
  await setJobResult({ jobId: job.id, result })
}

export const processAdminBotGenerationJob = async (job: Job) => {
  const roundNo = Number(job.payload.roundNo)
  if (!Number.isInteger(roundNo) || roundNo < 0) {
    throw new Error('Invalid bot generation round')
  }
  const result = await runSimulation(parseSimulationPayload(job.payload))

  await db.transaction(async (transaction) => {
    await transaction.delete(schema.loadout).where(
      // This job only owns versioned anonymous shopper loadouts for one round.
      // A retry replaces the same complete set and is therefore idempotent.
      and(
        eq(schema.loadout.roundNo, roundNo),
        isNull(schema.loadout.userId),
        eq(schema.loadout.version, GAME_VERSION),
        eq(schema.loadout.gameMode, DefaultGameMode),
      ),
    )
    if (result.bots.length) {
      await transaction.insert(schema.loadout).values(
        result.bots.map((bot) => ({
          userId: null,
          roundNo,
          data: {
            ...bot.loadout,
            items: countifyItems(bot.loadout.items),
          },
          version: GAME_VERSION,
          gameMode: DefaultGameMode,
        })),
      )
    }
  })
  await setJobResult({
    jobId: job.id,
    result: SimulationResultDto.parse(result),
  })
}
