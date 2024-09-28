import { fontHeading } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export const MainLogo = ({
  size = 'default',
}: {
  size?: 'default' | 'big'
}) => {
  return (
    <>
      <Link
        href="/"
        className={cn(
          'flex flex-col items-center -space-y-2',
          fontHeading.className,
          size === 'big' && 'scale-[2] mx-28 my-8',
        )}
      >
        <div
          className={cn(
            'text-3xl flex flex-col gap-1 -space-y-4 items-center',
            // size === 'huge' && 'lg:text-6xl',
          )}
        >
          <span className="text-primary">Auto</span>
          {/* <span
            className={cn(
              'text-xl',

              // size === 'huge' && 'lg:text-3xl'
            )}
          >
            of
          </span> */}
          <span className="">Cards</span>
        </div>
        {/* <div
          className={cn(
            'text-xs',
            // size === 'huge' && 'lg:text-5xl',
            // fontLore.className,
          )}
        >
          Automatic Card Battle Game
        </div> */}
      </Link>
    </>
  )
}
