import { ActionCommandClient } from './ActionCommandClient'
import { ActionCommandConfig } from './ActionCommandProvider'

export const ActionCommand = ({
  children,
  ...command
}: ActionCommandConfig) => {
  return <ActionCommandClient {...command}>{children}</ActionCommandClient>
}
