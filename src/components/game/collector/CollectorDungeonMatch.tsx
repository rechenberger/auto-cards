import { getUserCached } from '@/auth/getMyUser'
import { Game, User } from '@/db/schema-zod'
import { getDungeon } from '@/game/dungeons'
import { fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { Fragment } from 'react'
import { ItemCard } from '../ItemCard'
import { MatchViewFake } from '../MatchViewFake'
import { CollectorAdminButtons } from './CollectorAdminButtons'
import { NextRoundButtonCollector } from './NextRoundButtonCollector'

export const CollectorDungeonMatch = async ({ game }: { game: Game }) => {
  if (!game.data.dungeon) {
    return null
  }
  const user: User | null = await getUserCached({ userId: game.userId })
  const dungeon = getDungeon(game.data.dungeon.name)

  const room = game.data.dungeon.room
  return (
    <>
      <div className="flex flex-col gap-4 items-center">
        <div className={cn(fontLore.className, 'text-xl')}>
          {capitalCase(dungeon.name)}
        </div>
        <CollectorAdminButtons game={game} />
        {/* <SimpleDataCard data={game.data.dungeon} /> */}
        {room.type === 'reward' && (
          <>
            <div>Reward</div>
            <div
              className={cn(
                'flex-1 flex flex-row flex-wrap gap-1 justify-center items-start',
              )}
            >
              {room.items.map((item, idx) => {
                return (
                  <Fragment key={idx}>
                    <div className="relative">
                      <ItemCard itemData={item} tooltipOnClick />
                    </div>
                  </Fragment>
                )
              })}
            </div>
            <NextRoundButtonCollector game={game} />
          </>
        )}
      </div>
      {room.type === 'fight' && (
        <MatchViewFake
          game={game}
          seed={game.data.dungeon.room.seed}
          sides={[
            {
              loadoutData: game.data.currentLoadout,
              user: user ?? undefined,
            },
            {
              loadoutData: room.loadout,
            },
          ]}
        />
      )}
    </>
  )
}
