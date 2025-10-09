import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import apiData from '../assets/APIreturnReasonable.json'

export default function StarSystem({ data, onBack }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const animationIdRef = useRef(null)
  const [isTestMode, setIsTestMode] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const [cameraPosition, setCameraPosition] = useState('overview')

  useEffect(() => {
    console.log('StarSystem useEffect - data:', data, 'apiData:', apiData)
    // If no specific data is provided, use the JSON data for test mode
    if (!data) {
      console.log('Setting test mode - no data provided')
      setIsTestMode(true)
      setAnalysisData(null)
      initTestMode()
    } else {
      console.log('Setting analysis mode - data provided:', data)
      setIsTestMode(false)
      setAnalysisData(data)
      initAnalysisMode()
    }
  }, [data])

  const initTestMode = () => {
    if (!mountRef.current) return

    // Clear existing scene
    if (sceneRef.current) {
      sceneRef.current.clear()
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 1) // Pure black background
    mountRef.current.appendChild(renderer.domElement)

    // Create a star field
    createStarField(scene)
    
    // Add some sample stars from the data
    if (apiData && apiData.data) {
      const sampleStars = apiData.data.slice(0, 50) // Show first 50 stars
      sampleStars.forEach((star, index) => {
        createStar(scene, star, index)
      })
    }

    camera.position.z = 100
    sceneRef.current = scene
    rendererRef.current = renderer
    cameraRef.current = camera

    animate()
  }

  const initAnalysisMode = () => {
    if (!mountRef.current || !analysisData) return

    // Clear existing scene
    if (sceneRef.current) {
      sceneRef.current.clear()
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 1)
    mountRef.current.appendChild(renderer.domElement)

    // TEST VERSION: Simple central sphere
    createTestCentralSphere(scene)
    
    // TEST VERSION: Simple orbital paths
    createTestOrbitalPaths(scene)

    // Position camera
    camera.position.set(0, 30, 80)
    camera.lookAt(0, 0, 0)
    
    sceneRef.current = scene
    rendererRef.current = renderer
    cameraRef.current = camera

    animate()
  }

  // TEST VERSION: Simple central sphere
  const createTestCentralSphere = (scene) => {
    const geometry = new THREE.SphereGeometry(2, 32, 32)
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.3
    })
    
    const sphere = new THREE.Mesh(geometry, material)
    sphere.position.set(0, 0, 0)
    sphere.userData = { type: 'centralStar' }
    scene.add(sphere)
    
    return sphere
  }

  // TEST VERSION: Simple orbital paths
  const createTestOrbitalPaths = (scene) => {
    const orbitalRadii = [8, 14, 20, 26] // Fixed orbital distances
    
    orbitalRadii.forEach((radius, index) => {
      const points = []
      const segments = 64
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ))
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({ 
        color: 0x444444,
        transparent: true,
        opacity: 0.5
      })
      
      const orbit = new THREE.Line(geometry, material)
      orbit.userData = { type: 'orbit', index, radius }
      scene.add(orbit)
    })
  }

  const createStarField = (scene) => {
    const starGeometry = new THREE.BufferGeometry()
    const starCount = 1000
    const positions = new Float32Array(starCount * 3)
    
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 2000
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.8
    })
    
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)
  }

  const createStar = (scene, starData, index) => {
    const radius = Math.max(0.5, (20 - (starData.Tmag || 10)) * 0.1)
    const geometry = new THREE.SphereGeometry(radius, 16, 16)
    const material = new THREE.MeshBasicMaterial({ 
      color: getStarColor(starData.Teff),
      emissive: getStarColor(starData.Teff),
      emissiveIntensity: 0.3
    })
    
    const star = new THREE.Mesh(geometry, material)
    
    // Position based on RA and Dec (simplified)
    const ra = (starData.RA_orig || 0) * (Math.PI / 180)
    const dec = (starData.Dec_orig || 0) * (Math.PI / 180)
    const distance = 50 + (starData.d || 100) * 0.1
    
    star.position.x = Math.cos(dec) * Math.cos(ra) * distance
    star.position.y = Math.sin(dec) * distance
    star.position.z = Math.cos(dec) * Math.sin(ra) * distance
    
    star.userData = { starData, type: 'star' }
    scene.add(star)
  }

  // COMMENTED OUT FOR TEST VERSION
  /*
  const createCentralStar = (scene, starData) => {
    // Use reasonable star size for visualization
    const starRadius = 2.0 // Fixed reasonable size
    
    const geometry = new THREE.SphereGeometry(starRadius, 32, 32)
    const material = new THREE.MeshBasicMaterial({ 
      color: getStarColor(parseFloat(starData.temperature) || 5800),
      emissive: getStarColor(parseFloat(starData.temperature) || 5800),
      emissiveIntensity: 0.5
    })
    
    const star = new THREE.Mesh(geometry, material)
    star.position.set(0, 0, 0)
    star.userData = { 
      starData, 
      type: 'centralStar',
      radius: starRadius,
      mass: starData.mass || 1.0,
      temperature: starData.temperature || 5800
    }
    scene.add(star)
    
    // Add glow effect proportional to star size
    const glowGeometry = new THREE.SphereGeometry(starRadius * 1.8, 32, 32)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: getStarColor(parseFloat(starData.temperature) || 5800),
      transparent: true,
      opacity: 0.15
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    star.add(glow)
    
    return star
  }
  */

  // COMMENTED OUT FOR TEST VERSION
  /*
  const createPlanet = (scene, planetData, index, centralStar) => {
    // Use simplified orbital mechanics for better visualization
    const period = parseFloat(planetData.period) || (1 + index) * 10 // days
    
    // Simplified orbital radius calculation for better viewing
    const orbitalRadius = 8 + (index * 6) // Fixed reasonable distances
    
    // Use real planet radius data but scale appropriately
    const planetRadius = Math.max(0.2, Math.min(1.5, parseFloat(planetData.radius) || 1.0) * 0.3)
    
    const geometry = new THREE.SphereGeometry(planetRadius, 16, 16)
    const material = new THREE.MeshPhongMaterial({ 
      color: getPlanetColor(planetData.type),
      shininess: 100
    })
    
    const planet = new THREE.Mesh(geometry, material)
    
    // Calculate orbital speed for smooth animation
    const orbitalSpeed = 0.005 + (index * 0.002) // Slower for outer planets
    
    planet.userData = { 
      planetData, 
      type: 'planet',
      orbitalRadius,
      orbitalSpeed,
      angle: Math.random() * Math.PI * 2,
      index,
      period: period,
      radius: planetRadius,
      mass: parseFloat(planetData.mass) || 1.0
    }
    
    // Position planet in orbit
    planet.position.x = Math.cos(planet.userData.angle) * orbitalRadius
    planet.position.z = Math.sin(planet.userData.angle) * orbitalRadius
    
    scene.add(planet)
    
    // Add planet label
    createPlanetLabel(scene, planet, planetData, index)
    
    return planet
  }
  */

  // COMMENTED OUT FOR TEST VERSION
  /*
  const createPlanetLabel = (scene, planet, planetData, index) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = 256
    canvas.height = 64
    
    context.fillStyle = 'rgba(0, 0, 0, 0.8)'
    context.fillRect(0, 0, canvas.width, canvas.height)
    
    context.fillStyle = 'white'
    context.font = '16px Arial'
    context.textAlign = 'center'
    context.fillText(`Planet ${index + 1}`, canvas.width / 2, 25)
    context.fillText(planetData.type, canvas.width / 2, 45)
    
    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(8, 2, 1)
    sprite.position.copy(planet.position)
    sprite.position.y += 3
    sprite.userData = { planet, type: 'label' }
    
    scene.add(sprite)
  }

  const createOrbitalPath = (scene, planetData, index, centralStar) => {
    // Use the same simplified orbital radius as the planet
    const orbitalRadius = 8 + (index * 6)
    
    const points = []
    const segments = 64
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      points.push(new THREE.Vector3(
        Math.cos(angle) * orbitalRadius,
        0,
        Math.sin(angle) * orbitalRadius
      ))
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ 
      color: 0x444444,
      transparent: true,
      opacity: 0.3
    })
    
    const orbit = new THREE.Line(geometry, material)
    orbit.userData = { type: 'orbit', index, radius: orbitalRadius }
    scene.add(orbit)
  }
  */

  // SIMPLIFIED ANIMATION FOR TEST VERSION
  const animate = () => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return
    
    animationIdRef.current = requestAnimationFrame(animate)
    
    // Rotate central sphere
    sceneRef.current.traverse((object) => {
      if (object.userData && object.userData.type === 'centralStar') {
        object.rotation.y += 0.01
      }
    })
    
    rendererRef.current.render(sceneRef.current, cameraRef.current)
  }

  const getStarColor = (temperature) => {
    if (!temperature) return 0xffaa00
    const temp = parseFloat(temperature)
    if (temp > 30000) return 0x9bb5ff
    if (temp > 10000) return 0xffffff
    if (temp > 7500) return 0xfff4e6
    if (temp > 6000) return 0xfff4e6
    if (temp > 5000) return 0xffaa00
    if (temp > 3500) return 0xff6600
    return 0xff0000
  }

  const getPlanetColor = (type) => {
    switch (type) {
      case 'Terrestrial': return 0x8B4513
      case 'Super-Earth': return 0x228B22
      case 'Mini-Neptune': return 0x4169E1
      case 'Neptune-like': return 0x0000CD
      case 'Gas Giant': return 0xFFD700
      default: return 0x808080
    }
  }

  const handlePlanetClick = (planet) => {
    setSelectedPlanet(planet.userData.planetData)
  }

  const changeCameraPosition = (position) => {
    if (!cameraRef.current) return
    
    setCameraPosition(position)
    
    switch (position) {
      case 'overview':
        cameraRef.current.position.set(0, 30, 80)
        cameraRef.current.lookAt(0, 0, 0)
        break
      case 'close':
        cameraRef.current.position.set(0, 5, 25)
        cameraRef.current.lookAt(0, 0, 0)
        break
      case 'side':
        cameraRef.current.position.set(50, 0, 0)
        cameraRef.current.lookAt(0, 0, 0)
        break
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }

    window.addEventListener('resize', handleResize)
      return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [])

  // Render analysis mode (3D solar system)
  if (!isTestMode && analysisData) {
  return (
      <div style={{ 
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#000000',
        overflow: 'hidden'
      }}>
        {/* 3D Scene Container */}
        <div 
          ref={mountRef}
          style={{ 
            width: '100%', 
            height: '100%',
            cursor: 'grab'
          }}
          onMouseDown={(e) => {
            if (e.target === mountRef.current) {
              e.target.style.cursor = 'grabbing'
            }
          }}
          onMouseUp={(e) => {
            e.target.style.cursor = 'grab'
          }}
        />

        {/* SIMPLIFIED UI OVERLAY FOR TEST */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          color: 'white'
        }}>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '2rem',
            color: '#ffaa00'
          }}>
            🌟 Test Solar System
          </h1>
          <p style={{ margin: '0', opacity: 0.8 }}>
            Central sphere with orbital paths
          </p>
        </div>

        {/* SIMPLIFIED CAMERA CONTROLS FOR TEST */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <button
            onClick={() => changeCameraPosition('overview')}
            style={{
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid #444',
              background: cameraPosition === 'overview' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📷 Overview
          </button>
          <button
            onClick={() => changeCameraPosition('close')}
            style={{
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid #444',
              background: cameraPosition === 'close' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔍 Close-up
          </button>
          <button
            onClick={() => changeCameraPosition('side')}
            style={{
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid #444',
              background: cameraPosition === 'side' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            👁️ Side View
          </button>
        </div>

        {/* SIMPLIFIED BACK BUTTON FOR TEST */}
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid #444',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            zIndex: 1000
          }}
        >
          ← Back to Starfield
        </button>
      </div>
    )
  }

  // Render test mode (simple 3D star field)
  return (
    <div style={{ 
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: '#000000',
      overflow: 'hidden'
    }}>
      {/* 3D Scene Container */}
      <div 
        ref={mountRef}
        style={{ 
          width: '100%', 
          height: '100%'
        }}
      />

      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        color: 'white'
      }}>
        <h1 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '2rem',
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🌌 Star Database (Test Mode)
        </h1>
        <p style={{ margin: '0', opacity: 0.8 }}>
          Showing stars from APIreturnReasonable.json
        </p>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          padding: '12px 24px',
          borderRadius: '8px',
          border: '1px solid #444',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          zIndex: 1000
        }}
      >
        ← Back to Starfield
      </button>
    </div>
  )
}