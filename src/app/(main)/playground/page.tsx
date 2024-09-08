import { notFoundIfNotAdmin } from '@/auth/getIsAdmin'
import { Metadata } from 'next'
import { PlaygroundEdit } from './PlaygroundEdit'
import { PlaygroundMatchView } from './PlaygroundMatchView'
import { decodePlaygroundParams, PlaygroundParams } from './playgroundHref'

export const metadata: Metadata = {
  title: 'Playground',
}

export default async function Page({
  searchParams,
}: {
  searchParams?: PlaygroundParams
}) {
  await notFoundIfNotAdmin({ allowDev: true })

  const options = decodePlaygroundParams(searchParams ?? {})

  return (
    <>
      {options.mode === 'edit' && <PlaygroundEdit options={options} />}
      {options.mode === 'fight' && (
        <PlaygroundMatchView loadouts={options.loadouts} />
      )}
    </>
  )
}
