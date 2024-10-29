import { getUserCached } from '@/auth/getMyUser'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { Game, User } from '@/db/schema-zod'
import { getDungeon } from '@/game/dungeons'
import { fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { MatchViewFake } from '../MatchViewFake'
import { CollectorAdminButtons } from './CollectorAdminButtons'

export const CollectorDungeonMatch = async ({ game }: { game: Game }) => {
  if (!game.data.dungeon) {
    return null
  }
  const user: User | null = await getUserCached({ userId: game.userId })
  const dungeon = getDungeon(game.data.dungeon.name)

  const roomLoadout = game.data.dungeon.room.loadout
  return (
    <>
      <div className="flex flex-col gap-4 items-center">
        <div className={cn(fontLore.className, 'text-xl')}>
          {capitalCase(dungeon.name)}
        </div>
        <CollectorAdminButtons game={game} />
        <SimpleDataCard data={game.data.dungeon} />
      </div>
      {roomLoadout && (
        <MatchViewFake
          game={game}
          seed={game.data.dungeon.room.seed}
          sides={[
            {
              loadoutData: game.data.currentLoadout,
              user: user ?? undefined,
            },
            {
              loadoutData: roomLoadout,
            },
          ]}
        />
      )}
    </>
  )
}
