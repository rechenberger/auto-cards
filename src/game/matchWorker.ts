import { generateMatch } from '@/game/generateMatch'
import { parentPort } from 'worker_threads'
import { MatchWorkerInput, MatchWorkerOutput } from './matchWorkerManager'

const main = async () => {
  parentPort?.on('message', (message: MatchWorkerInput) => {
    try {
      const output = generateMatch(message.input)
      parentPort?.postMessage({
        jobId: message.jobId,
        output,
      } satisfies MatchWorkerOutput)
    } catch (error) {
      parentPort?.postMessage({
        jobId: message.jobId,
        error: error?.toString() ?? 'Unknown error',
      } satisfies MatchWorkerOutput)
    }
  })
}

main()
