// /src/components/StarSearch/StarSearch.jsx
import { useState } from 'react';

export default function StarSearch({ isOpen, onToggleFits, onConfigChange }) {
  const [fitsOpen, setFitsOpen] = useState(false);
  const [form, setForm] = useState({
    telescope: 'tess',
    starId: '',
    oiLookup: true,
    optimizationType: 'balanced', // 'balanced' | 'precision' | 'recall'
    prefer: '',
    tesscut: '',
    sector: '',
    cutout: '',
    file: null,
  });

  const update = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    onConfigChange?.(next);
  };

  return (
    <div className="tab-content">
      {/* Select Telescope */}
      <div className="filter-group">
        <label className="filter-label">
          Select telescope:
          <span className="info-icon" data-tooltip="Choose which space telescope data to search. TESS monitors stars for planetary transits; K2 is the extended Kepler mission.">ⓘ</span>
        </label>
        <select className="filter-dropdown" value={form.telescope} onChange={(e) => update('telescope', e.target.value)}>
          <option value="">Select telescope</option>
          <option value="tess">TESS</option>
          <option value="kepler">Kepler</option>
        </select>
      </div>

      {/* Star ID */}
      <div className="filter-group">
        <label className="filter-label">
          Select star by ID:
          <span className="info-icon" data-tooltip="Enter TIC/KIC/HD/common name etc.">ⓘ</span>
        </label>
        <input
          type="text"
          className="filter-input"
          placeholder="Enter star ID"
          value={form.starId}
          onChange={(e) => update('starId', e.target.value)}
        />
      </div>

      {/* TOI/KOI Lookup */}
      <div className="filter-group">
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              className="filter-checkbox"
              checked={form.oiLookup}
              onChange={(e) => update('oiLookup', e.target.checked)}
            />
            <span className="checkmark"></span>
            Enable TOI/KOI lookup
            <span className="info-icon" data-tooltip="Search stars with candidate/confirmed planets from mission catalogs.">ⓘ</span>
          </label>
        </div>
      </div>

      {/* FITS Config */}
      <div className="filter-group">
        <div className="fits-dropdown-section">
          <div className="filter-section-header" onClick={() => { setFitsOpen(!fitsOpen); onToggleFits?.(!fitsOpen); }}>
            <span>FITS Configuration</span>
            <span className={`expand-icon ${fitsOpen ? 'expanded' : 'collapsed'}`}>▼</span>
          </div>

          {fitsOpen && (
            <div className="fits-content">
              <div className="fits-input-group">
                <label className="input-label">Prefer:</label>
                <select className="filter-dropdown" value={form.prefer} onChange={(e) => update('prefer', e.target.value)}>
                  <option value="">Select preference</option>
                  <option value="spoc">SPOC</option>
                  <option value="qlp">QLP</option>
                  <option value="any">Any</option>
                </select>
              </div>
              <div className="fits-input-group">
                <label className="input-label">TESScut:</label>
                <select className="filter-dropdown" value={form.tesscut} onChange={(e) => update('tesscut', e.target.value)}>
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
                  value={form.sector}
                  onChange={(e) => update('sector', e.target.value)}
                />
              </div>
              <div className="fits-input-group">
                <label className="input-label">Cutout Size:</label>
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Enter cutout size"
                  value={form.cutout}
                  onChange={(e) => update('cutout', e.target.value)}
                />
              </div>

              {/* File Upload */}
              <div className="fits-upload-section">
                <label className="input-label fits-upload-label">Or upload your own data:</label>
                <div className="file-upload-box">
                  <input
                    type="file"
                    id="fileInput"
                    className="file-input"
                    accept=".csv,.json,.fits"
                    onChange={(e) => update('file', e.target.files?.[0] || null)}
                  />
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
  );
}
