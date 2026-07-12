'use client'

import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { KeyRound, PersonStanding } from 'lucide-react'
import Link from 'next/link'
import { useRequiredMe } from './useRequiredMe'
import { ApiTokenManager } from './ApiTokenManager'

export const MePageClient = () => {
  const me = useRequiredMe()
  if (me.isLoading || me.data === null) {
    return <QueryLoading label="Loading account…" />
  }
  if (me.isError || !me.data) {
    return <QueryError error={me.error} retry={() => void me.refetch()} />
  }

  const user = me.data
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{user.displayName}</CardTitle>
          <CardDescription>Account settings</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <dl className="grid gap-4 text-sm sm:grid-cols-[9rem_1fr]">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="break-all">{user.email}</dd>
            <dt className="text-muted-foreground">Email status</dt>
            <dd>{user.emailVerified ? 'Verified' : 'Not verified'}</dd>
            <dt className="text-muted-foreground">Theme</dt>
            <dd className="capitalize">{user.themeId}</dd>
            <dt className="text-muted-foreground">Sign-in methods</dt>
            <dd>
              {[
                ...(user.hasPassword ? ['password'] : []),
                ...user.providers,
              ].join(', ') || 'Email link'}
            </dd>
          </dl>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              asChild
              variant="outline"
              className="min-h-11 touch-manipulation"
            >
              <Link href="/auth/change-username">
                <PersonStanding className="mr-2 size-4" aria-hidden="true" />
                Change username
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-11 touch-manipulation"
            >
              <Link href="/auth/change-password">
                <KeyRound className="mr-2 size-4" aria-hidden="true" />
                Change password
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <ApiTokenManager />
    </div>
  )
}
