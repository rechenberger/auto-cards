'use client'

import { rngFloat, SeedArray } from '@/game/seed'
import { Html, Stars } from '@react-three/drei'
import { Canvas, Euler, useFrame, Vector3 } from '@react-three/fiber'
import { range } from 'lodash-es'
import { useRef } from 'react'
import { Mesh } from 'three/src/Three.js'

// FROM: https://teampilot.ai/team/tristan/chat/eacdf40de2b8991cac2577c4b3d7a8d4

const Card = ({ seed }: { seed: SeedArray }) => {
  const meshRef = useRef<Mesh | undefined>()

  useFrame(() => {
    if (!meshRef.current) return
    // Apply continuous rotation
    meshRef.current.rotation.x += 0.01
    meshRef.current.rotation.y += 0.01
    meshRef.current.position.y -= 0.01 // Falling effect
    if (meshRef.current.position.y < -5) {
      meshRef.current.position.y = 5 // Reset to top
    }
  })

  const position = range(3).map(
    (idx) => rngFloat({ seed: [...seed, 'position', idx] }) * 10 - 5,
  ) as Vector3

  const rotation = range(3).map(
    (idx) => rngFloat({ seed: [...seed, 'rotation', idx] }) * Math.PI,
  ) as Euler

  return (
    <mesh ref={meshRef as any} position={position} rotation={rotation}>
      <planeGeometry args={[1, 1.5]} />
      <meshBasicMaterial attach="material" color="white"></meshBasicMaterial>
      <Html transform>
        <div className="card">Your HTML Card Content</div>
      </Html>
    </mesh>
  )
}

export const TitleScreen = () => {
  return (
    <Canvas style={{ position: 'fixed', inset: 0 }}>
      <Stars />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {range(10).map((idx) => (
        <Card key={idx} seed={[idx]} />
      ))}
    </Canvas>
  )
}
