'use client'

import { playgroundHref } from '@/app/(main)/admin/playground/playgroundHref'
import { MetaResponse } from '@/contracts/meta'
import { MatchReplayResponse } from '@/contracts/replay'
import { Palette } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { DpsReportDisplay } from './DpsReportDisplay'
import { MatchReportDisplay } from './MatchReportDisplay'

export const MatchReplayTabs = ({
  replay,
  meta,
}: {
  replay: MatchReplayResponse
  meta: MetaResponse | null
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
        <div className="flex flex-col gap-2 items-center text-sm">
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
