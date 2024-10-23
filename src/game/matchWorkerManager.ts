import { createId } from '@paralleldrive/cuid2'
import { range } from 'lodash-es'
import { Worker } from 'worker_threads'
import { WORKER_COUNT, WORKER_MAX_LISTENERS } from './config'
import { GenerateMatchInput, MatchReport } from './generateMatch'

export type MatchWorkerInput = {
  jobId: string
  input: GenerateMatchInput
}

export type MatchWorkerOutput =
  | {
      jobId: string
      output: MatchReport
    }
  | {
      jobId: string
      error: string
    }

export const createMatchWorkerManager = ({
  noOfWorkers = WORKER_COUNT,
  maxListeners = WORKER_MAX_LISTENERS,
}: {
  noOfWorkers?: number
  maxListeners?: number
} = {}) => {
  const newWorker = () => {
    const worker = new Worker(new URL('./matchWorker.ts', import.meta.url))
    worker.setMaxListeners(maxListeners)
    return worker
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
      const listener = (message: MatchWorkerOutput) => {
        if (message.jobId === workerInput.jobId) {
          if ('output' in message) {
            resolve(message.output)
          } else {
            reject(message.error)
          }
          worker.off('message', listener)
        }
      }
      worker.on('message', listener)
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
  // return generateMatch(input)
}
