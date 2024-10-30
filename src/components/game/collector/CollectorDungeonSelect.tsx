import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Game } from '@/db/schema-zod'
import { setDungeonAccess } from '@/game/dungeons/DungeonAccess'
import { getDungeon } from '@/game/dungeons/allDungeons'
import { gameAction } from '@/game/gameAction'
import { createSeed } from '@/game/seed'
import { fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/super-action/button/ActionButton'
import { ActionWrapper } from '@/super-action/button/ActionWrapper'
import { capitalCase } from 'change-case'
import { range } from 'lodash-es'
import { ChevronDown } from 'lucide-react'
import { Fragment } from 'react'
import { fightDungeon } from './fightDungeon'

export const CollectorDungeonSelect = async ({ game }: { game: Game }) => {
  const accesses = game.data.dungeonAccesses
  if (!accesses) return null

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-2 justify-center">
        {accesses.map((access) => {
          const dungeon = getDungeon(access.name)

          const selectableMin = access.levelMin
          const selectableMax = Math.min(access.levelMax, dungeon.levelMax)
          const selectable = selectableMin < selectableMax

          return (
            <Fragment key={access.name}>
              <Card className="p-4 flex flex-col gap-2 xl:min-w-96">
                <CardDescription>
                  Level {access.levelCurrent}{' '}
                  {dungeon.levelMax ? ` of ${dungeon.levelMax}` : ''}
                </CardDescription>
                <div className="flex flex-row gap-2">
                  <CardTitle className="flex-1">
                    {capitalCase(access.name)}
                  </CardTitle>
                </div>
                <CardDescription
                  className={(cn(fontLore.className), 'max-w-80')}
                >
                  {dungeon.description}
                </CardDescription>
                <div className="flex-1" />
                <div className="flex flex-row">
                  {selectable && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          Level {access.levelCurrent}
                          <ChevronDown />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {range(selectableMin, selectableMax + 1).map(
                          (level) => {
                            return (
                              <Fragment key={level}>
                                <ActionWrapper
                                  action={async () => {
                                    'use server'
                                    return gameAction({
                                      gameId: game.id,
                                      checkUpdatedAt: game.updatedAt,
                                      action: async ({ ctx }) => {
                                        setDungeonAccess({
                                          game: ctx.game,
                                          dungeonAccess: {
                                            ...access,
                                            levelCurrent: level,
                                          },
                                        })
                                      },
                                    })
                                  }}
                                >
                                  <DropdownMenuItem>
                                    Level {level}
                                  </DropdownMenuItem>
                                </ActionWrapper>
                              </Fragment>
                            )
                          },
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <div className="flex-1" />
                  <ActionButton
                    variant="outline"
                    className="self-end"
                    catchToast
                    action={async () => {
                      'use server'
                      return gameAction({
                        gameId: game.id,
                        checkUpdatedAt: game.updatedAt,
                        action: async ({ ctx }) => {
                          await fightDungeon({
                            game: ctx.game,
                            dungeonInput: {
                              name: access.name,
                              level: access.levelCurrent,
                              seed: createSeed(),
                            },
                          })
                        },
                      })
                    }}
                  >
                    Enter
                  </ActionButton>
                </div>
              </Card>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
