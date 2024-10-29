import { ItemData } from '@/components/game/ItemData'
import { DungeonData } from '@/game/DungeonData'
import { ItemName } from '@/game/allItems'
import { ItemAspect } from '@/game/aspects'
import { GAME_VERSION } from '@/game/config'
import z from 'zod'
import { LoadoutData } from './LoadoutData'
import { createSeed } from './seed'

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
})
export type GameData = z.infer<typeof GameData>
