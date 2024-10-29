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
  game.data.currentLoadout.items.push({
    ...item,
    id: createId(),
  })
}
