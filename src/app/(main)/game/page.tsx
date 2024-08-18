import { getIsAdmin } from '@/auth/getIsAdmin'
import { getMyUserIdOrLogin } from '@/auth/getMyUser'
import { GameMatchBoard } from '@/components/game/GameMatchBoard'
import { ItemCard } from '@/components/game/ItemCard'
import { TitleScreen } from '@/components/game/TitleScreen'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game } from '@/db/schema-zod'
import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import { ActionButton } from '@/super-action/button/ActionButton'
import { eq } from 'drizzle-orm'
import { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { Fragment } from 'react'
import { z } from 'zod'
import { NewGameButton } from './NewGameButton'

export const metadata: Metadata = {
  title: 'Games',
}

export default async function Page() {
  const userId = await getMyUserIdOrLogin()

  const gamesRaw = await db.query.game.findMany({
    where: (s, { eq }) => eq(s.userId, userId),
  })
  const games = z.array(Game).parse(gamesRaw)
  const isAdmin = await getIsAdmin()

  return (
    <>
      <TitleScreen />
      <div className="flex flex-row gap-2 items-center">
        <div className="font-bold flex-1">My Games</div>
        {isAdmin && (
          <ActionButton
            variant={'outline'}
            hideIcon
            askForConfirmation
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
        )}
        <NewGameButton />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Fragment key={game.id}>
            <Card className="flex flex-col gap-4 p-4 items-center">
              <GameMatchBoard game={game} />
              <ItemGrid items={game.data.currentLoadout.items} />
              <div className="flex-1" />
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

const ItemGrid = async ({ items }: { items: { name: string }[] }) => {
  const betterItems = countifyItems(await orderItems(items))
  return (
    <div className="flex flex-row flex-wrap gap-1 justify-center items-center">
      {betterItems.map((item, idx) => {
        return (
          <Fragment key={idx}>
            <div className="relative">
              <ItemCard name={item.name} count={item.count} size={'80'} />
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
