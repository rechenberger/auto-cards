'use client'

import {
  useAdminMigrationStatus,
  useRunAdminMigration,
} from '@/client/api/admin'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database } from 'lucide-react'
import { ConfirmActionButton } from './ConfirmActionButton'

export const AdminMigrationsClient = () => {
  const status = useAdminMigrationStatus()
  const run = useRunAdminMigration()

  if (status.isPending) return <QueryLoading label="Checking data repairs…" />
  if (status.error) {
    return (
      <QueryError error={status.error} retry={() => void status.refetch()} />
    )
  }

  const remaining = status.data.leaderboardMissingGameId
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Data repairs</h1>
        <p className="text-sm text-muted-foreground">
          Reviewed schema migrations run through the CLI. This page only hosts
          idempotent legacy data backfills.
        </p>
      </div>
      <Alert>
        <Database className="size-4" aria-hidden="true" />
        <AlertTitle>Production-safe workflow</AlertTitle>
        <AlertDescription>
          Backfills report their remaining rows and can be retried safely.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            Leaderboard game IDs
            <Badge variant={remaining ? 'destructive' : 'secondary'}>
              {remaining} missing
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <p className="text-sm text-muted-foreground">
            Copies the owning game ID from each referenced loadout where
            possible.
          </p>
          <ConfirmActionButton
            disabled={!remaining || run.isPending}
            title="Run leaderboard backfill?"
            description={`There are ${remaining} rows without a game ID. Rows whose loadout has no game remain untouched.`}
            confirmLabel="Run backfill"
            onConfirm={() =>
              run.mutateAsync({ type: 'backfill-leaderboard-game-id' })
            }
          >
            {remaining ? 'Backfill game IDs' : 'Nothing to backfill'}
          </ConfirmActionButton>
          {run.error && (
            <p className="text-sm text-destructive" role="alert">
              {run.error.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
