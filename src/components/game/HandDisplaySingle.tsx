'use client'

import { ReactNode, useState } from 'react'

export const HandDisplaySingle = ({
  position,
  positionMax,
  children,
}: {
  position: number
  positionMax: number
  children: ReactNode
}) => {
  const [isHovering, setIsHovering] = useState(false)
  const mid = positionMax / 2
  const midDiff = position - mid
  const midDiffAbs = Math.abs(midDiff)
  const maxRotation = Math.min(30, 10 * positionMax)
  const rotation = (midDiff / mid) * maxRotation
  const maxWidth =
    positionMax > 5 ? 1200 : Math.min(600, 200 * (positionMax + 1))
  const actualWidth = 240 * (positionMax + 1) + 8 * positionMax
  const translateX = (1 / 2) * (midDiff / mid) * (maxWidth - actualWidth)
  const translateY = 40 + midDiffAbs * (positionMax >= 10 ? 10 : 20)

  return (
    <>
      <div
        className="transition-all"
        style={
          isHovering
            ? {
                zIndex: 1,
                scale: 1,
                translate: `${translateX}px 0`,
              }
            : {
                rotate: isHovering ? '' : `${rotation}deg`,
                scale: 0.8,
                translate: `${translateX}px ${translateY}px`,
              }
        }
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {children}
      </div>
    </>
  )
}
