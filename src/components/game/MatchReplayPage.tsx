'use client'

import { ClientApiError, fetchApi } from '@/client/api/fetchApi'
import { MetaResponse } from '@/contracts/meta'
import { MatchReplayResponse } from '@/contracts/replay'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'
import { MatchReplayView } from './MatchReplayView'

type ReplayState =
  | { status: 'loading' }
  | {
      status: 'ready'
      replay: MatchReplayResponse
      meta: MetaResponse | null
    }
  | { status: 'error'; error: unknown }

const isNotReplayable = (error: unknown) => {
  if (!(error instanceof ClientApiError)) return false
  if (!error.details || typeof error.details !== 'object') return false
  return (
    'reason' in error.details && error.details.reason === 'MATCH_NOT_REPLAYABLE'
  )
}

export const MatchReplayPage = ({ matchId }: { matchId: string }) => {
  const [retry, setRetry] = useState(0)
  const [state, setState] = useState<ReplayState>({ status: 'loading' })

  useEffect(() => {
    const abortController = new AbortController()
    setState({ status: 'loading' })

    void Promise.all([
      fetchApi(
        `/api/v1/matches/${encodeURIComponent(matchId)}/replay`,
        MatchReplayResponse,
        { signal: abortController.signal },
      ),
      fetchApi('/api/v1/meta', MetaResponse, {
        signal: abortController.signal,
      }).catch(() => null),
    ])
      .then(([replay, meta]) => {
        if (!abortController.signal.aborted) {
          setState({ status: 'ready', replay, meta })
        }
      })
      .catch((error: unknown) => {
        if (!abortController.signal.aborted) {
          setState({ status: 'error', error })
        }
      })

    return () => abortController.abort()
  }, [matchId, retry])

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-80 items-center justify-center gap-2 text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" />
        Loading match…
      </div>
    )
  }

  if (state.status === 'error') {
    const notReplayable = isNotReplayable(state.error)
    const notFound =
      state.error instanceof ClientApiError && state.error.code === 'NOT_FOUND'
    const message =
      state.error instanceof Error
        ? state.error.message
        : 'The match could not be loaded.'

    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>
          {notReplayable ? 'Old Match' : notFound ? 'Match not found' : 'Error'}
        </AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          <span>
            {notReplayable
              ? 'Game has changed too much to replay this match'
              : message}
          </span>
          {!notReplayable && !notFound && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return <MatchReplayView replay={state.replay} meta={state.meta} />
}
