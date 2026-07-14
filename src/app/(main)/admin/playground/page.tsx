'use client'

import { useMeta } from '@/client/api/catalog'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createSeed } from '@/game/seed'
import { RotateCw } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PlaygroundEdit } from './PlaygroundEdit'
import { PlaygroundMatchView } from './PlaygroundMatchView'
import {
  PlaygroundParams,
  decodePlaygroundParams,
  playgroundHref,
} from './playgroundHref'

export default function Page() {
  const searchParams = useSearchParams()
  const meta = useMeta()
  if (meta.isLoading) return <QueryLoading label="Loading playground…" />
  if (meta.error || !meta.data) {
    return <QueryError error={meta.error} retry={() => void meta.refetch()} />
  }
  if (!meta.data.viewer?.isAdmin) {
    return <QueryError error={new Error('Admin access required')} />
  }

  const options = decodePlaygroundParams({
    loadouts: searchParams.get('loadouts') ?? undefined,
    seed: searchParams.get('seed') ?? undefined,
    mode: (searchParams.get('mode') as PlaygroundParams['mode']) ?? undefined,
  })

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
      {options.mode === 'edit' && (
        <PlaygroundEdit
          options={options}
          rulesetVersion={meta.data.rulesetVersion}
          numberOfRounds={meta.data.numberOfRounds}
        />
      )}
      {options.mode === 'fight' && <PlaygroundMatchView options={options} />}
    </>
  )
}
