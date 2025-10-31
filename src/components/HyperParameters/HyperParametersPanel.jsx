import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./HyperParamsGlassy.css";

const PRESET_CONFIG = {
  precision: { optimization_type: "precision", threshold: 0.7, beta: 0.5 },
  recall:    { optimization_type: "recall",    threshold: 0.3, beta: 2.0 },
  balanced:  { optimization_type: "balanced",  threshold: 0.5, beta: 1.0 },
};

function buildConfig(preset, ui) {
  const base = PRESET_CONFIG[preset];

  const common = {
    optimization_type: base.optimization_type,
    threshold: ui.threshold,       // user-overridable
    beta: ui.beta,                 // user-overridable
    model_name:
      (ui.modelFamily === "koi" ? "koi_" : "toi_") +
      base.optimization_type +
      "_complete",
    find_optimal_threshold: ui.findOptimal,
    create_visualizations: ui.makeViz,
    visualization_path: "src/visualizations",
    do_oversample: ui.oversample,
    min_samples_for_oversample: 5,
    test_size: ui.testSize,
    validation_size: ui.valSize,
    random_state: ui.randomState,
  };

  if (ui.modelFamily === "koi") {
    // LightGBM (dummy but complete)
    return {
      ...common,
      model_type: "KOI",
      algorithm: "lightgbm",
      false_positive_weight: 1.8,
      false_negative_weight: 1.0,
      weight_value: 1.8,
      use_custom_objective: true,
      boosting_type: "gbdt",
      metric: "auc",
      learning_rate: 0.1,
      num_leaves: 31,
      max_depth: 6,
      min_data_in_leaf: 1,
      min_child_samples: 1,
      min_child_weight: 1e-3,
      feature_fraction: 0.9,
      bagging_fraction: 0.8,
      bagging_freq: 5,
      lambda_l1: 0.1,
      lambda_l2: 0.2,
      scale_pos_weight: 3.0,
      subsample_for_bin: 200000,
      subsample: 1.0,
      min_split_gain: 0.0,
      seed: 42,
      verbose: -1,
      deterministic: false,
      early_stopping_rounds: 50,
      num_boost_round: 1000,
      verbose_eval: false,
    };
  }

  // XGBoost (TOI)
  return {
    ...common,
    model_type: "TOI",
    algorithm: "xgboost",
    booster: "gbtree",
    objective: "binary:logistic",
    max_depth: 4,
    learning_rate: 0.1,
    min_child_weight: 2,
    gamma: 0,
    subsample: 0.8,
    colsample_bytree: 0.8,
    colsample_bylevel: 1.0,
    colsample_bynode: 1.0,
    reg_lambda: 1.0,
    reg_alpha: 0.01,
    n_estimators: 200,
    scale_pos_weight: 1.0,
    tree_method: "auto",
    importance_type: "gain",
    max_delta_step: 0,
    grow_policy: "depthwise",
    early_stopping_rounds: 50,
  };
}

/**
 * Fixed glassy popover. Renders directly under `anchorRef` (your "Change Hyper Parameters" button).
 *
 * Props:
 *   anchorRef: React ref to the trigger button
 *   open: boolean – controls visibility
 *   onClose: () => void
 *   onTrainModel: (config) => void
 */
