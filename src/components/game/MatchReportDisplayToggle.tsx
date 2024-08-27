import { MatchReport } from '@/game/generateMatch'
import { Button } from '../ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import { MatchReportDisplay } from './MatchReportDisplay'

export const MatchReportDisplayToggle = ({
  matchReport,
}: {
  matchReport: MatchReport
}) => {
  return (
    <>
      <Collapsible>
        <CollapsibleTrigger className="w-full" asChild>
          <Button variant="outline">Logs</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="max-h-96 overflow-auto rounded-lg self-stretch lg:self-center mt-2 max-w-[calc(100vw-2rem)] xl:max-w-[560px]">
            <MatchReportDisplay matchReport={matchReport} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}
