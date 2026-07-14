'use client'

import { UserButton } from '@/auth/UserButton'
import { NewGameButton } from '@/app/(main)/game/NewGameButton'
import { useMeta } from '@/client/api/catalog'
import { useGames } from '@/client/api/games'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { AlphaTag } from '@/components/game/AlphaTag'
import { TitleScreen } from '@/components/game/TitleScreen'
import { Button } from '@/components/ui/button'
import { fontHeading, fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export const EndlessLandingClient = () => {
  const meta = useMeta()
  const games = useGames(Boolean(meta.data?.viewer))
  if (meta.isLoading) return <QueryLoading />
  if (meta.error)
    return <QueryError error={meta.error} retry={() => meta.refetch()} />
  const latest = games.data?.games.find(
    (view) => view.game.gameMode === 'collector',
  )
  return (
    <>
      <div className="mb-20 flex flex-1 flex-col items-center justify-center py-8 lg:mb-80">
        <div className="flex flex-col items-center gap-2 rounded-lg bg-background/80 p-4 lg:gap-4">
          <div className="my-4 flex flex-col items-center">
            <AlphaTag />
            <h1 className={cn(fontHeading.className, 'mt-2 text-3xl')}>
              Endless Mode
            </h1>
            <p
              className={cn(
                fontLore.className,
                'text-center text-sm opacity-80',
              )}
            >
              Build your own collection of unique items.
              <br />
              Delve into increasingly difficult dungeons.
              <br />
              Legendary loot awaits.
            </p>
          </div>
          {meta.data?.viewer ? (
            <div className="flex flex-col gap-2 lg:flex-row">
              <NewGameButton variant="outline" gameMode="collector" />
              {latest && (
                <Button asChild>
                  <Link href={`/game/${latest.game.id}`}>
                    Resume Endless Game
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <UserButton />
          )}
        </div>
      </div>
      <TitleScreen />
    </>
  )
}
