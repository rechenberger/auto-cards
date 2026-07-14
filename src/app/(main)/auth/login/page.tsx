'use client'

import { LoginPageClient } from '@/auth/LoginPageClient'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  return (
    <LoginPageClient redirectUrl={searchParams.get('redirect') ?? undefined} />
  )
}
