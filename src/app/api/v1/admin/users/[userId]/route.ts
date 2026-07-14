import { AdminMutationResult, UpdateAdminUserRequest } from '@/contracts/admin'
import { db } from '@/db/db'
import { users } from '@/db/schema-auth'
import { badRequest, notFound } from '@/server/api/ApiError'
import { withIdempotency } from '@/server/api/idempotency'
import { apiData, apiRoute, parseJson } from '@/server/api/route'
import { requireApiAdmin } from '@/server/auth/apiPrincipal'
import { eq } from 'drizzle-orm'

type RouteContext = { params: Promise<{ userId: string }> }

export const PATCH = apiRoute(
  async (_context, request: Request, context: RouteContext) => {
    const principal = await requireApiAdmin({
      request,
      requiredScopes: ['admin'],
      allowDev: true,
    })
    const { userId } = await context.params
    return withIdempotency({
      request,
      principal,
      scope: `admin:user:${userId}:update`,
      handler: async (body) => {
        const parsed = UpdateAdminUserRequest.safeParse(parseJson(body))
        if (!parsed.success) {
          throw badRequest('Invalid user update', parsed.error.flatten())
        }
        const updated = await db
          .update(users)
          .set({ isAdmin: parsed.data.isAdmin })
          .where(eq(users.id, userId))
          .returning({ email: users.email })
        if (!updated.length) throw notFound('User not found')
        return apiData(
          AdminMutationResult.parse({
            message: parsed.data.isAdmin
              ? `Made ${updated[0]?.email} an admin`
              : `Removed admin from ${updated[0]?.email}`,
          }),
        )
      },
    })
  },
)

export const DELETE = apiRoute(
  async (_context, request: Request, context: RouteContext) => {
    const principal = await requireApiAdmin({
      request,
      requiredScopes: ['admin'],
      allowDev: true,
    })
    const { userId } = await context.params
    return withIdempotency({
      request,
      principal,
      scope: `admin:user:${userId}:delete`,
      handler: async () => {
        const deleted = await db
          .delete(users)
          .where(eq(users.id, userId))
          .returning({ email: users.email })
        if (!deleted.length) throw notFound('User not found')
        return apiData(
          AdminMutationResult.parse({
            message: `Deleted ${deleted[0]?.email}`,
          }),
        )
      },
    })
  },
)
