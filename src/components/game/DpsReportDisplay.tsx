import { dpsReport } from '@/game/dpsReport'
import { MatchReport } from '@/game/generateMatch'
import { getStatDefinition } from '@/game/stats'
import { capitalCase } from 'change-case'
import { keyBy, mapValues, orderBy, uniq } from 'lodash-es'
import { Fragment } from 'react'
import { SimpleDataCard } from '../simple/SimpleDataCard'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { DpsReportChart } from './DpsReportChart'
import { StatDisplay } from './StatsDisplay'

export const DpsReportDisplay = ({
  matchReport,
  showCards,
}: {
  matchReport: MatchReport
  showCards?: boolean
}) => {
  const { entries } = dpsReport({ matchReport })
  const stats = uniq(entries.map((entry) => entry.stat))

  return (
    <>
      <Tabs defaultValue={'damage'}>
        <TabsList className="grid grid-cols-4 h-auto">
          {stats.map((stat) => (
            <TabsTrigger
              key={stat}
              value={stat}
              className="text-white flex flex-row gap-2 justify-start items-center"
            >
              <StatDisplay stat={getStatDefinition(stat)} size="sm" hideCount />
              {capitalCase(stat)}
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
