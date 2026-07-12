import { hashPassword } from '@/auth/password'
import {
  AdminUserDto,
  AdminUserListDto,
  CreateAdminUserRequest,
} from '@/contracts/admin'
import { db } from '@/db/db'
import { users } from '@/db/schema-auth'
import { badRequest, conflict } from '@/server/api/ApiError'
import { withIdempotency } from '@/server/api/idempotency'
import { apiData, apiRoute, parseJson } from '@/server/api/route'
import { requireApiAdmin } from '@/server/auth/apiPrincipal'
import { eq, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const toDto = (user: {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  isAdmin: boolean | null
  themeId: string | null
  passwordHash: string | null
  accounts: { provider: string }[]
}) =>
  AdminUserDto.parse({
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified?.toISOString() ?? null,
    isAdmin: Boolean(user.isAdmin),
    themeId: user.themeId,
    hasPassword: Boolean(user.passwordHash),
    providers: [...new Set(user.accounts.map((account) => account.provider))],
  })

export const GET = apiRoute(async (_context, request: Request) => {
  await requireApiAdmin({
    request,
    requiredScopes: ['admin'],
    allowDev: true,
  })
  const onlyAdmins =
    new URL(request.url).searchParams.get('filter') === 'admins'
  const rows = await db.query.users.findMany({
    with: { accounts: { columns: { provider: true } } },
    where: onlyAdmins ? eq(users.isAdmin, true) : undefined,
  })
  return apiData(AdminUserListDto.parse({ users: rows.map(toDto) }), {
    headers: { 'Cache-Control': 'private, no-store' },
  })
})

export const POST = apiRoute(async (_context, request: Request) => {
  const principal = await requireApiAdmin({
    request,
    requiredScopes: ['admin'],
    allowDev: true,
  })
  return withIdempotency({
    request,
    principal,
    scope: 'admin:users:create',
    handler: async (body) => {
      const parsed = CreateAdminUserRequest.safeParse(parseJson(body))
      if (!parsed.success) {
        throw badRequest('Invalid user', parsed.error.flatten())
      }
      const email = parsed.data.email.toLowerCase()
      const existing = await db.query.users.findFirst({
        columns: { id: true },
        where: sql`lower(${users.email}) = ${email}`,
      })
      if (existing) throw conflict('Email is already registered')

      await db.insert(users).values({
        id: crypto.randomUUID(),
        email,
        passwordHash: await hashPassword({ password: parsed.data.password }),
      })
      return apiData({ message: `Created ${email}` }, { status: 201 })
    },
  })
})
