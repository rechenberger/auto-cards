import { db } from '@/db/db'

const checks = [
  {
    name: 'Database',
    test: async () => {
      await db.query.users.findFirst()
    },
  },
]

export const revalidate = 0
export const maxDuration = 20 // 20 seconds

const TIMEOUT = 10_000

export const GET = async () => {
  const results = await Promise.all(
    checks.map(async (check) => {
      try {
        await Promise.race([
          check.test(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error(`Timeout after ${TIMEOUT / 1000}s`)),
              TIMEOUT,
            ),
          ),
        ])
        return { name: check.name, success: true }
      } catch (e: any) {
        return {
          name: check.name,
          success: false,
          error: e?.message || e?.toString() || 'Unknown error',
        }
      }
    }),
  )

  const success = !results.some((r) => !r.success)
  return new Response(JSON.stringify({ success, checks: results }, null, 2), {
    status: success ? 200 : 500,
  })
}
