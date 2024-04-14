import { DarkModeToggle } from '@/components/layout/DarkModeToggle'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import Link from 'next/link'
import { MainTopNav } from './MainTopNav'

export const MainTop = () => {
  return (
    <>
      <div className="container flex flex-row items-center justify-between gap-6 py-6">
        <Link href="/" className="flex flex-row items-center gap-3">
          <div className="text-xl">
            <strong>
              Teampilot <span className="text-primary">Starter</span>
            </strong>
          </div>
        </Link>
        <div className="hidden flex-1 xl:flex">
          <MainTopNav />
        </div>
        <div className="flex flex-row">
          <Link
            href="https://github.com/SODEFA-GmbH-Co-KG/teampilot-starter"
            target="_blank"
          >
            <Button variant={'ghost'} size="icon">
              <Github />
            </Button>
          </Link>
          <DarkModeToggle />
        </div>
      </div>
      <div className="container flex pb-6 xl:hidden">
        <MainTopNav />
      </div>
    </>
  )
}
