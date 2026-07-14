'use client'

import { useCatalog, useMeta } from '@/client/api/catalog'
import { ItemName } from '@/game/allItems'
import { MatchReplayCardFrame } from './MatchReplayCard'
import { TitleScreenClientDynamic } from './TitleScreenClientDynamic'

export const TitleScreen = () => {
  const meta = useMeta()
  const catalog = useCatalog(meta.data?.viewer?.themeId)
  if (!catalog.data) return null

  const theme = catalog.data.themes.find(
    (candidate) => candidate.name === catalog.data?.imageThemeId,
  )
  if (!theme) return null

  const cards = catalog.data.items.flatMap((item) => {
    const name = ItemName.safeParse(item.name)
    if (!name.success) return []
    const imageUrl = catalog.data.images.find(
      (image) => image.itemId === item.name,
    )?.url
    return [
      <MatchReplayCardFrame
        key={item.name}
        itemData={{ name: name.data }}
        item={item}
        theme={theme}
        imageUrl={imageUrl}
        size="80"
        onlyTop={false}
        nonInteractive
      />,
    ]
  })

  return <TitleScreenClientDynamic>{cards}</TitleScreenClientDynamic>
}
