'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const loginWithRedirect = async () => {
  let url = `/auth/login`

  const h = headers()
  const redirectUrl = h.get('Referer')
  if (redirectUrl) {
    url += `?redirect=${encodeURIComponent(redirectUrl)}`
  }

  redirect(url)
}

export const changePasswordWithRedirect = async () => {
  let url = `/auth/change-password`

  const h = headers()
  const redirectUrl = h.get('Referer')
  if (redirectUrl) {
    url += `?redirect=${encodeURIComponent(redirectUrl)}`
  }

  redirect(url)
}
