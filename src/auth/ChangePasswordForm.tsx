'use client'

import { ChangePasswordFormClient } from './ChangePasswordFormClient'

export const ChangePasswordForm = ({
  redirectUrl,
}: {
  redirectUrl?: string
}) => {
  return <ChangePasswordFormClient redirectUrl={redirectUrl} />
}
