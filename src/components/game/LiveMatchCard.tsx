import { getLiveMatchStuff } from '@/game/getLiveMatchStuff'
import { getUserName } from '@/game/getUserName'
import { cn } from '@/lib/utils'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { Trophy } from 'lucide-react'
import { notFound } from 'next/navigation'
import { SimpleRefresher } from '../simple/SimpleRefresher'
import { Card } from '../ui/card'
import { LiveMatchCopyButton } from './LiveMatchCopyButton'
import { LiveMatchGameButtons } from './LiveMatchGameButtons'
import { LiveMatchJoinButtons } from './LiveMatchJoinButtons'
import { LiveMatchResults } from './LiveMatchResults'

export const LiveMatchCard = async ({
  liveMatchId,
  inGame,
}: {
  liveMatchId: string
  inGame: boolean
}) => {
  const liveMatch = await getLiveMatchStuff({ liveMatchId })
  if (!liveMatch) return notFound()

  return (
    <>
      <Card className="flex flex-col gap-2 p-2 w-56">
        <div className="flex flex-row gap-2 items-center">
          <div className="flex-1">⚡ Live Match</div>
          <SimpleRefresher
            forceState={true}
            // ms={myParticipation?.data.ready ? 1000 : 4000}
            ms={5_000}
          />
          <ActionButton
            hideIcon
            variant="ghost"
            size="vanilla"
            className="p-2"
            action={async () => {
              'use server'
              return superAction(async () => {
                streamDialog({
                  content: (
                    <>
                      <LiveMatchResults liveMatchId={liveMatchId} showCards />
                    </>
                  ),
                })
              })
            }}
          >
            <Trophy className="size-3" />
          </ActionButton>
        </div>
        <div>
          {liveMatch.liveMatchParticipations.map((participation) => {
            const hasGame = liveMatch.games.some(
              (g) => g.userId === participation.userId,
            )

            return (
              <div
                key={participation.id}
                className={cn(
                  'flex flex-row gap-2',
                  participation.data.ready && 'text-green-500',
                  !inGame && hasGame && 'text-green-500',
                )}
              >
                <div className="flex-1">
                  {getUserName({ user: participation.user })}
                  {participation.data.isHost && ' (Host)'}
                </div>
                <div className="text-right">
                  {participation.data.ready
                    ? 'Ready'
                    : inGame
                      ? 'Not Ready'
                      : hasGame
                        ? 'Started'
                        : 'Joined'}
                </div>
              </div>
            )
          })}
        </div>
        {liveMatch.status === 'open' && (
          <LiveMatchCopyButton liveMatchId={liveMatchId} />
        )}
        {inGame ? (
          <LiveMatchGameButtons liveMatch={liveMatch} />
        ) : (
          <LiveMatchJoinButtons liveMatch={liveMatch} />
        )}
      </Card>
    </>
  )
}
