import { getMyUserIdOrLogin } from '@/auth/getMyUser'
import { Button } from '@/components/ui/button'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game } from '@/db/schema-zod'
import { GAME_VERSION } from '@/game/config'
import { GameMode } from '@/game/gameMode'
import { and, desc, eq } from 'drizzle-orm'
import Link from 'next/link'
import { NewGameButton } from './game/NewGameButton'

export const LatestGame = async ({ gameMode }: { gameMode?: GameMode }) => {
  const userId = await getMyUserIdOrLogin()
  const game = await db.query.game
    .findFirst({
      where: and(
        eq(schema.game.userId, userId),
        eq(schema.game.version, GAME_VERSION),
        gameMode ? eq(schema.game.gameMode, gameMode) : undefined,
      ),
      orderBy: desc(schema.game.updatedAt),
    })
    .then(Game.safeParse)
    .then((game) => (game.success ? game.data : null))

  if (game) {
    return (
      <>
        <div className="flex flex-col lg:flex-row gap-2">
          <NewGameButton variant={'outline'} gameMode={gameMode} />
          <Button asChild>
            <Link href={`/game/${game.id}`}>Resume Game</Link>
          </Button>
        </div>
      </>
    )
  } else {
    return (
      <>
        <NewGameButton />
      </>
    )
  }
}
