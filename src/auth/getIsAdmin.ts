import { notFound } from 'next/navigation'
import { getMyUser } from './getMyUser'

export const isDev = () => process.env.NODE_ENV === 'development'

type IsAdminOptions = {
  allowDev?: boolean
}

export const getIsAdmin = async (options: IsAdminOptions = {}) => {
  const user = await getMyUser()
  if (!!user?.isAdmin) {
    return true
  }
  if (options.allowDev && isDev()) {
    return true
  }
  return false
}

export const throwIfNotAdmin = async (options: IsAdminOptions = {}) => {
  if (!(await getIsAdmin(options))) {
    throw new Error('Forbidden: You are not an admin.')
  }
}

export const notFoundIfNotAdmin = async (options: IsAdminOptions = {}) => {
  if (!(await getIsAdmin(options))) {
    notFound()
  }
}
