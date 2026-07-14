'use client'

import { RarityWeightsDisplay } from '@/components/game/RarityWeightsDisplay'
import { SimpleTooltip } from '@/components/simple/SimpleTooltip'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GameViewDto } from '@/contracts/game-api'
import { getDungeon } from '@/game/dungeons/allDungeons'
import { fontLore } from '@/lib/fonts'
import { capitalCase } from 'change-case'
import { ChevronDown, Info } from 'lucide-react'
import {
  CollectorCommandButton,
  CollectorCommandHandler,
} from './CollectorCommandButton'

export const CollectorDungeonSelect = ({
  view,
  onCommand,
  pending,
}: {
  view: GameViewDto
  onCommand: CollectorCommandHandler
  pending: boolean
}) => {
  const accesses = view.game.data.dungeonAccesses ?? []
  if (!accesses.length) return null

  return (
    <div className="flex flex-col justify-center gap-2 xl:flex-row">
      {accesses.map((access, index) => {
        const dungeon = getDungeon(access.name)
        const selectableMax = Math.min(access.levelMax, dungeon.levelMax)
        const levels = Array.from(
          { length: selectableMax - access.levelMin + 1 },
          (_, levelIndex) => access.levelMin + levelIndex,
        )
        const rewards = dungeon.rewards({ level: access.levelCurrent })

        return (
          <Card
            key={access.name}
            className="flex flex-col gap-2 p-4 xl:min-w-96"
          >
            <CardDescription className="flex-1 tabular-nums">
              Level {access.levelCurrent}
              {dungeon.levelMax ? ` of ${dungeon.levelMax}` : ''}
            </CardDescription>
            <CardTitle>{capitalCase(access.name)}</CardTitle>
            <CardDescription className={`${fontLore.className} max-w-80`}>
              {dungeon.description}
            </CardDescription>
            <div className="flex-1" />
            <div className="flex min-h-11 flex-row items-center gap-1">
              {levels.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 touch-manipulation"
                      disabled={pending}
                    >
                      Level {access.levelCurrent}
                      <ChevronDown className="ml-2 size-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {levels.map((level) => (
                      <DropdownMenuItem
                        key={level}
                        className="min-h-11 cursor-pointer"
                        disabled={pending}
                        onSelect={() =>
                          void onCommand({
                            type: 'set-dungeon-level',
                            dungeonName: access.name,
                            level,
                          })
                        }
                      >
                        Level {level}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <SimpleTooltip
                tooltip={
                  <RarityWeightsDisplay rarityWeights={rewards.rarityWeights} />
                }
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11"
                  aria-label={`Reward chances for ${capitalCase(access.name)}`}
                >
                  <Info className="size-4" aria-hidden="true" />
                </Button>
              </SimpleTooltip>
              <div className="flex-1" />
              <CollectorCommandButton
                variant="outline"
                className="self-end"
                command={{
                  type: 'enter-dungeon',
                  dungeonName: access.name,
                }}
                onCommand={onCommand}
                pending={pending}
                shortcut={index === accesses.length - 1 ? 'n' : undefined}
                accessibleLabel={`Enter ${capitalCase(access.name)}`}
              >
                Enter
              </CollectorCommandButton>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
