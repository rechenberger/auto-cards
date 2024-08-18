import { fontHeading } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export const MainLogo = ({
  size = 'default',
}: {
  size?: 'default' | 'huge'
}) => {
  return (
    <>
      <Link href="/" className="flex flex-row items-center gap-3">
        <div
          className={cn(
            'text-3xl flex flex-row gap-1 items-center',
            size === 'huge' && 'lg:text-8xl',
            fontHeading.className,
          )}
        >
          <span className="text-primary">Auto</span>
          <span className="">Cards</span>
        </div>
      </Link>
    </>
  )
}
