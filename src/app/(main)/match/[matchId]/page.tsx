'use client'

import { MatchReplayPage } from '@/components/game/MatchReplayPage'
import { useParams } from 'next/navigation'

export default function Page() {
  const { matchId } = useParams<{ matchId: string }>()
  return <MatchReplayPage matchId={matchId} />
}
