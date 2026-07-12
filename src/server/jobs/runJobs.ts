import { Job } from '@/db/schema-zod'
import {
  ADMIN_BOT_GENERATION_JOB,
  ADMIN_SIMULATION_JOB,
  processAdminBotGenerationJob,
  processAdminSimulationJob,
} from '@/server/application/admin/adminJobs'
import {
  AI_IMAGE_GENERATION_JOB,
  processAiImageJob,
} from '@/server/application/admin/aiImages'
import {
  DISCORD_NOTIFICATION_JOB,
  processDiscordNotification,
} from './discordJobs'
import { LEADERBOARD_SCORE_JOB, processLeaderboardJob } from './leaderboardJobs'
import {
  claimNextJob,
  cleanupExpiredQueueState,
  completeJob,
  failJob,
  recoverStaleJobs,
} from './queue'

const processJob = async (job: Job) => {
  switch (job.type) {
    case LEADERBOARD_SCORE_JOB:
      await processLeaderboardJob(job.payload)
      return
    case ADMIN_SIMULATION_JOB:
      await processAdminSimulationJob(job)
      return
    case ADMIN_BOT_GENERATION_JOB:
      await processAdminBotGenerationJob(job)
      return
    case AI_IMAGE_GENERATION_JOB:
      await processAiImageJob(job)
      return
    case DISCORD_NOTIFICATION_JOB:
      await processDiscordNotification(job.payload)
      return
    default:
      throw new Error(`Unknown job type: ${job.type}`)
  }
}

export const runDueJobs = async ({
  limit = 25,
  deadline = Date.now() + 50_000,
}: {
  limit?: number
  deadline?: number
} = {}) => {
  const [recovered, cleaned] = await Promise.all([
    recoverStaleJobs(),
    cleanupExpiredQueueState(),
  ])
  let completed = 0
  let failed = 0
  for (let index = 0; index < limit && Date.now() < deadline; index++) {
    const job = await claimNextJob()
    if (!job) break
    try {
      await processJob(job)
      if (await completeJob(job)) completed += 1
    } catch (error) {
      if (await failJob({ job, error })) failed += 1
    }
  }
  return { completed, failed, recovered, cleaned }
}
