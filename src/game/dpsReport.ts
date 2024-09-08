import { forEach } from 'lodash-es'
import hash from 'object-hash'
import { MatchReport, NOT_ENOUGH_MSG } from './generateMatch'
import { Stat } from './stats'

type DpsReportKey = {
  sourceSideIdx: number
  targetSideIdx: number
  target: 'self' | 'enemy'
  source: string
  stat: Stat
  negative: boolean
}

export type DpsReportEntry = DpsReportKey & { value: number }

export const dpsReport = ({ matchReport }: { matchReport: MatchReport }) => {
  const dpsMap = new Map<string, DpsReportEntry>()

  const add = ({ key, value }: { key: DpsReportKey; value: number }) => {
    value = Math.abs(value)
    const keyString = hash(key)
    const entryBefore = dpsMap.get(keyString)
    if (entryBefore) {
      entryBefore.value += value
    } else {
      dpsMap.set(keyString, { ...key, value })
    }
  }

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

    if (log.msg === NOT_ENOUGH_MSG) continue

    // if (log.targetItemIdx) continue

    forEach(stats, (value, statString) => {
      if (!value) return
      const negative = value < 0
      const stat = statString as Stat
      const key: DpsReportKey = {
        sourceSideIdx: log.sideIdx,
        targetSideIdx,
        target: log.sideIdx === targetSideIdx ? 'self' : 'enemy',
        source,
        stat,
        negative,
      }
      add({ key, value })

      if (
        ['health', 'block'].includes(key.stat) &&
        key.sourceSideIdx !== key.targetSideIdx
      ) {
        add({
          key: {
            ...key,
            stat: 'damage',
            negative: !negative,
          },
          value,
        })
      }
    })
  }

  const entries: DpsReportEntry[] = Array.from(dpsMap.values())

  return { entries }
}
