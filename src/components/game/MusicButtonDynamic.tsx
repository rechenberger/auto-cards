'use client'

import dynamic from 'next/dynamic'

const MusicButton = dynamic(
  () => import('../game/MusicButton').then((mod) => mod.MusicButton),
  { ssr: false },
)
export const MusicButtonDynamic = () => {
  return <MusicButton />
}
