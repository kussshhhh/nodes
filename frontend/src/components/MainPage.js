import React, { useState, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Points } from '@react-three/drei'
import * as THREE from 'three'

function createMoonTexture() {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Create gradient background
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
  gradient.addColorStop(0, '#d0d0d0')
  gradient.addColorStop(1, '#909090')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // Add craters
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const radius = Math.random() * 10 + 2
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(60, 60, 60, ${Math.random() * 0.2})`
    ctx.fill()
  }

  return new THREE.CanvasTexture(canvas)
}

function GlowingMoon() {
  const moonRef = useRef()
  const glowRef = useRef()
  const moonTexture = useMemo(() => createMoonTexture(), [])
  
  useFrame((state, delta) => {
    moonRef.current.rotation.y += delta * 0.1
    glowRef.current.rotation.y += delta * 0.1
  })

  return (
    <group>
      <mesh ref={moonRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial map={moonTexture} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshBasicMaterial color="#b3d9ff" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

function Stars({ count = 5000 }) {
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100
    }
    return positions
  }, [count])

  return (
    <Points positions={positions}>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.8} />
    </Points>
  )
}

function Comets({ count = 20 }) {
  const meshes = useMemo(() => {
    return new Array(count).fill().map(() => {
      return {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
      }
    })
  }, [count])

  useFrame(() => {
    meshes.forEach((mesh) => {
      mesh.position.add(mesh.velocity)
      if (mesh.position.length() > 50) {
        mesh.position.set(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        )
      }
    })
  })

  return (
    <>
      {meshes.map((mesh, i) => (
        <mesh key={i} position={mesh.position}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
      ))}
    </>
  )
}

export default function LearningPage() {
  const [learningTopic, setLearningTopic] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(`User wants to learn about: ${learningTopic}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-start p-4 relative overflow-hidden" style={{
      backgroundImage: 'linear-gradient(to bottom right, #1a1a1a, #000000)',
      boxShadow: 'inset 0 0 100px 20px rgba(255,255,255,0.1)'
    }}>
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Stars />
          <Comets />
          <Environment preset="night" />
        </Canvas>
      </div>
      <div className="w-full max-w-md aspect-square mt-8 mb-4 relative z-10">
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <GlowingMoon />
        </Canvas>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 text-center relative z-10">What would you like to learn?</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-lg relative z-10">
        <div className="flex gap-2">
          <input
            type="text"
            value={learningTopic}
            onChange={(e) => setLearningTopic(e.target.value)}
            placeholder="Enter a topic..."
            className="flex-grow bg-white bg-opacity-10 text-white placeholder-gray-400 border border-gray-600 rounded-md p-3 text-lg"
          />
          <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-3 rounded-md text-lg" style={{
            backgroundColor: '#ff1493',
            boxShadow: '0 0 10px #ff1493, 0 0 20px #ff1493, 0 0 30px #ff1493',
            transition: 'all 0.3s ease'
          }}>
            Learn
          </button>
        </div>
      </form>
    </div>
  )
}