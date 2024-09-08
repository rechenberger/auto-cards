import { notFoundIfNotAdmin } from '@/auth/getIsAdmin'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createSeed } from '@/game/seed'
import { RotateCw } from 'lucide-react'
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
      <div className="self-center flex flex-row row gap-2">
        <Tabs value={options.mode} className="">
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
        <Button variant="outline" asChild>
          <Link href={playgroundHref({ ...options, seed: createSeed() })}>
            <RotateCw className="size-4 mr-2" />
            Reroll Seed
          </Link>
        </Button>
      </div>
      {options.mode === 'edit' && <PlaygroundEdit options={options} />}
      {options.mode === 'fight' && <PlaygroundMatchView options={options} />}
    </>
  )
}
