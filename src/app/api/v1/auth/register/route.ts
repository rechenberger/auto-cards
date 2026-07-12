import { RegisterRequest, RegisterResponse } from '@/contracts/auth-api'
import { db } from '@/db/db'
import { users } from '@/db/schema-auth'
import { hashPassword } from '@/auth/password'
import { badRequest, conflict } from '@/server/api/ApiError'
import { apiData, apiRoute } from '@/server/api/route'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export const POST = apiRoute(async (_context, request: Request) => {
  const body: unknown = await request.json().catch(() => null)
  const parsed = RegisterRequest.safeParse(body)
  if (!parsed.success) {
    throw badRequest('Invalid registration', parsed.error.flatten())
  }

  const email = parsed.data.email.toLowerCase()
  const existingUser = await db.query.users.findFirst({
    columns: { id: true },
    where: sql`lower(${users.email}) = ${email}`,
  })
  if (existingUser) throw conflict('Email is already registered')

  await db.insert(users).values({
    id: crypto.randomUUID(),
    email,
    passwordHash: await hashPassword({ password: parsed.data.password }),
  })

  return apiData(RegisterResponse.parse({ email }), { status: 201 })
})
