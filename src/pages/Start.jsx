import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Starfield from '../components/Starfield.jsx'

export default function Start() {
  const navigate = useNavigate()
  const [isHyperParamsOpen, setIsHyperParamsOpen] = useState(false)
  
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
        <p className="card-text">Filter by satelite</p>
        <select className="dropdown">
          <option value="">Select a satelite</option>
        </select>
        <p className="card-text">Choose which star you want to analize</p>
        <input 
          type="text" 
          className="star-input" 
          placeholder="Enter star ID"
        />
        <p className="card-text">Or upload your own data</p>
        <div className="file-upload-box">
          <input type="file" id="fileInput" className="file-input" accept=".csv,.json" />
          <label htmlFor="fileInput" className="file-upload-label">
            <div className="upload-icon"></div>
            <div className="upload-text">Drop data files here CSV, JSON</div>
          </label>
        </div>

        <button className="start-analyzing-btn">Start Analyzing</button>

      </div>
    </main>
  )
}
