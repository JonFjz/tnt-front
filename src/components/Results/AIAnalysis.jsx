// /src/components/Results/AIAnalysis.jsx
export default function AIAnalysis({ data }) {
  if (!data) return null;
  const mr = data.raw || {};
  const r0 = (mr.results && mr.results[0]) || {};
  const pct = data.probabilityPct;

  return (
    <div className="ai-analysis-container">
      <h4 className="section-title">AI Analysis</h4>

      <div className="ai-analysis">
        <div className="ai-main-result" style={{ justifyContent: 'space-between' }}>
          <div className="exoplanet-count" style={{ alignItems: 'flex-start' }}>
            <span className="count-label" style={{ fontSize: '1rem', opacity: 0.9 }}>Verdict</span>
            <span className="count-number" style={{ fontSize: '2rem', marginTop: '0.25rem' }}>
              {data.label}
            </span>
          </div>

          <div className="confidence-meter">
            <label className="confidence-label">Confidence</label>
            <div className="confidence-bar">
              <div className="confidence-fill" style={{ width: pct != null ? `${pct}%` : '0%' }} />
            </div>
            <span className="confidence-value">{pct != null ? `${pct}%` : '—'}</span>
          </div>
        </div>

        <div className="ai-details">
          <div className="ai-detail-item"><label className="ai-label">Model</label><span className="ai-value">{mr.model_type || '—'}</span></div>
          <div className="ai-detail-item"><label className="ai-label">Optimization</label><span className="ai-value">{mr.optimization_type || '—'}</span></div>
          <div className="ai-detail-item"><label className="ai-label">Prediction Count</label><span className="ai-value">{mr.prediction_count ?? '—'}</span></div>
          <div className="ai-detail-item"><label className="ai-label">Status</label><span className="ai-value">{mr.status || '—'}</span></div>
          <div className="ai-detail-item"><label className="ai-label">Global Threshold</label><span className="ai-value">{mr.threshold ?? '—'}</span></div>
        </div>

      </div>
    </div>
  );
}
