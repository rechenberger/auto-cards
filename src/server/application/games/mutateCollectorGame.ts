import {
  CollectorCommand,
  CollectorCommandResult,
} from '@/contracts/collector-api'
import { Game } from '@/db/schema-zod'
import {
  getPossibleCollectorAspects,
  addCollectorItem,
  generateCollectorItem,
} from '@/game/collector/items'
import { createCollectorStartingItems } from '@/game/collector/startingOptions'
import { fightCollectorDungeon } from '@/game/collector/dungeon'
import { setDungeonAccess } from '@/game/dungeons/DungeonAccess'
import { getDungeon } from '@/game/dungeons/allDungeons'
import { allRarities, allRarityDefinitions } from '@/game/rarities'
import {
  COLLECTOR_ASPECT_PRECISION,
  COLLECTOR_UPGRADE_COSTS,
  COLLECTOR_UPGRADE_COSTS_DIRECT,
} from '@/game/rules'
import { createSeed, rngFloat, rngItem } from '@/game/seed'
import { invalidCommand } from '@/server/api/ApiError'
import { capitalCase } from 'change-case'
import { floor } from 'lodash-es'

const requireAdmin = (isAdmin: boolean) => {
  if (!isAdmin) throw invalidCommand('Admin access required')
}

const requireInventoryItem = ({
  game,
  itemId,
}: {
  game: Game
  itemId: string
}) => {
  const item = game.data.inventory?.items.find(
    (candidate) => candidate.id === itemId,
  )
  if (!item) throw invalidCommand('Collector item not found')
  return item
}

const updateItemCopies = ({
  game,
  itemId,
  update,
}: {
  game: Game
  itemId: string
  update: (
    item: NonNullable<Game['data']['inventory']>['items'][number],
  ) => void
}) => {
  const updated = new Set<object>()
  for (const item of [
    ...(game.data.inventory?.items ?? []),
    ...game.data.currentLoadout.items,
  ]) {
    if (item.id === itemId && !updated.has(item)) {
      update(item)
      updated.add(item)
    }
  }
}

