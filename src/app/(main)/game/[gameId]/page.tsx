import { getIsAdmin } from '@/auth/getIsAdmin'
import { getMyUserIdOrLogin } from '@/auth/getMyUser'
import { EndOfGameView } from '@/components/game/EndOfGameView'
import { MatchView } from '@/components/game/MatchView'
import { ShopView } from '@/components/game/ShopView'
import { CollectorGamePage } from '@/components/game/collector/CollectorGamePage'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { GAME_VERSION, NO_OF_ROUNDS } from '@/game/config'
import { getGameFromDb } from '@/game/getGame'
import { eq } from 'drizzle-orm'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Game',
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ gameId: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { gameId } = await params
  const userId = await getMyUserIdOrLogin()

  const game = await getGameFromDb({ id: gameId })
  if (game.userId !== userId) {
    const isAdmin = await getIsAdmin({ allowDev: true })
    if (!isAdmin) {
      return notFound()
    }
  }

  if (game.version < GAME_VERSION) {
    return <EndOfGameView game={game} oldVersion />
  }

  if (game.gameMode === 'collector') {
    return <CollectorGamePage game={game} searchParams={searchParams} />
  }

  if (game.data.roundNo >= NO_OF_ROUNDS) {
    return <EndOfGameView game={game} />
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
