import { isDev } from '@/auth/dev'
import { Game } from '@/db/schema-zod'
import { setDungeonAccess } from '@/game/dungeons/DungeonAccess'
import { gameAction } from '@/game/gameAction'
import { allRarities } from '@/game/rarities'
import { createSeed, rngItem } from '@/game/seed'
import { ActionButton } from '@/super-action/button/ActionButton'
import { DoorOpen, Plus, Swords, Trash, Unlock } from 'lucide-react'
import { addCollectorItem } from './addCollectorItem'
import { fightDungeon } from './fightDungeon'
import { generateCollectorItem } from './generateCollectorItem'

export const CollectorAdminButtons = async ({ game }: { game: Game }) => {
  // const isAdmin = await getIsAdmin({ allowDev: true })
  // if (!isAdmin) return null
  if (!isDev()) return null

  return (
    <>
      <div className="flex flex-row gap-2">
        <ActionButton
          icon={<Plus />}
          variant="outline"
          action={async () => {
            'use server'
            return gameAction({
              gameId: game.id,
              action: async ({ ctx }) => {
                const noOfItems = 10
                for (let i = 0; i < noOfItems; i++) {
                  const rarity = rngItem({
                    seed: [createSeed()],
                    items: allRarities,
                  })
                  const item = await generateCollectorItem({
                    game,
                    seed: [createSeed()],
                    rarity,
                  })
                  await addCollectorItem({
                    game: ctx.game,
                    item,
                  })
                }
              },
            })
          }}
        />
        <ActionButton
          icon={<Trash />}
          variant="outline"
          askForConfirmation={{
            title: 'Reset Game?',
            content: 'Loose all items and start over?',
          }}
          action={async () => {
            'use server'
            return gameAction({
              gameId: game.id,
              action: async ({ ctx }) => {
                ctx.game.data.currentLoadout.items = []
                ctx.game.data.inventory = {
                  items: [],
                }
                ctx.game.data.dungeon = undefined
              },
            })
          }}
        />
        <ActionButton
          icon={<Swords />}
          variant="outline"
          action={async () => {
            'use server'
            return gameAction({
              gameId: game.id,
              action: async ({ ctx }) => {
                await fightDungeon({
                  game: ctx.game,
                  dungeonInput: {
                    name: 'adventureTrail',
                    level: 1,
                    seed: createSeed(),
                  },
                })
              },
            })
          }}
        />
        <ActionButton
          icon={<DoorOpen />}
          variant="outline"
          action={async () => {
            'use server'
            return gameAction({
              gameId: game.id,
              action: async ({ ctx }) => {
                ctx.game.data.dungeon = undefined
              },
            })
          }}
        />
        <ActionButton
          icon={<Unlock />}
          variant="outline"
          action={async () => {
            'use server'
            return gameAction({
              gameId: game.id,
              action: async ({ ctx }) => {
                setDungeonAccess({
                  game: ctx.game,
                  dungeonAccess: {
                    name: 'adventureTrail',
                    levelMin: 1,
                    levelMax: 100,
                    levelCurrent: 100,
                  },
                })
              },
            })
          }}
        />
      </div>
    </>
  )
}
