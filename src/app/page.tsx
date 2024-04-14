import { GettingStarted } from '@/components/demo/GettingStarted'
import { TestCase } from '@/components/demo/TestCase'
import { fetchWikipedia } from '@/functions/fetchWikipedia.function'

export default function Page() {
  return (
    <>
      <GettingStarted />

      <div className="grid md:grid-cols-2 gap-4">
        <TestCase
          title="Basic Example"
          prompt="Congratulate the user that they have successfully setup the Teampilot SDK Starter!"
        />
        <TestCase
          title="Custom Function"
          prompt="How did Luna 25 land on the moon?"
          customFunctions={[fetchWikipedia]}
        />
      </div>
    </>
  )
}
