import { createMatchWorkerManager } from '@/game/matchWorkerManager'
import { ActionButton } from '@/super-action/button/ActionButton'

export default async function Page() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center">
        <ActionButton
          catchToast
          action={async () => {
            'use server'
            console.log('server')

            const matchInput = {
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
            }

            const manager = createMatchWorkerManager()
            const report = await manager.run({ input: matchInput })
            console.log('report', report)
            // console.log('worker', worker)
          }}
        >
          Go
        </ActionButton>
      </div>
    </>
  )
}
