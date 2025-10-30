import { useMemo, useEffect, useRef } from 'react'

export default function StarSystem({ data, onBack }) {
	const starData = useMemo(() => {
		return {
			id: data?.ID || data?.tid || data?.GAIA || 'Unknown',
			ra: data?.ra || data?.RA_orig || data?.rastr || '—',
			dec: data?.dec || data?.Dec_orig || data?.decstr || '—',
			magnitude: data?.GAIAmag || data?.Tmag || data?.st_tmag || '—',
			temperature: data?.Teff || data?.st_teff || '—',
			radius: data?.rad || data?.st_rad || 1,
			mass: data?.mass || null,
			distance: data?.d || data?.st_dist || null,
		}
	}, [data])

	const planets = useMemo(() => {
		// If we have transit data
		if (data?.pl_orbper || data?.response?.pl_orbper) {
			const planetData = data?.response || data
			return [{
				name: planetData.toidisplay || 'Planet 1',
				periodDays: planetData.pl_orbper,
				radius: (planetData.pl_rade || 1) * 4, // Scale up for visibility
				distance: planetData.pl_insol ? Math.sqrt(planetData.pl_insol) * 10 : 30,
				temperature: planetData.pl_eqt,
				transitDepth: planetData.pl_trandep,
				transitDuration: planetData.pl_trandurh
			}]
		}

		// If we have multiple transits
		if (Array.isArray(data?.transits) && data.transits.length > 0) {
			return data.transits.map((t, i) => ({
				name: `Planet ${i + 1}`,
				periodDays: t.period,
				radius: (t.radius || 1) * 4,
				distance: 22 + i * 14,
				temperature: t.temperature,
				transitDepth: t.depth,
				transitDuration: t.duration
			}))
		}

		// Default to empty system
		return []
	}, [data])

	const habitableZone = useMemo(() => {
		// Calculate habitable zone based on star temperature and luminosity
		// This is a simplified calculation
		const temp = starData.temperature
		if (!temp) return { inner: 30, outer: 60 }
		
		// Very rough approximation based on star temperature
		const baseDistance = Math.sqrt(temp / 5778) * 40 // Scale factor relative to Earth-Sun
		return {
			inner: baseDistance * 0.75,
			outer: baseDistance * 1.75
		}
	}, [starData.temperature])

	const containerRef = useRef(null)

	// 3D visualization effect
	useEffect(() => {
		let mounted = true
		let renderer, scene, camera, controls, starMesh, planetMeshes = []
		async function init() {
			const [THREE, { OrbitControls }] = await Promise.all([
				import('three'),
				import('three/examples/jsm/controls/OrbitControls.js')
			])
			if (!mounted || !containerRef.current) return
			const width = containerRef.current.clientWidth
			const height = containerRef.current.clientHeight
			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
			renderer.setSize(width, height)
			renderer.domElement.style.position = 'absolute'
			renderer.domElement.style.inset = '0'
			containerRef.current.appendChild(renderer.domElement)

			scene = new THREE.Scene()
			camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 20000)
			camera.position.set(0, 0, 40)

			controls = new OrbitControls(camera, renderer.domElement)
			controls.enableDamping = true
			controls.target.set(0, 0, 0)
			controls.update()

			// Background
			const bgGeo = new THREE.SphereGeometry(1000, 32, 32)
			const bgMat = new THREE.MeshBasicMaterial({ color: 0x000010, side: THREE.BackSide, depthWrite: false })
			const bg = new THREE.Mesh(bgGeo, bgMat)
			scene.add(bg)

			// Central star
			const starRadius = 4
			const starColor = getStarColor(data?.Teff || data?.st_teff)
			const starMat = new THREE.MeshBasicMaterial({ color: starColor })
			starMesh = new THREE.Mesh(new THREE.SphereGeometry(starRadius, 48, 48), starMat)
			scene.add(starMesh)

			// Planets
			planetMeshes = []
			let planets = []
			if (data?.pl_orbper || data?.response?.pl_orbper) {
				const planetData = data?.response || data
				planets = [{
					name: planetData.toidisplay || 'Planet 1',
					periodDays: planetData.pl_orbper,
					radius: (planetData.pl_rade || 1) * 1.2,
					distance: planetData.pl_insol ? Math.sqrt(planetData.pl_insol) * 10 : 14,
					color: 0x69f9ff
				}]
			} else if (Array.isArray(data?.transits) && data.transits.length > 0) {
				planets = data.transits.map((t, i) => ({
					name: `Planet ${i + 1}`,
					periodDays: t.period,
					radius: (t.radius || 1) * 1.2,
					distance: 10 + i * 6,
					color: 0x69f9ff
				}))
			}
			planets.forEach((p, i) => {
				const planetMat = new THREE.MeshPhongMaterial({ color: p.color, emissive: 0x222244, shininess: 60 })
				const planetMesh = new THREE.Mesh(new THREE.SphereGeometry(p.radius, 32, 32), planetMat)
				const angle = (i / planets.length) * Math.PI * 2
				planetMesh.position.set(Math.cos(angle) * p.distance, 0, Math.sin(angle) * p.distance)
				planetMeshes.push(planetMesh)
				scene.add(planetMesh)
				// Orbit ring
				const ringGeo = new THREE.RingGeometry(p.distance - 0.05, p.distance + 0.05, 64)
				const ringMat = new THREE.MeshBasicMaterial({ color: 0x69f9ff, side: THREE.DoubleSide, transparent: true, opacity: 0.18 })
				const ring = new THREE.Mesh(ringGeo, ringMat)
				ring.rotation.x = Math.PI / 2
				scene.add(ring)
			})

			// Lighting
			const light = new THREE.PointLight(starColor, 1.2, 200)
			light.position.set(0, 0, 0)
			scene.add(light)
			const amb = new THREE.AmbientLight(0xffffff, 0.18)
			scene.add(amb)

			// Animate
			let af = 0
			const animate = () => {
				controls.update()
				// Animate planets
				planetMeshes.forEach((mesh, i) => {
					const p = planets[i]
					if (!p) return
					const t = Date.now() * 0.00008 * (1 + i * 0.2)
					const angle = t + (i / planets.length) * Math.PI * 2
					mesh.position.x = Math.cos(angle) * p.distance
					mesh.position.z = Math.sin(angle) * p.distance
				})
				renderer.render(scene, camera)
				af = requestAnimationFrame(animate)
			}
			animate()

			// Resize
			const onResize = () => {
				const w = containerRef.current.clientWidth
				const h = containerRef.current.clientHeight
				renderer.setSize(w, h)
				camera.aspect = w / h
				camera.updateProjectionMatrix()
			}
			window.addEventListener('resize', onResize)

			// Cleanup
			return () => {
				if (af) cancelAnimationFrame(af)
				if (renderer?.domElement && renderer.domElement.parentNode) {
					renderer.domElement.parentNode.removeChild(renderer.domElement)
				}
				window.removeEventListener('resize', onResize)
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
			}
		}
		const cleanup = init()
		return () => { mounted = false; cleanup && cleanup() }
	}, [data])

	return (
		<div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at center, #02020a 0%, #000008 70%, #000006 100%)' }}>
			{/* Overlay UI */}
			<div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
				<div style={{ position: 'absolute', left: 24, top: 24, pointerEvents: 'auto' }}>
					<button className="back-to-search-btn" onClick={onBack}>← Back</button>
				</div>
				<div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
					<div style={{ width: 420, maxWidth: '92vw', pointerEvents: 'auto', marginTop: 32 }} className="glass card">
						<div style={{ padding: 16 }}>
							<h3>Star System</h3>
							<div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 12 }}>
								<div style={{ width: 80, height: 80, borderRadius: 80, background: `radial-gradient(circle at 40% 40%, #fff8, ${getStarColor(starData.temperature)} 60%, ${getDarkerStarColor(starData.temperature)} 100%)`, boxShadow: `0 0 24px ${getStarColor(starData.temperature)}` }} />
								<div>
									<div className="info-grid">
										<div className="info-item"><label className="info-label">Star ID:</label><span className="info-value">{starData.id}</span></div>
										<div className="info-item"><label className="info-label">RA:</label><span className="info-value">{starData.ra}</span></div>
										<div className="info-item"><label className="info-label">Dec:</label><span className="info-value">{starData.dec}</span></div>
										<div className="info-item"><label className="info-label">Mag:</label><span className="info-value">{starData.magnitude}</span></div>
										<div className="info-item"><label className="info-label">Teff:</label><span className="info-value">{starData.temperature} K</span></div>
										{starData.mass && <div className="info-item"><label className="info-label">Mass:</label><span className="info-value">{starData.mass} M☉</span></div>}
										{starData.distance && <div className="info-item"><label className="info-label">Distance:</label><span className="info-value">{starData.distance} pc</span></div>}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

// Helper function to get star color based on temperature
function getStarColor(temp) {
	if (!temp) return '#f90'
	if (temp > 30000) return '#9cf'
	if (temp > 10000) return '#fff'
	if (temp > 7500) return '#ffd'
	if (temp > 6000) return '#ff9'
	if (temp > 5000) return '#f90'
	if (temp > 3500) return '#f70'
	return '#f30'
}

// Helper function to get darker version of star color
function getDarkerStarColor(temp) {
	if (!temp) return '#700'
	if (temp > 30000) return '#114'
	if (temp > 10000) return '#447'
	if (temp > 7500) return '#474'
	if (temp > 6000) return '#740'
	if (temp > 5000) return '#720'
	if (temp > 3500) return '#600'
	return '#400'
}


