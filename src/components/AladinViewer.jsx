import { useEffect, useRef, useState } from 'react'

// Lightweight wrapper around Aladin Lite that loads the script on demand
export default function AladinViewer({ selectedStar, skyStar, onSkySelect, style }) {
	const containerRef = useRef(null)
	const aladinRef = useRef(null)
	const [ready, setReady] = useState(false)

	// Load Aladin script once
	useEffect(() => {
		if (window.A && window.A.init) {
			window.A.init.then(() => setReady(true))
			return
		}

		const script = document.createElement('script')
		script.src = 'https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js'
		script.charset = 'utf-8'
		script.async = true
		script.onload = () => {
			if (window.A && window.A.init) {
				window.A.init.then(() => setReady(true))
			}
		}
		document.body.appendChild(script)
		return () => {
			script.remove()
		}
	}, [])

	// Initialize viewer when ready
	useEffect(() => {
		if (!ready || !containerRef.current || aladinRef.current) return
		try {
			aladinRef.current = window.A.aladin(containerRef.current, {
				fov: 1,
				target: 'M81',
				cooFrame: 'ICRS'
			})
			// Optionally, wire selection back up if needed later
			// aladinRef.current.on('objectClicked', (obj) => { onSkySelect?.(obj) })
		} catch (e) {
			// swallow init errors; viewer just won't render
		}
	}, [ready])

	// Center view when selectedStar changes
	useEffect(() => {
		const A = aladinRef.current
		if (!A || !selectedStar) return

		// Prefer coordinates if available
		const ra = selectedStar.raDeg ?? selectedStar.ra
		const dec = selectedStar.decDeg ?? selectedStar.dec
		if (Number.isFinite(ra) && Number.isFinite(dec)) {
			try { A.gotoPosition(ra, dec) } catch (_) {}
			return
		}

		// Fallback to name
		if (selectedStar.name) {
			try { A.gotoObject(selectedStar.name) } catch (_) {}
		}
	}, [selectedStar])

	// Also react to skyStar selection (from 3D starfield), if present
	useEffect(() => {
		const A = aladinRef.current
		if (!A || !skyStar) return
		const ra = skyStar.raDeg ?? skyStar.ra
		const dec = skyStar.decDeg ?? skyStar.dec
		if (Number.isFinite(ra) && Number.isFinite(dec)) {
			try { A.gotoPosition(ra, dec) } catch (_) {}
		}
	}, [skyStar])

	return (
		<div
			ref={containerRef}
			id="aladin-lite-div"
			style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', borderRadius: 12, ...style }}
		/>
	)
}