export const mutateCollectorGame = async ({
  game,
  command,
  isAdmin,
  seed = createSeed,
}: {
  game: Game
  command: CollectorCommand
  isAdmin: boolean
  seed?: () => string
}): Promise<CollectorCommandResult> => {
  switch (command.type) {
    case 'choose-starter': {
      if (game.data.currentLoadout.items.length) {
        throw invalidCommand('A collector starter has already been selected')
      }
      const items = createCollectorStartingItems(command.starterId)
      game.data.currentLoadout.items = items
      game.data.inventory = {
        items: items.filter((item) => item.id).map((item) => ({ ...item })),
      }
      return {
        type: 'starter-selected',
        message: `Started as ${capitalCase(command.starterId)}`,
      }
    }

    case 'toggle-loadout-item': {
      const item = requireInventoryItem({ game, itemId: command.itemId })
      const equipped = game.data.currentLoadout.items.some(
        (candidate) => candidate.id === command.itemId,
      )
      game.data.currentLoadout.items = equipped
        ? game.data.currentLoadout.items.filter(
            (candidate) => candidate.id !== command.itemId,
          )
        : [...game.data.currentLoadout.items, { ...item }]
      return { type: equipped ? 'item-unequipped' : 'item-equipped' }
    }

    case 'toggle-favorite-item': {
      const item = requireInventoryItem({ game, itemId: command.itemId })
      const favorite = !item.favorite
      updateItemCopies({
        game,
        itemId: command.itemId,
        update: (candidate) => {
          candidate.favorite = favorite
        },
      })
      return { type: favorite ? 'item-favorited' : 'item-unfavorited' }
    }

    case 'salvage-item': {
      const item = requireInventoryItem({ game, itemId: command.itemId })
      if (!item.rarity) throw invalidCommand('This item cannot be salvaged')
      game.data.inventory!.items = game.data.inventory!.items.filter(
        (candidate) => candidate.id !== command.itemId,
      )
      game.data.currentLoadout.items = game.data.currentLoadout.items.filter(
        (candidate) => candidate.id !== command.itemId,
      )
      game.data.salvagedParts ??= {}
      game.data.salvagedParts[item.rarity] =
        (game.data.salvagedParts[item.rarity] ?? 0) + 1
      return {
        type: 'item-salvaged',
        message: `Salvaged ${capitalCase(item.name)} for 1 ${item.rarity} part`,
      }
    }

    case 'upgrade-item': {
      const item = requireInventoryItem({ game, itemId: command.itemId })
      const rarity = item.rarity
      if (!rarity) throw invalidCommand('This item cannot be upgraded')
      const nextRarity = allRarityDefinitions[allRarities.indexOf(rarity) + 1]
      if (!nextRarity) throw invalidCommand('This item is fully upgraded')

      const currentParts = game.data.salvagedParts?.[rarity] ?? 0
      if (currentParts < COLLECTOR_UPGRADE_COSTS) {
        throw invalidCommand('Not enough salvaged parts')
      }
      const possibleAspects = getPossibleCollectorAspects(
        item,
        game.version,
      ).filter(
        (aspect) =>
          !item.aspects?.some((current) => current.name === aspect.name),
      )
      if (!possibleAspects.length) {
        throw invalidCommand('No new aspect is available for this item')
      }

      const randomSeed = [seed()]
      const aspect = rngItem({ seed: randomSeed, items: possibleAspects })
      const newAspect = {
        name: aspect.name,
        rnd: floor(rngFloat({ seed: randomSeed }), COLLECTOR_ASPECT_PRECISION),
      }
      game.data.salvagedParts![rarity] = currentParts - COLLECTOR_UPGRADE_COSTS
      updateItemCopies({
        game,
        itemId: command.itemId,
        update: (candidate) => {
          candidate.aspects = [...(candidate.aspects ?? []), newAspect]
          candidate.rarity = nextRarity.name
        },
      })
      return {
        type: 'item-upgraded',
        message: `Upgraded ${capitalCase(item.name)} with ${capitalCase(
          aspect.name,
        )}`,
        details: { itemId: command.itemId, aspect: aspect.name },
      }
    }

    case 'convert-parts': {
      const rarityIndex = allRarities.indexOf(command.rarity)
      const nextRarity = allRarityDefinitions[rarityIndex + 1]
      if (!nextRarity)
        throw invalidCommand('Legendary parts cannot be converted')
      const current = game.data.salvagedParts?.[command.rarity] ?? 0
      const upgrades = Math.floor(current / COLLECTOR_UPGRADE_COSTS_DIRECT)
      if (!upgrades) throw invalidCommand('Not enough parts to convert')
      game.data.salvagedParts ??= {}
      game.data.salvagedParts[command.rarity] =
        current - upgrades * COLLECTOR_UPGRADE_COSTS_DIRECT
      game.data.salvagedParts[nextRarity.name] =
        (game.data.salvagedParts[nextRarity.name] ?? 0) + upgrades
      return {
        type: 'parts-converted',
        message: `Converted parts into ${upgrades} ${nextRarity.name} part${
          upgrades === 1 ? '' : 's'
        }`,
      }
    }

    case 'salvage-unprotected': {
      const equippedIds = new Set(
        game.data.currentLoadout.items.flatMap((item) =>
          item.id ? [item.id] : [],
        ),
      )
      const ids = new Set(
        (game.data.inventory?.items ?? [])
          .filter(
            (item) =>
              item.rarity === command.rarity &&
              item.id &&
              !item.favorite &&
              !equippedIds.has(item.id),
          )
          .flatMap((item) => (item.id ? [item.id] : [])),
      )
      if (!ids.size)
        throw invalidCommand('There are no unprotected items to salvage')
      game.data.inventory!.items = game.data.inventory!.items.filter(
        (item) => !item.id || !ids.has(item.id),
      )
      game.data.currentLoadout.items = game.data.currentLoadout.items.filter(
        (item) => !item.id || !ids.has(item.id),
      )
      game.data.salvagedParts ??= {}
      game.data.salvagedParts[command.rarity] =
        (game.data.salvagedParts[command.rarity] ?? 0) + ids.size
      return {
        type: 'items-salvaged',
        message: `Salvaged ${ids.size} ${command.rarity} item${
          ids.size === 1 ? '' : 's'
        }`,
      }
    }

    case 'set-dungeon-level': {
      if (game.data.dungeon)
        throw invalidCommand('Exit the active dungeon first')
      const access = game.data.dungeonAccesses?.find(
        (candidate) => candidate.name === command.dungeonName,
      )
      const dungeon = getDungeon(command.dungeonName)
      if (
        !access ||
        command.level < access.levelMin ||
        command.level > Math.min(access.levelMax, dungeon.levelMax)
      ) {
        throw invalidCommand('Dungeon level is not unlocked')
      }
      setDungeonAccess({
        game,
        dungeonAccess: { ...access, levelCurrent: command.level },
      })
      return { type: 'dungeon-level-selected' }
    }

    case 'enter-dungeon': {
      if (game.data.dungeon) throw invalidCommand('A dungeon is already active')
      const access = game.data.dungeonAccesses?.find(
        (candidate) => candidate.name === command.dungeonName,
      )
      if (!access) throw invalidCommand('No access to dungeon')
      await fightCollectorDungeon({
        game,
        dungeonInput: {
          name: access.name,
          level: access.levelCurrent,
          seed: seed(),
        },
      })
      return { type: 'dungeon-entered' }
    }

    case 'advance-dungeon': {
      const dungeon = game.data.dungeon
      if (!dungeon) throw invalidCommand('No active dungeon')
      if (dungeon.status === 'active') {
        await fightCollectorDungeon({ game, roomIdx: dungeon.room.idx + 1 })
        return { type: 'dungeon-room-advanced' }
      }
      game.data.dungeon = undefined
      return { type: 'dungeon-exited' }
    }

    case 'admin-generate-items': {
      requireAdmin(isAdmin)
      for (let index = 0; index < command.count; index++) {
        const rarity = rngItem({ seed: [seed()], items: allRarities })
        const item = await generateCollectorItem({
          game,
          seed: [seed()],
          rarity,
        })
        addCollectorItem({ game, item })
      }
      return {
        type: 'admin-items-generated',
        message: `Generated ${command.count} collector items`,
      }
    }

    case 'admin-reset':
      requireAdmin(isAdmin)
      game.data.currentLoadout.items = []
      game.data.inventory = { items: [] }
      game.data.dungeon = undefined
      return { type: 'admin-game-reset', message: 'Collector reset' }

    case 'admin-enter-dungeon':
      requireAdmin(isAdmin)
      await fightCollectorDungeon({
        game,
        dungeonInput: {
          name: 'adventureTrail',
          level: 1,
          seed: seed(),
        },
      })
      return { type: 'admin-dungeon-entered' }

    case 'admin-exit-dungeon':
      requireAdmin(isAdmin)
      game.data.dungeon = undefined
      return { type: 'admin-dungeon-exited' }

    case 'admin-unlock-dungeon':
      requireAdmin(isAdmin)
      setDungeonAccess({
        game,
        dungeonAccess: {
          name: 'adventureTrail',
          levelMin: 1,
          levelMax: 100,
          levelCurrent: 100,
        },
      })
      return { type: 'admin-dungeon-unlocked' }

    case 'admin-turbo-dungeon': {
      requireAdmin(isAdmin)
      let completed = 0
      let failed = 0
      for (let index = 0; index < command.count; index++) {
        const access = game.data.dungeonAccesses?.find(
          (candidate) => candidate.name === command.dungeonName,
        )
        if (!access) break
        await fightCollectorDungeon({
          game,
          dungeonInput: {
            name: access.name,
            level: access.levelCurrent,
            seed: seed(),
          },
        })
        while (game.data.dungeon?.status === 'active') {
          await fightCollectorDungeon({
            game,
            roomIdx: game.data.dungeon.room.idx + 1,
          })
        }
        if (game.data.dungeon?.status === 'completed') completed++
        else if (game.data.dungeon?.status === 'failed') failed++
        game.data.dungeon = undefined
      }
      return {
        type: 'admin-dungeon-turbo-completed',
        message: `${completed + failed} of ${
          command.count
        } done, ${completed} completed, ${failed} failed`,
        details: { completed, failed },
      }
    }
  }
}
