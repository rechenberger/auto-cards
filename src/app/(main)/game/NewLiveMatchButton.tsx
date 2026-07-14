'use client'

import { useCreateLiveMatch } from '@/client/api/liveMatches'
import { Button, ButtonProps } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export const NewLiveMatchButton = ({
  variant,
}: {
  variant?: ButtonProps['variant']
}) => {
  const router = useRouter()
  const createLiveMatch = useCreateLiveMatch()

  return (
    <Button
      type="button"
      variant={variant}
      className="min-h-11 touch-manipulation"
      disabled={createLiveMatch.isPending}
      onClick={() =>
        createLiveMatch.mutate(undefined, {
          onSuccess: (liveMatch) => router.push(`/live/${liveMatch.id}`),
        })
      }
    >
      {createLiveMatch.isPending ? 'Starting…' : 'Start Live Match'}
    </Button>
  )
}
