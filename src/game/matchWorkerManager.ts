import { createId } from '@paralleldrive/cuid2'
import { range } from 'lodash-es'
import { Worker } from 'worker_threads'
import { GenerateMatchInput, MatchReport } from './generateMatch'

export type MatchWorkerInput = {
  jobId: string
  input: GenerateMatchInput
}

export type MatchWorkerOutput = {
  jobId: string
  output: MatchReport
}

export const createMatchWorkerManager = ({
  noOfWorkers = 8,
}: {
  noOfWorkers?: number
} = {}) => {
  const newWorker = () => {
    return new Worker(new URL('./matchWorker.ts', import.meta.url))
  }

  const workers = range(noOfWorkers).map(newWorker)
  const getWorker = () => {
    const idx = Math.floor(Math.random() * workers.length)
    return workers[idx]
  }

  const run = async ({ input }: { input: GenerateMatchInput }) => {
    const worker = getWorker()
    const workerInput: MatchWorkerInput = {
      jobId: createId(),
      input,
    }
    worker.postMessage(workerInput)
    return new Promise<MatchReport>((resolve, reject) => {
      worker.on('message', (message) => {
        if (message.jobId === workerInput.jobId) {
          resolve(message.output)
        }
      })
      // worker.on('error', (error) => {
      //   reject(error)
      // })
    })
  }

  const terminate = async () => {
    await Promise.all(workers.map((worker) => worker.terminate()))
  }

  return {
    run,
    terminate,
  }
}

export type MatchWorkerManager = ReturnType<typeof createMatchWorkerManager>

const manager = createMatchWorkerManager()

export const generateMatchByWorker = async (input: GenerateMatchInput) => {
  return manager.run({ input })
}
