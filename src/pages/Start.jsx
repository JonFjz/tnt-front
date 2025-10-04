import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Starfield from '../components/Starfield.jsx'

export default function Start() {
  const navigate = useNavigate()
  const [isHyperParamsOpen, setIsHyperParamsOpen] = useState(false)
  const [isStarFiltersOpen, setIsStarFiltersOpen] = useState(true)
  
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
     <Starfield />
     
     {/* Hyper Parameters Button */}
     <button className="hyper-params-btn" onClick={() => setIsHyperParamsOpen(!isHyperParamsOpen)}>
       Change Hyper Parameters
       <div className="settings-icon"></div>
     </button>

     {/* Hyper Parameters Panel */}
     {isHyperParamsOpen && (
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
        {/* Scrollable Content Area */}
        <div className="scrollable-content">
          {/* Star Search Filters */}
          <div className="star-filters-section">
            <div className="filter-section-header" onClick={() => setIsStarFiltersOpen(!isStarFiltersOpen)}>
              <span>Star Search Filters</span>
              <span className={`expand-icon ${isStarFiltersOpen ? 'expanded' : 'collapsed'}`}>▼</span>
            </div>
            
            {isStarFiltersOpen && (
              <div className="filter-content">
                {/* Sky Position */}
                <div className="filter-group">
                  <label className="filter-label">Sky position:</label>
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
                  <label className="filter-label">Magnitude range:</label>
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
                  <label className="filter-label">Temperature (K):</label>
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
                  <label className="filter-label">Distance (pc):</label>
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
                  <label className="filter-label">Observation:</label>
                  <select className="filter-dropdown">
                    <option value="">Select satellite</option>
                    <option value="tess">TESS</option>
                    <option value="k2">K2</option>
                  </select>
                </div>

                {/* Flags */}
                <div className="filter-group">
                  <label className="filter-label">Flags:</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input type="checkbox" className="filter-checkbox" />
                      <span className="checkmark"></span>
                      Variable stars only
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" className="filter-checkbox" />
                      <span className="checkmark"></span>
                      Has TOI/KOI
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Star ID Section */}
          <div className="star-id-section">
            <p className="card-text">Choose which star you want to analyze</p>
            <input 
              type="text" 
              className="star-input" 
              placeholder="Enter star ID"
            />
          </div>

          {/* File Upload */}
          <div className="upload-section">
            <p className="card-text">Or upload your own data</p>
            <div className="file-upload-box">
              <input type="file" id="fileInput" className="file-input" accept=".csv,.json" />
              <label htmlFor="fileInput" className="file-upload-label">
                <div className="upload-icon"></div>
                <div className="upload-text">Drop data files here CSV, JSON</div>
              </label>
            </div>
          </div>
        </div>

        {/* Fixed Button Outside Scroll */}
        <button className="start-analyzing-btn">Start Analyzing</button>

      </div>
    </main>
  )
}
