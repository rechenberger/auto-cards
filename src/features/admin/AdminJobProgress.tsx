'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AdminJobDto } from '@/contracts/admin'
import { CheckCircle2, CircleDashed, LoaderCircle, XCircle } from 'lucide-react'

export const AdminJobProgress = ({ jobs }: { jobs: AdminJobDto[] }) => {
  if (!jobs.length) return null
  const completed = jobs.filter((job) => job.status === 'completed').length
  const failed = jobs.filter((job) => job.status === 'failed').length
  const settled = completed + failed
  const percent = (settled / jobs.length) * 100

  return (
    <Alert variant={failed ? 'destructive' : 'default'}>
      {settled === jobs.length ? (
        failed ? (
          <XCircle className="size-4" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="size-4" aria-hidden="true" />
        )
      ) : (
        <LoaderCircle
          className="size-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      <AlertTitle className="flex flex-wrap items-center gap-2">
        Background jobs
        <Badge variant="outline" className="tabular-nums">
          {settled}/{jobs.length}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-3 space-y-3" role="status">
        <Progress
          value={percent}
          aria-label={`${Math.round(percent)}% complete`}
        />
        <div className="grid gap-1 text-xs">
          {jobs.map((job) => (
            <div key={job.id} className="flex min-h-6 items-center gap-2">
              {job.status === 'completed' ? (
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
              ) : job.status === 'failed' ? (
                <XCircle className="size-3.5" aria-hidden="true" />
              ) : job.status === 'running' ? (
                <LoaderCircle
                  className="size-3.5 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <CircleDashed className="size-3.5" aria-hidden="true" />
              )}
              <span className="font-mono">{job.type}</span>
              <span className="text-muted-foreground">{job.status}</span>
              {job.error && <span>{job.error}</span>}
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  )
}
