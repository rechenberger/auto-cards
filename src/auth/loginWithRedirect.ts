'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const loginWithRedirect = async () => {
  let url = `/auth/login`

  const h = await headers()
  const redirectUrl = h.get('Referer')

  // Prevent unnecessary redirects:
  if (redirectUrl?.includes(url)) return

  if (redirectUrl) {
    url += `?redirect=${encodeURIComponent(redirectUrl)}`
  }

  redirect(url)
}

export const changePasswordWithRedirect = async () => {
  let url = `/auth/change-password`

  const h = await headers()
  const redirectUrl = h.get('Referer')

  // Prevent unnecessary redirects:
  if (redirectUrl?.includes(url)) return

  if (redirectUrl) {
    url += `?redirect=${encodeURIComponent(redirectUrl)}`
  }

  redirect(url)
}
