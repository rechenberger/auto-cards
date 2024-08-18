import { MatchView } from '@/components/game/MatchView'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { eq } from 'drizzle-orm'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Match',
}

export default async function Page({
  params: { matchId },
}: {
  params: { matchId: string }
}) {
  const match = await db.query.match.findFirst({
    where: eq(schema.match.id, matchId),
  })

  if (!match) {
    return notFound()
  }

  return (
    <>
      <MatchView match={match} />
    </>
  )
}
