// /src/components/Sidebar/TabNav.jsx
export default function TabNav({ activeTab, onChange }) {
  return (
    <div className="tab-navigation">
      <button
        className={`tab-button ${activeTab === 'basicStars' ? 'active' : ''}`}
        onClick={() => onChange('basicStars')}
      >
        Quick Stars
      </button>
      <button
        className={`tab-button ${activeTab === 'starSearch' ? 'active' : ''}`}
        onClick={() => onChange('starSearch')}
      >
        Star Search
      </button>
      <button
        className={`tab-button ${activeTab === 'starFilter' ? 'active' : ''}`}
        onClick={() => onChange('starFilter')}
      >
        Star Filter
      </button>
    </div>
  );
}
