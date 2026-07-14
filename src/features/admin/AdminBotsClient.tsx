'use client'

import {
  adminBotsKey,
  useAdminBots,
  useAdminJobs,
  useQueueBotGeneration,
} from '@/client/api/admin'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { TinyItem } from '@/components/game/TinyItem'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { countifyItems } from '@/game/countifyItems'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { AdminJobProgress } from './AdminJobProgress'
import { ConfirmActionButton } from './ConfirmActionButton'

export const AdminBotsClient = () => {
  const bots = useAdminBots()
  const queue = useQueueBotGeneration()
  const queryClient = useQueryClient()
  const [jobIds, setJobIds] = useState<string[]>([])
  const jobs = useAdminJobs(jobIds)
  const handledJobs = useRef('')

  useEffect(() => {
    const current = jobs.data?.jobs ?? []
    if (
      current.length > 0 &&
      current.every((job) => ['completed', 'failed'].includes(job.status))
    ) {
      const key = current.map((job) => `${job.id}:${job.status}`).join(',')
      if (handledJobs.current !== key) {
        handledJobs.current = key
        void queryClient.invalidateQueries({ queryKey: adminBotsKey })
      }
    }
  }, [jobs.data?.jobs, queryClient])

  const enqueue = async (roundNos: number[]) => {
    const result = await queue.mutateAsync({ roundNos })
    handledJobs.current = ''
    setJobIds(result.jobs.map((job) => job.id))
  }

  if (bots.isPending) return <QueryLoading label="Loading bot pool…" />
  if (bots.error) {
    return <QueryError error={bots.error} retry={() => void bots.refetch()} />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Bot pool</h1>
          <p className="text-sm text-muted-foreground">
            Ruleset {bots.data.rulesetVersion}. Generation runs as durable jobs.
          </p>
        </div>
        <ConfirmActionButton
          disabled={queue.isPending}
          title="Regenerate every bot round?"
          description="Each round is queued independently and atomically replaces its anonymous bot loadouts when complete."
          confirmLabel="Queue all rounds"
          onConfirm={() =>
            enqueue(bots.data.rounds.map((round) => round.roundNo))
          }
        >
          Generate all
        </ConfirmActionButton>
      </div>

      {queue.error && <QueryError error={queue.error} />}
      <AdminJobProgress jobs={jobs.data?.jobs ?? []} />

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Round</TableHead>
              <TableHead>Gold</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Loadouts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bots.data.rounds.map((round) => (
              <TableRow key={round.roundNo}>
                <TableCell className="tabular-nums">{round.roundNo}</TableCell>
                <TableCell className="tabular-nums">{round.gold}</TableCell>
                <TableCell>
                  <ConfirmActionButton
                    variant="outline"
                    disabled={queue.isPending}
                    title={`Regenerate round ${round.roundNo}?`}
                    description="The existing versioned anonymous loadouts for this round are replaced after simulation succeeds."
                    confirmLabel="Queue generation"
                    onConfirm={() => enqueue([round.roundNo])}
                  >
                    Generate
                  </ConfirmActionButton>
                </TableCell>
                <TableCell>
                  <div className="flex min-w-80 flex-col gap-2">
                    {round.loadouts.length ? (
                      round.loadouts.map((loadout) => (
                        <div key={loadout.id} className="flex flex-wrap gap-1">
                          {countifyItems(loadout.data.items).map((item) => (
                            <TinyItem key={item.name} itemData={item} />
                          ))}
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No bots for this round
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
