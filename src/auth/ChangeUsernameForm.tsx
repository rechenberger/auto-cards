'use client'

import { ChangeUsernameFormClient } from './ChangeUsernameFormClient'

export const ChangeUsernameForm = ({
  redirectUrl,
}: {
  redirectUrl?: string
}) => {
  return <ChangeUsernameFormClient redirectUrl={redirectUrl} />
}
