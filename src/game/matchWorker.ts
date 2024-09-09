import { generateMatch } from '@/game/generateMatch'
import { parentPort } from 'worker_threads'
import { MatchWorkerInput, MatchWorkerOutput } from './matchWorkerManager'

const main = async () => {
  parentPort?.on('message', async (message: MatchWorkerInput) => {
    const output = await generateMatch(message.input)
    parentPort?.postMessage({
      jobId: message.jobId,
      output,
    } satisfies MatchWorkerOutput)
  })
}

main()
