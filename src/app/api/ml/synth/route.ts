import { generateRandomLoadout } from '@/app/(main)/admin/simulation/generateRandomLoadout'
import { startingByRound } from '@/app/(main)/admin/simulation/startingByRound'
import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { getAllItems, ItemName } from '@/game/allItems'
import { NO_OF_ROUNDS } from '@/game/config'
import { generateMatchByWorker } from '@/game/matchWorkerManager'
import { createSeed, rngGenerator } from '@/game/seed'
import {
  SimpleMatchData,
  toSimpleMatchDataItemCounts,
} from '@/game/SimpleMatchData'
import { range } from 'lodash-es'

const generateParticipantGroups = async ({
  noOfMatches,
  startingGold,
  startingItems,
}: {
  noOfMatches: number
  startingGold: number
  startingItems: { name: ItemName; count: number }[]
}) => {
  const seed = rngGenerator({ seed: createSeed() })

  const matchups = await Promise.all(
    range(noOfMatches).map(async (idx) => {
      const { loadout: loadoutBlue } = await generateRandomLoadout({
        startingGold,
        startingItems,
        seed,
      })

      const { loadout: loadoutRed } = await generateRandomLoadout({
        startingGold,
        startingItems,
        seed,
      })

      return [{ loadout: loadoutBlue }, { loadout: loadoutRed }]
    }),
  )

  return matchups
}

export const GET = async () => {
  await throwIfNotAdmin({ allowDev: true })

  const allItems = await getAllItems()

  const doBatch = async () => {
    const input = startingByRound(NO_OF_ROUNDS - 1)

    const participantGroups = await generateParticipantGroups({
      noOfMatches: 10,
      ...input,
    })

    const matches = await Promise.all(
      participantGroups.map(async (participants) => {
        const matchReport = await generateMatchByWorker({
          participants: participants,
          seed: ['synth'],
          skipLogs: true,
        })

        return {
          matchReport,
          participants,
        }
      }),
    )

    const simpleMatchData = matches.map((m) => {
      const simpleMatchData: SimpleMatchData = {
        itemCounts: m.participants.map((p) =>
          toSimpleMatchDataItemCounts({
            items: p.loadout.items,
            allItems,
          }),
        ),
        winner: m.matchReport.winner.sideIdx,
      }
      return simpleMatchData
    })

    return simpleMatchData
  }

  const result = await doBatch()
  return new Response(JSON.stringify(result))
}
