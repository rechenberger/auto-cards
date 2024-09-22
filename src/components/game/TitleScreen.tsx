import { getAllItems } from '@/game/allItems'
import dynamic from 'next/dynamic'
import { Fragment } from 'react'
import { ItemCard } from './ItemCard'

const TitleScreenClient = dynamic(
  () => import('./TitleScreenClient').then((m) => m.TitleScreenClient),
  {
    ssr: false,
  },
)

export const TitleScreen = async () => {
  const allItems = await getAllItems()

  const cards = allItems.map((item) => (
    <Fragment key={item.name}>
      <ItemCard key={item.name} name={item.name} size="80" disableTooltip />
    </Fragment>
  ))

  return (
    <>
      <TitleScreenClient>{cards}</TitleScreenClient>
    </>
  )
}
