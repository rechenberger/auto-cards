import { getIsAdmin } from '@/auth/getIsAdmin'
import { getMyUserIdOrLogin } from '@/auth/getMyUser'
import { GameMatchBoard } from '@/components/game/GameMatchBoard'
import { ItemCardGrid } from '@/components/game/ItemCardGrid'
import { LeaderboardRankCardByGame } from '@/components/game/LeaderboardRankCardByGame'
import { TitleScreen } from '@/components/game/TitleScreen'
import { TimeAgo } from '@/components/simple/TimeAgo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game } from '@/db/schema-zod'
import { GAME_VERSION, LIMIT_GAME_OVERVIEW, NO_OF_ROUNDS } from '@/game/config'
import { ActionButton } from '@/super-action/button/ActionButton'
import { and, desc, eq } from 'drizzle-orm'
import { Zap } from 'lucide-react'
import { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { Fragment } from 'react'
import { z } from 'zod'
import { NewGameButton } from './NewGameButton'
import { NewLiveMatchButton } from './NewLiveMatchButton'

export const metadata: Metadata = {
  title: 'Games',
}

export default async function Page() {
  const userId = await getMyUserIdOrLogin()

  const gamesRaw = await db.query.game.findMany({
    where: and(
      eq(schema.game.userId, userId),
      eq(schema.game.version, GAME_VERSION),
    ),
    orderBy: desc(schema.game.updatedAt),
    limit: LIMIT_GAME_OVERVIEW,
  })
  const games = z.array(Game).parse(gamesRaw)
  const isAdmin = await getIsAdmin()

  return (
    <>
      <TitleScreen />
      <div className="flex flex-col md:flex-row gap-2 items-center">
        <div className="font-bold flex-1">My Games</div>
        {/* {isAdmin && (
          <ActionButton
            variant={'outline'}
            hideIcon
            askForConfirmation={{
              title: 'Delete All Games',
              content:
                'Are you sure you want to delete all games of all players?',
            }}
            action={async () => {
              'use server'
              await db
                .delete(schema.game)
                // .where(eq(schema.games.userId, userId))
                .execute()
              revalidatePath('/game', 'layout')
            }}
          >
            Delete All
          </ActionButton>
        )} */}
        <div className="flex flex-row gap-2">
          <NewLiveMatchButton variant={'outline'} />
          <NewGameButton gameMode="collector" variant={'outline'} />
          <NewGameButton />
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Fragment key={game.id}>
            <Card className="flex flex-col gap-4 p-4 items-center">
              {game.gameMode === 'shopper' && (
                <div className="flex flex-row gap-4 justify-center items-center">
                  <GameMatchBoard game={game} />
                  {game.data.roundNo >= NO_OF_ROUNDS - 1 && (
                    <LeaderboardRankCardByGame gameId={game.id} tiny />
                  )}
                </div>
              )}
              {game.gameMode === 'collector' && (
                <div className="">Endless Mode</div>
              )}
              <ItemCardGrid items={game.data.currentLoadout.items} />
              {game.liveMatchId && (
                <div className="text-sm opacity-60 flex flex-row items-center gap-1">
                  <Zap className="size-3" />
                  <span>Live Match</span>
                </div>
              )}
              {game.updatedAt && (
                <div className="text-sm opacity-60">
                  <TimeAgo date={new Date(game.updatedAt)} />
                </div>
              )}
              <div className="flex flex-row justify-end gap-2">
                {isAdmin && (
                  <ActionButton
                    variant={'outline'}
                    hideIcon
                    askForConfirmation
                    action={async () => {
                      'use server'
                      await db
                        .delete(schema.game)
                        .where(eq(schema.game.id, game.id))
                        .execute()
                      revalidatePath('/game', 'layout')
                    }}
                  >
                    Delete
                  </ActionButton>
                )}
                <Link href={`/game/${game.id}`}>
                  <Button>Resume Game</Button>
                </Link>
              </div>
            </Card>
          </Fragment>
        ))}
      </div>
    </>
  )
}
