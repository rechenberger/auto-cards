import { db } from '@/db/db'
import { apiKeys } from '@/db/schema-auth'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export const createAPIKey = async ({
  userId,
  name,
  expiresAt,
}: {
  userId: string
  name: string
  expiresAt?: Date
}) => {
  const apiKey = await db
    .insert(apiKeys)
    .values({
      id: nanoid(),
      userId: userId,
      key: `ac_${nanoid(16)}`,
      name: name,
      expiresAt: expiresAt,
    })
    .returning({
      key: apiKeys.key,
    })

  return {
    key: apiKey[0].key,
  }
}
