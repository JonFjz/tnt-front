import { useEffect, useRef } from 'react'
import apiData from '../assets/APIreturnReasonable.json'

// Three.js is loaded dynamically to avoid SSR issues and keep bundle lean
export default function Starfield({ apiUrl = 'https://tnt.thot.info/api', onStarSelected, selectedStar, ra = 266.4170, dec = -29.0078, radius = 30, temp_min = 3000, temp_max = 4500 }) {
	const containerRef = useRef(null)
	const threeRef = useRef({})
	const starsRef = useRef({ points: null, data: [] })

	// Enhanced background creation function
	const createEnhancedBackground = async (scene) => {
		const { 
			BufferGeometry, 
			BufferAttribute, 
			PointsMaterial, 
			Points, 
			SphereGeometry, 
			MeshBasicMaterial, 
			Mesh, 
			BackSide,
			Color,
			ShaderMaterial,
			PlaneGeometry
		} = await import('three')

		// 1. Create realistic night sky sphere with texture
		await createNightSkySphere(scene)
		
		// 2. Create multiple layers of background stars
		await createBackgroundStarLayers(scene)
		
		// 3. Create nebula and supernova structures using noise
		await createNebulaStructures(scene)
		
		// 4. Add bright distant stars
		await createBrightDistantStars(scene)
	}

	// Create realistic night sky sphere with starmap texture
	const createNightSkySphere = async (scene) => {
		const { SphereGeometry, MeshBasicMaterial, Mesh, BackSide, Color, TextureLoader } = await import('three')
		
		// Create a large sphere for the night sky background
		const skyGeometry = new SphereGeometry(15000, 128, 64)
		
		// Load the starmap texture
		const textureLoader = new TextureLoader()
		const starmapTexture = textureLoader.load('/starmap_2020_4k copy.jpg')
		
		// Configure texture for proper UV mapping
		starmapTexture.wrapS = starmapTexture.wrapT = 1000 // RepeatWrapping
		starmapTexture.flipY = false // Don't flip Y for proper orientation
		
		const skyMaterial = new MeshBasicMaterial({ 
			map: starmapTexture,
			side: BackSide, 
			depthWrite: false,
			transparent: false,
			opacity: 1.0
		})
		
		const skyMesh = new Mesh(skyGeometry, skyMaterial)
		scene.add(skyMesh)
	}

	// Create multiple layers of background stars
	const createBackgroundStarLayers = async (scene) => {
		const { BufferGeometry, BufferAttribute, PointsMaterial, Points, Color } = await import('three')
		
		// Layer 1: Very distant faint stars (8000+ stars)
		const distantCount = 12000
		const distantPos = new Float32Array(distantCount * 3)
		const distantCol = new Float32Array(distantCount * 3)
		const distantSizes = new Float32Array(distantCount)
		
		for (let i = 0; i < distantCount; i++) {
			const ra = Math.random() * Math.PI * 2
			const dec = (Math.random() - 0.5) * Math.PI
			const r = 8000 + Math.random() * 4000
			const x = r * Math.cos(dec) * Math.cos(ra)
			const y = r * Math.sin(dec)
			const z = r * Math.cos(dec) * Math.sin(ra)
			
			distantPos[i * 3] = x
			distantPos[i * 3 + 1] = y
			distantPos[i * 3 + 2] = z
			
			// Vary star colors slightly
			const baseColor = 0.3 + Math.random() * 0.4
			distantCol[i * 3] = baseColor
			distantCol[i * 3 + 1] = baseColor + Math.random() * 0.1
			distantCol[i * 3 + 2] = baseColor + Math.random() * 0.1
			
			distantSizes[i] = 0.1 + Math.random() * 0.2
		}
		
		const distantGeom = new BufferGeometry()
		distantGeom.setAttribute('position', new BufferAttribute(distantPos, 3))
		distantGeom.setAttribute('color', new BufferAttribute(distantCol, 3))
		distantGeom.setAttribute('size', new BufferAttribute(distantSizes, 1))
		
		const distantMat = new PointsMaterial({ 
			vertexColors: true, 
			sizeAttenuation: true, 
			transparent: true, 
			opacity: 0.4,
			depthWrite: false, 
			depthTest: false 
		})
		const distantPoints = new Points(distantGeom, distantMat)
		scene.add(distantPoints)
		
		// Layer 2: Medium distance stars (5000+ stars)
		const mediumCount = 8000
		const mediumPos = new Float32Array(mediumCount * 3)
		const mediumCol = new Float32Array(mediumCount * 3)
		const mediumSizes = new Float32Array(mediumCount)
		
		for (let i = 0; i < mediumCount; i++) {
			const ra = Math.random() * Math.PI * 2
			const dec = (Math.random() - 0.5) * Math.PI
			const r = 3000 + Math.random() * 2000
			const x = r * Math.cos(dec) * Math.cos(ra)
			const y = r * Math.sin(dec)
			const z = r * Math.cos(dec) * Math.sin(ra)
			
			mediumPos[i * 3] = x
			mediumPos[i * 3 + 1] = y
			mediumPos[i * 3 + 2] = z
			
			const baseColor = 0.5 + Math.random() * 0.3
			mediumCol[i * 3] = baseColor
			mediumCol[i * 3 + 1] = baseColor + Math.random() * 0.15
			mediumCol[i * 3 + 2] = baseColor + Math.random() * 0.15
			
			mediumSizes[i] = 0.2 + Math.random() * 0.3
		}
		
		const mediumGeom = new BufferGeometry()
		mediumGeom.setAttribute('position', new BufferAttribute(mediumPos, 3))
		mediumGeom.setAttribute('color', new BufferAttribute(mediumCol, 3))
		mediumGeom.setAttribute('size', new BufferAttribute(mediumSizes, 1))
		
		const mediumMat = new PointsMaterial({ 
			vertexColors: true, 
			sizeAttenuation: true, 
			transparent: true, 
			opacity: 0.6,
			depthWrite: false, 
			depthTest: false 
		})
		const mediumPoints = new Points(mediumGeom, mediumMat)
		scene.add(mediumPoints)
	}

	// Create nebula and supernova structures using noise
	const createNebulaStructures = async (scene) => {
		const { BufferGeometry, BufferAttribute, PointsMaterial, Points, Color } = await import('three')
		
		// Create several nebula structures at different distances
		const nebulaCount = 15
		for (let n = 0; n < nebulaCount; n++) {
			const nebulaRadius = 2000 + Math.random() * 3000
			const nebulaCenter = {
				x: (Math.random() - 0.5) * nebulaRadius * 2,
				y: (Math.random() - 0.5) * nebulaRadius * 2,
				z: (Math.random() - 0.5) * nebulaRadius * 2
			}
			
			const particleCount = 2000 + Math.random() * 3000
			const positions = new Float32Array(particleCount * 3)
			const colors = new Float32Array(particleCount * 3)
			const sizes = new Float32Array(particleCount)
			
			for (let i = 0; i < particleCount; i++) {
				// Use Voronoi-like distribution for nebula structure
				const angle = Math.random() * Math.PI * 2
				const phi = Math.random() * Math.PI
				const distance = Math.random() * nebulaRadius
				
				// Add noise for organic structure
				const noise1 = Math.sin(angle * 3) * Math.cos(phi * 2) * 0.3
				const noise2 = Math.sin(angle * 5) * Math.cos(phi * 3) * 0.2
				const finalDistance = distance * (1 + noise1 + noise2)
				
				const x = nebulaCenter.x + finalDistance * Math.sin(phi) * Math.cos(angle)
				const y = nebulaCenter.y + finalDistance * Math.cos(phi)
				const z = nebulaCenter.z + finalDistance * Math.sin(phi) * Math.sin(angle)
				
				positions[i * 3] = x
				positions[i * 3 + 1] = y
				positions[i * 3 + 2] = z
				
				// Nebula colors (blues, purples, reds)
				const colorType = Math.random()
				if (colorType < 0.3) {
					// Blue nebula
					colors[i * 3] = 0.1 + Math.random() * 0.3
					colors[i * 3 + 1] = 0.2 + Math.random() * 0.4
					colors[i * 3 + 2] = 0.4 + Math.random() * 0.4
				} else if (colorType < 0.6) {
					// Purple/pink nebula
					colors[i * 3] = 0.3 + Math.random() * 0.4
					colors[i * 3 + 1] = 0.1 + Math.random() * 0.3
					colors[i * 3 + 2] = 0.4 + Math.random() * 0.4
				} else {
					// Red/orange nebula (supernova remnants)
					colors[i * 3] = 0.4 + Math.random() * 0.4
					colors[i * 3 + 1] = 0.1 + Math.random() * 0.2
					colors[i * 3 + 2] = 0.1 + Math.random() * 0.2
				}
				
				sizes[i] = 0.5 + Math.random() * 1.5
			}
			
			const nebulaGeom = new BufferGeometry()
			nebulaGeom.setAttribute('position', new BufferAttribute(positions, 3))
			nebulaGeom.setAttribute('color', new BufferAttribute(colors, 3))
			nebulaGeom.setAttribute('size', new BufferAttribute(sizes, 1))
			
			const nebulaMat = new PointsMaterial({
				vertexColors: true,
				sizeAttenuation: true,
				transparent: true,
				opacity: 0.15 + Math.random() * 0.1,
				depthWrite: false,
				depthTest: false,
				blending: 1 // AdditiveBlending
			})
			
			const nebula = new Points(nebulaGeom, nebulaMat)
			scene.add(nebula)
		}
	}

	// Create bright distant stars
	const createBrightDistantStars = async (scene) => {
		const { BufferGeometry, BufferAttribute, PointsMaterial, Points, Color } = await import('three')
		
		const brightCount = 500
		const brightPos = new Float32Array(brightCount * 3)
		const brightCol = new Float32Array(brightCount * 3)
		const brightSizes = new Float32Array(brightCount)
		
		for (let i = 0; i < brightCount; i++) {
			const ra = Math.random() * Math.PI * 2
			const dec = (Math.random() - 0.5) * Math.PI
			const r = 5000 + Math.random() * 3000
			const x = r * Math.cos(dec) * Math.cos(ra)
			const y = r * Math.sin(dec)
			const z = r * Math.cos(dec) * Math.sin(ra)
			
			brightPos[i * 3] = x
			brightPos[i * 3 + 1] = y
			brightPos[i * 3 + 2] = z
			
			// Bright white/blue stars
			const brightness = 0.8 + Math.random() * 0.2
			brightCol[i * 3] = brightness
			brightCol[i * 3 + 1] = brightness * (0.9 + Math.random() * 0.1)
			brightCol[i * 3 + 2] = brightness * (0.8 + Math.random() * 0.2)
			
			brightSizes[i] = 1.0 + Math.random() * 2.0
		}
		
		const brightGeom = new BufferGeometry()
		brightGeom.setAttribute('position', new BufferAttribute(brightPos, 3))
		brightGeom.setAttribute('color', new BufferAttribute(brightCol, 3))
		brightGeom.setAttribute('size', new BufferAttribute(brightSizes, 1))
		
		const brightMat = new PointsMaterial({
			vertexColors: true,
			sizeAttenuation: true,
			transparent: true,
			opacity: 0.8,
			depthWrite: false,
			depthTest: false
		})
		
		const brightPoints = new Points(brightGeom, brightMat)
		scene.add(brightPoints)
	}

	useEffect(() => {
		let mounted = true

		async function init() {
			const [{ WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute, PointsMaterial, Points, SphereGeometry, MeshBasicMaterial, BackSide, Mesh, Raycaster, Vector2, Color }, { OrbitControls }] = await Promise.all([
				import('three'),
				import('three/examples/jsm/controls/OrbitControls.js')
			])

			if (!mounted || !containerRef.current) return

			const container = containerRef.current
			const width = container.clientWidth
			const height = container.clientHeight

			const renderer = new WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true })
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
			renderer.setSize(width, height)
			renderer.domElement.style.position = 'absolute'
			renderer.domElement.style.inset = '0'
			renderer.setClearColor(0x000008, 1)
			container.appendChild(renderer.domElement)

			const scene = new Scene()
			const camera = new PerspectiveCamera(60, width / height, 0.01, 20000)
			camera.position.set(0, 0, 0)

			const controls = new OrbitControls(camera, renderer.domElement)
			controls.enableDamping = true
			controls.dampingFactor = 0.05
			controls.rotateSpeed = -0.5 // Negative for inverted drag feel
			controls.zoomSpeed = 0.8
			controls.panSpeed = 0.4
			controls.enablePan = false
			controls.enableZoom = false
			controls.minDistance = 0.1
			controls.maxDistance = 100
			controls.target.set(0, 0, 0)
			let isDragging = false
			controls.addEventListener('start', () => { isDragging = true })
			controls.addEventListener('end', () => { setTimeout(() => { isDragging = false }, 0) })

			// Sky sphere (inverted) to give a sense of background sky
			const skyGeo = new SphereGeometry(10000, 64, 64)
			const skyMat = new MeshBasicMaterial({ color: new Color(0x000010), side: BackSide, depthWrite: false })
			const sky = new Mesh(skyGeo, skyMat)
			scene.add(sky)

			// Star points
			const starGeometry = new BufferGeometry()
			const positions = []
			const colors = []
			const color = new Color()

			// Use local JSON data instead of API
			let fetched = []
			console.log('Using local APIreturnReasonable.json data for Starfield')
			
			if (apiData && apiData.data && Array.isArray(apiData.data)) {
				// Apply temperature filtering to the local data
				fetched = apiData.data.filter(star => {
					const teff = star.Teff || star.teff
					return teff && teff >= temp_min && teff <= temp_max
				})
				console.log(`Loaded ${fetched.length} stars from local JSON data (filtered by temperature ${temp_min}-${temp_max}K)`)
			} else {
				console.warn('No local data available, using fallback stars')
				// Fallback stars if local data is not available
				fetched = [
					{ ID: 'FALLBACK-1', ra: 0, dec: 0, Tmag: 5.0, Teff: 6000 },
					{ ID: 'FALLBACK-2', ra: 90, dec: 30, Tmag: 6.0, Teff: 5000 },
					{ ID: 'FALLBACK-3', ra: 180, dec: -30, Tmag: 7.0, Teff: 4000 },
					{ ID: 'FALLBACK-4', ra: 270, dec: 60, Tmag: 8.0, Teff: 3000 }
				]
			}

			// Normalize and project to unit sphere using RA/Dec (in degrees)
			// Prefer 'ra'/'dec' (degrees) else 'RA_orig'/'Dec_orig' (radians, convert to deg)
			const starData = fetched
				.map((s) => {
					let raDeg = null, decDeg = null
					if (typeof s.ra === 'number' && typeof s.dec === 'number') {
						raDeg = s.ra
						decDeg = s.dec
					} else if (typeof s.RA_orig === 'number' && typeof s.Dec_orig === 'number') {
						raDeg = s.RA_orig * (180 / Math.PI)
						decDeg = s.Dec_orig * (180 / Math.PI)
					}
					return { ...s, raDeg, decDeg }
				})
				.filter(s => Number.isFinite(s.raDeg) && Number.isFinite(s.decDeg))

			const toCartesian = (raDeg, decDeg, radius = 500) => {
				// Convert to radians
				const ra = (raDeg * Math.PI) / 180 // 0..360 -> 0..2π
				const dec = (decDeg * Math.PI) / 180 // -90..90 -> -π/2..π/2
				// Astronomical convention: x towards RA=0, z towards RA=90; flip to right-handed Three.js
				const cosDec = Math.cos(dec)
				const x = radius * cosDec * Math.cos(ra)
				const y = radius * Math.sin(dec)
				const z = radius * cosDec * Math.sin(ra)
				return [x, y, z]
			}

			const defaultMag = 12
			const sizeByMag = (mag = defaultMag) => {
				// Map magnitude to size; brighter => larger
				const rel = Math.pow(10, -0.4 * (mag - 10)) // around 1 at mag 10
				return 0.5 + Math.min(2.0, rel * 2.0) // Much larger sizes for distant stars
			}
			const starSizes = []
			starData.forEach((s) => {
				const [x, y, z] = toCartesian(s.raDeg, s.decDeg, 15000) // Match starmap sphere radius
				positions.push(x, y, z)
				// Color by temperature if available (blue-hot, red-cool)
				const teff = s.Teff ?? s.st_teff
				if (Number.isFinite(teff)) {
					// Map 2500K..10000K to 0..1 then to gradient
					const t = Math.max(0, Math.min(1, (teff - 2500) / (10000 - 2500)))
					color.setRGB(1 - t * 0.6, 0.8 * (1 - Math.abs(t - 0.5) * 2), 0.9 * t + 0.1)
				} else {
					color.setRGB(1, 1, 1)
				}
				colors.push(color.r, color.g, color.b)
				const mag = s.Tmag ?? s.GAIAmag ?? s.Vmag ?? defaultMag
				starSizes.push(sizeByMag(mag))
			})

			starGeometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
			starGeometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))
			// Use per-vertex size approximation via sizeAttenuation and magnitude-influenced base size
			const baseStarSize = starSizes.length ? starSizes.reduce((a, b) => a + b, 0) / starSizes.length : 3.0
			const starMaterial = new PointsMaterial({ size: baseStarSize, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: 0.95, depthWrite: false, depthTest: false })
			const points = new Points(starGeometry, starMaterial)
			scene.add(points)

			// After creating the main star points and adding to scene
			starsRef.current = { points, data: starData, starMaterial }

			// --- Set camera to center for proper panning ---
			camera.position.set(0, 0, 0) // Camera at center of sphere
			controls.target.set(0, 0, 0) // Always look at center
			controls.update()

			// Create enhanced background system
			await createEnhancedBackground(scene)

			// Selected star sprite (highlight)
			const spriteMaterial = new (await import('three')).SpriteMaterial({
				color: 0xffffaa,
				opacity: 0.95,
				transparent: true,
				depthWrite: false,
				depthTest: false
			})
			const sprite = new (await import('three')).Sprite(spriteMaterial)
			sprite.scale.set(5, 5, 5)
			sprite.visible = false
			scene.add(sprite)

			threeRef.current.toCartesian = toCartesian
			threeRef.current.highlightSprite = sprite

			// Picking
			const raycaster = new Raycaster()
			raycaster.params.Points = { threshold: 0.02 }
			const mouse = new Vector2()
			let downPos = null
			const onMouseDown = (event) => {
				downPos = { x: event.clientX, y: event.clientY }
			}
			const onClick = (event) => {
				if (!starsRef.current.points) return
				// Ignore clicks if user was dragging or moved significantly
				if (isDragging && downPos) return
				if (downPos) {
					const dx = event.clientX - downPos.x
					const dy = event.clientY - downPos.y
					if (dx * dx + dy * dy > 9) return
				}
				const rect = renderer.domElement.getBoundingClientRect()
				mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
				mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
				raycaster.setFromCamera(mouse, camera)
				const intersects = raycaster.intersectObject(starsRef.current.points)
				if (intersects.length > 0) {
					const idx = intersects[0].index
					const star = starsRef.current.data[idx]
					if (star && typeof onStarSelected === 'function') {
						onStarSelected(star)
					}
				}
			}
			renderer.domElement.addEventListener('mousedown', onMouseDown)
			renderer.domElement.addEventListener('click', onClick)

			// Wheel → adjust camera FOV instead of dollying
			const onWheel = (event) => {
				if (!event) return
				event.preventDefault()
				const delta = Math.sign(event.deltaY) // 1 or -1
				const step = 2.5
				camera.fov = Math.max(20, Math.min(90, camera.fov + delta * step))
				camera.updateProjectionMatrix()
			}
			renderer.domElement.addEventListener('wheel', onWheel, { passive: false })

			// Animate
			let af = 0
			const animate = () => {
				controls.update()
				// Adjust star sizes based on camera FOV
				const fov = camera.fov
				const scale = Math.max(0.3, Math.min(2.2, 60 / fov))
				if (starsRef.current.starMaterial) starsRef.current.starMaterial.size = baseStarSize * scale
				renderer.render(scene, camera)
				af = requestAnimationFrame(animate)
			}
			animate()

			// Resize
			const onResize = () => {
				const w = container.clientWidth
				const h = container.clientHeight
				renderer.setSize(w, h)
				camera.aspect = w / h
				camera.updateProjectionMatrix()
			}
			window.addEventListener('resize', onResize)

			// Save refs for cleanup
			threeRef.current = { renderer, scene, camera, controls, onResize, onClick, onMouseDown, onWheel, af, toCartesian, highlightSprite: sprite }
		}

		init()

		return () => {
			mounted = false
			const { renderer, scene, controls, onResize, onClick, onMouseDown, onWheel, af, highlightSprite } = threeRef.current
			if (af) cancelAnimationFrame(af)
			if (renderer?.domElement) {
				renderer.domElement.removeEventListener('click', onClick)
				renderer.domElement.removeEventListener('mousedown', onMouseDown)
				renderer.domElement.removeEventListener('wheel', onWheel)
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
			if (highlightSprite) highlightSprite.material?.dispose?.()
			if (renderer) {
				renderer.dispose()
				if (renderer.domElement && renderer.domElement.parentNode) {
					renderer.domElement.parentNode.removeChild(renderer.domElement)
				}
			}
		}
	}, [apiUrl, onStarSelected, ra, dec, radius, temp_min, temp_max])

	// Update highlight when selection changes
	useEffect(() => {
		const { highlightSprite, toCartesian } = threeRef.current
		if (!highlightSprite || !toCartesian) return
		if (!selectedStar) {
			highlightSprite.visible = false
			return
		}
		const raDeg = typeof selectedStar.ra === 'number' ? selectedStar.ra : (typeof selectedStar.RA_orig === 'number' ? selectedStar.RA_orig * (180 / Math.PI) : null)
		const decDeg = typeof selectedStar.dec === 'number' ? selectedStar.dec : (typeof selectedStar.Dec_orig === 'number' ? selectedStar.Dec_orig * (180 / Math.PI) : null)
		if (Number.isFinite(raDeg) && Number.isFinite(decDeg)) {
			const [x, y, z] = toCartesian(raDeg, decDeg, 15000)
			highlightSprite.position.set(x, y, z)
			highlightSprite.visible = true
		} else {
			highlightSprite.visible = false
		}
	}, [selectedStar])

	return (
		<div
			ref={containerRef}
			style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at center, #02020a 0%, #000008 70%, #000006 100%)' }}
		/>
	)
}