export default function HyperParamsGlassy({ anchorRef, open, onClose, onTrainModel }) {
  const panelRef = useRef(null);
  const [coords, setCoords] = useState({ top: 80, left: 24 });
  const [sections, setSections] = useState({ presets: true, custom: false });

  const [preset, setPreset] = useState("recall"); // default
  const [ui, setUi] = useState({
    modelFamily: "toi",    // 'toi' (XGBoost) or 'koi' (LightGBM dummy)
    threshold: PRESET_CONFIG.recall.threshold,
    beta: PRESET_CONFIG.recall.beta,
    findOptimal: true,
    oversample: true,
    makeViz: true,
    testSize: 0.3,
    valSize: 0.5,
    randomState: 42,
  });

  // When preset changes, refresh sliders to the preset defaults
  useEffect(() => {
    const base = PRESET_CONFIG[preset];
    setUi(s => ({ ...s, threshold: base.threshold, beta: base.beta }));
  }, [preset]);

  const config = useMemo(() => buildConfig(preset, ui), [preset, ui]);

  // Position right under the anchor button; keep inside viewport.
  const reposition = () => {
    const btn = anchorRef?.current;
    const node = panelRef.current;
    if (!btn || !node) return;
    const r = btn.getBoundingClientRect();
    const width = node.offsetWidth || 420;
    const margin = 8;
    const left = Math.min(
      Math.max(8, r.left),
      window.innerWidth - width - 8
    );
    const top = Math.min(
      r.bottom + margin,
      window.innerHeight - node.offsetHeight - 8
    );
    setCoords({ top, left });
  };

  useLayoutEffect(() => { if (open) reposition(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const h = () => reposition();
    window.addEventListener("resize", h);
    window.addEventListener("scroll", h, true);
    return () => {
      window.removeEventListener("resize", h);
      window.removeEventListener("scroll", h, true);
    };
  }, [open]);

  // Close on outside click / ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    const onDoc = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const Row = ({ label, children, right }) => (
    <div className="hp-row">
      <span className="hp-label">{label}</span>
      <div className="hp-controls">{children}</div>
      {right}
    </div>
  );

  return (
    <div
      ref={panelRef}
      className="hp-popover glass"
      style={{ top: coords.top, left: coords.left }}
      role="dialog"
      aria-label="Hyper-parameter panel"
    >
      {/* header close */}
      <div className="hp-head" onClick={() => setSections(s => ({ ...s, presets: !s.presets }))}>
        <div className="hp-title">Presets</div>
        <button className="hp-icon" >▾</button>
      </div>

      {sections.presets && (
        <div className="hp-section">
          <div className="segmented">
            {["precision", "recall", "balanced"].map(key => (
              <button
                key={key}
                className={`seg ${preset === key ? "active" : ""}`}
                onClick={() => setPreset(key)}
              >
                {key[0].toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <div className="hp-hint">
            {preset === "precision" && "Fewer false positives (stricter)."}
            {preset === "recall" && "Catch more candidates (looser)."}
            {preset === "balanced" && "Trade-off at an F1-ish sweet spot."}
          </div>
        </div>
      )}

      <div className="hp-head" onClick={() => setSections(s => ({ ...s, custom: !s.custom }))}>
        <div className="hp-title">Train Custom Model</div>
        <button className="hp-icon" >▾</button>
      </div>

      {sections.custom && (
        <div className="hp-section">
          <Row label="Family / Algorithm">
            <div className="segmented">
              <button
                className={`seg ${ui.modelFamily === "toi" ? "active" : ""}`}
                onClick={() => setUi(s => ({ ...s, modelFamily: "toi" }))}
              >TOI · XGBoost</button>
              <button
                className={`seg ${ui.modelFamily === "koi" ? "active" : ""}`}
                onClick={() => setUi(s => ({ ...s, modelFamily: "koi" }))}
              >KOI · LightGBM</button>
            </div>
          </Row>

          <Row label="Threshold">
            <>
              <input
                type="range" min={0} max={1} step={0.01}
                value={ui.threshold}
                onChange={(e) => setUi(s => ({ ...s, threshold: parseFloat(e.target.value) }))}
              />
              <span className="hp-num">{ui.threshold.toFixed(2)}</span>
            </>
          </Row>

          <Row label="Beta (0–2)">
            <>
              <input
                type="range" min={0} max={2} step={0.1}
                value={ui.beta}
                onChange={(e) => setUi(s => ({ ...s, beta: parseFloat(e.target.value) }))}
              />
              <span className="hp-num">{ui.beta.toFixed(1)}</span>
            </>
          </Row>

          <Row label="Find optimal threshold">
            <label className="switch">
              <input
                type="checkbox"
                checked={ui.findOptimal}
                onChange={e => setUi(s => ({ ...s, findOptimal: e.target.checked }))}
              />
              <span className="slider" />
            </label>
          </Row>

          <Row label="Oversample positives">
            <label className="switch">
              <input
                type="checkbox"
                checked={ui.oversample}
                onChange={e => setUi(s => ({ ...s, oversample: e.target.checked }))}
              />
              <span className="slider" />
            </label>
          </Row>

          <Row label="Create visualizations">
            <label className="switch">
              <input
                type="checkbox"
                checked={ui.makeViz}
                onChange={e => setUi(s => ({ ...s, makeViz: e.target.checked }))}
              />
              <span className="slider" />
            </label>
          </Row>

          <Row label="Test size">
            <>
              <input
                type="range" min={0.1} max={0.5} step={0.05}
                value={ui.testSize}
                onChange={e => setUi(s => ({ ...s, testSize: parseFloat(e.target.value) }))}
              />
              <span className="hp-num">{ui.testSize.toFixed(2)}</span>
            </>
          </Row>

          <Row label="Validation size">
            <>
              <input
                type="range" min={0.2} max={0.8} step={0.05}
                value={ui.valSize}
                onChange={e => setUi(s => ({ ...s, valSize: parseFloat(e.target.value) }))}
              />
              <span className="hp-num">{ui.valSize.toFixed(2)}</span>
            </>
          </Row>

          <Row label="Random state">
            <input
              type="number"
              className="hp-input"
              value={ui.randomState}
              onChange={e => setUi(s => ({ ...s, randomState: parseInt(e.target.value || "0", 10) }))}
            />
          </Row>

          <button className="hp-train" onClick={() => onTrainModel?.(config)}>
            Train Model
          </button>
        </div>
      )}
    </div>
  );
}
