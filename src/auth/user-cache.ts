import { revalidateTag } from 'next/cache'

export const userCacheTag = 'user'

export const revalidateUserCache = () => {
  revalidateTag(userCacheTag)
}
