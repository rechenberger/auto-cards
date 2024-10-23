import { LiveMatchCard } from '@/components/game/LiveMatchCard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Match',
}

export default async function Page({
  params,
}: {
  params: Promise<{ liveMatchId: string }>
}) {
  const { liveMatchId } = await params
  return (
    <>
      <div className="self-center">
        <LiveMatchCard liveMatchId={liveMatchId} inGame={false} />
      </div>
    </>
  )
}
