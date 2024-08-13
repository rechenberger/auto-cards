import { getMyUser } from '@/auth/getMyUser'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { GameData } from '@/db/schema-zod'
import { sendDiscordMessage } from '@/lib/discord'
import { typedParse } from '@/lib/typedParse'
import { createId } from '@paralleldrive/cuid2'
import { first } from 'lodash-es'
import { GAME_DATA_VERSION } from './config'
import { generateShopItems } from './generateShopItems'

export const createGame = async ({ userId }: { userId: string }) => {
  const id = createId()

  const game = {
    id,
    userId,
    data: typedParse(GameData, {
      version: GAME_DATA_VERSION,
      shopItems: [],
      currentLoadout: {
        items: [],
      },
    }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  game.data.shopItems = await generateShopItems({ game })

  const gameSaved = await db
    .insert(schema.game)
    .values(game)
    .returning()
    .execute()
    .then(first)

  if (!gameSaved) {
    throw new Error('Failed to save game')
  }

  const user = await getMyUser()
  if (user && !user.isAdmin) {
    await sendDiscordMessage({
      content: `${user.name ?? user.email} playing ${game.id}`,
    })
  }

  return gameSaved
}
