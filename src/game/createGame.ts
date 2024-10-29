import { getMyUser } from '@/auth/getMyUser'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game, LiveMatch } from '@/db/schema-zod'
import { sendDiscordMessage } from '@/lib/discord'
import { typedParse } from '@/lib/typedParse'
import { createId } from '@paralleldrive/cuid2'
import { first } from 'lodash-es'
import { startingDungeonAccesses } from './DungeonAccess'
import { GameData } from './GameData'
import { GAME_VERSION } from './config'
import { DefaultGameMode, GameMode } from './gameMode'
import { generateShopItems } from './generateShopItems'
import { getUserName } from './getUserName'
import { roundStats } from './roundStats'

export const createGame = async ({
  userId,
  liveMatch,
  skipSave,
  gameMode = DefaultGameMode,
}: {
  userId: string
  liveMatch?: LiveMatch
  skipSave?: boolean
  gameMode?: GameMode
}): Promise<Game> => {
  const id = createId()

  const game: Game = {
    id,
    userId,
    data: typedParse(GameData, {
      version: GAME_VERSION,
      gold: first(roundStats)?.gold ?? 0,
      seed: liveMatch?.data.seed,
      shopItems: [],
      currentLoadout: {
        items:
          gameMode === 'shopper'
            ? [
                {
                  name: 'hero',
                },
              ]
            : [],
      },
      dungeonAccesses:
        gameMode === 'collector' ? startingDungeonAccesses : undefined,
    }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    liveMatchId: liveMatch?.id ?? null,
    version: GAME_VERSION,
    gameMode,
  }

  game.data.shopItems = await generateShopItems({ game })

  if (skipSave) {
    return game
  }

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
      content: `${getUserName({ user })} playing ${game.id}`,
    })
  }

  return gameSaved
}
