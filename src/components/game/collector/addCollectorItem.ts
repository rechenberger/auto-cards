import { Game } from '@/db/schema-zod'
import { createId } from '@paralleldrive/cuid2'
import { ItemData } from '../ItemData'

export const addCollectorItem = ({
  game,
  item,
}: {
  game: Game
  item: ItemData
}) => {
  const itemWithId = {
    ...item,
    id: createId(),
  }
  if (!game.data.inventory) {
    game.data.inventory = {
      items: [],
    }
  }
  if (game.data.inventory) {
    game.data.inventory.items.push(itemWithId)
  }
}
