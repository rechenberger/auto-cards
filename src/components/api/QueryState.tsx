'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoaderCircle, RefreshCw } from 'lucide-react'

export const QueryLoading = ({ label = 'Loading…' }: { label?: string }) => (
  <div
    className="flex min-h-48 flex-col items-center justify-center gap-3"
    role="status"
  >
    <LoaderCircle className="size-6 animate-spin motion-reduce:animate-none" />
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
)

export const QueryError = ({
  error,
  retry,
}: {
  error: unknown
  retry?: () => void
}) => (
  <Card className="mx-auto flex max-w-lg flex-col items-center gap-4 p-6 text-center">
    <div>
      <div className="font-semibold">Something went wrong</div>
      <div className="mt-1 text-sm text-muted-foreground">
        {error instanceof Error
          ? error.message
          : 'The request could not be loaded.'}
      </div>
    </div>
    {retry && (
      <Button
        type="button"
        variant="outline"
        onClick={retry}
        className="min-h-11"
      >
        <RefreshCw className="mr-2 size-4" aria-hidden="true" />
        Try again
      </Button>
    )}
  </Card>
)
