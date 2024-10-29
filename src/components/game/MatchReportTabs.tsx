import { playgroundHref } from '@/app/(main)/admin/playground/playgroundHref'
import { getIsAdmin } from '@/auth/getIsAdmin'
import { Game } from '@/db/schema-zod'
import { LoadoutData } from '@/game/LoadoutData'
import { Palette } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { DpsReportDisplay } from './DpsReportDisplay'
import { LiveMatchResults } from './LiveMatchResults'
import { MatchReportDisplay } from './MatchReportDisplay'
import { MatchReportShowWhenDone } from './MatchReportShowWhenDone'

export const MatchReportTabs = async ({
  loadouts,
  seed,
  game,
}: {
  loadouts: LoadoutData[]
  seed: string
  game?: Game
}) => {
  const isAdmin = await getIsAdmin({ allowDev: true })
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
        <TabsContent value={'overview'}>
          <div className="flex flex-col gap-4">
            {isAdmin && (
              <Button variant="outline" asChild className="self-center">
                <Link
                  href={playgroundHref({
                    loadouts,
                    mode: 'edit',
                    seed,
                  })}
                >
                  <Palette className="size-4 mr-2" />
                  {/* <Pen className="size-4 mr-2" /> */}
                  Edit in Playground
                </Link>
              </Button>
            )}
            {game?.liveMatchId && (
              <MatchReportShowWhenDone>
                <LiveMatchResults liveMatchId={game.liveMatchId} />
              </MatchReportShowWhenDone>
            )}
          </div>
        </TabsContent>
        <TabsContent value={'logs'}>
          <MatchReportDisplay />
        </TabsContent>
        <TabsContent value={'metrics'}>
          <DpsReportDisplay />
        </TabsContent>
      </Tabs>
    </>
  )
}
