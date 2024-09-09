import { MatchParticipant } from '@/components/game/MatchParticipants'
import { Match } from '@/db/schema-zod'
import { orderBy } from 'lodash-es'
import { getItemByName } from './allItems'
import { generateMatchByWorker } from './matchWorkerManager'

export const generateChangemakers = async ({
  match,
  participants,
  withoutWholeItemStack = true,
}: {
  match: Match
  participants: MatchParticipant[]
  withoutWholeItemStack?: boolean
}) => {
  let itemsBySide = await Promise.all(
    participants.map(
      async (p) =>
        await Promise.all(
          p.loadout.data.items.map(async (item, itemIdx) => ({
            ...item,
            itemIdx,
            sideIdx: p.sideIdx,

            def: await getItemByName(item.name),

            winsWithout: 0,
            matchesWithout: 0,
            necessity: 0,
          })),
        ),
    ),
  )

  itemsBySide = itemsBySide.map((s) => s.filter((i) => i.def.price > 0))

  await Promise.all(
    itemsBySide[0].map(async (item0) => {
      await Promise.all(
        itemsBySide[1].map(async (item1) => {
          const matchReport = await generateMatchByWorker({
            skipLogs: true,
            participants: [
              {
                loadout: {
                  items: participants[0].loadout.data.items.flatMap((i) => {
                    const without = i.name === item0.name
                    if (!without) return [i]
                    if (withoutWholeItemStack) return []
                    if (i.count && i.count > 1) {
                      return [{ ...i, count: i.count - 1 }]
                    }
                    return []
                  }),
                },
              },
              {
                loadout: {
                  items: participants[1].loadout.data.items.flatMap((i) => {
                    const without = i.name === item1.name
                    if (!without) return [i]
                    if (withoutWholeItemStack) return []
                    if (i.count && i.count > 1) {
                      return [{ ...i, count: i.count - 1 }]
                    }
                    return []
                  }),
                },
              },
            ],
            seed: [match.data.seed, 'remix', item0.name, item1.name],
          })

          const winnerIdx = matchReport.winner.sideIdx

          item0.matchesWithout++
          if (winnerIdx === item0.sideIdx) {
            item0.winsWithout++
          }
          item0.necessity = 1 - item0.winsWithout / item0.matchesWithout

          item1.matchesWithout++
          if (winnerIdx === item1.sideIdx) {
            item1.winsWithout++
          }
          item1.necessity = 1 - item1.winsWithout / item1.matchesWithout
        }),
      )
    }),
  )

  itemsBySide = itemsBySide.map((s) => orderBy(s, (i) => i.necessity, 'desc'))

  return itemsBySide
}

export type Changemakers = Awaited<ReturnType<typeof generateChangemakers>>
export type Changemaker = Changemakers[number][number]
