import { Button } from '@/components/ui/button'
import {
  streamDialog,
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { createStreamableUI } from 'ai/rsc'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
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
            const ui = createStreamableUI(
              <div className="animate-spin">🎉</div>,
            )

            // Stream a toast to the client:
            streamToast({
              title: 'Party Streaming...',
              description: <div className="flex gap-2">{ui.value}</div>,
            })

            // LOOP:
            for (let i = 0; i < 10; i++) {
              // Update the streamable UI:
              ui.append(<div className="animate-spin">🎉</div>)
              // Wait a bit to simulate work:
              await new Promise((resolve) => setTimeout(resolve, 500))
            }

            // Tell streamable UI we're done
            ui.done()

            // Stream another toast to the client:
            streamToast({
              title: 'Party Streamed!',
              description: (
                <>
                  {/* Yes they can be nested, if you are a madman like me */}
                  <ActionButton
                    action={async () => {
                      'use server'
                      return superAction(async () => {
                        // Fetch the source code of this file
                        const file = await fetch(
                          'https://raw.githubusercontent.com/rechenberger/party-starter/main/src/components/demo/PartyButton.tsx',
                        ).then((res) => res.text())

                        // We can also Stream a dialog to the client:
                        streamDialog({
                          title: 'PartyButton.tsx',
                          content: (
                            <>
                              <div className="flex max-h-[60vh] max-w-full overflow-scroll text-xs">
                                <Markdown className="max-w-none">{`\`\`\`tsx\n${file}\n\`\`\``}</Markdown>
                              </div>
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
