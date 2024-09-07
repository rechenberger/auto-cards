import { forEach } from 'lodash-es'
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
  const dpsMap = new Map<DpsReportKey, number>()

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
      const valueBefore = dpsMap.get(key) ?? 0
      const valueNew = Math.abs(value) + valueBefore
      dpsMap.set(key, valueNew)
    })
  }

  const entries: DpsReportEntry[] = []
  dpsMap.forEach((value, key) => {
    entries.push({
      ...key,
      value,
    })
  })

  return entries
}
