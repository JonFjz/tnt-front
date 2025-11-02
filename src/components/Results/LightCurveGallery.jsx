// /src/components/Results/LightCurveGallery.jsx
export default function LightCurveGallery({ items = [] }) {
  if (!items?.length) {
    return (
      <div className="results-section">
        <h4 className="section-title">Visualizations</h4>
        <div className="viz-empty glass-subtle">
          Found in the TOI/KOI table.
        </div>
      </div>
    );
  }

  return (
    <div className="results-section">
      <h4 className="section-title">Visualizations</h4>
      <div className="viz-col">
        {items.map((img, i) => (
          <figure key={i} className="viz-card">
            <img
              className="viz-img"
              src={img.dataUrl}
              alt={img.type || img.filename || `visualization-${i}`}
              loading="lazy"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
