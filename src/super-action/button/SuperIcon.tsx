import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { ArrowRight, Loader2 } from 'lucide-react'
import { ReactNode } from 'react'

export const SuperIcon = ({
  icon = <ArrowRight />,
  isLoading = false,
  className,
}: {
  icon?: ReactNode
  isLoading?: boolean
  className?: string
}) => {
  const Icon = isLoading ? <Loader2 /> : icon
  return (
    <Slot className={cn('size-4', isLoading && 'animate-spin', className)}>
      {Icon}
    </Slot>
  )
}
