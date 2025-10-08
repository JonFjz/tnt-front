// /src/components/Sidebar/BasicStarsList.jsx
export default function BasicStarsList({ selected, onSelect }) {
  const stars = [
    { id: '388857263', name: 'Proxima Centauri', type: 'Red Dwarf', magnitude: '11.13' },
    { id: '261136679', name: 'π Mensae', type: 'G-type', magnitude: '5.65' },
    { id: '150428135', name: 'TOI-700', type: 'Red Dwarf', magnitude: '13.1' },
    { id: '269273552', name: 'Betelgeuse', type: 'Red Supergiant', magnitude: '0.58' },
    { id: '231308237', name: 'Rigel', type: 'Blue Supergiant', magnitude: '0.13' },
    { id: '280310048', name: 'Procyon A', type: 'F-type', magnitude: '0.34' },
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
