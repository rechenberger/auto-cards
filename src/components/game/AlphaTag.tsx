'use client'

import { SimpleTooltip } from '@/components/simple/SimpleTooltip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Info } from 'lucide-react'

export const AlphaTag = () => {
  return (
    <>
      <SimpleTooltip
        tooltip={
          <>
            <div>👨‍💻 This game mode is still in development.</div>
            <br />
            <div>🐛 Things may break.</div>
            <div>💨 Things may get deleted.</div>
            <div>❤️‍🩹 Dont get too attached to your collection (just yet).</div>
            <br />
            <div>🙏 Very thankful for any feedback.</div>
          </>
        }
      >
        <Button
          type="button"
          variant="vanilla"
          size="vanilla"
          aria-label="Collector mode development status"
          className={cn(
            'min-h-11 touch-manipulation rounded-full px-2.5 py-0.5 text-xs font-semibold inline-flex items-center',
            'bg-green-700 text-green-300',
            'font-mono',
          )}
        >
          <div>In Development</div>
          <Info className="size-3 ml-1" />
        </Button>
      </SimpleTooltip>
    </>
  )
}
