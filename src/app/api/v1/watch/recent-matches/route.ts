import { RecentMatchesDto } from '@/contracts/watch'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { getUserName } from '@/game/getUserName'
import { fallbackThemeId } from '@/game/themes'
import { apiData, apiRoute } from '@/server/api/route'
import { asc, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export const GET = apiRoute(async () => {
  const matches = await db.query.match.findMany({
    orderBy: desc(schema.match.createdAt),
    limit: 20,
    with: {
      matchParticipations: {
        orderBy: asc(schema.matchParticipation.sideIdx),
        with: { user: true, loadout: true },
      },
    },
  })

  const data = RecentMatchesDto.parse({
    matches: matches.flatMap((match) => {
      if (
        match.matchParticipations.length !== 2 ||
        match.matchParticipations.some((participant) => !participant.loadout)
      ) {
        return []
      }
      const participants = match.matchParticipations.map((participant) => ({
        sideIdx: participant.sideIdx,
        status: participant.status,
        displayName: participant.user
          ? getUserName({ user: participant.user })
          : 'Bot',
        themeId: fallbackThemeId(participant.user?.themeId),
        loadout: participant.loadout!.data,
      }))
      return [
        {
          id: match.id,
          createdAt: match.createdAt,
          roundNo: match.matchParticipations[0].loadout!.roundNo,
          participants,
        },
      ]
    }),
  })
  return apiData(data)
})
