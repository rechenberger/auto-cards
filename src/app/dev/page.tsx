import { ActionButton } from '@/super-action/button/ActionButton'
import { Worker } from 'worker_threads'

export default async function Page() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center">
        <ActionButton
          catchToast
          action={async () => {
            'use server'
            console.log('server')
            // const piscina = new Piscina({
            //   // filename: new URL('./worker.js', import.meta.url).href,
            //   filename: new URL(
            //     'http://localhost:3000/worker/workerino.js',
            //   ).toString(),
            //   maxThreads: 4, // Adjust based on your needs
            // })
            // const result = await piscina.run({})
            // console.log('result', result)
            const worker = new Worker(
              new URL('./matchWorker.ts', import.meta.url),
            )
            worker.on('message', (message) => {
              console.log('message', message)
            })
            worker.on('error', (error) => {
              console.log('error', error)
            })
            worker.on('online', () => {
              console.log('online')
            })
            worker.on('exit', () => {
              console.log('exit')
            })
            worker.postMessage({
              message: 'hello from main thread',
            })
            // console.log('worker', worker)
          }}
        >
          Go
        </ActionButton>
      </div>
    </>
  )
}
