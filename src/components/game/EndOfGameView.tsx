import { NewGameButton } from '@/app/(main)/game/NewGameButton'
import { Game } from '@/db/schema-zod'
import { fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { GameMatchBoard } from './GameMatchBoard'
import { LoadoutDisplay } from './LoadoutDisplay'
import { TitleScreen } from './TitleScreen'

export const EndOfGameView = ({ game }: { game: Game }) => {
  return (
    <>
      <div className="flex-1 flex flex-col gap-4 items-center justify-center text-center">
        {/* <div className="text-6xl">GG</div>
        <div className="text-2xl">Game Over</div> */}
        <div className="p-4 bg-background/80 rounded-lg flex flex-col gap-4">
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
