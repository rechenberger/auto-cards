import { Game } from '@/db/schema-zod'
import { gameAction } from '@/game/gameAction'
import { createSeed } from '@/game/seed'
import { ActionButton } from '@/super-action/button/ActionButton'
import { Plus, Trash } from 'lucide-react'
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
                const item = await generateCollectorItem({
                  game,
                  seed: [createSeed()],
                  rarity: 'rare',
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
      </div>
    </>
  )
}
