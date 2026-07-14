import { runDueJobs } from '@/server/jobs/runJobs'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export const GET = async (request: Request) => {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  return Response.json(await runDueJobs())
}
