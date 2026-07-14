'use client'

import { LoginForm } from '@/auth/LoginForm'
import { normalizeClientRedirect } from '@/auth/clientRedirect'
import { useMe } from '@/client/api/auth'
import { QueryLoading } from '@/components/api/QueryState'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const LoginPageClient = ({ redirectUrl }: { redirectUrl?: string }) => {
  const me = useMe()
  const router = useRouter()

  useEffect(() => {
    if (me.data) router.replace(normalizeClientRedirect(redirectUrl))
  }, [me.data, redirectUrl, router])

  if (me.isLoading || me.data) return <QueryLoading label="Loading account…" />

  return (
    <Card className="self-center w-full max-w-md flex flex-col gap-4">
      <CardContent className="flex flex-col gap-4 pt-6">
        <LoginForm redirectUrl={redirectUrl} />
      </CardContent>
    </Card>
  )
}
