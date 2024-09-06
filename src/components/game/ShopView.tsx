import { Game } from '@/db/schema-zod'
import { FightButton } from './FightButton'
import { LiveMatchCard } from './LiveMatchCard'
import { LoadoutDisplay } from './LoadoutDisplay'
import { MatchReportResetter } from './MatchReportResetter'
import { Shop } from './Shop'

export const ShopView = ({ game }: { game: Game }) => {
  return (
    <>
      <div className="flex-1 flex flex-col gap-4">
        <Shop game={game} />
        <div className="flex-1" />
        <div className="self-center">
          {game.liveMatchId ? (
            <LiveMatchCard liveMatchId={game.liveMatchId} inGame={true} />
          ) : (
            <FightButton game={game} />
          )}
        </div>
        <div className="flex-1" />
        <LoadoutDisplay
          game={game}
          loadout={game.data.currentLoadout}
          canSell
        />
        <MatchReportResetter />
      </div>
    </>
  )
}
