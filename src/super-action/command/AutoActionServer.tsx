import { Suspense } from 'react'

export const AutoActionServer = ({
  action,
}: {
  action: () => Promise<void>
}) => {
  const promise = action()
  return <Suspense fallback={null}>{promise.then(() => null)}</Suspense>
}
