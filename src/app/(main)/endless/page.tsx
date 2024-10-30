import { getIsLoggedIn } from '@/auth/getMyUser'
import { UserButton } from '@/auth/UserButton'
import { AlphaTag } from '@/components/game/AlphaTag'
import { TitleScreen } from '@/components/game/TitleScreen'
import { fontHeading, fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { LatestGame } from '../LatestGame'

export default async function Page() {
  const isLoggedIn = await getIsLoggedIn()

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center py-8 mb-20 lg:mb-80">
        <div className="p-4 bg-background/80 rounded-lg flex flex-col gap-2 lg:gap-4 items-center">
          <div className="flex flex-col items-center my-4">
            <AlphaTag />
            <h1
              className={
                (cn(fontHeading.className), 'text-3xl self-center mt-2')
              }
            >
              Endless Mode
            </h1>
            <div
              className={cn(
                fontLore.className,
                'text-sm opacity-80 text-center',
              )}
            >
              Build your own collection of unique items.
              <br />
              Delve into increasingly difficult dungeons.
              <br />
              Legendary loot awaits.
            </div>
          </div>
          {isLoggedIn ? (
            <>
              <LatestGame gameMode="collector" />
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
