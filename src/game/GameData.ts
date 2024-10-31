import { ItemData } from '@/components/game/ItemData'
import { ItemName } from '@/game/allItems'
import { ItemAspect } from '@/game/aspects'
import { GAME_VERSION } from '@/game/config'
import { DungeonAccess } from '@/game/dungeons/DungeonAccess'
import { DungeonData } from '@/game/dungeons/DungeonData'
import z from 'zod'
import { LoadoutData } from './LoadoutData'
import { createSeed } from './seed'
import { Stats } from './stats'

export const GameData = z.object({
  version: z.number().default(GAME_VERSION),
  seed: z.string().default(() => createSeed()),
  roundNo: z.number().default(0),
  gold: z.number().default(0),
  shopRerolls: z.number().default(0),
  shopItems: z.array(
    z.object({
      name: ItemName,
      isOnSale: z.boolean().optional(),
      isReserved: z.boolean().optional(),
      isSold: z.boolean().optional(),
      isSpecial: z.boolean().optional(),
      aspects: z.array(ItemAspect).optional(),
    }),
  ),
  currentLoadout: LoadoutData,
  inventory: z
    .object({
      items: z.array(ItemData),
    })
    .optional(),
  dungeon: DungeonData.optional(),
  dungeonAccesses: z.array(DungeonAccess).optional(),
  currencies: Stats.optional(),
})
export type GameData = z.infer<typeof GameData>
