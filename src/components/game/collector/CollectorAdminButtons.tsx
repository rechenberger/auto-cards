import { Game } from '@/db/schema-zod'
import { gameAction } from '@/game/gameAction'
import { allRarities } from '@/game/rarities'
import { createSeed, rngItem } from '@/game/seed'
import { ActionButton } from '@/super-action/button/ActionButton'
import { DoorOpen, Plus, Swords, Trash } from 'lucide-react'
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
                ctx.game.data.currentLoadout.items.push(item)
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
                ctx.game.data.currentLoadout.items = [
                  {
                    name: 'hero',
                  },
                ]
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
                ctx.game.data.dungeon = {
                  name: 'adventureTrail',
                  level: 1,
                  room: 0,
                }
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
