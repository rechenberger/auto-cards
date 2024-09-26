'use client'

import { Button } from '@/components/ui/button'
import { generateMatch } from '@/game/generateMatch'
import { PlaygroundOptions } from './playgroundHref'

export const ClientMatchButton = ({
  options,
}: {
  options: PlaygroundOptions
}) => {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        const report = await generateMatch({
          participants: options.loadouts.map((l) => ({ loadout: l })),
          seed: [options.seed],
        })
        console.log(report)
      }}
    >
      Client Match
    </Button>
  )
}
