// /src/pages/Start.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import StarSystem from '../components/StarSystem.jsx';
// Removed Starfield background in favor of Aladin viewer

import TabNav from '../components/Sidebar/TabNav.jsx';
import BasicStarsList from '../components/Sidebar/BasicStarsList.jsx';
import HyperParametersPanel from '../components/HyperParameters/HyperParametersPanel.jsx';
import StarFilters from '../components/StarFilters/StarFilters.jsx';
import StarSearch from '../components/StarSearch/StarSearch.jsx';
import ResultsPanel from '../components/Results/ResultsPanel.jsx';
import AIAnalysis from '../components/Results/AIAnalysis.jsx';
import TransitDetails from '../components/Results/TransitDetails.jsx';
import AladinViewer from '../components/AladinViewer.jsx';

import {analyzeStar} from '../api/analyze.js';

export default function Start() {
  const navigate = useNavigate();

  // Tabs/panels
  const [isHyperParamsOpen, setIsHyperParamsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basicStars');

  // Selections (existing)
  const [selectedStar, setSelectedStar] = useState(null);
  const [filteredStars, setFilteredStars] = useState([]);
  const [selectedFilteredStar, setSelectedFilteredStar] = useState(null);
  const [skySelectedStar, setSkySelectedStar] = useState(null);

  // Results & warp (existing)
  const [hasResults, setHasResults] = useState(false);
  const [resultsData, setResultsData] = useState(null);   // keep for legacy UI
  const [resultsRaw, setResultsRaw] = useState(null);     // NEW: raw API payload (per spec)
 
  const [warpDone, setWarpDone] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [showSystem, setShowSystem] = useState(false);

  // NEW: analyze parameters + UI states
  const [starId, setStarId] = useState('');                 // required
  const [mission, setMission] = useState('TESS');           // default: tess
  const [oiLookup, setOiLookup] = useState(true);          // default: false
  const [optimizationType, setOptimizationType] = useState('recall');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);


  const handleBasicSelect = (star) => {
    setSelectedStar(star);
    setStarId(star?.id || '');
    // mission is taken from StarSearch dropdown if the user touched it; otherwise keep default 'tess'
  };

  // StarSearch → lift params up
  const handleSearchConfig = (cfg) => {
    if ('starId' in cfg) setStarId(cfg.starId || '');
    if ('telescope' in cfg) setMission(cfg.telescope || 'TESS');
    if ('oiLookup' in cfg) setOiLookup(!!cfg.oiLookup);
    if ('optimizationType' in cfg) setOptimizationType(cfg.optimizationType || 'balanced');
  };

  // Compute fallback id from sky selection if no explicit starId
  const fallbackSkyId = useMemo(() => {
    const s = skySelectedStar || {};
    return s.ID || s.objID || s.tid || s.GAIA || s.ALLWISE || s.TWOMASS || s.UCAC || s.TYC || '';
  }, [skySelectedStar]);

  const canAnalyze = !!(starId || fallbackSkyId);

  // NEW: main analyze handler (replaces/augments old analyzeSelectedStar)
  const handleAnalyze = async () => {
    setAnalyzeError(null);

    const idToUse = starId || fallbackSkyId;
    if (!idToUse) {
      setAnalyzeError('Select a star first.');
      return;
    }

    setIsAnalyzing(true);
    setHasResults(true);     // keep the user on the current page until success
    setResultsRaw(null);      // reset
    // Do NOT touch resultsData here; per spec we are not implementing display yet

    console.log('[analyze] params ->', { id: idToUse, mission, oi_lookup: oiLookup, optimization_type: optimizationType });

    // Pick the method your backend expects. If it’s GET, change method to 'GET'.
    const res = await analyzeStar(
      { id: idToUse, mission, oi_lookup: oiLookup, optimization_type: optimizationType }
    );

    setIsAnalyzing(false);
     // stop warp immediately (or keep until you flip pages)

    if (!res.ok) {
      console.error('[analyze] error ->', res.error);
      setAnalyzeError(res.error || 'Analyze failed.');
      return;
    }

    console.log('[analyze] raw response ->', res.data);
    setResultsRaw(res.data);  // per spec: store RAW only; no shaping yet
    setHasResults(true);      // show the results page sections (existing UI can be wired later)
    // Keep resultsData null for now (so you don’t accidentally render legacy shapes)
  };

  return (
    <main className="page">
      {/* Aladin sky viewer as full background */}
      {!hasResults && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}
        >
          <AladinViewer selectedStar={selectedStar} />
        </div>
      )}

      {/* Show StarSystem as overlay when results are available */}
      {hasResults && (
        <StarSystem 
          data={resultsRaw}
          onBack={() => setHasResults(false)}
        />
      )}

      {/* Hyper Params trigger (unchanged) */}
      {!hasResults && (
        <button className="hyper-params-btn" onClick={() => setIsHyperParamsOpen(!isHyperParamsOpen)} >
          Change Hyper Parameters
          <div className="settings-icon"></div>
        </button>
      )}
      {!hasResults && isHyperParamsOpen && <HyperParametersPanel />}

      {/* Hamburger */}
      <div className="hamburger-icon" onClick={() => navigate('/')} >
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </div>

      {/* Left panel */}
      <div className="glass card w-30 h-90" style={{ zIndex: 1000, position: 'relative' }}>
        {hasResults ? (
          <ResultsPanel
            resultsData={resultsData}    // stays null for now
            onBack={() => setHasResults(false)}
          />
        ) : (
          <>
            <TabNav activeTab={activeTab} onChange={setActiveTab} />
            <div className="scrollable-content">
              {activeTab === 'basicStars' && (
                <BasicStarsList selected={selectedStar} onSelect={handleBasicSelect} />
              )}

              {activeTab === 'starSearch' && (
                <StarSearch onConfigChange={handleSearchConfig} />
              )}

              {activeTab === 'starFilter' && (
                <div className="tab-content">
                  <StarFilters onResults={setFilteredStars} />
                  <div className="select-star-section">
                    <h4 className="section-subtitle">Select Star</h4>
                    <div className="filtered-stars-list">
                      {filteredStars.length > 0 ? (
                        filteredStars.map((star) => (
                          <div
                            key={star.id}
                            className={`star-item ${selectedFilteredStar?.id === star.id ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedFilteredStar(star);
                              setStarId(star.id);             // also initialize analyze params
                            }}
                          >
                            <div className="star-info">
                              <div className="star-name">{star.name}</div>
                              <div className="star-id">{star.id}</div>
                              <div className="star-details">
                                <span className="star-type">{star.type}</span>
                                <span className="star-magnitude">Mag: {star.magnitude}</span>
                                {typeof star.distance === 'number' && (
                                  <span className="star-distance">Dist: {star.distance.toFixed(1)} pc</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-filtered-stars">
                          <p>No stars found. Apply filters and click "Filter".</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Start Analyzing button — now tied to handleAnalyze */}
        {!hasResults && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="start-analyzing-btn"
              disabled={!canAnalyze || isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing
                ? 'Analyzing...'
                : canAnalyze
                  ? 'Analyze Selected Star'
                  : 'Select a star to analyze'}
            </button>

            {analyzeError && (
              <div style={{ color: '#ff6b6b', fontSize: 13 }}>{analyzeError}</div>
            )}
          </div>
        )}

        {/* Test toggle (unchanged)
        <button className="test-results-btn" onClick={() => setHasResults(!hasResults)}>
          {hasResults ? 'Hide Results' : 'Show Results'}
        </button> */}
      </div>

      

      {/* Center sections: keep existing components; they’ll remain empty until you wire resultsRaw */}
      {hasResults && resultsData && <AIAnalysis data={resultsData} />}
      {hasResults && resultsData && <TransitDetails data={resultsData} />}
    </main>
  );
}
