import { parentPort } from 'worker_threads'

const main = async () => {
  // await generateMatch({
  //   participants: [],
  //   seed: ['123'],
  // })
  await new Promise((resolve) => setTimeout(resolve, 1000))
  parentPort?.postMessage('hi from matchWorker')
}

main()
