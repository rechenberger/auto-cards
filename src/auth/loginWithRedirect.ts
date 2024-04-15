'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const loginWithRedirect = async () => {
  let url = `/auth/signin`

  const h = headers()
  const redirectUrl = h.get('Referer')
  if (redirectUrl) {
    url += `?redirect=${encodeURIComponent(redirectUrl)}`
  }

  redirect(url)
}
