import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game, LiveMatch } from '@/db/schema-zod'
import { typedParse } from '@/lib/typedParse'
import { enqueueDiscordNotification } from '@/server/jobs/discordJobs'
import { createId } from '@paralleldrive/cuid2'
import { first } from 'lodash-es'
import { eq } from 'drizzle-orm'
import { GAME_VERSION } from './config'
import { startingDungeonAccesses } from './dungeons/DungeonAccess'
import { GameData } from './GameData'
import { DefaultGameMode, GameMode } from './gameMode'
import { generateShopItems } from './generateShopItems'
import { getUserName } from './getUserName'
import { getRoundStats } from './roundStats'

export const createGame = async ({
  userId,
  liveMatch,
  skipSave,
  gameMode = DefaultGameMode,
  gameVersion = GAME_VERSION,
}: {
  userId: string
  liveMatch?: LiveMatch
  skipSave?: boolean
  gameMode?: GameMode
  gameVersion?: number
}): Promise<Game> => {
  const id = createId()

  const game: Game = {
    id,
    userId,
    data: typedParse(GameData, {
      version: gameVersion,
      gold: first(getRoundStats(gameVersion))?.gold ?? 0,
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
    version: gameVersion,
    gameMode,
    revision: 0,
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

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  })
  if (user && !user.isAdmin) {
    await enqueueDiscordNotification({
      idempotencyKey: `new-game:${game.id}`,
      content: `${getUserName({ user })} playing ${game.id}`,
    })
  }

  return gameSaved
}
