// /src/components/Results/ResultsPanel.jsx
import StarInfo from './StarInfo.jsx';
import LightCurvePlaceholder from './LightCurvePlaceholder.jsx';

export default function ResultsPanel({ resultsData, onBack }) {
  return (
    <div className="results-container">
      <div className="results-header">
        <h3>Star Analysis Results</h3>
        <button className="back-to-search-btn" onClick={onBack}>← Back to Search</button>
      </div>
      <div className="scrollable-content">
        <div className="results-content">
          {resultsData ? (
            <>
              <StarInfo data={resultsData} />
              <LightCurvePlaceholder />
            </>
          ) : (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Analyzing star data...</p>
              <p className="loading-subtext">This may take a few moments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
