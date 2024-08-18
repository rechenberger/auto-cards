import { NewGameButton } from '@/app/(main)/game/NewGameButton'
import { Game } from '@/db/schema-zod'
import { GameMatchBoard } from './GameMatchBoard'
import { LoadoutDisplay } from './LoadoutDisplay'

export const EndOfGameView = ({ game }: { game: Game }) => {
  return (
    <>
      <div className="flex-1 flex flex-col gap-4 items-center justify-center">
        <div className="text-6xl">GG</div>
        <div className="text-2xl">Game Over</div>
        <GameMatchBoard game={game} />
        <div className="my-8">
          <LoadoutDisplay game={game} loadout={game.data.currentLoadout} />
        </div>
        <NewGameButton variant={'outline'} />
      </div>
    </>
  )
}
