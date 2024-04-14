import { db } from '@/db/db'
import { users } from '@/db/schema-auth'
import { eq } from 'drizzle-orm'
import { auth } from './auth'

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
  const user = db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  return user
}

export const getMyUserOrThrow = async () => {
  const user = await getMyUser()
  if (!user) throw new Error('User not found')
  return user
}
