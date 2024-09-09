import { createId } from '@paralleldrive/cuid2'
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

export const createMatchWorkerManager = () => {
  const newWorker = () => {
    return new Worker(new URL('./matchWorker.ts', import.meta.url))
  }

  const getWorker = () => {
    // TODO: implement worker pool
    return newWorker()
  }

  const doJob = async ({ input }: { input: GenerateMatchInput }) => {
    const worker = getWorker()
    const workerInput: MatchWorkerInput = {
      jobId: createId(),
      input,
    }
    worker.postMessage(workerInput)
    return new Promise((resolve, reject) => {
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

  return {
    doJob,
  }
}
