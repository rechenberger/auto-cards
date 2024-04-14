import { PartyButton } from '@/components/demo/PartyButton'
import { Readme } from '@/components/demo/Readme'

export default async function Page() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center gap-12 py-8">
        <h1 className="text-2xl lg:text-6xl">🎉 Welcome to the Party 🥳</h1>
        <PartyButton />
        <Readme />
      </div>
    </>
  )
}
