import { getIsAdmin } from '@/auth/getIsAdmin'
import { getMyUserIdOrLogin } from '@/auth/getMyUser'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { getGameFromDb } from '@/game/getGame'
import { notFound } from 'next/navigation'

export default async function Page({
  params: { gameId },
}: {
  params: { gameId: string }
}) {
  const userId = await getMyUserIdOrLogin()

  const game = await getGameFromDb({ id: gameId })
  if (game.userId !== userId) {
    const isAdmin = await getIsAdmin({ allowDev: true })
    if (!isAdmin) {
      return notFound()
    }
  }

  return (
    <>
      <SimpleDataCard data={game} />
    </>
  )
}
