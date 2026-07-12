'use client'

import { useMe } from '@/client/api/auth'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const useRequiredMe = () => {
  const me = useMe()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!me.isLoading && !me.isError && me.data === null) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent(pathname || '/')}`,
      )
    }
  }, [me.data, me.isError, me.isLoading, pathname, router])

  return me
}
