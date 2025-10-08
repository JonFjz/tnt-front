// /src/components/Results/AIAnalysis.jsx
export default function AIAnalysis({ data }) {
  return (
    <div className="ai-analysis-container">
      <h4 className="section-title">AI Analysis</h4>
      <div className="ai-analysis">
        <div className="ai-main-result">
          <div className="exoplanet-count">
            <span className="count-number">{data.exoplanetCount || '2'}</span>
            <span className="count-label">Exoplanets Detected</span>
          </div>
          <div className="confidence-meter">
            <label className="confidence-label">Confidence:</label>
            <div className="confidence-bar">
              <div className="confidence-fill" style={{ width: `${data.confidence || 87}%` }} />
            </div>
            <span className="confidence-value">{data.confidence || 87}%</span>
          </div>
        </div>

        <div className="ai-details">
          <div className="ai-detail-item">
            <label className="ai-label">Detection Threshold:</label>
            <span className="ai-value">{data.threshold || '0.72'}</span>
          </div>
          <div className="ai-detail-item">
            <label className="ai-label">Signal-to-Noise Ratio:</label>
            <span className="ai-value">{data.snr || '8.4'}</span>
          </div>
          <div className="ai-detail-item">
            <label className="ai-label">Processing Time:</label>
            <span className="ai-value">{data.processingTime || '2.3s'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
