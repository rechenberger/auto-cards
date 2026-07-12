import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { LiveMatchData, LiveMatchParticipationData } from '@/db/schema-zod'
import { GAME_VERSION } from '@/game/config'
import { typedParse } from '@/lib/typedParse'
import type { ApiPrincipal } from '@/server/auth/apiPrincipal'
import { first } from 'lodash-es'
import { getLiveMatchView } from './getLiveMatchView'

export const createLiveMatch = async ({
  principal,
}: {
  principal: ApiPrincipal
}) => {
  const liveMatch = await db.transaction(async (tx) => {
    const created = await tx
      .insert(schema.liveMatch)
      .values({
        data: typedParse(LiveMatchData, {
          rulesetVersion: GAME_VERSION,
        }),
        status: 'open',
      })
      .returning()
      .then(first)
    if (!created) throw new Error('Failed to create live match')

    await tx.insert(schema.liveMatchParticipation).values({
      liveMatchId: created.id,
      userId: principal.userId,
      data: typedParse(LiveMatchParticipationData, { isHost: true }),
    })
    return created
  })

  return getLiveMatchView({ liveMatchId: liveMatch.id, principal })
}
