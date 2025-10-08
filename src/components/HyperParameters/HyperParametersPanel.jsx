// /src/components/HyperParameters/HyperParametersPanel.jsx
import { useState } from 'react';
import NumberSliderInput from '../inputs/NumberSliderInput.jsx';
import ToggleSwitch from '../inputs/ToggleSwitch.jsx';

export default function HyperParametersPanel({
  defaultValues = {},
  onTrainModel, // optional future hook
}) {
  const [sections, setSections] = useState({
    presets: false,
    preprocessing: true,
    transitSearch: true,
    featureExtraction: false,
    model: true,
    decisionThreshold: true,
  });

  const [toggles, setToggles] = useState({ qualityMask: true });

  const toggle = (name) => setSections((s) => ({ ...s, [name]: !s[name] }));
  const toggleSwitch = (name) => setToggles((t) => ({ ...t, [name]: !t[name] }));

  const onClickSelectAll = (e) => {
    // keep behavior identical to your original double-click-to-select
    e.stopPropagation();
    setTimeout(() => e.target.select(), 0);
  };

  const blockPlusMinus = (e) => {
    if (e.key === '+' || e.key === '-') e.preventDefault();
  };

  return (
    <div className="hyper-params-panel">
      {/* Presets */}
      <div className="param-section">
        <div className="param-section-header" onClick={() => toggle('presets')}>
          <span>Presets</span>
          <span className={`expand-icon ${sections.presets ? 'expanded' : 'collapsed'}`}>▼</span>
        </div>
        {sections.presets && <div className="param-content">{/* future */}</div>}
      </div>

      {/* Preprocessing */}
      <div className="param-section">
        <div className="param-section-header" onClick={() => toggle('preprocessing')}>
          <span>Preprocessing</span>
          <span className={`expand-icon ${sections.preprocessing ? 'expanded' : 'collapsed'}`}>▼</span>
        </div>
        {sections.preprocessing && (
          <div className="param-content">
            <div className="param-item">
              <label>Sigma-clip</label>
              <NumberSliderInput
                min={1} max={10} defaultValue={defaultValues.sigmaClip ?? 6}
                onClick={onClickSelectAll}
                onKeyDown={blockPlusMinus}
                onChange={() => {}}
              />
            </div>
            <div className="param-item">
              <label>Resampling cadence</label>
              <NumberSliderInput
                min={10} max={100} defaultValue={defaultValues.resample ?? 60}
                onClick={onClickSelectAll}
                onKeyDown={blockPlusMinus}
                onChange={() => {}}
              />
            </div>
            <div className="param-item">
              <label>Quality mask</label>
              <ToggleSwitch checked={toggles.qualityMask} onToggle={() => toggleSwitch('qualityMask')} />
            </div>
          </div>
        )}
      </div>

      {/* Transit search */}
      <div className="param-section">
        <div className="param-section-header" onClick={() => toggle('transitSearch')}>
          <span>Transit search</span>
          <span className={`expand-icon ${sections.transitSearch ? 'expanded' : 'collapsed'}`}>▼</span>
        </div>
        {sections.transitSearch && (
          <div className="param-content">
            <div className="param-item">
              <label>Period range(days)</label>
              <NumberSliderInput
                min={1} max={1000} defaultValue={defaultValues.periodDays ?? 365}
                onClick={onClickSelectAll}
                onKeyDown={blockPlusMinus}
                onChange={() => {}}
              />
            </div>
            <div className="param-item">
              <label>Max planets</label>
              <NumberSliderInput
                min={1} max={10} defaultValue={defaultValues.maxPlanets ?? 4}
                onClick={onClickSelectAll}
                onKeyDown={blockPlusMinus}
                onChange={() => {}}
              />
            </div>
          </div>
        )}
      </div>

      {/* Feature extraction (placeholder) */}
      <div className="param-section">
        <div className="param-section-header" onClick={() => toggle('featureExtraction')}>
          <span>Feature extraction</span>
          <span className={`expand-icon ${sections.featureExtraction ? 'expanded' : 'collapsed'}`}>▼</span>
        </div>
        {sections.featureExtraction && <div className="param-content">{/* future */}</div>}
      </div>

      {/* Model */}
      <div className="param-section">
        <div className="param-section-header" onClick={() => toggle('model')}>
          <span>Model</span>
          <span className={`expand-icon ${sections.model ? 'expanded' : 'collapsed'}`}>▼</span>
        </div>
        {sections.model && (
          <div className="param-content">
            <div className="param-item">
              <label>n_estimators</label>
              <NumberSliderInput
                min={100} max={1000} defaultValue={defaultValues.n_estimators ?? 800}
                onClick={onClickSelectAll}
                onKeyDown={blockPlusMinus}
                onChange={() => {}}
              />
            </div>
            <div className="param-item">
              <label>learning_rate</label>
              <NumberSliderInput
                min={0.01} max={1} step={0.01} defaultValue={defaultValues.learning_rate ?? 0.07}
                onClick={onClickSelectAll}
                onKeyDown={blockPlusMinus}
                onChange={() => {}}
              />
            </div>
            <div className="param-item">
              <label>max_depth</label>
              <NumberSliderInput
                min={1} max={10} defaultValue={defaultValues.max_depth ?? 4}
                onClick={onClickSelectAll}
                onKeyDown={blockPlusMinus}
                onChange={() => {}}
              />
            </div>
          </div>
        )}
      </div>

      {/* Decision threshold */}
      <div className="param-section">
        <div className="param-section-header" onClick={() => toggle('decisionThreshold')}>
          <span>Decision threshold</span>
          <span className={`expand-icon ${sections.decisionThreshold ? 'expanded' : 'collapsed'}`}>▼</span>
        </div>
        {sections.decisionThreshold && (
          <div className="param-content">
            <div className="param-item">
              <label>Recall Focus</label>
              <NumberSliderInput min={0} max={1} step={0.1} defaultValue={0.3} onChange={() => {}} />
            </div>
            <div className="param-item">
              <label>Precision Focus</label>
              <NumberSliderInput min={0} max={1} step={0.1} defaultValue={0.7} onChange={() => {}} />
            </div>
          </div>
        )}
      </div>

      <button className="train-model-btn" onClick={() => onTrainModel?.()}>Train Model</button>
    </div>
  );
}
