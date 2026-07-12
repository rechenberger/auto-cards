'use client'

import { UserButton } from '@/auth/UserButton'
import { NewGameButton } from '@/app/(main)/game/NewGameButton'
import { useMeta } from '@/client/api/catalog'
import { useGames } from '@/client/api/games'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { AlphaTag } from '@/components/game/AlphaTag'
import { Button } from '@/components/ui/button'
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
    <div className="flex flex-1 flex-col items-center justify-center py-8 mb-20 lg:mb-80">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-background/90 p-6 text-center">
        <AlphaTag />
        <h1 className="text-3xl font-bold">Endless Mode</h1>
        <p className="text-sm text-muted-foreground">
          Build your own collection of unique items.
          <br />
          Delve into increasingly difficult dungeons. Legendary loot awaits.
        </p>
        {meta.data?.viewer ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <NewGameButton variant="outline" gameMode="collector" />
            {latest && (
              <Button asChild className="min-h-11">
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
  )
}
