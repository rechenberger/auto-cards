import { cn } from '@/lib/utils'
import { ArrowRight, LucideIcon } from 'lucide-react'
import { ActionCommandClient } from './ActionCommandClient'
import { ActionCommandConfig } from './ActionCommandProvider'

export const ActionCommand = ({
  icon: Icon = ArrowRight,
  children,
  isLoading,
  ...command
}: ActionCommandConfig & {
  icon?: LucideIcon | null
  isLoading?: boolean
}) => {
  return (
    <>
      <ActionCommandClient {...command}>
        {!!Icon && (
          <Icon className={cn('size-4 mr-2', isLoading && 'animate-spin')} />
        )}
        {children}
      </ActionCommandClient>
    </>
  )
}
