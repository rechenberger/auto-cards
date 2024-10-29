import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ReactNode } from 'react'

export const SimpleTooltip = ({
  tooltip,
  children,
}: {
  tooltip: ReactNode
  children: ReactNode
}) => {
  if (!tooltip) return children
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
