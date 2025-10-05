import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Starfield from '../components/Starfield.jsx'
import StarWarp from '../components/StarWarp.jsx'
import StarSystem from '../components/StarSystem.jsx'

export default function Start() {
  const navigate = useNavigate()
  const [isHyperParamsOpen, setIsHyperParamsOpen] = useState(false)
  const [isStarFiltersOpen, setIsStarFiltersOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('basicStars') // 'basicStars', 'starSearch', or 'starFilter'
  const [selectedStar, setSelectedStar] = useState(null) // Track selected star from basic stars list
  const [filteredStars, setFilteredStars] = useState([
    { id: 'HD 209458', name: 'HD 209458', type: 'G0V', magnitude: 7.65, distance: 159 },
    { id: 'WASP-12', name: 'WASP-12', type: 'G0V', magnitude: 11.69, distance: 871 },
    { id: 'Kepler-452', name: 'Kepler-452', type: 'G2V', magnitude: 13.4, distance: 1402 },
    { id: 'TRAPPI222ST-1', name: 'TRAPPIST-1', type: 'M8V', magnitude: 18.8, distance: 39.5 },
    { id: 'TOI-715', name: 'TOI-715', type: 'M4V', magnitude: 16.2, distance: 137 },
    { id: 'K2-18', name: 'K2-18', type: 'M2.5V', magnitude: 13.4, distance: 124 }
  ]) // Store filtered stars from star filter
  const [selectedFilteredStar, setSelectedFilteredStar] = useState(null) // Track selected star from filtered list
  const [isChangeFitsOpen, setIsChangeFitsOpen] = useState(false)
  const [hasResults, setHasResults] = useState(false) // legacy side-panel results
  const [resultsData, setResultsData] = useState(null) // Store actual results data
  const [skySelectedStar, setSkySelectedStar] = useState(null) // Selected from sky view
  const [warpActive, setWarpActive] = useState(false)
  const [warpDone, setWarpDone] = useState(false)
  const [dataReady, setDataReady] = useState(false)
  const [showSystem, setShowSystem] = useState(false)

  useEffect(() => {
    if (warpDone && dataReady) {
      setShowSystem(true)
      setWarpActive(false)
    }
  }, [warpDone, dataReady])
  
  const apiUrl = '/api'

  const handleStarSelected = async (star) => {
    // Only select the star in sky view; don't analyze yet
    setSkySelectedStar(star)
  }

  const analyzeSelectedStar = async () => {
    if (!skySelectedStar) return
    setWarpActive(true)
    setWarpDone(false)
    setDataReady(false)

    // Try to fetch detailed system data with any available identifier
    const candidateIds = [
      skySelectedStar?.ID,
      skySelectedStar?.objID,
      skySelectedStar?.tid,
      skySelectedStar?.GAIA,
      skySelectedStar?.ALLWISE,
      skySelectedStar?.TWOMASS,
      skySelectedStar?.UCAC,
      skySelectedStar?.TYC
    ].filter(Boolean)

    let detailed = null
    for (const id of candidateIds) {
      try {
        const analyzeUrl = `${apiUrl.replace(/\/$/, '')}/analyze?id=${encodeURIComponent(id)}`
        const resp = await fetch(analyzeUrl, { headers: { 'accept': 'application/json' } })
        const json = await resp.json()
        if (json?.response || json?.data || json) {
          detailed = json.response || json.data || json
          break
        }
      } catch (e) {
        // Ignore and try next id
      }
    }

    const s = Array.isArray(detailed) ? detailed[0] : (detailed || skySelectedStar)
    const mapped = {
      starId: s?.GAIA || s?.ID || s?.tid || s?.ALLWISE || s?.TWOMASS || s?.UCAC || s?.TYC || 'Unknown',
      ra: (s?.ra ?? s?.RA_orig) != null ? String(s.ra ?? s.RA_orig) + '°' : '—',
      dec: (s?.dec ?? s?.Dec_orig) != null ? String(s.dec ?? s.Dec_orig) + '°' : '—',
      magnitude: s?.Tmag ?? s?.GAIAmag ?? s?.Vmag ?? s?.st_tmag ?? '—',
      temperature: s?.Teff ?? s?.st_teff ? String(s?.Teff ?? s?.st_teff) + ' K' : '—',
      distance: s?.d ?? s?.st_dist ? String(s?.d ?? s?.st_dist) + ' pc' : '—',
      exoplanetCount: s?.pl_pnum ?? undefined,
      transits: s?.pl_orbper ? [{ period: `${s.pl_orbper} days`, depth: s.pl_trandep ? `${s.pl_trandep}` : undefined, duration: s.pl_trandurh ? `${s.pl_trandurh} h` : undefined }] : undefined,
      confidence: undefined,
      threshold: undefined,
      snr: undefined,
      processingTime: undefined
    }

    setResultsData(mapped)
    setDataReady(true)
  }
  
  // Handle typing in inputs to update slider
  const handleInputChange = (e, min, max) => {
    const input = e.target
    const wrapper = input.parentElement
    let value = parseFloat(input.value)
    
    // Clamp to min/max and update input field
    if (!isNaN(value)) {
      const clampedValue = Math.max(min, Math.min(max, value))
      
      // If value was clamped, update the input field
      if (clampedValue !== value) {
        input.value = clampedValue
      }
      
      wrapper.setAttribute('data-value', clampedValue)
      
      // Update CSS fill percentage
      const percentage = ((clampedValue - min) / (max - min)) * 100
      wrapper.style.setProperty('--fill-percentage', `${percentage}%`)
    }
  }

  // Handle input focus for better selection
  const handleInputClick = (e) => {
    e.stopPropagation()
    const input = e.target
    setTimeout(() => {
      input.select()
    }, 0)
  }

  // Handle key press to block + and - characters
  const handleKeyDown = (e) => {
    if (e.key === '+' || e.key === '-') {
      e.preventDefault()
    }
  }

  // Handle range inputs to ensure left <= right
  const handleRangeInputChange = (e, min, max, isLeftInput) => {
    const input = e.target
    let value = parseFloat(input.value)
    
    // Clamp to min/max first
    if (!isNaN(value)) {
      value = Math.max(min, Math.min(max, value))
      input.value = value
    }
    
    // Find the paired input (sibling)
    const rangeContainer = input.closest('.range-inputs')
    const inputs = rangeContainer.querySelectorAll('input[type="number"]')
    const leftInput = inputs[0]
    const rightInput = inputs[1]
    
    const leftValue = parseFloat(leftInput.value) || min
    const rightValue = parseFloat(rightInput.value) || max
    
    if (isLeftInput) {
      // If left input changed and it's now greater than right, update right
      if (leftValue > rightValue) {
        rightInput.value = leftValue
      }
    } else {
      // If right input changed and it's now less than left, update left
      if (rightValue < leftValue) {
        leftInput.value = rightValue
      }
    }
  }

  // Handle date range inputs to ensure start <= end
  const handleDateRangeChange = (e, isStartDate) => {
    const input = e.target
    const dateValue = input.value
    
    // Find the paired date input (sibling)
    const fitsContainer = input.closest('.fits-content')
    const dateInputs = fitsContainer.querySelectorAll('input[type="date"]')
    const startInput = dateInputs[0] // First date input is start
    const endInput = dateInputs[1]   // Second date input is end
    
    const startDate = new Date(startInput.value)
    const endDate = new Date(endInput.value)
    
    // Only validate if both dates have values
    if (startInput.value && endInput.value) {
      if (isStartDate) {
        // If start date changed and it's now after end date, update end date
        if (startDate > endDate) {
          endInput.value = startInput.value
        }
      } else {
        // If end date changed and it's now before start date, update start date
        if (endDate < startDate) {
          startInput.value = endInput.value
        }
      }
    }
  }

  // Handle toggle switch
  const [toggleStates, setToggleStates] = useState({
    qualityMask: true
  })

  const handleToggle = (toggleName) => {
    setToggleStates(prev => ({
      ...prev,
      [toggleName]: !prev[toggleName]
    }))
  }

  // Handle section dropdowns
  const [sectionStates, setSectionStates] = useState({
    presets: false,
    preprocessing: true,
    transitSearch: true,
    featureExtraction: false,
    model: true,
    decisionThreshold: true
  })

  const toggleSection = (sectionName) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  // Handle dragging on inputs to change values
  const handleMouseDown = (e, min, max, step = 1) => {
    const input = e.target
    const wrapper = input.parentElement
    const startX = e.clientX
    const startValue = parseFloat(input.value)
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX
      const sensitivity = (max - min) / 200 // Adjust sensitivity
      let newValue = startValue + (deltaX * sensitivity)
      
      // Clamp to min/max
      newValue = Math.max(min, Math.min(max, newValue))
      
      // Apply step
      if (step < 1) {
        newValue = Math.round(newValue / step) * step
        newValue = parseFloat(newValue.toFixed(2))
      } else {
        newValue = Math.round(newValue)
      }
      
      input.value = newValue
      wrapper.setAttribute('data-value', newValue)
      
      // Update CSS fill percentage
      const percentage = ((newValue - min) / (max - min)) * 100
      wrapper.style.setProperty('--fill-percentage', `${percentage}%`)
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ew-resize'
    e.preventDefault()
  }

  // Validation functions for star search filters
  const validateRA = (value) => {
    const ra = parseFloat(value)
    if (isNaN(ra) || ra < 0 || ra >= 360) {
      return "Right Ascension must be between 0° and 360°"
    }
    return null
  }

  const validateDec = (value) => {
    const dec = parseFloat(value)
    if (isNaN(dec) || dec < -90 || dec > 90) {
      return "Declination must be between -90° and +90°"
    }
    return null
  }

  const validateRadius = (value) => {
    const radius = parseFloat(value)
    if (isNaN(radius) || radius <= 0 || radius > 30) {
      return "Radius must be between 0.01 and 30 arcmin"
    }
    return null
  }

  return (
    <main className="page">
     <Starfield apiUrl={apiUrl} onStarSelected={handleStarSelected} selectedStar={skySelectedStar} />
     <StarWarp active={warpActive} onComplete={() => { setWarpDone(true); }} />
     {showSystem && resultsData && (
       <StarSystem data={resultsData} onBack={() => { setShowSystem(false); setResultsData(null); setSkySelectedStar(null); }} />
     )}
     
     {/* Hyper Parameters Button - Hide when results exist */}
     {!hasResults && (
       <button className="hyper-params-btn" onClick={() => setIsHyperParamsOpen(!isHyperParamsOpen)}>
         Change Hyper Parameters
         <div className="settings-icon"></div>
       </button>
     )}

     {/* Hyper Parameters Panel - Hide when results exist */}
     {!hasResults && isHyperParamsOpen && (
       <div className="hyper-params-panel">
         <div className="param-section">
           <div className="param-section-header" onClick={() => toggleSection('presets')}>
             <span>Presets</span>
             <span className={`expand-icon ${sectionStates.presets ? 'expanded' : 'collapsed'}`}>▼</span>
           </div>
           {sectionStates.presets && (
             <div className="param-content">
               {/* Content for presets will go here when needed */}
             </div>
           )}
         </div>
         
         <div className="param-section">
           <div className="param-section-header" onClick={() => toggleSection('preprocessing')}>
             <span>Preprocessing</span>
             <span className={`expand-icon ${sectionStates.preprocessing ? 'expanded' : 'collapsed'}`}>▼</span>
           </div>
           {sectionStates.preprocessing && (
             <div className="param-content">
               <div className="param-item">
                 <label>Sigma-clip</label>
                 <div className="param-input-wrapper" data-min="1" data-max="10" data-value="6">
                   <input type="number" min="1" max="10" defaultValue="6" className="param-input" 
                          onMouseDown={(e) => {
                            if (e.detail === 2) return; // Double click to select
                            handleMouseDown(e, 1, 10);
                          }}
                          onClick={handleInputClick}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => handleInputChange(e, 1, 10)} />
                 </div>
               </div>
               <div className="param-item">
                 <label>Resampling cadence</label>
                 <div className="param-input-wrapper" data-min="10" data-max="100" data-value="60">
                   <input type="number" min="10" max="100" defaultValue="60" className="param-input"
                          onMouseDown={(e) => {
                            if (e.detail === 2) return;
                            handleMouseDown(e, 10, 100);
                          }}
                          onClick={handleInputClick}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => handleInputChange(e, 10, 100)} />
                 </div>
               </div>
               <div className="param-item">
                 <label>Quality mask</label>
                 <div 
                   className={`param-toggle ${toggleStates.qualityMask ? 'on' : 'off'}`}
                   onClick={() => handleToggle('qualityMask')}
                 >
                   {toggleStates.qualityMask ? 'ON' : 'OFF'}
                 </div>
               </div>
             </div>
           )}
         </div>

         <div className="param-section">
           <div className="param-section-header" onClick={() => toggleSection('transitSearch')}>
             <span>Transit search</span>
             <span className={`expand-icon ${sectionStates.transitSearch ? 'expanded' : 'collapsed'}`}>▼</span>
           </div>
           {sectionStates.transitSearch && (
             <div className="param-content">
               <div className="param-item">
                 <label>Period range(days)</label>
                 <div className="param-input-wrapper" data-min="1" data-max="1000" data-value="365">
                   <input type="number" min="1" max="1000" defaultValue="365" className="param-input"
                          onMouseDown={(e) => {
                            if (e.detail === 2) return;
                            handleMouseDown(e, 1, 1000);
                          }}
                          onClick={handleInputClick}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => handleInputChange(e, 1, 1000)} />
                 </div>
               </div>
               <div className="param-item">
                 <label>Max planets</label>
                 <div className="param-input-wrapper" data-min="1" data-max="10" data-value="4">
                   <input type="number" min="1" max="10" defaultValue="4" className="param-input"
                          onMouseDown={(e) => {
                            if (e.detail === 2) return;
                            handleMouseDown(e, 1, 10);
                          }}
                          onClick={handleInputClick}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => handleInputChange(e, 1, 10)} />
                 </div>
               </div>
             </div>
           )}
         </div>

         <div className="param-section">
           <div className="param-section-header" onClick={() => toggleSection('featureExtraction')}>
             <span>Feature extraction</span>
             <span className={`expand-icon ${sectionStates.featureExtraction ? 'expanded' : 'collapsed'}`}>▼</span>
           </div>
           {sectionStates.featureExtraction && (
             <div className="param-content">
               {/* Content for feature extraction will go here when needed */}
             </div>
           )}
         </div>

         <div className="param-section">
           <div className="param-section-header" onClick={() => toggleSection('model')}>
             <span>Model</span>
             <span className={`expand-icon ${sectionStates.model ? 'expanded' : 'collapsed'}`}>▼</span>
           </div>
           {sectionStates.model && (
             <div className="param-content">
               <div className="param-item">
                 <label>n_estimators</label>
                 <div className="param-input-wrapper" data-min="100" data-max="1000" data-value="800">
                   <input type="number" min="100" max="1000" defaultValue="800" className="param-input"
                          onMouseDown={(e) => {
                            if (e.detail === 2) return;
                            handleMouseDown(e, 100, 1000);
                          }}
                          onClick={handleInputClick}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => handleInputChange(e, 100, 1000)} />
                 </div>
               </div>
               <div className="param-item">
                 <label>learning_rate</label>
                 <div className="param-input-wrapper" data-min="0.01" data-max="1" data-value="0.07">
                   <input type="number" min="0.01" max="1" step="0.01" defaultValue="0.07" className="param-input"
                          onMouseDown={(e) => {
                            if (e.detail === 2) return;
                            handleMouseDown(e, 0.01, 1, 0.01);
                          }}
                          onClick={handleInputClick}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => handleInputChange(e, 0.01, 1)} />
                 </div>
               </div>
               <div className="param-item">
                 <label>max_depth</label>
                 <div className="param-input-wrapper" data-min="1" data-max="10" data-value="4">
                   <input type="number" min="1" max="10" defaultValue="4" className="param-input"
                          onMouseDown={(e) => {
                            if (e.detail === 2) return;
                            handleMouseDown(e, 1, 10);
                          }}
                          onClick={handleInputClick}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => handleInputChange(e, 1, 10)} />
                 </div>
               </div>
             </div>
           )}
         </div>

         <div className="param-section">
           <div className="param-section-header" onClick={() => toggleSection('decisionThreshold')}>
             <span>Decision threshold</span>
             <span className={`expand-icon ${sectionStates.decisionThreshold ? 'expanded' : 'collapsed'}`}>▼</span>
           </div>
           {sectionStates.decisionThreshold && (
             <div className="param-content">
               <div className="param-item">
                 <label>Recall Focus</label>
                 <div className="param-input-wrapper" data-min="0" data-max="1" data-value="0.3">
                   <input type="number" min="0" max="1" step="0.1" defaultValue="0.3" className="param-input"
                          onMouseDown={(e) => {
                            if (e.detail === 2) return;
                            handleMouseDown(e, 0, 1, 0.1);
                          }}
                          onClick={handleInputClick}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => handleInputChange(e, 0, 1)} />
                 </div>
               </div>
               <div className="param-item">
                 <label>Precision Focus</label>
                 <div className="param-input-wrapper" data-min="0" data-max="1" data-value="0.7">
                   <input type="number" min="0" max="1" step="0.1" defaultValue="0.7" className="param-input"
                          onMouseDown={(e) => {
                            if (e.detail === 2) return;
                            handleMouseDown(e, 0, 1, 0.1);
                          }}
                          onClick={handleInputClick}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => handleInputChange(e, 0, 1)} />
                 </div>
               </div>
             </div>
           )}
         </div>

         <button className="train-model-btn">Train Model</button>
       </div>
     )}

     {/* Hamburger Icon */}
     <div className="hamburger-icon" onClick={() => navigate('/')}>
       <div className="hamburger-line"></div>
       <div className="hamburger-line"></div>
       <div className="hamburger-line"></div>
     </div>
     
      <div className="glass card w-30 h-90">
        {/* Show results or filters based on state */}
        {hasResults ? (
          /* Results Content */
          <div className="results-container">
            <div className="results-header">
              <h3>Star Analysis Results</h3>
              <button 
                className="back-to-search-btn"
                onClick={() => setHasResults(false)}
              >
                ← Back to Search
              </button>
            </div>
            <div className="scrollable-content">
              <div className="results-content">
                {resultsData ? (
                  <>
                    {/* Star Information Section */}
                    <div className="results-section">
                      <h4 className="section-title">Star Information</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <label className="info-label">Star ID:</label>
                          <span className="info-value">{resultsData.starId || 'TIC 123456789'}</span>
                        </div>
                        <div className="info-item">
                          <label className="info-label">RA:</label>
                          <span className="info-value">{resultsData.ra || '180.5°'}</span>
                        </div>
                        <div className="info-item">
                          <label className="info-label">Dec:</label>
                          <span className="info-value">{resultsData.dec || '-45.2°'}</span>
                        </div>
                        <div className="info-item">
                          <label className="info-label">Magnitude:</label>
                          <span className="info-value">{resultsData.magnitude || '12.4'}</span>
                        </div>
                        <div className="info-item">
                          <label className="info-label">Temperature:</label>
                          <span className="info-value">{resultsData.temperature || '5800 K'}</span>
                        </div>
                        <div className="info-item">
                          <label className="info-label">Distance:</label>
                          <span className="info-value">{resultsData.distance || '125.6 pc'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Graph Section */}
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
                  </>
                ) : (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Analyzing star data...</p>
                    <p className="loading-subtext">This may take a few moments</p>
                    
                    {/* Mock Data Button for Testing */}
                    <button 
                      className="mock-data-btn"
                      onClick={() => setResultsData({
                        starId: "TIC 441420236",
                        ra: "285.67°",
                        dec: "-23.45°", 
                        magnitude: "11.2",
                        temperature: "5847 K",
                        distance: "98.3 pc",
                        exoplanetCount: 2,
                        confidence: 89,
                        threshold: 0.74,
                        snr: 12.8,
                        processingTime: "1.7s",
                        transits: [
                          { period: "4.15 days", depth: "0.92%", duration: "2.3 hours" },
                          { period: "8.47 days", depth: "0.61%", duration: "1.9 hours" }
                        ]
                      })}
                    >
                      Load Mock Results (Preview)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Search/Filter Content */
          <>
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-button ${activeTab === 'basicStars' ? 'active' : ''}`}
                onClick={() => setActiveTab('basicStars')}
              >
                Basic Stars
              </button>
              <button 
                className={`tab-button ${activeTab === 'starSearch' ? 'active' : ''}`}
                onClick={() => setActiveTab('starSearch')}
              >
                Star Search
              </button>
              <button 
                className={`tab-button ${activeTab === 'starFilter' ? 'active' : ''}`}
                onClick={() => setActiveTab('starFilter')}
              >
                Star Filter
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="scrollable-content">
          {/* Basic Stars Tab */}
          {activeTab === 'basicStars' && (
            <div className="tab-content">
              <div className="basic-stars-section">
                <div className="stars-list">
                  {[
                    { id: 'TIC-388857263', name: 'Proxima Centauri', type: 'Red Dwarf', magnitude: '11.13' },
                    { id: 'TIC-261136679', name: 'π Mensae', type: 'G-type', magnitude: '5.65' },
                    { id: 'TIC-150428135', name: 'TOI-700', type: 'Red Dwarf', magnitude: '13.1' },
                    { id: 'TIC-269273552', name: 'Betelgeuse', type: 'Red Supergiant', magnitude: '0.58' },
                    { id: 'TIC-231308237', name: 'Rigel', type: 'Blue Supergiant', magnitude: '0.13' },
                    { id: 'TIC-280310048', name: 'Procyon A', type: 'F-type', magnitude: '0.34' },
                    { id: 'TIC-245873777', name: 'Aldebaran', type: 'Red Giant', magnitude: '0.85' },
                    { id: 'TIC-423088367', name: 'Pollux', type: 'K-type Giant', magnitude: '1.14' }
                  ].map((star) => (
                    <div 
                      key={star.id}
                      className={`star-item ${selectedStar?.id === star.id ? 'selected' : ''}`}
                      onClick={() => setSelectedStar(star)}
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
          )}

          {/* Star Search Tab */}
          {activeTab === 'starSearch' && (
            <div className="tab-content">
              {/* Select Telescope */}
              <div className="filter-group">
                <label className="filter-label">
                  Select telescope:
                  <span className="info-icon" data-tooltip="Choose which space telescope data to search. TESS (Transiting Exoplanet Survey Satellite) monitors stars for planetary transits, while K2 is the extended Kepler mission.">ⓘ</span>
                </label>
                <select className="filter-dropdown">
                  <option value="">Select telescope</option>
                  <option value="tess">TESS</option>
                  <option value="k2">K2</option>
                </select>
              </div>

              {/* Select Star by ID */}
              <div className="filter-group">
                <label className="filter-label">
                  Select star by ID:
                  <span className="info-icon" data-tooltip="Enter a specific star identifier like TIC ID, HD number, or common name to search for that exact star in the telescope database.">ⓘ</span>
                </label>
                <input 
                  type="text" 
                  className="filter-input" 
                  placeholder="Enter star ID"
                />
              </div>

              {/* TOI/KOI Lookup */}
              <div className="filter-group">
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" className="filter-checkbox" />
                    <span className="checkmark"></span>
                    Enable TOI/KOI lookup
                    <span className="info-icon" data-tooltip="TOI (TESS Objects of Interest) and KOI (Kepler Objects of Interest) are candidate exoplanets detected by these missions. Enable this to search for stars with confirmed or candidate planets.">ⓘ</span>
                  </label>
                </div>
              </div>

              {/* Change FITS Dropdown */}
              <div className="filter-group">
                <div className="fits-dropdown-section">
                  <div className="filter-section-header" onClick={() => setIsChangeFitsOpen(!isChangeFitsOpen)}>
                    <span>FITS Configuration</span>
                    <span className={`expand-icon ${isChangeFitsOpen ? 'expanded' : 'collapsed'}`}>▼</span>
                  </div>
                  
                  {isChangeFitsOpen && (
                    <div className="fits-content">
                      <div className="fits-input-group">
                        <label className="input-label">Prefer:</label>
                        <select className="filter-dropdown">
                          <option value="">Select preference</option>
                          <option value="spoc">SPOC</option>
                          <option value="qlp">QLP</option>
                          <option value="any">Any</option>
                        </select>
                      </div>
                      <div className="fits-input-group">
                        <label className="input-label">TESScut:</label>
                        <select className="filter-dropdown">
                          <option value="">Select option</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div className="fits-input-group">
                        <label className="input-label">Sector:</label>
                        <input 
                          type="number" 
                          className="filter-input" 
                          placeholder="Enter sector number"
                        />
                      </div>
                      <div className="fits-input-group">
                        <label className="input-label">Cutout Size:</label>
                        <input 
                          type="number" 
                          className="filter-input" 
                          placeholder="Enter cutout size"
                        />
                      </div>
                      
                      {/* File Upload Section */}
                      <div className="fits-upload-section">
                        <label className="input-label fits-upload-label">Or upload your own data:</label>
                        <div className="file-upload-box">
                          <input type="file" id="fileInput" className="file-input" accept=".csv,.json,.fits" />
                          <label htmlFor="fileInput" className="file-upload-label">
                            <div className="upload-icon"></div>
                            <div className="upload-text">Drop data files here CSV, JSON, FITS</div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Star Filter Tab */}
          {activeTab === 'starFilter' && (
            <div className="tab-content">
              <div className="star-filters-section">
                <div className="filter-content">
                    {/* Sky Position */}
                    <div className="filter-group">
                      <label className="filter-label">
                        Sky position:
                        <span className="info-icon" data-tooltip="Search for stars within a specific region of the sky. RA (Right Ascension) is celestial longitude (0-360°), Dec (Declination) is celestial latitude (-90° to +90°), and Radius defines the search area in arcminutes.">ⓘ</span>
                      </label>
                      <div className="sky-position-inputs">
                        <div className="input-group">
                          <label className="input-label">RA</label>
                          <input type="number" className="filter-input" placeholder="0-360" min="0" max="360"
                                 onChange={(e) => handleInputChange(e, 0, 360)} />
                        </div>
                        <div className="input-group">
                          <label className="input-label">Dec</label>
                          <input type="number" className="filter-input" placeholder="-90 to 90" min="-90" max="90"
                                 onChange={(e) => handleInputChange(e, -90, 90)} />
                        </div>
                        <div className="input-group">
                          <label className="input-label">Radius</label>
                          <input type="number" className="filter-input" placeholder="arcmin" min="0.01" max="30"
                                 onChange={(e) => handleInputChange(e, 0.01, 30)} />
                          <span className="unit-label">arcmin</span>
                        </div>
                      </div>
                    </div>

                    {/* Magnitude Range */}
                    <div className="filter-group">
                      <label className="filter-label">
                        Magnitude range:
                        <span className="info-icon" data-tooltip="Apparent magnitude measures how bright a star appears from Earth. Lower numbers = brighter stars. The Sun is -26.7, bright stars are 0-2, naked-eye limit is ~6, and faint stars can be 15+.">ⓘ</span>
                      </label>
                      <div className="range-inputs">
                        <input type="number" className="filter-input range-input" defaultValue="6" min="0" max="20"
                               onChange={(e) => handleRangeInputChange(e, 0, 20, true)} />
                        <span className="range-separator">—</span>
                        <input type="number" className="filter-input range-input" defaultValue="15" min="0" max="20"
                               onChange={(e) => handleRangeInputChange(e, 0, 20, false)} />
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="filter-group">
                      <label className="filter-label">
                        Temperature (K):
                        <span className="info-icon" data-tooltip="Stellar effective temperature in Kelvin. Cool red dwarfs are ~2500-4000K, Sun-like stars are ~5000-6000K, and hot blue stars can exceed 20000K. Temperature determines the star's color and spectral type.">ⓘ</span>
                      </label>
                      <div className="range-inputs">
                        <input type="number" className="filter-input range-input" defaultValue="3000" min="2500" max="40000"
                               onChange={(e) => handleRangeInputChange(e, 2500, 40000, true)} />
                        <span className="range-separator">—</span>
                        <input type="number" className="filter-input range-input" defaultValue="7500" min="2500" max="40000"
                               onChange={(e) => handleRangeInputChange(e, 2500, 40000, false)} />
                      </div>
                    </div>

                    {/* Distance */}
                    <div className="filter-group">
                      <label className="filter-label">
                        Distance (pc):
                        <span className="info-icon" data-tooltip="Distance from Earth measured in parsecs (pc). 1 parsec = 3.26 light-years. Nearby stars are within ~10pc, the solar neighborhood extends to ~100pc, and the galaxy disk is ~30,000pc across.">ⓘ</span>
                      </label>
                      <div className="range-inputs">
                        <input type="number" className="filter-input range-input" defaultValue="10" min="1" max="10000"
                               onChange={(e) => handleRangeInputChange(e, 1, 10000, true)} />
                        <span className="range-separator">—</span>
                        <input type="number" className="filter-input range-input" defaultValue="500" min="1" max="10000"
                               onChange={(e) => handleRangeInputChange(e, 1, 10000, false)} />
                      </div>
                    </div>

                    {/* Observation */}
                    <div className="filter-group">
                      <label className="filter-label">
                        Observation:
                        <span className="info-icon" data-tooltip="Select which space telescope's observations to filter by. TESS provides all-sky monitoring for transits, while K2 observed specific fields with high precision photometry.">ⓘ</span>
                      </label>
                      <select className="filter-dropdown">
                        <option value="">Select satellite</option>
                        <option value="tess">TESS</option>
                        <option value="k2">K2</option>
                      </select>
                    </div>

                    {/* Filter Button */}
                    <div className="filter-group">
                      <button className="filter-btn" onClick={() => setFilteredStars([])}>
                        Filter
                      </button>
                    </div>
                  </div>

                  {/* Select Star Section */}
                  <div className="select-star-section">
                    <h4 className="section-subtitle">Select Star</h4>
                    <div className="filtered-stars-list">
                      {filteredStars.length > 0 ? (
                        filteredStars.map((star) => (
                          <div 
                            key={star.id}
                            className={`star-item ${selectedFilteredStar?.id === star.id ? 'selected' : ''}`}
                            onClick={() => setSelectedFilteredStar(star)}
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
                        ))
                      ) : (
                        <div className="no-filtered-stars">
                          <p>No stars found. Apply filters and click "Filter" to see results.</p>
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            </div>
          )}
            </div>
          </>
        )}

        {/* Fixed Button Outside Scroll - Hide when results exist */}
        {!hasResults && (
          <button className="start-analyzing-btn" disabled={!skySelectedStar} onClick={analyzeSelectedStar}>
            {skySelectedStar ? 'Analyze Selected Star' : 'Select a star to analyze'}
          </button>
        )}

        {/* Test Button for Results Toggle (bottom right) */}
        <button 
          className="test-results-btn"
          onClick={() => setHasResults(!hasResults)}
        >
          {hasResults ? 'Hide Results' : 'Show Results'}
        </button>

      </div>

      {/* AI Analysis - Center Container */}
      {hasResults && resultsData && (
        <div className="ai-analysis-container">
          <h4 className="section-title">AI Analysis</h4>
          <div className="ai-analysis">
            <div className="ai-main-result">
              <div className="exoplanet-count">
                <span className="count-number">{resultsData.exoplanetCount || '2'}</span>
                <span className="count-label">Exoplanets Detected</span>
              </div>
              <div className="confidence-meter">
                <label className="confidence-label">Confidence:</label>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{width: `${resultsData.confidence || 87}%`}}
                  ></div>
                </div>
                <span className="confidence-value">{resultsData.confidence || 87}%</span>
              </div>
            </div>
            
            <div className="ai-details">
              <div className="ai-detail-item">
                <label className="ai-label">Detection Threshold:</label>
                <span className="ai-value">{resultsData.threshold || '0.72'}</span>
              </div>
              <div className="ai-detail-item">
                <label className="ai-label">Signal-to-Noise Ratio:</label>
                <span className="ai-value">{resultsData.snr || '8.4'}</span>
              </div>
              <div className="ai-detail-item">
                <label className="ai-label">Processing Time:</label>
                <span className="ai-value">{resultsData.processingTime || '2.3s'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transit Details - Right of AI Analysis */}
      {hasResults && resultsData && (
        <div className="transit-details-container">
          <h4 className="section-title">Transit Details</h4>
          <div className="transit-details-scrollable">
            <div className="transit-details">
              {resultsData.transits && resultsData.transits.length > 0 ? (
                resultsData.transits.map((transit, index) => (
                  <div key={index} className="transit-item">
                    <h5>Planet {index + 1}</h5>
                    <div className="transit-info">
                      <span>Period: {transit.period || '3.2 days'}</span>
                      <span>Depth: {transit.depth || '0.8%'}</span>
                      <span>Duration: {transit.duration || '2.1 hours'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="transit-item">
                  <h5>Planet 1</h5>
                  <div className="transit-info">
                    <span>Period: 3.2 days</span>
                    <span>Depth: 0.8%</span>
                    <span>Duration: 2.1 hours</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
