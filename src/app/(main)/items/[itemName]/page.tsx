import { ItemCard } from '@/components/game/ItemCard'
import { capitalCase } from 'change-case'
import { Metadata } from 'next'

type PageProps = {
  params: {
    itemName: string
  }
}

export const generateMetadata = async ({
  params: { itemName },
}: PageProps): Promise<Metadata> => ({
  title: capitalCase(itemName),
})

export default async function Page({ params: { itemName } }: PageProps) {
  return (
    <>
      <ItemCard name={itemName} size="480" />
    </>
  )
}
