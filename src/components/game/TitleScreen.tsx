import { getAllItems } from '@/game/allItems'
import { Fragment } from 'react'
import { ItemCard } from './ItemCard'
import { TitleScreenClientDynamic } from './TitleScreenClientDynamic'

export const TitleScreen = async () => {
  const allItems = await getAllItems()

  const cards = allItems.map((item) => (
    <Fragment key={item.name}>
      <ItemCard key={item.name} name={item.name} size="80" disableTooltip />
    </Fragment>
  ))

  return (
    <>
      <TitleScreenClientDynamic>{cards}</TitleScreenClientDynamic>
    </>
  )
}
