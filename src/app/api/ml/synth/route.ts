import { generateRandomLoadout } from '@/app/(main)/admin/simulation/generateRandomLoadout'
import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { getAllItems } from '@/game/allItems'
import { generateMatchByWorker } from '@/game/matchWorkerManager'
import { createSeed, rngGenerator } from '@/game/seed'
import {
  SimpleMatchData,
  toSimpleMatchDataItemCounts,
} from '@/game/SimpleMatchData'
import { range } from 'lodash-es'

const generateParticipantGroups = async ({
  noOfMatches,
  gold,
}: {
  noOfMatches: number
  gold: number
}) => {
  const seed = rngGenerator({ seed: createSeed() })

  const matchups = await Promise.all(
    range(noOfMatches).map(async (idx) => {
      const { loadout: loadoutBlue } = await generateRandomLoadout({
        gold,
        seed,
      })

      const { loadout: loadoutRed } = await generateRandomLoadout({
        gold,
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
    const participantGroups = await generateParticipantGroups({
      noOfMatches: 10,
      gold: 100,
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
