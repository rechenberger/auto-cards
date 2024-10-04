import { db } from '@/db/db'
import { apiKeys, users } from '@/db/schema'
import { and, eq, gte, isNull, or } from 'drizzle-orm'

export async function getMyUserFromApiKey(apiKey: string) {
  const dbApiKey = await db.query.apiKeys.findFirst({
    where: and(
      eq(apiKeys.key, apiKey),
      or(gte(apiKeys.expiresAt, new Date()), isNull(apiKeys.expiresAt)),
    ),
  })

  if (!dbApiKey) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, dbApiKey.userId),
  })
  return user
}

export const getMyUserFromApiKeyOrThrow = async (apiKey: string) => {
  const user = await getMyUserFromApiKey(apiKey)
  if (!user) {
    throw new Error('Invalid API key')
  }
  return user
}

export const authenticateWithApiKey = async (req: Request) => {
  const apiKey = req.headers.get('x-api-key')

  if (!apiKey) {
    throw new Error('API key not found')
  }

  const user = await getMyUserFromApiKeyOrThrow(apiKey)

  return user
}
