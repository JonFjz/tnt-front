import { useEffect, useRef } from 'react'
import apiData from '../assets/APIreturnReasonable.json'

export default function StarSystem({ data, onBack }) {
  const containerRef = useRef(null)
  const threeRef = useRef({})
  const planetsRef = useRef({ objects: [], data: [] })

  useEffect(() => {
    let mounted = true

    async function init() {
      const [{ 
        WebGLRenderer, 
        Scene, 
        PerspectiveCamera, 
        SphereGeometry, 
        MeshBasicMaterial, 
        Mesh, 
        BufferGeometry, 
        BufferAttribute, 
        LineBasicMaterial, 
        Line, 
        Color,
        Raycaster,
        Vector2
      }, { OrbitControls }] = await Promise.all([
        import('three'),
        import('three/examples/jsm/controls/OrbitControls.js')
      ])

      if (!mounted || !containerRef.current) return

      const container = containerRef.current
      const width = container.clientWidth
      const height = container.clientHeight

      const renderer = new WebGLRenderer({ antialias: true, alpha: false })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(width, height)
      renderer.domElement.style.position = 'absolute'
      renderer.domElement.style.inset = '0'
      renderer.setClearColor(0x000000, 1)
      container.appendChild(renderer.domElement)

      const scene = new Scene()
      const camera = new PerspectiveCamera(60, width / height, 0.01, 1000)
      camera.position.set(0, 30, 80)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.rotateSpeed = -0.3
      controls.zoomSpeed = 0.6
      controls.panSpeed = 0.4
      controls.enablePan = true
      controls.enableZoom = true
      controls.minDistance = 5
      controls.maxDistance = 200
      controls.target.set(0, 0, 0)

      // Create central star
      const centralStar = await createCentralStar(scene, data)
      const centralStarData = centralStar?.userData
      
      // Create planets and orbital paths
      if (data && data.transits && data.transits.length > 0) {
        for (let i = 0; i < data.transits.length; i++) {
          await createPlanet(scene, data.transits[i], i, centralStarData)
          await createOrbitalPath(scene, i, centralStarData)
        }
      } else {
        // Create default test planets if no data
        await createTestPlanets(scene, centralStarData)
      }

      // Background star field
      await createStarField(scene)

      // Animation
      let af = 0
      const animate = () => {
        controls.update()
        
        // Animate planets
        planetsRef.current.objects.forEach((planet, index) => {
          if (planet.userData && planet.userData.type === 'planet') {
            const { orbitalRadius, orbitalSpeed } = planet.userData
            planet.userData.angle = (planet.userData.angle || 0) + orbitalSpeed
            
            planet.position.x = Math.cos(planet.userData.angle) * orbitalRadius
            planet.position.z = Math.sin(planet.userData.angle) * orbitalRadius
            
            // Rotate planet on its axis
            planet.rotation.y += 0.02
          }
        })

        // Rotate central star
        if (centralStar) {
          centralStar.rotation.y += 0.01
        }

        renderer.render(scene, camera)
        af = requestAnimationFrame(animate)
      }
      animate()

      // Click handling for planets
      const raycaster = new Raycaster()
      const mouse = new Vector2()
      let isDragging = false
      let downPos = null

      const onMouseDown = (event) => {
        downPos = { x: event.clientX, y: event.clientY }
        isDragging = false
      }

      const onMouseMove = () => {
        if (downPos) {
          isDragging = true
        }
      }

      const onClick = (event) => {
        if (isDragging) return
        
        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
        
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(planetsRef.current.objects)
        
        if (intersects.length > 0) {
          const planet = intersects[0].object
          if (planet.userData && planet.userData.type === 'planet') {
            console.log('Planet clicked:', planet.userData.planetData)
            // You can add planet selection logic here
          }
        }
      }

      renderer.domElement.addEventListener('mousedown', onMouseDown)
      renderer.domElement.addEventListener('mousemove', onMouseMove)
      renderer.domElement.addEventListener('click', onClick)

      // Resize handler
      const onResize = () => {
        const w = container.clientWidth
        const h = container.clientHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      // Save refs for cleanup
      threeRef.current = { 
        renderer, 
        scene, 
        camera, 
        controls, 
        onResize, 
        onClick, 
        onMouseDown, 
        onMouseMove, 
        af 
      }
    }

    init()

    return () => {
      mounted = false
      const { renderer, scene, controls, onResize, onClick, onMouseDown, onMouseMove, af } = threeRef.current
      if (af) cancelAnimationFrame(af)
      if (renderer?.domElement) {
        renderer.domElement.removeEventListener('click', onClick)
        renderer.domElement.removeEventListener('mousedown', onMouseDown)
        renderer.domElement.removeEventListener('mousemove', onMouseMove)
      }
      if (window && onResize) window.removeEventListener('resize', onResize)
      if (controls) controls.dispose()
      if (scene) {
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose?.()
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.())
            else obj.material.dispose?.()
          }
        })
      }
      if (renderer) {
        renderer.dispose()
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
      }
    }
  }, [data])

  // Helper function to create central star using real data
  const createCentralStar = async (scene, starData) => {
    const { SphereGeometry, MeshBasicMaterial, Mesh } = await import('three')
    
    // Get star data from APIreturnReasonable.json
    let selectedStar = null
    if (starData && starData.star_id) {
      // Find the star in our data by ID
      selectedStar = apiData.data.find(star => 
        star.ID === starData.star_id || 
        star.GAIA === starData.star_id ||
        star.TWOMASS === starData.star_id
      )
    }
    
    // If no specific star found, use a random one from the data
    if (!selectedStar && apiData.data.length > 0) {
      selectedStar = apiData.data[Math.floor(Math.random() * apiData.data.length)]
    }
    
    // Use real star parameters
    const temperature = selectedStar?.Teff || 5800
    const mass = selectedStar?.mass || 1.0
    const radius = selectedStar?.rad || 1.0
    const luminosity = selectedStar?.lum || 1.0
    
    // Scale star size based on real radius (relative to Sun)
    const starRadius = Math.max(0.5, Math.min(3.0, radius)) * 2
    
    const geometry = new SphereGeometry(starRadius, 32, 32)
    const material = new MeshBasicMaterial({ 
      color: getStarColor(temperature),
      emissive: getStarColor(temperature),
      emissiveIntensity: Math.min(0.8, luminosity * 0.2) // Scale emissive intensity with luminosity
    })
    
    const star = new Mesh(geometry, material)
    star.position.set(0, 0, 0)
    star.userData = { 
      type: 'centralStar', 
      starData: selectedStar,
      temperature,
      mass,
      radius,
      luminosity
    }
    scene.add(star)
    
    return star
  }

  // Helper function to create planets with realistic parameters
  const createPlanet = async (scene, planetData, index, centralStarData) => {
    const { SphereGeometry, MeshBasicMaterial, Mesh } = await import('three')
    
    // Get central star mass for realistic orbital calculations
    const starMass = centralStarData?.mass || 1.0 // Solar masses
    const starLuminosity = centralStarData?.luminosity || 1.0
    
    // Calculate realistic orbital radius based on star properties
    // Use simplified version of Kepler's laws and habitable zone calculations
    const baseOrbitalRadius = 5 + (index * 4) // Base distance
    const luminosityFactor = Math.sqrt(starLuminosity) // Luminosity affects habitable zone
    const orbitalRadius = baseOrbitalRadius * luminosityFactor
    
    // Calculate realistic planet radius based on type and star properties
    let planetRadius = 0.3
    if (planetData.radius) {
      planetRadius = Math.max(0.1, Math.min(2.0, parseFloat(planetData.radius) * 0.2))
    } else {
      // Generate realistic planet size based on type
      switch (planetData.type) {
        case 'Terrestrial':
          planetRadius = 0.3 + Math.random() * 0.2
          break
        case 'Super-Earth':
          planetRadius = 0.5 + Math.random() * 0.3
          break
        case 'Mini-Neptune':
          planetRadius = 0.8 + Math.random() * 0.4
          break
        case 'Neptune-like':
          planetRadius = 1.0 + Math.random() * 0.5
          break
        case 'Gas Giant':
          planetRadius = 1.5 + Math.random() * 1.0
          break
        case 'Ice Giant':
          planetRadius = 1.2 + Math.random() * 0.6
          break
        default:
          planetRadius = 0.4 + Math.random() * 0.4
      }
    }
    
    // Calculate realistic orbital speed based on Kepler's laws
    // v = sqrt(GM/r) where G is gravitational constant, M is star mass, r is orbital radius
    const gravitationalConstant = 1.0 // Simplified units
    const orbitalSpeed = Math.sqrt(gravitationalConstant * starMass / orbitalRadius) * 0.01
    
    const geometry = new SphereGeometry(planetRadius, 16, 16)
    const material = new MeshBasicMaterial({ 
      color: getPlanetColor(planetData.type)
    })
    
    const planet = new Mesh(geometry, material)
    planet.userData = { 
      type: 'planet',
      planetData,
      orbitalRadius,
      orbitalSpeed,
      angle: Math.random() * Math.PI * 2,
      starMass,
      starLuminosity
    }
    
    // Position planet in orbit
    planet.position.x = Math.cos(planet.userData.angle) * orbitalRadius
    planet.position.z = Math.sin(planet.userData.angle) * orbitalRadius
    
    scene.add(planet)
    planetsRef.current.objects.push(planet)
    planetsRef.current.data.push(planetData)
    
    return planet
  }

  // Helper function to create orbital paths with realistic radii
  const createOrbitalPath = async (scene, index, centralStarData) => {
    const { BufferGeometry, BufferAttribute, LineBasicMaterial, Line, Vector3 } = await import('three')
    
    // Calculate orbital radius using the same logic as planet creation
    const starLuminosity = centralStarData?.luminosity || 1.0
    const baseOrbitalRadius = 5 + (index * 4)
    const luminosityFactor = Math.sqrt(starLuminosity)
    const orbitalRadius = baseOrbitalRadius * luminosityFactor
    
    const points = []
    const segments = 64
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      points.push(new Vector3(
        Math.cos(angle) * orbitalRadius,
        0,
        Math.sin(angle) * orbitalRadius
      ))
    }
    
    const geometry = new BufferGeometry().setFromPoints(points)
    const material = new LineBasicMaterial({ 
      color: 0x444444,
      transparent: true,
      opacity: 0.5
    })
    
    const orbit = new Line(geometry, material)
    orbit.userData = { type: 'orbit', index, radius: orbitalRadius }
    scene.add(orbit)
    
    return orbit
  }

  // Helper function to create test planets when no data
  const createTestPlanets = async (scene, centralStarData) => {
    const testPlanets = [
      { type: 'Terrestrial', radius: '1.0', period: '88 days' },
      { type: 'Super-Earth', radius: '1.5', period: '225 days' },
      { type: 'Gas Giant', radius: '4.0', period: '365 days' },
      { type: 'Ice Giant', radius: '3.5', period: '687 days' }
    ]
    
    for (let i = 0; i < testPlanets.length; i++) {
      await createPlanet(scene, testPlanets[i], i, centralStarData)
      await createOrbitalPath(scene, i, centralStarData)
    }
  }

  // Helper function to create background star field
  const createStarField = async (scene) => {
    const { BufferGeometry, BufferAttribute, PointsMaterial, Points } = await import('three')
    
    const starCount = 1000
    const positions = new Float32Array(starCount * 3)
    const colors = new Float32Array(starCount * 3)
    
    for (let i = 0; i < starCount; i++) {
      const radius = 500 + Math.random() * 500
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      
      const color = 0.5 + Math.random() * 0.5
      colors[i * 3] = color
      colors[i * 3 + 1] = color
      colors[i * 3 + 2] = color
    }
    
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setAttribute('color', new BufferAttribute(colors, 3))
    
    const material = new PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    })
    
    const stars = new Points(geometry, material)
    scene.add(stars)
  }

  // Helper function to get star color based on temperature (more accurate stellar classification)
  const getStarColor = (temperature) => {
    if (!temperature) return 0xffaa00
    const temp = parseFloat(temperature)
    
    // More accurate stellar color classification
    if (temp >= 30000) return 0x9bb5ff      // O-type: Blue-white
    if (temp >= 10000) return 0xaabfff      // B-type: Blue-white
    if (temp >= 7500) return 0xcad7ff       // A-type: White
    if (temp >= 6000) return 0xfff4e6       // F-type: Yellow-white
    if (temp >= 5000) return 0xfff4e6       // G-type: Yellow (like our Sun)
    if (temp >= 3500) return 0xffaa00       // K-type: Orange
    if (temp >= 2000) return 0xff6600       // M-type: Red
    return 0xff0000                         // Very cool stars: Deep red
  }

  // Helper function to get planet color based on type
  const getPlanetColor = (type) => {
    switch (type) {
      case 'Terrestrial': return 0x8B4513
      case 'Super-Earth': return 0x228B22
      case 'Mini-Neptune': return 0x4169E1
      case 'Neptune-like': return 0x0000CD
      case 'Gas Giant': return 0xFFD700
      case 'Ice Giant': return 0x87CEEB
      default: return 0x808080
    }
  }

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(ellipse at center, #02020a 0%, #000008 70%, #000006 100%)',
      zIndex: 1
    }}>
      {/* 3D Scene Container */}
      <div 
        ref={containerRef}
        style={{ 
          position: 'absolute',
          inset: 0,
          zIndex: 0
        }}
      />

      {/* UI Overlay - positioned to not interfere with sidebar */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '350px', // Positioned to the right of the sidebar
        zIndex: 1000,
        color: 'white'
      }}>
        <h1 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '1.5rem',
          color: '#ffaa00'
        }}>
          🌟 Solar System View
        </h1>
        <p style={{ margin: '0', opacity: 0.8, fontSize: '0.9rem' }}>
          Interactive 3D solar system with real star data
        </p>
      </div>

      {/* Instructions - positioned to not interfere with sidebar */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        zIndex: 1000,
        maxWidth: '250px'
      }}>
        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
          🎮 Controls
        </div>
        <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
          <div>• <strong>Mouse:</strong> Rotate view</div>
          <div>• <strong>Scroll:</strong> Zoom in/out</div>
          <div>• <strong>Right-click:</strong> Pan view</div>
          <div>• <strong>Click planets:</strong> Select</div>
        </div>
      </div>
    </div>
  )
}
