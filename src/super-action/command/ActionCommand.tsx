import { ArrowRight, LucideIcon } from 'lucide-react'
import { ActionCommandClient } from './ActionCommandClient'
import { ActionCommandConfig } from './ActionCommandProvider'

export const ActionCommand = ({
  icon: Icon = ArrowRight,
  children,
  ...command
}: ActionCommandConfig & {
  icon?: LucideIcon | null
}) => {
  return (
    <>
      <ActionCommandClient {...command}>
        {!!Icon && <Icon className="mr-2 h-4 w-4" />}
        {children}
      </ActionCommandClient>
    </>
  )
}
