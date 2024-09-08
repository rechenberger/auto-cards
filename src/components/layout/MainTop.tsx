import { UserButton } from '@/auth/UserButton'
import { getIsAdmin } from '@/auth/getIsAdmin'
import { getIsLoggedIn } from '@/auth/getMyUser'
import { DarkModeToggle } from '@/components/layout/DarkModeToggle'
import dynamic from 'next/dynamic'
import { MainLogo } from './MainLogo'
import { MainTopNav } from './MainTopNav'

const MusicButton = dynamic(
  () => import('../game/MusicButton').then((mod) => mod.MusicButton),
  {
    ssr: false,
  },
)

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
      name: 'Items',
      href: '/items',
    },
    {
      name: 'Docs',
      href: '/docs',
    },
    {
      name: 'Playground',
      href: '/admin/playground',
      hidden: !isAdminOrDev,
    },
    {
      name: 'Simulation',
      href: '/admin/simulation',
      hidden: !isAdminOrDev,
    },
    {
      name: 'Bot',
      href: '/admin/bot',
      hidden: !isAdminOrDev,
    },
    {
      name: 'Users',
      href: '/admin/users',
      hidden: !isAdminOrDev,
    },
  ].filter((entry) => !entry.hidden)

  return (
    <>
      <div className="container flex flex-row items-center justify-between gap-6 py-6">
        <MainLogo />
        <div className="hidden flex-1 xl:flex">
          <MainTopNav entries={entries} />
          <UserButton />
        </div>
        <div className="flex flex-row">
          {/* <Button variant={'ghost'} size="icon" asChild>
            <Link
              href="https://github.com/rechenberger/party-starter"
              target="_blank"
            >
              <Github />
            </Link>
          </Button> */}
          <MusicButton />
          <DarkModeToggle />
        </div>
      </div>
      <div className="container flex pb-6 xl:hidden">
        <MainTopNav entries={entries} />
        <UserButton />
      </div>
    </>
  )
}
