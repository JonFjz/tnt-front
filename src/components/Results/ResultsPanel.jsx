// /src/components/Results/ResultsPanel.jsx
import StarInfo from './StarInfo.jsx';

function LightCurveGallery({ items = [] }) {
  const imgs = (items || []).slice(0, 3); // show only 3

  if (!imgs.length) {
    return (
      <section className="results-section">
        <h4 className="section-title">Visualizations</h4>
        <div className="viz-empty">Found in the TOI/KOI table.</div>
      </section>
    );
  }

  return (
    <section className="results-section">
      <h4 className="section-title">Visualizations</h4>
      <div className="viz-col">
        {imgs.map((img, i) => (
          <figure key={i} className="viz-card">
            <img
              className="viz-img"
              src={img.dataUrl}
              alt={img.type || img.filename || `visualization-${i}`}
              loading="lazy"
            />
            <figcaption className="viz-caption">
              {img.type?.replaceAll('_', ' ') || img.filename}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

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
              <StarInfo data={resultsData.star} />
              <LightCurveGallery items={resultsData.visualizations} />
            </>
          ) : (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Analyzing star data...</p>
              <p className="loading-subtext">This may take a few moments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
