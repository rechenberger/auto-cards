import { CraftingList } from '@/components/game/CraftingList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crafting',
}

export default async function Page() {
  return (
    <>
      <CraftingList />
    </>
  )
}
