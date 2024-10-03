"use client"

import { useState, useEffect } from 'react'
import SpaceBackground from './SpaceBackground'
import Goku from './Goku'

export default function Loading() {
  const [isLoaded, setIsLoaded] = useState(false)
  const gifUrl = "https://media.tenor.com/cJtDhl2-MP0AAAAi/goku-dragon-ball.gif"

  useEffect(() => {
    const img = new Image()
    img.onload = () => setIsLoaded(true)
    img.src = gifUrl
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <SpaceBackground/>
      <Goku gifUrl={gifUrl} />
      <div className="mt-16">
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 bg-pink-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}