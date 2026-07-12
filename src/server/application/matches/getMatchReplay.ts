import { MatchReplayResponse } from '@/contracts/replay'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { LoadoutData } from '@/game/LoadoutData'
import { getItemByName } from '@/game/allItems'
import { getBotName } from '@/game/botName'
import { GAME_VERSION } from '@/game/config'
import { getUserName } from '@/game/getUserName'
import { fallbackThemeId, getThemeDefinition, ThemeId } from '@/game/themes'
import { conflict, notFound } from '@/server/api/ApiError'
import { and, asc, desc, eq, or } from 'drizzle-orm'
import { uniq } from 'lodash-es'

export const getMatchReplay = async ({ matchId }: { matchId: string }) => {
  const [match, participationRows] = await Promise.all([
    db.query.match.findFirst({
      columns: {
        id: true,
        data: true,
        gameMode: true,
        createdAt: true,
      },
      where: eq(schema.match.id, matchId),
    }),
    db.query.matchParticipation.findMany({
      columns: {
        sideIdx: true,
        status: true,
      },
      where: eq(schema.matchParticipation.matchId, matchId),
      orderBy: asc(schema.matchParticipation.sideIdx),
      with: {
        loadout: {
          columns: {
            id: true,
            data: true,
            version: true,
          },
        },
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            themeId: true,
          },
        },
      },
    }),
  ])

  if (!match) throw notFound('Match not found')
  if (
    participationRows.length !== 2 ||
    participationRows.some((participant) => !participant.loadout)
  ) {
    throw conflict('Game has changed too much to replay this match', {
      reason: 'MATCH_NOT_REPLAYABLE',
    })
  }

  const participants = await Promise.all(
    participationRows.map(async (participant) => {
      const loadout = participant.loadout!
      const parsedTheme = ThemeId.safeParse(participant.user?.themeId)
      const themeId = await fallbackThemeId(
        parsedTheme.success ? parsedTheme.data : undefined,
      )
      return {
        sideIdx: participant.sideIdx,
        status: participant.status,
        displayName: participant.user
          ? getUserName({ user: participant.user })
          : getBotName({ seed: loadout.id }),
        themeId,
        loadoutId: loadout.id,
        loadout: LoadoutData.parse(loadout.data),
        rulesetVersion: loadout.version,
      }
    }),
  )

  const itemNames = uniq(
    participants.flatMap((participant) =>
      participant.loadout.items.map((item) => item.name),
    ),
  )
  const rulesetVersions = uniq(
    participants.map((participant) => participant.rulesetVersion),
  )
  if (rulesetVersions.length !== 1) {
    throw conflict('Participants use different game versions', {
      reason: 'MATCH_NOT_REPLAYABLE',
    })
  }
  const rulesetVersion = rulesetVersions[0] ?? GAME_VERSION
  const itemDefinitions = itemNames.map((itemName) =>
    getItemByName(itemName, rulesetVersion),
  )
  const themeIds = participants.map((participant) => participant.themeId)
  const themes = await Promise.all(themeIds.map(getThemeDefinition))

  const imageRequests: { itemId: string; themeId: string }[] =
    participants.flatMap((participant) =>
      participant.loadout.items.map((item) => ({
        itemId: item.name,
        themeId: participant.themeId,
      })),
    )
  imageRequests.push({
    itemId: 'match-bg',
    themeId: themeIds.join('~'),
  })

  const uniqueImageRequests = [
    ...new Map(
      imageRequests.map((request) => [
        `${request.itemId}|${request.themeId}`,
        request,
      ]),
    ).values(),
  ]
  const imageWhere = or(
    ...uniqueImageRequests.map((request) =>
      and(
        eq(schema.aiImage.itemId, request.itemId),
        eq(schema.aiImage.themeId, request.themeId),
      ),
    ),
  )
  const imageRows = imageWhere
    ? await db
        .select({
          itemId: schema.aiImage.itemId,
          themeId: schema.aiImage.themeId,
          url: schema.aiImage.url,
        })
        .from(schema.aiImage)
        .where(imageWhere)
        .orderBy(desc(schema.aiImage.updatedAt))
    : []

  const latestImages = new Map<string, (typeof imageRows)[number]>()
  for (const image of imageRows) {
    if (!image.itemId) continue
    const key = `${image.itemId}|${image.themeId}`
    if (!latestImages.has(key)) latestImages.set(key, image)
  }

  const seed =
    typeof match.data === 'object' &&
    match.data !== null &&
    'seed' in match.data &&
    typeof match.data.seed === 'string'
      ? match.data.seed
      : null
  if (!seed) {
    throw conflict('Match seed is missing', {
      reason: 'MATCH_NOT_REPLAYABLE',
    })
  }

  return MatchReplayResponse.parse({
    apiVersion: 'v1',
    match: {
      id: match.id,
      seed,
      gameMode: match.gameMode,
      createdAt: match.createdAt,
    },
    rulesetVersion,
    currentRulesetVersion: GAME_VERSION,
    participants: participants.map(
      ({ rulesetVersion: _, ...participant }) => participant,
    ),
    assets: {
      itemDefinitions,
      themes,
      images: [...latestImages.values()],
    },
  })
}
