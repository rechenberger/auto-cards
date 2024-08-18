import { getIsLoggedIn } from '@/auth/getMyUser'
import { UserButton } from '@/auth/UserButton'
import { TitleScreen } from '@/components/game/TitleScreen'
import { MainLogo } from '@/components/layout/MainLogo'
import { LatestGame } from './LatestGame'

export default async function Page() {
  const isLoggedIn = await getIsLoggedIn()
  // if (isLoggedIn) {
  //   redirect('/game')
  // }

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center py-8 mb-20 lg:mb-80">
        <div className="p-4 bg-background/80 rounded-lg flex flex-col gap-2 lg:gap-4 items-center">
          <MainLogo size="big" />
          {isLoggedIn ? (
            <>
              <LatestGame />
            </>
          ) : (
            <UserButton />
          )}
        </div>
      </div>
      <TitleScreen />
    </>
  )
}
