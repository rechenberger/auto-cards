'use client'

import { playgroundHref } from '@/app/(main)/admin/playground/playgroundHref'
import { MetaResponse } from '@/contracts/meta'
import { MatchReplayResponse } from '@/contracts/replay'
import { Palette } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { DpsReportDisplay } from './DpsReportDisplay'
import { MatchReportDisplay } from './MatchReportDisplay'
import { MatchReportShowWhenDone } from './MatchReportShowWhenDone'

export const MatchReplayTabs = ({
  replay,
  meta,
  overviewContent,
}: {
  replay: MatchReplayResponse
  meta: MetaResponse | null
  overviewContent?: ReactNode
}) => {
  const loadouts = replay.participants.map((participant) => participant.loadout)

  return (
    <Tabs defaultValue="overview" className="flex flex-col">
      <TabsList className="self-center">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
        <TabsTrigger value="metrics">Metrics</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="flex flex-col items-center gap-4 text-sm">
          {meta?.viewer?.isAdmin && (
            <Button variant="outline" asChild className="self-center">
              <Link
                href={playgroundHref({
                  loadouts,
                  mode: 'edit',
                  seed: replay.match.seed,
                })}
              >
                <Palette className="size-4 mr-2" />
                Edit in Playground
              </Link>
            </Button>
          )}
          {replay.rulesetVersion !== replay.currentRulesetVersion && (
            <div className="text-muted-foreground text-center">
              Recorded in ruleset {replay.rulesetVersion}; the current ruleset
              is {replay.currentRulesetVersion}. Historical outcomes may differ
              after balance changes.
            </div>
          )}
          {overviewContent && (
            <MatchReportShowWhenDone>{overviewContent}</MatchReportShowWhenDone>
          )}
        </div>
      </TabsContent>
      <TabsContent value="logs">
        <MatchReportDisplay />
      </TabsContent>
      <TabsContent value="metrics">
        <DpsReportDisplay />
      </TabsContent>
    </Tabs>
  )
}
