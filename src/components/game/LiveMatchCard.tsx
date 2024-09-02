import { getMyUserId } from '@/auth/getMyUser'
import { getLiveMatchStuff } from '@/game/getLiveMatchStuff'
import { getUserName } from '@/game/getUserName'
import { cn } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { SimpleRefresher } from '../simple/SimpleRefresher'
import { Card } from '../ui/card'
import { LiveMatchGameButtons } from './LiveMatchGameButtons'
import { LiveMatchJoinButtons } from './LiveMatchJoinButtons'

export const LiveMatchCard = async ({
  liveMatchId,
  inGame,
}: {
  liveMatchId: string
  inGame: boolean
}) => {
  const userId = await getMyUserId()
  const liveMatch = await getLiveMatchStuff({ liveMatchId })
  if (!liveMatch) return notFound()

  const myParticipation = userId
    ? liveMatch.liveMatchParticipations.find(
        (participation) => participation.user.id === userId,
      )
    : undefined

  return (
    <>
      <Card className="flex flex-col gap-2 p-2 w-56">
        <div className="flex flex-row gap-2 items-baseline">
          <div className="flex-1">⚡ Live Match</div>
          <SimpleRefresher
            forceState={true}
            ms={myParticipation?.data.ready ? 1000 : 4000}
          />
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
        {inGame ? (
          <LiveMatchGameButtons liveMatch={liveMatch} />
        ) : (
          <LiveMatchJoinButtons liveMatch={liveMatch} />
        )}
      </Card>
    </>
  )
}
