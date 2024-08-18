import { UserButton } from '@/auth/UserButton'
import { getIsAdmin } from '@/auth/getIsAdmin'
import { getIsLoggedIn } from '@/auth/getMyUser'
import { DarkModeToggle } from '@/components/layout/DarkModeToggle'
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
      name: 'Simulation',
      href: '/simulation',
      hidden: !isAdminOrDev,
    },
    {
      name: 'Bot',
      href: '/bot',
      hidden: !isAdminOrDev,
    },
    {
      name: 'Items',
      href: '/items',
    },
    {
      name: 'Users',
      href: '/users',
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
