import { Game } from '@/db/schema-zod'
import { createId } from '@paralleldrive/cuid2'
import { ItemData } from '../ItemData'
import { checkCollectorLoadout } from './checkCollectorLoadout'

export const addCollectorItem = async ({
  game,
  item,
}: {
  game: Game
  item: ItemData
}) => {
  const itemWithId = {
    ...item,
    id: createId(),
    createdAt: new Date().toISOString(),
  }
  if (!game.data.inventory) {
    game.data.inventory = {
      items: [],
    }
  }
  if (game.data.inventory) {
    game.data.inventory.items.push(itemWithId)
  }
  const loadoutWithItem = {
    ...game.data.currentLoadout,
    items: [...game.data.currentLoadout.items, itemWithId],
  }
  const check = await checkCollectorLoadout({ loadout: loadoutWithItem })
  if (check.allGood) {
    game.data.currentLoadout = loadoutWithItem
  }
}
