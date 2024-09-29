import { cn } from '@/lib/utils'

export const ItemCardChip = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        'bg-[#313130] pl-4 pr-3 py-1',
        'rounded-l-full',
        'border-l-2 border-y-2 border-black',
        className,
      )}
    >
      <div className="text-xs">{children}</div>
    </div>
  )
}
