import { Game } from '@/db/schema-zod'
import { CollectorDungeonMatch } from './CollectorDungeonMatch'
import { CollectorOverview } from './CollectorOverview'

export const CollectorGamePage = ({
  game,
  searchParams,
}: {
  game: Game
  searchParams: Promise<Record<string, string>>
}) => {
  if (game.data.dungeon) {
    return <CollectorDungeonMatch game={game} />
  }
  return <CollectorOverview game={game} searchParams={searchParams} />
}
