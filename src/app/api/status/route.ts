import { db } from '@/db/db'
import { z } from 'zod'

// CONFIG:
export const revalidate = 0
const TIMEOUT_IN_SECONDS = 10
export const maxDuration = 20 // 10s extra for route handling

const checks = [
  {
    name: 'Database',
    test: async () => {
      await db.query.users.findFirst()
    },
  },
]

// HANDLER:
export const GET = async () => {
  const results = await Promise.all(
    checks.map(async (check) => {
      try {
        await Promise.race([
          check.test(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error(`Timeout after ${TIMEOUT_IN_SECONDS}s`)),
              TIMEOUT_IN_SECONDS * 1000,
            ),
          ),
        ])
        return { name: check.name, success: true }
      } catch (e) {
        const parsed = z
          .object({
            message: z.string(),
          })
          .safeParse(e)

        return {
          name: check.name,
          success: false,
          error: parsed.success ? parsed.data?.message : 'Unknown error',
        }
      }
    }),
  )

  const success = !results.some((r) => !r.success)
  return new Response(JSON.stringify({ success, checks: results }, null, 2), {
    status: success ? 200 : 500,
  })
}
