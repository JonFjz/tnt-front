import { useMemo } from 'react'

export default function StarSystem({ data, onBack }) {
	const planets = useMemo(() => {
		// Build simple mock planets if none provided
		const list = Array.isArray(data?.transits) && data.transits.length > 0
			? data.transits.map((t, i) => ({
				name: `Planet ${i + 1}`,
				periodDays: t.period,
				radius: 6 + i * 3,
				distance: 22 + i * 14
			}))
			: [
				{ name: 'Planet 1', periodDays: '3.2 days', radius: 6, distance: 22 },
				{ name: 'Planet 2', periodDays: '8.1 days', radius: 8, distance: 36 }
			]
		return list
	}, [data])

	return (
		<div style={{ position: 'fixed', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
			<div style={{ position: 'absolute', left: 24, top: 24, pointerEvents: 'auto' }}>
				<button className="back-to-search-btn" onClick={onBack}>← Back</button>
			</div>
			<div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'grid', placeItems: 'center' }}>
				<div style={{ width: 560, maxWidth: '90vw', pointerEvents: 'auto' }} className="glass card">
					<div style={{ padding: 16 }}>
						<h3>Star System</h3>
						<div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 12 }}>
							<div style={{ width: 120, height: 120, borderRadius: 120, background: 'radial-gradient(circle at 40% 40%, #fff6, #f90 60%, #600 100%)', boxShadow: '0 0 40px #f90' }} />
							<div>
								<div className="info-grid">
									<div className="info-item"><label className="info-label">Star ID:</label><span className="info-value">{data?.starId ?? 'Unknown'}</span></div>
									<div className="info-item"><label className="info-label">RA:</label><span className="info-value">{data?.ra ?? '—'}</span></div>
									<div className="info-item"><label className="info-label">Dec:</label><span className="info-value">{data?.dec ?? '—'}</span></div>
									<div className="info-item"><label className="info-label">Mag:</label><span className="info-value">{data?.magnitude ?? '—'}</span></div>
									<div className="info-item"><label className="info-label">Teff:</label><span className="info-value">{data?.temperature ?? '—'}</span></div>
								</div>
							</div>
						</div>
						<div style={{ marginTop: 16 }}>
							<h4>Planets</h4>
							<div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
								{planets.map((p, idx) => (
									<div key={idx} className="glass" style={{ padding: 12, borderRadius: 12, minWidth: 160 }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
											<div style={{ width: p.radius, height: p.radius, borderRadius: 999, background: 'radial-gradient(circle at 30% 30%, #fff4, #69f 70%, #002 100%)', boxShadow: '0 0 16px #69f6' }} />
											<div>
												<div className="star-name">{p.name}</div>
												<div className="star-details">Orbit: {p.periodDays}</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}


