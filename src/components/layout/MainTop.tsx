import { UserButton } from '@/auth/UserButton'
import { getIsAdmin } from '@/auth/getIsAdmin'
import { getIsLoggedIn } from '@/auth/getMyUser'
import { DarkModeToggle } from '@/components/layout/DarkModeToggle'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import Link from 'next/link'
import { DevBadges } from './DevBadges'
import { MainTopNav } from './MainTopNav'

export const MainTop = async () => {
  const isAdminOrDev = await getIsAdmin({ allowDev: true })
  const isLoggedIn = await getIsLoggedIn()

  const entries = [
    {
      name: 'Home',
      href: '/',
    },
    {
      name: 'Me',
      href: '/auth/me',
      hidden: !isLoggedIn,
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
        <Link href="/" className="flex flex-row items-center gap-3">
          <div className="text-xl">
            <strong>
              Party <span className="text-primary">Starter</span>
            </strong>
          </div>
        </Link>
        <div className="hidden flex-1 xl:flex items-center gap-2">
          <MainTopNav entries={entries} />
          <DevBadges />
          <UserButton />
        </div>
        <div className="flex flex-row">
          <Button variant={'ghost'} size="icon" asChild>
            <Link
              href="https://github.com/rechenberger/party-starter"
              target="_blank"
            >
              <Github />
            </Link>
          </Button>
          <DarkModeToggle />
        </div>
      </div>
      <div className="container flex pb-6 xl:hidden items-center gap-2 flex-wrap">
        <MainTopNav entries={entries} />
        <DevBadges />
        <UserButton />
      </div>
    </>
  )
}
