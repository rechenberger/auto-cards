'use client'

import { dpsReport } from '@/game/dpsReport'
import { getStatDefinition, Stat } from '@/game/stats'
import { capitalCase } from 'change-case'
import { keyBy, mapValues, orderBy, uniq } from 'lodash-es'
import { Fragment } from 'react'
import { SimpleDataCard } from '../simple/SimpleDataCard'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { DpsReportChart } from './DpsReportChart'
import { useMatchReport } from './MatchReportProvider'
import { StatDisplay } from './StatsDisplay'

const statOrder: Stat[] = ['damage', 'health', 'block', 'stamina']

export const DpsReportDisplay = ({ showCards }: { showCards?: boolean }) => {
  const matchReport = useMatchReport()
  const { entries } = dpsReport({ matchReport })
  let stats = uniq(entries.map((entry) => entry.stat))
  stats = orderBy(stats, (stat) => {
    const idx = statOrder.indexOf(stat)
    return idx === -1 ? Infinity : idx
  })
  return (
    <>
      <Tabs defaultValue={'damage'}>
        <TabsList className="grid grid-cols-3 md:grid-cols-4 h-auto">
          {stats.map((stat) => (
            <TabsTrigger
              key={stat}
              value={stat}
              className="flex flex-row px-2 md:px-3 gap-1 md:gap-2 justify-start items-center"
            >
              <StatDisplay
                stat={getStatDefinition(stat)}
                size="sm"
                hideCount
                disableTooltip
              />
              <span className="truncate">{capitalCase(stat)}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {stats.map((stat) => {
          let entriesStat = entries.filter((entry) => entry.stat === stat)
          if (!entriesStat.length) return null
          entriesStat = orderBy(entriesStat, (e) => e.value, 'desc')
          return (
            <TabsContent key={stat} value={stat}>
              <DpsReportChart
                data={entriesStat}
                valueLabel={capitalCase(stat)}
              />
              {showCards && (
                <div className="grid grid-cols-2 gap-2">
                  {['self', 'enemy'].map((target) => {
                    const entriesTarget = entriesStat.filter((entry) =>
                      target === 'self'
                        ? entry.targetSideIdx === entry.sourceSideIdx
                        : entry.targetSideIdx !== entry.sourceSideIdx,
                    )
                    if (!entriesTarget.length) return null
                    return (
                      <Fragment key={target}>
                        {[0, 1].map((sourceSideIdx) => {
                          const playerName =
                            sourceSideIdx === 0 ? 'blue' : 'red'

                          const targetSideIdx =
                            target === 'self'
                              ? sourceSideIdx
                              : 1 - sourceSideIdx

                          const entriesSide = entriesStat.filter(
                            (entry) =>
                              entry.sourceSideIdx === sourceSideIdx &&
                              entry.targetSideIdx === targetSideIdx,
                          )
                          let simple = entriesSide.map((entry) => {
                            return {
                              source:
                                capitalCase(entry.source) +
                                (entry.negative ? ' ' : ''), // a little hack to make negative label != positive label and show both
                              value: entry.negative
                                ? -entry.value
                                : entry.value,
                            }
                          })
                          simple = orderBy(simple, 'value', 'desc')
                          const simpler = mapValues(
                            keyBy(simple, (e) => e.source),
                            'value',
                          )
                          if (!simple.length) return <div key={sourceSideIdx} />
                          return (
                            <Fragment key={sourceSideIdx}>
                              <Card>
                                <CardHeader>
                                  <CardTitle>
                                    {playerName} {target}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {!!simple.length && (
                                    <SimpleDataCard data={simpler} />
                                  )}
                                </CardContent>
                              </Card>
                            </Fragment>
                          )
                        })}
                      </Fragment>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </>
  )
}
