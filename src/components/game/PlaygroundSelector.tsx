'use client'

import {
  decodeLoadout,
  defaultLoadoutString,
  encodeLoadout,
  playgroundHref,
} from '@/app/(main)/admin/playground/playgroundHref'
import { LoadoutData } from '@/db/schema-zod'
import { createSeed } from '@/game/seed'
import { cn } from '@/lib/utils'
import { atom, useAtom } from 'jotai'
import { Check } from 'lucide-react'
import Link from 'next/link'

const playgroundBlueAtom = atom('')
const playgroundRedAtom = atom('')

export const PlaygroundSelector = ({ loadout }: { loadout: LoadoutData }) => {
  const [blue, setBlue] = useAtom(playgroundBlueAtom)
  const [red, setRed] = useAtom(playgroundRedAtom)

  const key = encodeLoadout(loadout)
  const isBlue = blue === key
  const isRed = red === key

  return (
    <>
      <div className="flex flex-row overflow-hidden rounded-md bg-border">
        <button
          onClick={() => (isBlue ? setBlue('') : setBlue(key))}
          className={cn(
            'p-1 flex-1 flex flex-row justify-center items-center',
            isBlue ? 'bg-blue-500' : 'bg-blue-500/20',
          )}
        >
          <Check className={cn('size-4', isBlue ? 'visible' : 'invisible')} />
        </button>
        <Link
          href={playgroundHref({
            loadouts: [
              decodeLoadout(blue || defaultLoadoutString),
              decodeLoadout(red || defaultLoadoutString),
            ],
            mode: 'fight',
            seed: createSeed(),
          })}
          target="_blank"
          className="px-1 flex-1 flex flex-row justify-center items-center"
        >
          vs
        </Link>
        <button
          onClick={() => (isRed ? setRed('') : setRed(key))}
          className={cn(
            'p-1 flex-1 flex flex-row justify-center items-center',
            isRed ? 'bg-red-500' : 'bg-red-500/20',
          )}
        >
          <Check className={cn('size-4', isRed ? 'visible' : 'invisible')} />
        </button>
      </div>
    </>
  )
}
