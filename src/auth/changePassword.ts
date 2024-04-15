import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { eq } from 'drizzle-orm'
import { hashPassword } from './password'

export const changePassword = async ({
  userId,
  password,
}: {
  userId: string
  password: string
}) => {
  const passwordHash = await hashPassword({ password })
  await db
    .update(schema.users)
    .set({
      passwordHash,
    })
    .where(eq(schema.users.id, userId))
    .execute()
}
