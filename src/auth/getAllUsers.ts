import { db } from '@/db/db'
import { unstable_cache } from 'next/cache'
import { userCacheTag } from './user-cache'

const getAllUsersRaw = async () => {
  const users = await db.query.users.findMany({
    with: {
      accounts: true,
    },
  })
  return users
}

export const getAllUsersCached = unstable_cache(
  getAllUsersRaw,
  ['getAllUsers'],
  {
    tags: [userCacheTag],
  },
)
