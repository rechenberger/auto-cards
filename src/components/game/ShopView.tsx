import { Game } from '@/db/schema-zod'
import { FightButton } from './FightButton'
import { LoadoutDisplay } from './LoadoutDisplay'
import { Shop } from './Shop'

export const ShopView = ({ game }: { game: Game }) => {
  return (
    <>
      <div className="flex-1 flex flex-col gap-4">
        <Shop game={game} />
        <div className="flex-1" />
        <div className="self-center">
          <FightButton game={game} />
        </div>
        <div className="flex-1" />
        <LoadoutDisplay game={game} loadout={game.data.currentLoadout} />
      </div>
    </>
  )
}
