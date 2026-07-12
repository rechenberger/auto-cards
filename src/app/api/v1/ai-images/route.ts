import {
  AiImageCommand,
  AiImageJobBatchDto,
  AiImagesDto,
} from '@/contracts/ai-images'
import {
  enqueueAiImageCommand,
  findAiImages,
} from '@/server/application/admin/aiImages'
import { toAdminJobDto } from '@/server/application/admin/adminJobs'
import { badRequest } from '@/server/api/ApiError'
import { withIdempotency } from '@/server/api/idempotency'
import { apiData, apiRoute, parseJson } from '@/server/api/route'
import { requireApiAdmin } from '@/server/auth/apiPrincipal'
import { runDueJobs } from '@/server/jobs/runJobs'
import { after } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export const GET = apiRoute(async (_context, request: Request) => {
  const searchParams = new URL(request.url).searchParams
  const rawLimit = Number(searchParams.get('limit') ?? 12)
  if (!Number.isInteger(rawLimit) || rawLimit < 1 || rawLimit > 500) {
    throw badRequest('Limit must be between 1 and 500')
  }
  const images = await findAiImages({
    itemId: searchParams.get('itemId') ?? undefined,
    themeId: searchParams.has('themeId')
      ? searchParams.get('themeId')
      : undefined,
    prompt: searchParams.get('prompt') ?? undefined,
    limit: rawLimit,
  })
  return apiData(AiImagesDto.parse({ images }), {
    headers: {
      'Cache-Control': 'public, max-age=5, stale-while-revalidate=30',
    },
  })
})

export const POST = apiRoute(async (_context, request: Request) => {
  const principal = await requireApiAdmin({
    request,
    requiredScopes: ['admin'],
    allowDev: true,
  })
  const response = await withIdempotency({
    request,
    principal,
    scope: 'admin:ai-images:generate',
    handler: async (body) => {
      const parsed = AiImageCommand.safeParse(parseJson(body))
      if (!parsed.success) {
        throw badRequest('Invalid image command', parsed.error.flatten())
      }
      const result = await enqueueAiImageCommand({
        command: parsed.data,
        requestedBy: principal.userId,
        requestKey: request.headers.get('idempotency-key')!,
      })
      return apiData(
        AiImageJobBatchDto.parse({
          jobs: result.jobs.map((job) => toAdminJobDto(job)),
          queued: result.jobs.length,
          skipped: result.skipped,
        }),
        { status: 202 },
      )
    },
  })
  after(() => runDueJobs({ limit: 1, deadline: Date.now() + 45_000 }))
  return response
})
