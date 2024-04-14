import { PartyButton } from '@/components/demo/PartyButton'
import { Readme } from '@/components/demo/Readme'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function Page() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center gap-12 py-8">
        <h1 className="text-2xl lg:text-6xl">🎉 Welcome to the Party 🥳</h1>
        <div className="flex flex-col gap-2">
          <PartyButton />
          <Link
            href="https://github.com/new?template_name=party-starter&template_owner=rechenberger"
            target="_blank"
          >
            <Button variant={'outline'}>
              Use this template
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <Readme />
      </div>
    </>
  )
}
