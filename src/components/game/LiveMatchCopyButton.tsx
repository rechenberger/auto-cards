'use client'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { Copy } from 'lucide-react'

export const LiveMatchCopyButton = ({
  liveMatchId,
}: {
  liveMatchId: string
}) => (
  <Button
    type="button"
    variant="outline"
    className="min-h-11 touch-manipulation"
    onClick={async () => {
      const url = `${window.location.origin}/live/${liveMatchId}`
      try {
        await navigator.clipboard.writeText(url)
        toast({ title: 'Copied invite link', description: url })
      } catch {
        toast({
          variant: 'destructive',
          title: 'Could not copy invite link',
          description: url,
        })
      }
    }}
  >
    <Copy className="mr-2 size-4" aria-hidden="true" />
    Copy Invite Link
  </Button>
)
