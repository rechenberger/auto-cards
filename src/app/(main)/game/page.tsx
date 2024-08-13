import { getIsAdmin } from '@/auth/getIsAdmin'
import { getMyUserIdOrLogin } from '@/auth/getMyUser'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Game } from '@/db/GameData'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { ActionButton } from '@/super-action/button/ActionButton'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { Fragment } from 'react'
import { z } from 'zod'
import { NewGameButton } from './NewGameButton'

export default async function Page() {
  const userId = await getMyUserIdOrLogin()

  const gamesRaw = await db.query.games.findMany({
    // where: (s, { eq }) => eq(s.userId, userId),
  })
  const games = z.array(Game).parse(gamesRaw)
  const isAdmin = await getIsAdmin()

  return (
    <>
      <div className="flex flex-row gap-2 items-center">
        <div className="font-bold flex-1">My Games</div>
        {isAdmin && (
          <ActionButton
            variant={'outline'}
            askForConfirmation
            action={async () => {
              'use server'
              await db
                .delete(schema.games)
                // .where(eq(schema.games.userId, userId))
                .execute()
              revalidatePath('/game', 'layout')
            }}
          >
            Delete All
          </ActionButton>
        )}
        <NewGameButton />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Fragment key={game.id}>
            <Card>
              <CardHeader>
                <CardTitle>Game</CardTitle>
                <CardDescription>{game.id}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <SimpleDataCard
                  data={{
                    ...game.data,
                  }}
                />
                <div className="flex flex-row justify-end gap-2">
                  {game.userId === userId && (
                    <ActionButton
                      variant={'outline'}
                      askForConfirmation
                      action={async () => {
                        'use server'
                        await db
                          .delete(schema.games)
                          .where(eq(schema.games.id, game.id))
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
              </CardContent>
            </Card>
          </Fragment>
        ))}
      </div>
    </>
  )
}
