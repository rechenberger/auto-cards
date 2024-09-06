import { Game } from '@/db/schema-zod'
import { getCraftingRecipesGame } from '@/game/getCraftingRecipesGame'
import { cn } from '@/lib/utils'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { CraftingList } from './CraftingList'

export const CraftingButton = async ({ game }: { game: Game }) => {
  const recipes = await getCraftingRecipesGame({ game })
  const countReady = recipes.filter((r) => r.hasAll).length
  const gameId = game.id

  return (
    <>
      <ActionButton
        variant="outline"
        catchToast
        hideIcon
        className="relative flex flex-row gap-2"
        action={async () => {
          'use server'
          return superAction(async () => {
            streamDialog({
              title: 'Crafting',
              className: 'max-w-3xl',
              content: (
                <>
                  <CraftingList game={game} />
                </>
              ),
            })
          })
        }}
      >
        Crafting
        {recipes.length > 0 && (
          <div
            className={cn(
              // 'absolute -top-2.5 -right-2.5',
              'size-5 text-center rounded-full  text-xs font-bold flex items-center justify-center',
              countReady > 0
                ? 'bg-primary text-primary-foreground'
                : 'bg-border text-primary-foreground',
            )}
          >
            {countReady || recipes.length}
          </div>
        )}
      </ActionButton>
    </>
  )
}
