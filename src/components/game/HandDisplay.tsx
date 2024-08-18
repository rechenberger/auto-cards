import { Fragment, ReactNode } from 'react'
import { HandDisplaySingle } from './HandDisplaySingle'

export const HandDisplay = ({ children }: { children: ReactNode[] }) => {
  return (
    <>
      {/* <div className="h-[360px]" /> */}
      <div className="relative bottom-20 inset-x-0 flex flex-row justify-center gap-2 mt-16">
        {children.map((card, idx) => {
          return (
            <Fragment key={idx}>
              <HandDisplaySingle
                position={idx}
                positionMax={children.length - 1}
              >
                {card}
              </HandDisplaySingle>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
