import { Button } from '@/components/ui/button'
import {
  showDialog,
  showToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { createStreamableUI } from 'ai/rsc'
import { promises as fs } from 'fs'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import path from 'path'
import { Markdown } from './Markdown'

export const PartyButton = () => {
  return (
    <>
      {/* ActionButton can handle streaming from superActions: */}
      <ActionButton
        command={{
          // inject this action into the CMD+K menu
          // label: 'Stream Party!', // optional, defaults to children
          shortcut: {
            key: 'p', // Also set a keyboard-shortcut
          },
        }}
        action={async () => {
          'use server'

          // We have to wrap the action in a superAction to enable fun stuff:
          return superAction(async () => {
            // Create a streamable UI for in-toast-streaming
            const ui = createStreamableUI('🎉')

            // Stream a toast to the client:
            showToast({
              title: 'Party Streaming...',
              description: ui.value,
            })

            // LOOP:
            for (let i = 0; i < 10; i++) {
              // Update the streamable UI:
              ui.append('🎉')
              // Wait a bit to simulate work:
              await new Promise((resolve) => setTimeout(resolve, 500))
            }

            // Tell streamable UI we're done
            ui.done()

            // Stream another toast to the client:
            showToast({
              title: 'Party Streamed!',
              description: (
                <>
                  {/* This is a Server Component, have fun ;) */}
                  <ActionButton
                    action={async () => {
                      'use server'
                      return superAction(async () => {
                        const filePath = path.join(
                          process.cwd(),
                          '/src/components/demo/PartyButton.tsx',
                        )
                        const file = await fs.readFile(filePath, 'utf8')

                        showDialog({
                          title: 'How it works',
                          content: (
                            <>
                              <Markdown>{`\`\`\`tsx\n${file}\n\`\`\``}</Markdown>
                              <Link
                                href="https://github.com/rechenberger/party-starter/blob/main/src/components/demo/PartyButton.tsx"
                                target="_blank"
                              >
                                <Button>
                                  Goto Source
                                  <ExternalLink className="w-4 h-4 ml-1" />
                                </Button>
                              </Link>
                            </>
                          ),
                        })
                      })
                    }}
                  >
                    How?
                  </ActionButton>
                </>
              ),
            })
          })
        }}
      >
        Party!
      </ActionButton>
    </>
  )
}
