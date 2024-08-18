import dynamic from 'next/dynamic'

const TitleScreenClient = dynamic(
  () => import('./TitleScreenClient').then((m) => m.TitleScreenClient),
  {
    ssr: false,
  },
)

export const TitleScreen = async () => {
  return (
    <>
      <TitleScreenClient />
    </>
  )
}
