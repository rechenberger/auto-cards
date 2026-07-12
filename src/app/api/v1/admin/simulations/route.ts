import { AdminJobBatchDto, QueueSimulationRequest } from '@/contracts/admin'
import {
  enqueueAdminSimulation,
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
    scope: 'admin:simulations:create',
    handler: async (body) => {
      const parsed = QueueSimulationRequest.safeParse(parseJson(body))
      if (!parsed.success) {
        throw badRequest('Invalid simulation request', parsed.error.flatten())
      }
      const requestKey = request.headers.get('idempotency-key')!
      const jobs = await Promise.all(
        parsed.data.inputs.map((input, index) =>
          enqueueAdminSimulation({
            input,
            requestedBy: principal.userId,
            requestKey,
            index,
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
