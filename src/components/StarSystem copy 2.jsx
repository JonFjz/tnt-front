import { useMemo, useEffect, useRef } from 'react'

export default function StarSystem({ data, onBack }) {
  const starData = useMemo(() => ({
    id: data?.ID || data?.tid || data?.GAIA || 'Unknown',
    ra: data?.ra || data?.RA_orig || data?.rastr || '—',
    dec: data?.dec || data?.Dec_orig || data?.decstr || '—',
    magnitude: data?.GAIAmag || data?.Tmag || data?.st_tmag || '—',
    temperature: data?.Teff || data?.st_teff || '—',
    radius: data?.rad || data?.st_rad || 1,
    mass: data?.mass || null,
    distance: data?.d || data?.st_dist || null,
  }), [data])

  const planets = useMemo(() => {
    if (Array.isArray(data?.transits) && data.transits.length > 0) {
      return data.transits.map((t, i) => ({
        name: `Planet ${i+1}`,
        periodDays: t.period,
        radius: (t.radius || 1) * 1.2,
        distance: 10 + i * 6,
        color: 0x69f9ff
      }))
    }
    return []
  }, [data])

  const containerRef = useRef(null)

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
      renderer.setSize(width, height)
      containerRef.current.appendChild(renderer.domElement)

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000)
      camera.position.set(0, 0, 40)

      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true

      // Background
      const bg = new THREE.Mesh(
        new THREE.SphereGeometry(1000, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x000010, side: THREE.BackSide })
      )
      scene.add(bg)

      // Star
      starMesh = new THREE.Mesh(
        new THREE.SphereGeometry(4, 64, 64),
        new THREE.MeshBasicMaterial({ color: getStarColor(starData.temperature) })
      )
      scene.add(starMesh)

      // Planets
      planetMeshes = planets.map((p, i) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(p.radius, 32, 32),
          new THREE.MeshPhongMaterial({ color: p.color, emissive: 0x222244 })
        )
        mesh.position.set(p.distance, 0, 0)
        scene.add(mesh)

        // Orbit ring
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(p.distance - 0.05, p.distance + 0.05, 64),
          new THREE.MeshBasicMaterial({ color: p.color, side: THREE.DoubleSide, transparent: true, opacity: 0.18 })
        )
        ring.rotation.x = Math.PI / 2
        scene.add(ring)

        return mesh
      })

      // Lighting
      scene.add(new THREE.PointLight(getStarColor(starData.temperature), 1.2, 200))
      scene.add(new THREE.AmbientLight(0xffffff, 0.18))

      // Animate
      let af = 0
      const animate = () => {
        controls.update()
        const t = Date.now() * 0.001
        planetMeshes.forEach((mesh, i) => {
          const p = planets[i]
          if (!p) return
          const angle = t * (1 + i * 0.2)
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

      return () => {
        if (af) cancelAnimationFrame(af)
        window.removeEventListener('resize', onResize)
        if (controls) controls.dispose()
        if (renderer?.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
        if (scene) scene.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose?.()
          if (obj.material) Array.isArray(obj.material) ? obj.material.forEach(m => m.dispose?.()) : obj.material.dispose?.()
        })
      }
    }

    const cleanup = init()
    return () => { mounted = false; cleanup && cleanup() }
  }, [planets, starData.temperature])

  return (
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, background: 'black' }}>
      {/* Overlay */}
      <div style={{ position: 'absolute', top: 20, left: 20, color: '#fff' }}>
        <p>⭐ Star ID: {starData.id}</p>
        <p>RA: {starData.ra}</p>
        <p>Dec: {starData.dec}</p>
        <p>Mag: {starData.magnitude}</p>
        <p>Temp: {starData.temperature} K</p>
      </div>
      <button onClick={onBack} style={{ position: 'absolute', top: 20, right: 20 }}>← Back</button>
    </div>
  )
}

function getStarColor(temp) {
  if (!temp) return '#f90'
  if (temp > 10000) return '#fff'
  if (temp > 7500) return '#ffd27f'
  if (temp > 6000) return '#f6a960'
  return '#f37b2b'
}
