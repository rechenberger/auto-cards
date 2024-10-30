import { Game } from '@/db/schema-zod'
import { CollectorDungeonMatch } from './CollectorDungeonMatch'
import { CollectorOverview } from './CollectorOverview'
import { CollectorStartingOptionsSelect } from './CollectorStartingOptionsSelect'

export const CollectorGamePage = ({
  game,
  searchParams,
}: {
  game: Game
  searchParams: Promise<Record<string, string>>
}) => {
  if (!game.data.currentLoadout.items.length) {
    return <CollectorStartingOptionsSelect game={game} />
  }
  if (game.data.dungeon) {
    return <CollectorDungeonMatch game={game} />
  }
  return <CollectorOverview game={game} searchParams={searchParams} />
}
