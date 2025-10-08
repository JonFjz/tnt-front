// /src/components/Results/LightCurvePlaceholder.jsx
export default function LightCurvePlaceholder() {
  return (
    <div className="results-section">
      <h4 className="section-title">Light Curve Analysis</h4>
      <div className="graph-container">
        <div className="graph-placeholder">
          <div className="graph-content">
            <p>📈 Light curve graph will be displayed here</p>
            <div className="graph-mock">
              <div className="graph-axes">
                <span className="y-axis-label">Brightness</span>
                <span className="x-axis-label">Time (days)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
