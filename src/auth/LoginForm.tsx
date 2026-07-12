'use client'

import { AuthFormClient } from './AuthFormClient'

export const LoginForm = ({ redirectUrl }: { redirectUrl?: string }) => {
  return <AuthFormClient redirectUrl={redirectUrl} />
}
