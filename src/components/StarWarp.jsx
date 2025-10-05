import { useEffect, useRef } from 'react'

export default function StarWarp({ active = false, onComplete, durationMs = 1600 }) {
	const ref = useRef(null)

	useEffect(() => {
		if (!active) return
		const el = ref.current
		if (!el) return
		el.style.opacity = '1'
		const t = setTimeout(() => {
			el.style.opacity = '0'
			if (typeof onComplete === 'function') onComplete()
		}, durationMs)
		return () => clearTimeout(t)
	}, [active, durationMs, onComplete])

	return (
		<div
			ref={ref}
			style={{
				pointerEvents: 'none',
				position: 'fixed',
				inset: 0,
				zIndex: 2,
				opacity: 0,
				transition: 'opacity 300ms ease-out',
				background:
					'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.95) 100%)'
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage:
						'repeating-linear-gradient(0deg, rgba(255,255,255,0.0) 0px, rgba(255,255,255,0.0) 10px, rgba(255,255,255,0.12) 11px, rgba(255,255,255,0.12) 12px)',
					filter: 'blur(1px)',
					transform: 'translateZ(0)',
					animation: active ? 'warp-streaks 900ms linear infinite' : 'none'
				}}
			/>
			<style>{`
			@keyframes warp-streaks {
				0% { background-position: 0 0; opacity: 0.5; }
				100% { background-position: 0 200px; opacity: 0.9; }
			}
			`}</style>
		</div>
	)
}


