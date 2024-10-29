import { db } from '@/db/db'
import { users } from '@/db/schema-auth'
import { eq } from 'drizzle-orm'
import { omit } from 'lodash-es'
import { unstable_cache } from 'next/cache'
import { auth } from './auth'
import { loginWithRedirect } from './loginWithRedirect'
import { userCacheTag } from './user-cache'

export const getMyUserId = async () => {
  const session = await auth()
  return session?.user?.id
}

export const getMyUserIdOrThrow = async () => {
  const userId = await getMyUserId()
  if (!userId) {
    throw new Error('User not found')
  }
  return userId
}

export const getMyUserIdOrLogin = async () => {
  const userId = await getMyUserId()
  if (!userId) {
    await loginWithRedirect()
    throw new Error('User not found')
  }
  return userId
}

export const getIsLoggedIn = async () => {
  const user = await getMyUser()
  return !!user
}

const getUserRaw = async ({ userId }: { userId: string }) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  if (!user) return null
  const parsed = omit(user, ['passwordHash'])
  return parsed
}

export const getUserCached = unstable_cache(getUserRaw, ['getUser'], {
  tags: [userCacheTag],
})

export const getMyUser = async () => {
  const userId = await getMyUserId()
  if (!userId) return null
  return getUserCached({ userId })
}

export const getMyUserOrThrow = async () => {
  const user = await getMyUser()
  if (!user) throw new Error('User not found')
  return user
}

export const getMyUserOrLogin = async () => {
  const user = await getMyUser()
  if (!user) {
    await loginWithRedirect()
    throw new Error('User not found')
  }
  return user
}
