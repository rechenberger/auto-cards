import { ReactNode } from 'react'

export const CardRow = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div className="flex flex-row gap-2 overflow-x-auto overflow-y-hidden">
        {children}
      </div>
    </>
  )
}
