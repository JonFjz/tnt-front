import { useEffect, useRef } from 'react'
import axios from 'axios'

// Three.js is loaded dynamically to avoid SSR issues and keep bundle lean
export default function Starfield({ apiUrl = 'https://tnt.thot.info/api', onStarSelected }) {
	const containerRef = useRef(null)
	const threeRef = useRef({})
	const starsRef = useRef({ points: null, data: [] })

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
			const camera = new PerspectiveCamera(60, width / height, 0.01, 2000)
			camera.position.set(0, 0, 2.2)

			const controls = new OrbitControls(camera, renderer.domElement)
			controls.enableDamping = true
			controls.rotateSpeed = 0.3
			controls.zoomSpeed = 0.6
			controls.panSpeed = 0.4
			controls.enablePan = true
			controls.minDistance = 1.1
			controls.maxDistance = 20
			let isDragging = false
			controls.addEventListener('start', () => { isDragging = true })
			controls.addEventListener('end', () => { setTimeout(() => { isDragging = false }, 0) })

			// Sky sphere (inverted) to give a sense of background sky
			const skyGeo = new SphereGeometry(1000, 48, 48)
			const skyMat = new MeshBasicMaterial({ color: new Color(0x000010), side: BackSide, depthWrite: false })
			const sky = new Mesh(skyGeo, skyMat)
			scene.add(sky)

			// Star points
			const starGeometry = new BufferGeometry()
			const positions = []
			const colors = []
			const color = new Color()

			// Fetch stars
			let fetched = []
			try {
				// Use /search endpoint with explicit defaults
				const base = apiUrl.replace(/\/$/, '')
				const url = `${base}/search?ra=0&dec=0&radius=5`
				const res = await axios.get(url)
				const json = res?.data
				if (Array.isArray(json?.data)) {
					fetched = json.data
				} else if (json?.response) {
					fetched = [json.response]
				} else if (Array.isArray(json)) {
					fetched = json
				}
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error('Failed to fetch stars', e)
			}

			// Fallback to mock if none
			if (!fetched || fetched.length === 0) {
				try {
					const mock = await axios.get('/stars.mock.json')
					if (Array.isArray(mock?.data?.data)) {
						fetched = mock.data.data
					}
				} catch {}
			}

			// Normalize and project to unit sphere using RA/Dec (in degrees)
			// Prefer 'ra'/'dec' else 'RA_orig'/'Dec_orig'
			const starData = fetched
				.map((s) => {
					const raDeg = (typeof s.ra === 'number' ? s.ra : (typeof s.RA_orig === 'number' ? s.RA_orig * (180 / Math.PI) : null))
					const decDeg = (typeof s.dec === 'number' ? s.dec : (typeof s.Dec_orig === 'number' ? s.Dec_orig * (180 / Math.PI) : null))
					return { ...s, raDeg, decDeg }
				})
				.filter(s => Number.isFinite(s.raDeg) && Number.isFinite(s.decDeg))

			const toCartesian = (raDeg, decDeg, radius = 1) => {
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
				return 0.005 + Math.min(0.02, rel * 0.02)
			}
			const starSizes = []
			starData.forEach((s) => {
				const [x, y, z] = toCartesian(s.raDeg, s.decDeg, 1)
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
			const avgSize = starSizes.length ? starSizes.reduce((a, b) => a + b, 0) / starSizes.length : 0.01
			const starMaterial = new PointsMaterial({ size: avgSize, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: 0.95, depthWrite: false, depthTest: false })
			const points = new Points(starGeometry, starMaterial)
			scene.add(points)

			starsRef.current = { points, data: starData }

			// Background faint star layer for night-sky feel
			const bgCount = 2000
			const bgPos = new Float32Array(bgCount * 3)
			const bgCol = new Float32Array(bgCount * 3)
			for (let i = 0; i < bgCount; i++) {
				// jitter on unit sphere slightly beyond main sphere
				const ra = Math.random() * Math.PI * 2
				const dec = (Math.random() - 0.5) * Math.PI
				const r = 1.02
				const x = r * Math.cos(dec) * Math.cos(ra)
				const y = r * Math.sin(dec)
				const z = r * Math.cos(dec) * Math.sin(ra)
				bgPos[i * 3 + 0] = x
				bgPos[i * 3 + 1] = y
				bgPos[i * 3 + 2] = z
				const c = 0.7 + Math.random() * 0.3
				bgCol[i * 3 + 0] = c
				bgCol[i * 3 + 1] = c
				bgCol[i * 3 + 2] = c
			}
			const bgGeom = new BufferGeometry()
			bgGeom.setAttribute('position', new BufferAttribute(bgPos, 3))
			bgGeom.setAttribute('color', new BufferAttribute(bgCol, 3))
			const bgMat = new PointsMaterial({ size: 0.004, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: 0.6, depthWrite: false, depthTest: false })
			scene.add(new Points(bgGeom, bgMat))

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

			// Animate
			let af = 0
			const animate = () => {
				controls.update()
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
			threeRef.current = { renderer, scene, camera, controls, onResize, onClick, onMouseDown, af }
		}

		init()

		return () => {
			mounted = false
			const { renderer, scene, controls, onResize, onClick, onMouseDown, af } = threeRef.current
			if (af) cancelAnimationFrame(af)
			if (renderer?.domElement) {
				renderer.domElement.removeEventListener('click', onClick)
				renderer.domElement.removeEventListener('mousedown', onMouseDown)
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
	}, [apiUrl, onStarSelected])

	return (
		<div
			ref={containerRef}
			style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at center, #02020a 0%, #000008 70%, #000006 100%)' }}
		/>
	)
}


