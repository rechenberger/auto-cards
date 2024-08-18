import { getIsAdmin } from '@/auth/getIsAdmin'
import { getMyUserIdOrLogin } from '@/auth/getMyUser'
import { MatchView } from '@/components/game/MatchView'
import { ShopView } from '@/components/game/ShopView'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { getGameFromDb } from '@/game/getGame'
import { eq } from 'drizzle-orm'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Game',
}

export default async function Page({
  params: { gameId },
}: {
  params: { gameId: string }
}) {
  const userId = await getMyUserIdOrLogin()

  const game = await getGameFromDb({ id: gameId })
  if (game.userId !== userId) {
    const isAdmin = await getIsAdmin({ allowDev: true })
    if (!isAdmin) {
      return notFound()
    }
  }

  const loadouts = await db.query.loadout.findMany({
    where: eq(schema.loadout.gameId, gameId),
    with: {
      primaryMatchParticipation: {
        with: {
          match: true,
        },
      },
    },
  })
  // .then(Loadout.array().parse)

  const currentMatch = loadouts.find((l) => l.roundNo === game.data.roundNo)
    ?.primaryMatchParticipation?.match

  if (currentMatch) {
    return <MatchView game={game} match={currentMatch} />
  }

  return (
    <>
      <ShopView game={game} />
    </>
  )
}
