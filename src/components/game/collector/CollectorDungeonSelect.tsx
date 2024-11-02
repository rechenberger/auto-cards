import { getIsAdmin } from '@/auth/getIsAdmin'
import { SimpleTooltipButton } from '@/components/simple/SimpleTooltipButton'
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
import { streamToast } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { ActionWrapper } from '@/super-action/button/ActionWrapper'
import { capitalCase } from 'change-case'
import { range } from 'lodash-es'
import { ChevronDown, Info } from 'lucide-react'
import { Fragment } from 'react'
import { RarityWeightsDisplay } from '../RarityWeightsDisplay'
import { fightDungeon } from './fightDungeon'

export const CollectorDungeonSelect = async ({ game }: { game: Game }) => {
  const accesses = game.data.dungeonAccesses
  if (!accesses) return null

  const isAdmin = await getIsAdmin({ allowDev: true })

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-2 justify-center">
        {accesses.map((access, idx) => {
          const dungeon = getDungeon(access.name)

          const selectableMin = access.levelMin
          const selectableMax = Math.min(access.levelMax, dungeon.levelMax)
          const selectable = selectableMin < selectableMax

          const rewards = dungeon.rewards({ level: access.levelCurrent })
          const isLast = idx === accesses.length - 1

          return (
            <Fragment key={access.name}>
              <Card className="p-4 flex flex-col gap-2 xl:min-w-96">
                <CardDescription className="flex-1">
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
                <div className="flex flex-row gap-1">
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
                  <SimpleTooltipButton
                    variant="ghost"
                    size="icon"
                    icon={<Info />}
                    tooltip={
                      <RarityWeightsDisplay
                        rarityWeights={rewards.rarityWeights}
                      />
                    }
                  />
                  <div className="flex-1" />
                  <ActionButton
                    variant="outline"
                    className="self-end"
                    catchToast
                    command={{
                      label: `Enter ${capitalCase(access.name)}`,
                      shortcut: isLast
                        ? {
                            key: 'n',
                          }
                        : undefined,
                    }}
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
                  {isAdmin && (
                    <ActionButton
                      variant="outline"
                      className="self-end"
                      catchToast
                      command={{
                        label: `Turbo ${capitalCase(access.name)}`,
                      }}
                      hideButton
                      action={async () => {
                        'use server'
                        return gameAction({
                          gameId: game.id,
                          checkUpdatedAt: game.updatedAt,
                          streamRevalidate: true,
                          action: async ({ ctx }) => {
                            const dungeonName = access.name
                            const noOfDungeons = 100
                            let completed = 0
                            let failed = 0
                            for (let i = 0; i < noOfDungeons; i++) {
                              const access =
                                ctx.game.data.dungeonAccesses?.find(
                                  (a) => a.name === dungeonName,
                                )
                              if (!access) return
                              console.log('fightDungeon')
                              await fightDungeon({
                                game: ctx.game,
                                dungeonInput: {
                                  name: access.name,
                                  level: access.levelCurrent,
                                  seed: createSeed(),
                                },
                              })
                              while (ctx.game.data.dungeon) {
                                const dungeonData = ctx.game.data.dungeon
                                const roomIdx = dungeonData.room.idx + 1
                                console.log('fightDungeon', i, roomIdx)
                                await fightDungeon({
                                  game: ctx.game,
                                  roomIdx: dungeonData.room.idx + 1,
                                })
                                const { status } = dungeonData
                                if (status !== 'active') {
                                  if (status === 'completed') {
                                    completed++
                                  } else if (status === 'failed') {
                                    failed++
                                  }
                                  ctx.game.data.dungeon = undefined
                                }
                              }
                            }
                            streamToast({
                              title: `${capitalCase(access.name)}`,
                              description: `${
                                completed + failed
                              } of ${noOfDungeons} done, ${completed} completed, ${failed} failed`,
                            })
                          },
                        })
                      }}
                    >
                      Turbo
                    </ActionButton>
                  )}
                </div>
              </Card>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
