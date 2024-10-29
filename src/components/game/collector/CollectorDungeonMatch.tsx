import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { Game } from '@/db/schema-zod'
import { getDungeon } from '@/game/dungeons'
import { fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { CollectorAdminButtons } from './CollectorAdminButtons'

export const CollectorDungeonMatch = ({ game }: { game: Game }) => {
  if (!game.data.dungeon) {
    return null
  }
  const dungeon = getDungeon(game.data.dungeon.name)
  return (
    <>
      <div className="flex flex-col gap-4 items-center">
        <div className={cn(fontLore.className, 'text-xl')}>
          {capitalCase(dungeon.name)}
        </div>
        <CollectorAdminButtons game={game} />
        <SimpleDataCard data={game.data.dungeon} />
      </div>
    </>
  )
}
