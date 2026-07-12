'use client'

import { useAdminJobs, useQueueSimulations } from '@/client/api/admin'
import { useCatalog, useMeta } from '@/client/api/catalog'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SimulationInputDto, SimulationResultDto } from '@/contracts/admin'
import { getSimulationStartForRound } from '@/game/simulationConfig'
import { FlaskConical, LoaderCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminJobProgress } from './AdminJobProgress'
import { SimulationDisplay } from './SimulationDisplay'

export const AdminSimulationClient = () => {
  const meta = useMeta()
  const catalog = useCatalog()
  const queue = useQueueSimulations()
  const [jobIds, setJobIds] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const jobs = useAdminJobs(jobIds, { includeResult: true })

  const inputs = useMemo<SimulationInputDto[]>(() => {
    const finalRound = Math.max(0, (meta.data?.numberOfRounds ?? 10) - 1)
    const base = SimulationInputDto.parse({
      noOfBots: 20,
      noOfRepeats: 1,
      simulationSeed: ['lol'],
      ...getSimulationStartForRound(finalRound),
      noOfBotsSelected: 10,
      noOfSelectionRounds: 30,
    })
    return [base, { ...base, simulationSeed: ['rofl'] }]
  }, [meta.data?.numberOfRounds])

  const run = async () => {
    const result = await queue.mutateAsync({ inputs })
    setJobIds(result.jobs.map((job) => job.id))
    setDialogOpen(true)
  }

  if (meta.isPending || catalog.isPending) {
    return <QueryLoading label="Loading simulation rules…" />
  }
  if (meta.error || catalog.error) {
    return (
      <QueryError
        error={meta.error ?? catalog.error}
        retry={() => {
          void meta.refetch()
          void catalog.refetch()
        }}
      />
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Balance simulation</h1>
        <p className="text-sm text-muted-foreground">
          Variants run as durable jobs against ruleset{' '}
          {meta.data.rulesetVersion}.
        </p>
      </div>
      <SimpleDataCard data={inputs} />
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          className="min-h-11 touch-manipulation"
          disabled={queue.isPending}
          onClick={() => void run()}
        >
          {queue.isPending ? (
            <LoaderCircle
              className="mr-2 size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <FlaskConical className="mr-2 size-4" aria-hidden="true" />
          )}
          {queue.isPending ? 'Queueing…' : 'Run simulation'}
        </Button>
        {!!jobIds.length && (
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => setDialogOpen(true)}
          >
            View current run
          </Button>
        )}
      </div>
      {queue.error && <QueryError error={queue.error} />}
      <AdminJobProgress jobs={jobs.data?.jobs ?? []} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-none">
          <DialogHeader>
            <DialogTitle>Simulation results</DialogTitle>
            <DialogDescription>
              The dialog can be closed while jobs continue in the background.
            </DialogDescription>
          </DialogHeader>
          <AdminJobProgress jobs={jobs.data?.jobs ?? []} />
          <div className="flex gap-4 overflow-x-auto pb-2">
            {jobIds.map((jobId, index) => {
              const job = jobs.data?.jobs.find(
                (candidate) => candidate.id === jobId,
              )
              const result = SimulationResultDto.safeParse(job?.result)
              if (!result.success) return null
              return (
                <div key={jobId} className="min-w-[min(90vw,52rem)] flex-1">
                  <SimulationDisplay
                    input={inputs[index] ?? inputs[0]!}
                    simulationResult={result.data}
                    allItems={catalog.data.items}
                  />
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
