'use client'

import React, { useEffect, useState } from 'react'
import { getAllGraphTopics } from './IndexDBUtils'
import { Home } from 'lucide-react'

export default function History({ onTopicClick, isGraphVisible, onHomeClick }) {
  const [topics, setTopics] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const fetchedTopics = await getAllGraphTopics()
        setTopics(fetchedTopics)
      } catch (error) {
        console.error('Failed to load topics:', error)
      }
    }
    
    loadTopics()
  }, [])

  return (
     <div 
      className="fixed top-0 left-0 z-50" 
      style={{
        height: '100%',
        width: '64px', // Width of the button area
        pointerEvents: 'none' // Make the whole container pass through clicks by default
      }}
    >
      <div 
        className="absolute top-4 z-50 flex items-center" 
        style={{
          left: isGraphVisible ? '70px' : '4px',
          transition: 'left 0.3s ease',
          pointerEvents: 'auto' // Restore click events for buttons
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2 rounded-md mr-2"
          style={{
            backgroundColor: '#ff1493',
            boxShadow: '0 0 10px #ff1493, 0 0 20px #ff1493, 0 0 30px #ff1493',
            transition: 'all 0.3s ease',
          }}
        >
          {isOpen ? '<<' : '☰'}
        </button>
        <button
          onClick={onHomeClick}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold p-2 rounded-md flex items-center justify-center"
          style={{
            backgroundColor: '#ff1493',
            boxShadow: '0 0 10px #ff1493, 0 0 20px #ff1493, 0 0 30px #ff1493',
            transition: 'all 0.3s ease',
            width: '40px',
            height: '40px'
          }}
        >
          <Home size={24} />
        </button>
      </div>
      <div 
        className={`w-64 h-full bg-black bg-opacity-30 backdrop-blur-sm border-r border-gray-800 overflow-y-auto transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          pointerEvents: isOpen ? 'auto' : 'none' // Only block interactions when open
        }}
      >
        <div className="p-4 mt-20">
          <h2 className="text-xl font-bold text-white mb-4">History</h2>
          <div className="space-y-2">
            {topics.map((topic, index) => (
              <button
                key={index}
                className="w-full text-left text-white hover:bg-white hover:bg-opacity-10 py-2 px-3 rounded transition duration-200"
                onClick={() => {
                  onTopicClick(topic)
                  setIsOpen(false)
                }}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}