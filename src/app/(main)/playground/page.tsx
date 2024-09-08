import { notFoundIfNotAdmin } from '@/auth/getIsAdmin'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Metadata } from 'next'
import Link from 'next/link'
import { PlaygroundEdit } from './PlaygroundEdit'
import { PlaygroundMatchView } from './PlaygroundMatchView'
import {
  decodePlaygroundParams,
  playgroundHref,
  PlaygroundParams,
} from './playgroundHref'

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
      <Tabs defaultValue={options.mode} className="self-center">
        <TabsList>
          <TabsTrigger value="fight" asChild>
            <Link href={playgroundHref({ ...options, mode: 'fight' })}>
              Fight
            </Link>
          </TabsTrigger>
          <TabsTrigger value="edit">
            <Link href={playgroundHref({ ...options, mode: 'edit' })}>
              Edit
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {options.mode === 'edit' && <PlaygroundEdit options={options} />}
      {options.mode === 'fight' && (
        <PlaygroundMatchView loadouts={options.loadouts} />
      )}
    </>
  )
}
