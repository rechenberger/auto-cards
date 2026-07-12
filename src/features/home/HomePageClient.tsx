'use client'

import { UserButton } from '@/auth/UserButton'
import { NewGameButton } from '@/app/(main)/game/NewGameButton'
import { useMeta } from '@/client/api/catalog'
import { useGames } from '@/client/api/games'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { Button } from '@/components/ui/button'
import { MainLogo } from '@/components/layout/MainLogo'
import Link from 'next/link'

export const HomePageClient = () => {
  const meta = useMeta()
  const games = useGames(Boolean(meta.data?.viewer))

  if (meta.isLoading) return <QueryLoading />
  if (meta.error)
    return <QueryError error={meta.error} retry={() => meta.refetch()} />

  const latest = games.data?.games[0]
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-8 mb-20 lg:mb-80">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-background/90 p-4 shadow-sm backdrop-blur-sm">
        <MainLogo size="big" />
        {meta.data?.viewer ? (
          games.isLoading ? (
            <QueryLoading label="Loading latest game…" />
          ) : games.error ? (
            <QueryError error={games.error} retry={() => games.refetch()} />
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <NewGameButton variant="outline" />
              {latest && (
                <Button asChild className="min-h-11">
                  <Link href={`/game/${latest.game.id}`}>Resume Game</Link>
                </Button>
              )}
            </div>
          )
        ) : (
          <UserButton />
        )}
      </div>
    </div>
  )
}
