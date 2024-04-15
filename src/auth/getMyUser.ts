import { db } from '@/db/db'
import { users } from '@/db/schema-auth'
import { eq } from 'drizzle-orm'
import { omit } from 'lodash-es'
import { auth } from './auth'
import { loginWithRedirect } from './loginWithRedirect'

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

export const getIsLoggedIn = async () => {
  const userId = await getMyUserId()
  return !!userId
}

export const getMyUser = async () => {
  const userId = await getMyUserId()
  if (!userId) return null
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  const parsed = omit(user, ['passwordHash'])
  return parsed
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
