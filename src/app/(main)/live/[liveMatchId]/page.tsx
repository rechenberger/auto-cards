'use client'

import { LiveMatchCard } from '@/components/game/LiveMatchCard'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams<{ liveMatchId: string }>()
  return (
    <div className="self-center">
      <LiveMatchCard liveMatchId={params.liveMatchId} inGame={false} />
    </div>
  )
}
