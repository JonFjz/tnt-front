// /src/components/Results/StarInfo.jsx
export default function StarInfo({ data }) {
  return (
    <div className="results-section">
      <h4 className="section-title">Star Information</h4>
      <div className="info-grid">
        <div className="info-item"><label className="info-label">Star ID:</label><span className="info-value">{data.starId || 'TIC 123456789'}</span></div>
        <div className="info-item"><label className="info-label">RA:</label><span className="info-value">{data.ra || '180.5°'}</span></div>
        <div className="info-item"><label className="info-label">Dec:</label><span className="info-value">{data.dec || '-45.2°'}</span></div>
        <div className="info-item"><label className="info-label">Magnitude:</label><span className="info-value">{data.magnitude || '12.4'}</span></div>
        <div className="info-item"><label className="info-label">Temperature:</label><span className="info-value">{data.temperature || '5800 K'}</span></div>
        <div className="info-item"><label className="info-label">Distance:</label><span className="info-value">{data.distance || '125.6 pc'}</span></div>
      </div>
    </div>
  );
}
