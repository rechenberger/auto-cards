'use client'

import { toast } from '@/components/ui/use-toast'
import { Button } from '../ui/button'

export const LiveMatchCopyButton = ({
  liveMatchId,
}: {
  liveMatchId: string
}) => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/live/${liveMatchId}`
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          navigator.clipboard.writeText(url)
          toast({
            title: 'Copied to clipboard',
            description: url,
          })
        }}
      >
        Copy Invite Link
      </Button>
    </>
  )
}
