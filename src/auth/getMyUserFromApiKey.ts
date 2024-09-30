import { db } from '@/db/db'
import { apiKeys } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function getMyUserFromApiKey(apiKey: string) {
  const user = await db.query.users.findFirst({
    with: {
      apiKeys: {
        where: eq(apiKeys.key, apiKey),
      },
    },
  })
  return user
}

export const getMyUserFromApiKeyOrThrow = async (apiKey: string) => {
  const user = await getMyUserFromApiKey(apiKey)
  if (!user) {
    throw new Error('User not found')
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
