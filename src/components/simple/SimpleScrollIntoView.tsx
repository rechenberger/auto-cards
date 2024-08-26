'use client'

import { useEffect, useRef } from 'react'

export const SimpleScrollIntoView = () => {
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (ref.current) {
      const el = ref.current
      const container = el.closest('.overflow-auto')
      if (container instanceof HTMLElement && el) {
        container.scrollTo({
          top: el.offsetTop - container.offsetHeight / 2,
          left: el.offsetLeft - container.offsetWidth / 2,
          behavior: 'smooth',
        })
      }
    }
  })

  return <span ref={ref} />
}
