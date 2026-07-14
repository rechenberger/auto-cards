'use client'

import { cn } from '@/lib/utils'

export const MatchReplayBackground = ({ imageUrl }: { imageUrl?: string }) => {
  return (
    <div className="fixed -z-10 inset-0 bg-slate-950">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className={cn(
            'w-full h-full object-cover brightness-90 bg-transparent',
          )}
        />
      )}
      <div className="absolute inset-0 bg-black opacity-30" />
    </div>
  )
}
