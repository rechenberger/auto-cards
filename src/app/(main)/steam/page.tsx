import { CardTitle } from '@/components/ui/card'
import { Metadata } from 'next'
import { SteamClient } from './SteamClient'

export const metadata: Metadata = {
  title: 'Steam',
}

export default async function Page() {
  return (
    <>
      <CardTitle>Steam</CardTitle>
      <SteamClient />
    </>
  )
}
