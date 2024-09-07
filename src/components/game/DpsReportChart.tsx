import { dpsReport } from '@/game/dpsReport'
import { MatchReport } from '@/game/generateMatch'
import { capitalCase } from 'change-case'
import { first, keyBy, mapValues, orderBy, uniq } from 'lodash-es'
import { Fragment } from 'react'
import { SimpleDataCard } from '../simple/SimpleDataCard'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

export const DpsReportChart = ({
  matchReport,
}: {
  matchReport: MatchReport
}) => {
  const { entries } = dpsReport({ matchReport })
  const stats = uniq(entries.map((entry) => entry.stat))

  return (
    <>
      <Tabs defaultValue={first(stats)}>
        <TabsList className="grid grid-cols-4 h-auto">
          {stats.map((stat) => (
            <TabsTrigger key={stat} value={stat}>
              {capitalCase(stat)}
            </TabsTrigger>
          ))}
        </TabsList>
        {stats.map((stat) => {
          const entriesStat = entries.filter((entry) => entry.stat === stat)
          return (
            <TabsContent key={stat} value={stat}>
              <div className="grid grid-cols-2 gap-2">
                {['self', 'enemy'].map((target) => (
                  <Fragment key={target}>
                    {[0, 1].map((sourceSideIdx) => {
                      const playerName = sourceSideIdx === 0 ? 'blue' : 'red'

                      const targetSideIdx =
                        target === 'self' ? sourceSideIdx : 1 - sourceSideIdx

                      const entriesSide = entriesStat.filter(
                        (entry) =>
                          entry.sourceSideIdx === sourceSideIdx &&
                          entry.targetSideIdx === targetSideIdx,
                      )
                      let simple = entriesSide.map((entry) => {
                        return {
                          name: capitalCase(entry.source),
                          value: entry.negative ? -entry.value : entry.value,
                        }
                      })
                      simple = orderBy(simple, 'value', 'desc')
                      const simpler = mapValues(keyBy(simple, 'name'), 'value')
                      return (
                        <Fragment key={sourceSideIdx}>
                          <Card>
                            <CardHeader>
                              <CardTitle>
                                {playerName} {target}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <SimpleDataCard data={simpler} />
                            </CardContent>
                          </Card>
                        </Fragment>
                      )
                    })}
                  </Fragment>
                ))}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </>
  )
}
