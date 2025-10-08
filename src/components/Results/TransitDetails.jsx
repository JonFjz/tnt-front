// /src/components/Results/TransitDetails.jsx
export default function TransitDetails({ data }) {
  const transits = data?.transits?.length ? data.transits : [
    { period: '3.2 days', depth: '0.8%', duration: '2.1 hours' },
  ];

  return (
    <div className="transit-details-container">
      <h4 className="section-title">Transit Details</h4>
      <div className="transit-details-scrollable">
        <div className="transit-details">
          {transits.map((t, i) => (
            <div key={i} className="transit-item">
              <h5>Planet {i + 1}</h5>
              <div className="transit-info">
                <span>Period: {t.period}</span>
                <span>Depth: {t.depth}</span>
                <span>Duration: {t.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
