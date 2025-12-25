import { ReactNode } from 'react'

interface StreamableUIWrapper {
  value: ReactNode
  update(newValue: ReactNode): void
  append(appendedValue: ReactNode): void
  done(finalValue?: ReactNode): void
}

/**
 * A simple streamable UI utility that mimics the AI SDK's createStreamableUI.
 * This is used for streaming React components in server actions.
 *
 * Based on the pattern from AI SDK v3 ai/rsc, adapted for v6 where this was removed.
 */
export function createStreamableUI(
  initialValue?: ReactNode,
): StreamableUIWrapper {
  let currentValue: ReactNode = initialValue ?? null
  let isDone = false

  // Simple implementation using a mutable reference pattern
  // that works with React Server Components streaming
  const wrapper: StreamableUIWrapper = {
    value: initialValue as ReactNode,
    update(newValue: ReactNode) {
      if (isDone) {
        throw new Error('Cannot update a done streamable UI')
      }
      currentValue = newValue
      wrapper.value = newValue
    },
    append(appendedValue: ReactNode) {
      if (isDone) {
        throw new Error('Cannot append to a done streamable UI')
      }
      // For append, we wrap both old and new in a fragment
      const combined: ReactNode = (
        <>
          {currentValue}
          {appendedValue}
        </>
      )
      currentValue = combined
      wrapper.value = combined
    },
    done(finalValue?: ReactNode) {
      if (isDone) {
        throw new Error('Streamable UI is already done')
      }
      isDone = true
      if (finalValue !== undefined) {
        currentValue = finalValue
        wrapper.value = finalValue
      }
    },
  }

  return wrapper
}

export type StreamableUI = StreamableUIWrapper
