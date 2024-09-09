import { generateMatch } from '@/game/generateMatch'
import { parentPort } from 'worker_threads'

const main = async () => {
  const matchReport = await generateMatch({
    skipLogs: true,
    participants: [
      {
        loadout: {
          items: [{ name: 'hero', count: 1 }],
        },
      },
      {
        loadout: {
          items: [{ name: 'hero', count: 1 }],
        },
      },
    ],
    seed: ['123'],
  })
  await new Promise((resolve) => setTimeout(resolve, 1000))
  parentPort?.postMessage(matchReport)
}

main()
