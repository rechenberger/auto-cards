import { Game } from '@/db/schema-zod'
import { getCraftingRecipesGame } from '@/game/getCraftingRecipesGame'
import { cn } from '@/lib/utils'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { CraftingList } from './CraftingList'

export const CraftingButton = async ({ game }: { game: Game }) => {
  const recipes = await getCraftingRecipesGame({ game })
  const countReady = recipes.filter((r) => r.hasAll).length

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
              className: 'lg:max-w-5xl',
              content: (
                <>
                  <CraftingList
                    game={game}
                    className="w-min max-h-[calc(100vh-10rem)] overflow-auto"
                  />
                  <Button asChild variant="outline" className="mx-auto">
                    <Link href="/docs/crafting" target="_blank">
                      View All Recipes
                      <ExternalLink className="size-4 ml-2" />
                    </Link>
                  </Button>
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
