import { showToast, superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { createStreamableUI } from 'ai/rsc'

export const PartyButton = () => {
  return (
    <>
      <ActionButton
        action={async () => {
          'use server'
          return superAction(async () => {
            const ui = createStreamableUI('🎉')
            showToast({
              title: 'Streaming Party...',
              description: ui.value,
            })
            for (let i = 0; i < 10; i++) {
              ui.append('🎉')
              await new Promise((resolve) => setTimeout(resolve, 500))
            }
            ui.done()
            showToast({
              title: 'Party Stream Complete',
              description: '',
            })
          })
        }}
      >
        Party!
      </ActionButton>
    </>
  )
}
