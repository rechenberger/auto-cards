import { notFound } from 'next/navigation'
import { getMyUser } from './getMyUser'

export const isDev = () => process.env.NODE_ENV === 'development'

export const getIsAdmin = async () => {
  const user = await getMyUser()
  return !!user?.isAdmin
}

export const throwIfNotAdmin = async () => {
  if (!(await getIsAdmin())) {
    throw new Error('Forbidden: You are not an admin.')
  }
}

export const notFoundIfNotAdmin = async () => {
  if (!(await getIsAdmin())) {
    notFound()
  }
}
