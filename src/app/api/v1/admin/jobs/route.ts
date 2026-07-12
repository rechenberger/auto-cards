import { AdminJobsDto } from '@/contracts/admin'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Job } from '@/db/schema-zod'
import { toAdminJobDto } from '@/server/application/admin/adminJobs'
import { badRequest } from '@/server/api/ApiError'
import { apiData, apiRoute } from '@/server/api/route'
import { requireApiAdmin } from '@/server/auth/apiPrincipal'
import { runDueJobs } from '@/server/jobs/runJobs'
import { desc, inArray } from 'drizzle-orm'
import { after } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export const GET = apiRoute(async (_context, request: Request) => {
  await requireApiAdmin({
    request,
    requiredScopes: ['admin'],
    allowDev: true,
  })
  const ids = (new URL(request.url).searchParams.get('ids') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
  const includeResult =
    new URL(request.url).searchParams.get('includeResult') === 'true'
  if (ids.length > 100) throw badRequest('Too many job ids')
  const rows = await db.query.job.findMany({
    where: ids.length ? inArray(schema.job.id, ids) : undefined,
    orderBy: desc(schema.job.createdAt),
    limit: ids.length || 50,
  })
  const response = apiData(
    AdminJobsDto.parse({
      jobs: Job.array()
        .parse(rows)
        .map((job) => toAdminJobDto(job, { includeResult })),
    }),
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
  after(() => runDueJobs({ limit: 1, deadline: Date.now() + 45_000 }))
  return response
})
