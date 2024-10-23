// @ts-nocheck React Three Fiber types look broken in react 19

'use client'

import { rngFloat, SeedArray } from '@/game/seed'
import { Html } from '@react-three/drei'
import { Canvas, Euler, useFrame, Vector3 } from '@react-three/fiber'
import { range } from 'lodash-es'
import { ReactNode, useMemo, useRef } from 'react'
import { Mesh } from 'three/src/Three.js'

// FROM: https://teampilot.ai/team/tristan/chat/eacdf40de2b8991cac2577c4b3d7a8d4

const Card = ({ seed, children }: { seed: SeedArray; children: ReactNode }) => {
  const meshRef = useRef<Mesh | undefined>()

  const minY = -8
  const maxY = -1 * minY

  useFrame((state, delta) => {
    if (!meshRef.current) return
    if (delta > 0.1) return // Skip if too much time has passed
    // Apply continuous rotation
    meshRef.current.rotation.x += delta * 1
    meshRef.current.rotation.y += delta * 1
    meshRef.current.position.y -= delta * 5 // Falling effect
    if (meshRef.current.position.y < minY) {
      meshRef.current.position.y = maxY // Reset to top
    }
  })

  const position: Vector3 = useMemo(
    () => [
      rngFloat({ seed: [...seed, 'position', 'x'], min: -10, max: 10 }),
      rngFloat({ seed: [...seed, 'position', 'y'], min: minY, max: maxY }),
      rngFloat({ seed: [...seed, 'position', 'z'], min: -5, max: 2 }),
    ],
    [maxY, minY, seed],
  ) as Vector3

  const rotation = useMemo(
    () =>
      range(3).map(
        (idx) => rngFloat({ seed: [...seed, 'rotation', idx] }) * Math.PI,
      ),
    [seed],
  ) as Euler

  return (
    <mesh ref={meshRef as any} position={position} rotation={rotation}>
      <planeGeometry args={[1, 1.5]} />
      <meshBasicMaterial attach="material" color="white"></meshBasicMaterial>
      <Html transform>{children}</Html>
    </mesh>
  )
}

export const TitleScreenClient = ({ children }: { children: ReactNode[] }) => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  if (isSafari) return null
  return (
    <Canvas style={{ position: 'fixed', inset: 0 }} className="-z-10">
      {/* <Stars /> */}
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {children.map((child, idx) => (
        <Card key={idx} seed={[idx]}>
          {child}
        </Card>
      ))}
    </Canvas>
  )
}
