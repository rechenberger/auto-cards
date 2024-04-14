import { Markdown } from '@/components/demo/Markdown'
import { Card, CardContent } from '@/components/ui/card'
import { showToast, superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { createStreamableUI } from 'ai/rsc'
import { promises as fs } from 'fs'
import path from 'path'

export default async function Page() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center gap-12 py-8">
        <h1 className="text-2xl lg:text-6xl">🎉 Welcome to the Party 🥳</h1>
        <PartyButton />
        <Readme />
      </div>
    </>
  )
}

const PartyButton = () => {
  return (
    <>
      <ActionButton
        action={async () => {
          'use server'
          return superAction(async () => {
            const ui = createStreamableUI('🎉')
            showToast({
              title: 'Stream Party!',
              description: ui.value,
            })
            for (let i = 0; i < 10; i++) {
              ui.append('🎉')
              await new Promise((resolve) => setTimeout(resolve, 500))
            }
            ui.done()
          })
        }}
      >
        Stream Party!
      </ActionButton>
    </>
  )
}

const Readme = async () => {
  const p = path.join(process.cwd(), '/README.md')
  const readme = await fs.readFile(p, 'utf8')
  return (
    <>
      <Card className="max-w-full py-8">
        <CardContent>
          <Markdown className="break-words">{readme}</Markdown>
        </CardContent>
      </Card>
    </>
  )
}
