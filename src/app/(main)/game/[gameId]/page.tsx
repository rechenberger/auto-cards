'use client'

import { GamePageClient } from '@/features/game/GamePageClient'
import { useParams } from 'next/navigation'

export default function Page() {
  const { gameId } = useParams<{ gameId: string }>()
  return <GamePageClient gameId={gameId} />
}
