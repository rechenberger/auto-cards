import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { db } from '@/db/db'
import { getAllItems } from '@/game/allItems'
import { GAME_VERSION } from '@/game/config'
import { toSimpleMatchDataItemCounts } from '@/game/SimpleMatchData'

export const GET = async () => {
  await throwIfNotAdmin({ allowDev: true })

  const matches = await db.query.match.findMany({
    with: {
      matchParticipations: {
        with: {
          loadout: true,
        },
      },
    },
  })

  const allItems = await getAllItems()

  const result = matches.flatMap((match) => {
    const sides = match.matchParticipations.flatMap((p) => {
      if (!p.loadout) return []
      if (p.loadout.version !== GAME_VERSION) return []

      const counts = toSimpleMatchDataItemCounts({
        items: p.loadout.data.items,
        allItems,
      })

      return {
        counts,
        status: p.status,
      }
    })
    if (sides.length != 2) {
      return []
    }
    const winnerSide = sides.findIndex((s) => s.status === 'won')
    if (winnerSide === -1) {
      return []
    }
    return {
      itemCounts: sides.map((s) => s.counts),
      winnerSide,
    }
  })

  return new Response(JSON.stringify(result))
}
