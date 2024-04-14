'use client'

import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const entries = [
  {
    name: 'Home',
    href: '/',
  },
]

export function MainTopNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'flex flex-1 flex-wrap items-center gap-4 lg:gap-6',
        className,
      )}
      {...props}
    >
      {entries.map((entry) => {
        const isActive =
          entry.href === '/'
            ? pathname === entry.href
            : pathname?.startsWith(entry.href)
        return (
          <Link
            key={entry.href}
            href={entry.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              !isActive && 'text-muted-foreground',
            )}
          >
            {entry.name}
          </Link>
        )
      })}
      <div className="flex-1" />
      <Link
        href={'https://teampilot.ai'}
        target="_blank"
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          'text-muted-foreground',
          'flex flex-row items-center gap-1',
        )}
      >
        <div>Teampilot AI</div>
        <ExternalLink className="h-3 w-3" />
      </Link>
    </nav>
  )
}
