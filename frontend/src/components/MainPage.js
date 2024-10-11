  import React, { useEffect, useState, useRef, useMemo } from 'react'
  import { Canvas, useFrame } from '@react-three/fiber'
  import { Environment, Points } from '@react-three/drei'
  import * as THREE from 'three'
  import Graph from './Graph'
  import Loading from './Loading'
  import History from './History'
  import { initDB, getGraph, saveGraph } from './IndexDBUtils'
  import SpaceBackground from './SpaceBackground'
  // import { is } from '@react-three/fiber/dist/declarations/src/core/utils'
  

  const backendapi = process.env.REACT_APP_API_URL;
  // console.log(backendapi) 

  function createMoonTexture() {
    const size = 1024
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    // Create gradient background
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
    gradient.addColorStop(0, '#fcfdf5')
    gradient.addColorStop(1, '#fcfdf5')
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
          <meshBasicMaterial color="ffffff" transparent opacity={0.2} />
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

  function Comets({ count = 30 }) {
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
    const [isLoading, setIsLoading] = useState(false) 
    const [graphData, setGraphData] = useState(null) 
    
    useEffect(() => {
      const loadExistingData = async () => {
        await initDB();
        const savedGraphData = localStorage.getItem('currentTopic');
        if (savedGraphData) {
          const graph = await getGraph(savedGraphData);
          if (graph) {
            setGraphData(graph);
            setLearningTopic(savedGraphData) ;
            //update url without triggering a new history entry
            window.history.replaceState({topic: savedGraphData}, '' , `?topic=${encodeURIComponent(savedGraphData)}`)
          }
        }
        return savedGraphData ;
      };

      // handle browser back/forward buttons
      const handlePopState = (event) => {
        if(event.state?.topic){
          loadTopicFromHistory(event.state.topic) ;
        }else{
          setGraphData(null) ;
          setLearningTopic('');
          localStorage.removeItem('currentTopic') ;
        }
      }

      const handleBeforeUnload = (event) => {
        // Check if it's a refresh (user pressed F5 or Ctrl+R)
        if (event.persisted || (window.performance && window.performance.navigation.type === 1)) {
          // It's a refresh, don't clear the state
          return;
        }

        // It's a page close, clear the state
        localStorage.removeItem('currentTopic');
      };

      window.addEventListener('popstate', handlePopState) ;
      window.addEventListener('beforeunload', handleBeforeUnload);

      //check url params on load
      const urlParams  = new URLSearchParams(window.location.search) ;
      const topicParam = urlParams.get('topic') ;
      
      const initializeData = async () => {
        const existingSavedGraphData = await loadExistingData();
        if(topicParam && !existingSavedGraphData){
          loadTopicFromHistory(topicParam);
        }
      };
  
      initializeData();

      return () => {
        window.removeEventListener('popstate', handlePopState) ;
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }

    }, []);


  const loadTopicFromHistory = async (topic) => {
    setIsLoading(true);
    try {
      const graph = await getGraph(topic);
      if (graph) {
        setGraphData(graph);
        setLearningTopic(topic);
        localStorage.setItem('currentTopic', topic);
      }
    } catch (error) {
      console.error('Error loading topic from history:', error);
    } finally {
      setIsLoading(false);
    }
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        // First, check if we already have this topic in IndexedDB
        const existingGraph = await getGraph(learningTopic);

        if (existingGraph) {
          setGraphData(existingGraph);

        } else {
          // If not in IndexedDB, fetch from backend
          const response = await fetch(`${backendapi}/api/learn?topic=${encodeURIComponent(learningTopic)}`);
          // console.log(response.json()) ;
          if (!response.ok) {
            throw new Error('Network response not ok');
          }
          const data = await response.json();

          // Save to IndexedDB
          await saveGraph(learningTopic, data);
          localStorage.setItem('currentTopic', learningTopic);

          setGraphData(data);
        }

        localStorage.setItem('currentTopic', learningTopic) ;

        // add a new history entry
        window.history.pushState(
          {topic: learningTopic},
          '',
          `?topic=${encodeURIComponent(learningTopic)}` 
        ) ;

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

      const handleTopicSelect = async (topic) => {
        setLearningTopic(topic);
        setIsLoading(true);

        try {
          const existingGraph = await getGraph(topic);
          if (existingGraph) {
            setGraphData(existingGraph);
            localStorage.setItem('currentTopic', topic);
            window.history.pushState(
              { topic }, 
              '', 
              `?topic=${encodeURIComponent(topic)}`
            );
          }
        } catch (error) {
          console.error('Error loading selected topic:', error);
        } finally {
          setIsLoading(false);
        }
      };

      const handleHomeClick = () => {
        setGraphData(null) ;
        setLearningTopic('') ;
        localStorage.removeItem('currentTopic') ;
        window.history.pushState(null, '', '/') ;
      } 

    return (
      <div>

      <History 
        onTopicClick={handleTopicSelect} 
        onHomeClick={handleHomeClick}  
      />
      { !isLoading && !graphData && ( 
          <div className="min-h-screen flex flex-col items-center justify-start p-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <SpaceBackground/>
            </div>
            <div className="w-full max-w-md aspect-square mt-8 mb-4 relative z-10 pointer-events-none">
              <Canvas camera={{ position: [0, 0, 3] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <GlowingMoon />
              </Canvas>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4 text-center relative z-10">What would you like to learn?</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-lg relative z-30">
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
          </div> )}

      {isLoading && <Loading/>}

      {!isLoading && graphData && (
        <div className="app-container">
          <div className="graph-wrapper" style={{ width: '100%', height: '600px' }}>
            <Graph data={graphData} />
          </div>
         
        </div>
      )}

      
  </div>
    )
  } 
