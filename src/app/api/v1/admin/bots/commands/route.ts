import { AdminJobBatchDto, QueueBotGenerationRequest } from '@/contracts/admin'
import { NO_OF_ROUNDS } from '@/game/config'
import {
  enqueueAdminBotGeneration,
  toAdminJobDto,
} from '@/server/application/admin/adminJobs'
import { badRequest } from '@/server/api/ApiError'
import { withIdempotency } from '@/server/api/idempotency'
import { apiData, apiRoute, parseJson } from '@/server/api/route'
import { requireApiAdmin } from '@/server/auth/apiPrincipal'
import { runDueJobs } from '@/server/jobs/runJobs'
import { after } from 'next/server'

export const maxDuration = 60

export const POST = apiRoute(async (_context, request: Request) => {
  const principal = await requireApiAdmin({
    request,
    requiredScopes: ['admin'],
    allowDev: true,
  })
  const response = await withIdempotency({
    request,
    principal,
    scope: 'admin:bots:generate',
    handler: async (body) => {
      const parsed = QueueBotGenerationRequest.safeParse(parseJson(body))
      if (!parsed.success) {
        throw badRequest(
          'Invalid bot generation request',
          parsed.error.flatten(),
        )
      }
      const roundNos = [...new Set(parsed.data.roundNos)]
      if (roundNos.some((roundNo) => roundNo >= NO_OF_ROUNDS)) {
        throw badRequest('Round is outside the active ruleset')
      }
      const requestKey = request.headers.get('idempotency-key')!
      const jobs = await Promise.all(
        roundNos.map((roundNo) =>
          enqueueAdminBotGeneration({
            roundNo,
            requestedBy: principal.userId,
            requestKey,
          }),
        ),
      )
      return apiData(
        AdminJobBatchDto.parse({
          jobs: jobs.map((job) => toAdminJobDto(job)),
          queued: jobs.length,
        }),
        { status: 202 },
      )
    },
  })
  after(() => runDueJobs({ limit: 1, deadline: Date.now() + 45_000 }))
  return response
})
