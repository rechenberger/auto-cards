import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { userCacheTag } from './user-cache'

const getAllUsersRaw = async ({
  onlyAdmins,
}: { onlyAdmins?: boolean } = {}) => {
  const users = await db.query.users.findMany({
    with: {
      accounts: true,
    },
    where: onlyAdmins ? eq(schema.users.isAdmin, true) : undefined,
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
