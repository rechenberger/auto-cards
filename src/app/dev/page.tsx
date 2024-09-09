import { ActionButton } from '@/super-action/button/ActionButton'

import Piscina from 'piscina'

let piscina: Piscina | null = null

function getPiscina() {
  if (!piscina) {
    piscina = new Piscina({
      // filename: new URL('./worker.js', import.meta.url).href,
      filename: new URL('http://localhost:3000/worker/worker.js').href,
      maxThreads: 4, // Adjust based on your needs
    })
  }
  return piscina
}

export default async function Page() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center">
        <ActionButton
          catchToast
          action={async () => {
            'use server'
            console.log('server')
            const result = await getPiscina().run({})
            console.log('result', result)
          }}
        >
          Go
        </ActionButton>
      </div>
    </>
  )
}
