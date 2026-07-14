import { openApiDocument } from '@/server/api/openapi'

export const dynamic = 'force-static'

export const GET = () =>
  Response.json(openApiDocument, {
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    },
  })
