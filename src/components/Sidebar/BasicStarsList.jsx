// /src/components/Sidebar/BasicStarsList.jsx
export default function BasicStarsList({ selected, onSelect }) {
  const stars = [
    { id: '388857263', name: 'Proxima Centauri', type: 'Red Dwarf', magnitude: '11.13' },
    { id: '261136679', name: 'π Mensae', type: 'G-type', magnitude: '5.65' },
    { id: '150428135', name: 'TOI-700', type: 'Red Dwarf', magnitude: '13.1' },
    { id: '260128333', name: 'TOI-1338', type: 'SB', magnitude: '12.537' },
    { id: '251848941', name: 'TOI-178', type: 'PM', magnitude: '13.05' },
    { id: '350810590', name: 'Kepler-36', type: 'Eruptive', magnitude: '12.795' },
    { id: '245873777', name: 'Aldebaran', type: 'Red Giant', magnitude: '0.85' },
    { id: '423088367', name: 'Pollux', type: 'K-type Giant', magnitude: '1.14' },
  ];

  return (
    <div className="tab-content">
      <div className="basic-stars-section">
        <div className="stars-list">
          {stars.map((star) => (
            <div
              key={star.id}
              className={`star-item ${selected?.id === star.id ? 'selected' : ''}`}
              onClick={() => onSelect(star)}
            >
              <div className="star-info">
                <div className="star-name">{star.name}</div>
                <div className="star-id">{star.id}</div>
                <div className="star-details">
                  <span className="star-type">{star.type}</span>
                  <span className="star-magnitude">Mag: {star.magnitude}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
