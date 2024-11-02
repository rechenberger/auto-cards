import { SimpleTooltip } from '@/components/simple/SimpleTooltip'
import { Card } from '@/components/ui/card'
import { Game } from '@/db/schema-zod'
import { COLLECTOR_UPGRADE_COSTS_DIRECT } from '@/game/config'
import { gameAction } from '@/game/gameAction'
import { allRarityDefinitions } from '@/game/rarities'
import { cn } from '@/lib/utils'
import { streamToast } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import assert from 'assert'
import { capitalCase } from 'change-case'
import { filter, find, reverse } from 'lodash-es'
import { ArrowUp, Recycle } from 'lucide-react'
import { Fragment } from 'react'
import { ItemData } from '../ItemData'

export const CollectorSalvageButtons = ({
  game,
  itemsShown,
  loadoutItems,
}: {
  game: Game
  itemsShown: ItemData[]
  loadoutItems: ItemData[]
}) => {
  return (
    <>
      {' '}
      <div className="grid lg:grid-cols-5 gap-2">
        {reverse([...allRarityDefinitions]).map((rarity, idx) => {
          const itemIdsToSalvage = filter(
            itemsShown,
            (i) =>
              i.rarity === rarity.name &&
              !!i.id &&
              !i.favorite &&
              !find(loadoutItems, (li) => li.id === i.id),
          ).flatMap((i) => (i.id ? [i.id] : []))

          const originalIdx = allRarityDefinitions.length - idx - 1
          const nextRarity = allRarityDefinitions[originalIdx + 1]

          const amount = game.data.salvagedParts?.[rarity.name] ?? 0
          const upgrades = Math.floor(amount / COLLECTOR_UPGRADE_COSTS_DIRECT)

          return (
            <Fragment key={rarity.name}>
              <Card className="px-2 py-1 text-sm">
                <div
                  className={cn(
                    'flex flex-row gap-1 items-center',
                    rarity.textClass,
                  )}
                >
                  {!!nextRarity && (
                    <SimpleTooltip
                      tooltip={`Upgrade ${
                        upgrades * COLLECTOR_UPGRADE_COSTS_DIRECT
                      } ${capitalCase(
                        rarity.name,
                      )} Parts to ${upgrades} ${capitalCase(
                        nextRarity.name,
                      )} Parts`}
                    >
                      <ActionButton
                        variant={'ghost'}
                        disabled={upgrades <= 0}
                        size="sm"
                        className={cn(
                          'rounded-none first:rounded-l-md last:rounded-r-md',
                          'h-auto px-2 py-1',
                        )}
                        icon={<ArrowUp className="lg:-rotate-90" />}
                        catchToast
                        action={async () => {
                          'use server'
                          return gameAction({
                            gameId: game.id,
                            streamRevalidate: true,
                            action: async ({ ctx }) => {
                              const { salvagedParts } = ctx.game.data
                              assert(salvagedParts, 'salvagedParts not found')
                              const current = salvagedParts[rarity.name] ?? 0
                              const newAmount =
                                current -
                                upgrades * COLLECTOR_UPGRADE_COSTS_DIRECT
                              assert(newAmount >= 0, 'not enough parts')
                              salvagedParts[rarity.name] = newAmount
                              salvagedParts[nextRarity.name] =
                                (salvagedParts[nextRarity.name] ?? 0) + upgrades
                            },
                          })
                        }}
                      />
                    </SimpleTooltip>
                  )}
                  <div className="flex-1 truncate">
                    {capitalCase(rarity.name)} Parts
                  </div>
                  <div className="text-right">{amount}</div>
                  <ActionButton
                    variant={'ghost'}
                    disabled={!itemIdsToSalvage.length}
                    size="sm"
                    className={cn(
                      'rounded-none first:rounded-l-md last:rounded-r-md',
                      'h-auto px-2 py-1',
                    )}
                    icon={<Recycle />}
                    catchToast
                    askForConfirmation={{
                      title: `Salvage ${itemIdsToSalvage.length} ${rarity.name} items?`,
                      content: `This will only salvage items that are not equipped and not favorites.`,
                    }}
                    action={async () => {
                      'use server'
                      return gameAction({
                        gameId: game.id,
                        streamRevalidate: true,
                        action: async ({ ctx }) => {
                          const ids = itemIdsToSalvage

                          if (ctx.game.data.inventory) {
                            ctx.game.data.inventory.items =
                              ctx.game.data.inventory.items.filter(
                                (i) => !i.id || !ids.includes(i.id),
                              )
                          }
                          ctx.game.data.currentLoadout.items =
                            ctx.game.data.currentLoadout.items.filter(
                              (i) => !i.id || !ids.includes(i.id),
                            )

                          const salvagedParts =
                            ctx.game.data.salvagedParts ?? {}
                          salvagedParts[rarity.name] =
                            (salvagedParts[rarity.name] ?? 0) + ids.length
                          ctx.game.data.salvagedParts = salvagedParts

                          streamToast({
                            title: `Salvaged ${ids.length} ${rarity.name} items`,
                            description: `You got ${ids.length} ${rarity.name} parts.`,
                          })
                        },
                      })
                    }}
                  >
                    + {itemIdsToSalvage.length}
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
