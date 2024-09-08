import { MatchReport } from '@/game/generateMatch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { DpsReportDisplay } from './DpsReportDisplay'
import { MatchReportDisplay } from './MatchReportDisplay'

export const MatchReportTabs = ({
  matchReport,
}: {
  matchReport: MatchReport
}) => {
  return (
    <>
      <Tabs defaultValue={'overview'} className="flex flex-col">
        <TabsList className="self-center">
          <TabsTrigger value={'overview'} className="">
            Overview
          </TabsTrigger>
          <TabsTrigger value={'logs'} className="">
            Logs
          </TabsTrigger>
          <TabsTrigger value={'metrics'} className="">
            Metrics
          </TabsTrigger>
        </TabsList>
        <TabsContent value={'overview'}>{/* TODO: ? */}</TabsContent>
        <TabsContent value={'logs'}>
          <div className="max-h-96 overflow-auto rounded-lg self-stretch lg:self-center mt-2 max-w-[calc(100vw-2rem)] xl:max-w-[560px]">
            <MatchReportDisplay matchReport={matchReport} />
          </div>
        </TabsContent>
        <TabsContent value={'metrics'}>
          <DpsReportDisplay matchReport={matchReport} />
        </TabsContent>
      </Tabs>
    </>
  )
}
