import { ItemCardGrid } from '@/components/game/ItemCardGrid'
import { TimeAgo } from '@/components/simple/TimeAgo'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { getBotName } from '@/game/botName'
import { NO_OF_ROUNDS } from '@/game/config'
import { getUserName } from '@/game/getUserName'
import { desc, eq } from 'drizzle-orm'
import { Metadata } from 'next'
import { Fragment } from 'react'

export const metadata: Metadata = {
  title: 'Leaderboard',
}

const getLoadouts = async () => {
  return await db.query.loadout.findMany({
    orderBy: desc(schema.loadout.createdAt),
    limit: 20,
    with: {
      user: true,
    },
    where: eq(schema.loadout.roundNo, NO_OF_ROUNDS - 1),
  })
}

export default async function Page() {
  const loadouts = await getLoadouts()
  return (
    <>
      <div className="grid grid-cols-[auto_auto_1fr] gap-4 items-center">
        {loadouts.map((loadout, idx) => {
          const name = loadout.user
            ? getUserName({ user: loadout.user })
            : getBotName({ seed: loadout.id })

          return (
            <Fragment key={loadout.id}>
              <div className="text-xl">#{idx + 1}</div>
              <div>
                <div>{name}</div>
                {loadout.createdAt && (
                  <div className="text-sm opacity-60">
                    <TimeAgo date={new Date(loadout.createdAt)} />
                  </div>
                )}
              </div>
              <div className="flex justify-self-start">
                <ItemCardGrid
                  items={loadout.data.items}
                  className="justify-start"
                  // themeId={loadout.user?.themeId ?? undefined}
                />
              </div>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
