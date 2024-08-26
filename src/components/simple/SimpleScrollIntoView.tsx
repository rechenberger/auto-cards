'use client'

import { useEffect, useRef } from 'react'

export const SimpleScrollIntoView = () => {
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })
  })

  return <span ref={ref} />
}
