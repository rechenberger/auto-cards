// @ts-nocheck React Three Fiber's beta types do not fully model React 19.

'use client'

import { rngFloat, SeedArray } from '@/game/seed'
import { Html } from '@react-three/drei'
import { Canvas, Euler, useFrame, Vector3 } from '@react-three/fiber'
import { range } from 'lodash-es'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import type { Mesh } from 'three'

const MIN_Y = -8
const MAX_Y = 8

const FallingCard = ({
  seed,
  children,
}: {
  seed: SeedArray
  children: ReactNode
}) => {
  const meshRef = useRef<Mesh>()

  useFrame((_state, delta) => {
    if (!meshRef.current || delta > 0.1) return
    meshRef.current.rotation.x += delta
    meshRef.current.rotation.y += delta
    meshRef.current.position.y -= delta * 5
    if (meshRef.current.position.y < MIN_Y) meshRef.current.position.y = MAX_Y
  })

  const position = useMemo(
    () =>
      [
        rngFloat({ seed: [...seed, 'position', 'x'], min: -10, max: 10 }),
        rngFloat({ seed: [...seed, 'position', 'y'], min: MIN_Y, max: MAX_Y }),
        rngFloat({ seed: [...seed, 'position', 'z'], min: -5, max: 2 }),
      ] as Vector3,
    [seed],
  )
  const rotation = useMemo(
    () =>
      range(3).map(
        (index) => rngFloat({ seed: [...seed, 'rotation', index] }) * Math.PI,
      ) as Euler,
    [seed],
  )

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[1, 1.5]} />
      <meshBasicMaterial attach="material" color="white" />
      <Html transform>
        <div aria-hidden="true" inert className="pointer-events-none">
          {children}
        </div>
      </Html>
    </mesh>
  )
}

export const TitleScreenClient = ({ children }: { children: ReactNode[] }) => {
  const [reduceMotion, setReduceMotion] = useState(true)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  if (isSafari || reduceMotion) return null

  return (
    <Canvas
      style={{ position: 'fixed', inset: 0 }}
      className="pointer-events-none -z-10"
      aria-hidden="true"
    >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {children.map((child, index) => (
        <FallingCard key={index} seed={[index]}>
          {child}
        </FallingCard>
      ))}
    </Canvas>
  )
}
