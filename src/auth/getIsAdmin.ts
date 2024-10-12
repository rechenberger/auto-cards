import { notFound } from 'next/navigation'
import { isDev } from './dev'
import { getMyUser } from './getMyUser'

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
