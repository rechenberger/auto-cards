import { getMyUserIdOrLogin } from '@/auth/getMyUser'
import { Button } from '@/components/ui/button'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game } from '@/db/schema-zod'
import { desc } from 'drizzle-orm'
import Link from 'next/link'
import { NewGameButton } from './game/NewGameButton'

export const LatestGame = async () => {
  const userId = await getMyUserIdOrLogin()
  const game = await db.query.game
    .findFirst({
      where: (s, { eq }) => eq(s.userId, userId),
      orderBy: desc(schema.game.updatedAt),
    })
    .then(Game.parse)

  if (game) {
    return (
      <>
        <div className="flex flex-col xl:flex-row gap-2">
          <NewGameButton variant={'outline'} />
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
