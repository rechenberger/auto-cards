import { UserButton } from '@/auth/UserButton'
import { getIsAdmin } from '@/auth/getIsAdmin'
import { getIsLoggedIn } from '@/auth/getMyUser'
import { DarkModeToggle } from '@/components/layout/DarkModeToggle'
import { DEFAULT_GAME_VERSION, GAME_VERSION } from '@/game/config'
import { Github } from 'lucide-react'
import Link from 'next/link'
import { MusicButtonDynamic } from '../game/MusicButtonDynamic'
import { Button } from '../ui/button'
import { DevBadges } from './DevBadges'
import { MainLogo } from './MainLogo'
import { MainTopNav } from './MainTopNav'

export const MainTop = async () => {
  const isAdminOrDev = await getIsAdmin({ allowDev: true })
  const isLoggedIn = await getIsLoggedIn()

  const entries = [
    {
      name: 'Home',
      href: '/',
      hidden: isLoggedIn,
    },
    {
      name: 'Game',
      href: '/game',
      hidden: !isLoggedIn,
    },
    {
      name: 'Watch',
      href: '/watch',
    },
    {
      name: 'Docs',
      href: '/docs',
    },
    {
      name: 'Admin',
      href: '/admin',
      hidden: !isAdminOrDev,
    },
  ].filter((entry) => !entry.hidden)

  return (
    <>
      <div className="container max-md:px-4 flex flex-row items-center justify-between gap-6 py-6">
        <MainLogo />
        <div className="hidden flex-1 xl:flex items-center gap-2">
          <MainTopNav entries={entries} />
          {GAME_VERSION !== DEFAULT_GAME_VERSION && (
            <div className="text-sm bg-red-500/50 rounded-md px-2 py-1">
              v{GAME_VERSION}
            </div>
          )}
          <DevBadges />
          <UserButton />
        </div>
        <div className="flex flex-row">
          <MusicButtonDynamic />
          <Button variant={'ghost'} size="icon" asChild>
            <Link
              href="https://github.com/rechenberger/auto-cards"
              target="_blank"
            >
              <Github />
            </Link>
          </Button>
          <DarkModeToggle />
        </div>
      </div>
      <div className="container max-md:px-4  flex pb-6 xl:hidden items-center gap-2 flex-wrap">
        <MainTopNav entries={entries} />
        <DevBadges />
        <UserButton />
      </div>
    </>
  )
}
