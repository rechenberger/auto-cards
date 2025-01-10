import { CardTitle } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Steam',
}

export default async function Page() {
  return (
    <>
      <CardTitle>Steam</CardTitle>
    </>
  )
}
