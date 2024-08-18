import { getIsLoggedIn } from '@/auth/getMyUser'
import { TitleScreen } from '@/components/game/TitleScreen'

export default async function Page() {
  const isLoggedIn = await getIsLoggedIn()
  // if (isLoggedIn) {
  //   redirect('/game')
  // }

  return (
    <>
      {/* <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 mb-80">
        <h1 className={cn('font-bold text-2xl lg:text-6xl')}>
          Auto <span className="text-primary">Cards</span>
        </h1>
        <UserButton />
      </div> */}
      <div className=" flex-1 h-screen">
        <TitleScreen />
      </div>
    </>
  )
}
