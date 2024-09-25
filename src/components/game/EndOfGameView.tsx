import { NewGameButton } from '@/app/(main)/game/NewGameButton'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game } from '@/db/schema-zod'
import { fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { desc, eq } from 'drizzle-orm'
import { GameMatchBoard } from './GameMatchBoard'
import { LeaderboardRankCard } from './LeaderboardRankCard'
import { LiveMatchResults } from './LiveMatchResults'
import { LoadoutDisplay } from './LoadoutDisplay'
import { TitleScreen } from './TitleScreen'

export const EndOfGameView = async ({
  game,
  oldVersion,
}: {
  game: Game
  oldVersion?: boolean
}) => {
  const loadout = await db.query.loadout.findFirst({
    where: eq(schema.loadout.gameId, game.id),
    orderBy: desc(schema.loadout.roundNo),
  })
  return (
    <>
      <div className="flex-1 flex flex-col gap-4 items-center justify-center text-center">
        {/* <div className="text-6xl">GG</div>
        <div className="text-2xl">Game Over</div> */}
        <div className="p-4 bg-background/80 rounded-lg flex flex-col gap-4">
          {oldVersion && (
            <div className="text-sm text-amber-500">Old Game Version</div>
          )}
          <div className={cn(fontLore.className, '')}>
            <div className="text-2xl font-bold">
              You will never be forgotten
            </div>
            <div className="text-xs opacity-60">
              unless I accidentally delete the database
            </div>
          </div>
          <GameMatchBoard game={game} />
        </div>
        {!oldVersion && game.liveMatchId && (
          <LiveMatchResults liveMatchId={game.liveMatchId} />
        )}
        {!oldVersion && loadout && <LeaderboardRankCard loadout={loadout} />}

        <div className="self-stretch flex flex-col gap-4">
          <LoadoutDisplay game={game} loadout={game.data.currentLoadout} />
        </div>
        <div />
        <NewGameButton variant={'outline'} />
      </div>
      <TitleScreen />
    </>
  )
}
