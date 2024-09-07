import { forEach } from 'lodash-es'
import hash from 'object-hash'
import { MatchReport } from './generateMatch'
import { Stat } from './stats'

type DpsReportKey = {
  sourceSideIdx: number
  targetSideIdx: number
  source: string
  stat: Stat
  negative: boolean
}

type DpsReportEntry = DpsReportKey & { value: number }

export const dpsReport = ({ matchReport }: { matchReport: MatchReport }) => {
  const dpsMap = new Map<string, DpsReportEntry>()

  for (const log of matchReport.logs) {
    const stats = log.stats
    if (!stats) continue

    const item = log.itemIdx
      ? log.stateSnapshot.sides[log.sideIdx].items[log.itemIdx]
      : undefined
    const source = item?.name ?? log.msg
    if (!source) continue

    const targetSideIdx = log.targetSideIdx
    if (targetSideIdx === undefined) continue

    // if (log.targetItemIdx) continue

    forEach(stats, (value, statString) => {
      if (!value) return
      const negative = value < 0
      const stat = statString as Stat
      const key: DpsReportKey = {
        sourceSideIdx: log.sideIdx,
        targetSideIdx,
        source,
        stat,
        negative,
      }
      const keyString = hash(key)
      const entryBefore = dpsMap.get(keyString)
      if (entryBefore) {
        entryBefore.value += Math.abs(value)
      } else {
        const newEntry: DpsReportEntry = {
          ...key,
          value: Math.abs(value),
        }
        dpsMap.set(keyString, newEntry)
      }
    })
  }

  const entries: DpsReportEntry[] = Array.from(dpsMap.values())

  return { entries }
}
