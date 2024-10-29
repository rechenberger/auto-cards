import { Game } from '@/db/schema-zod'
import { gameAction } from '@/game/gameAction'
import { allRarities } from '@/game/rarities'
import { createSeed, rngItem } from '@/game/seed'
import { ActionButton } from '@/super-action/button/ActionButton'
import { DoorOpen, Plus, Swords, Trash } from 'lucide-react'
import { addCollectorItem } from './addCollectorItem'
import { fightDungeon } from './fightDungeon'
import { generateCollectorItem } from './generateCollectorItem'

export const CollectorAdminButtons = ({ game }: { game: Game }) => {
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
              },
            })
          }}
        />
        <ActionButton
          icon={<Trash />}
          variant="outline"
          action={async () => {
            'use server'
            return gameAction({
              gameId: game.id,
              action: async ({ ctx }) => {
                ctx.game.data.currentLoadout.items = []
                ctx.game.data.inventory = {
                  items: [],
                }
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
                    seed: ctx.game.data.seed,
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
      </div>
    </>
  )
}
