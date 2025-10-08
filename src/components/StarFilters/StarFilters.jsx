// /src/components/StarFilters/StarFilters.jsx
import { useState } from 'react';
import RangeNumberInput from '../inputs/RangeNumberInput.jsx';
import { searchStars } from '../../api/api.js';
import { validateRA, validateDec, validateRadius } from '../../utils/validation.js';

export default function StarFilters({
  onResults, // (stars[]) => void
}) {
  const [form, setForm] = useState({
    ra: 0, dec: 0, radius: 15,
    magMin: 6, magMax: 15,
    tempMin: 3000, tempMax: 7500,
    distMin: 10, distMax: 500,
    obs: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleFilter = async () => {
    setLoading(true);
    setError(null);

    const raErr = validateRA(form.ra);
    const decErr = validateDec(form.dec);
    const radErr = validateRadius(form.radius);
    if (raErr || decErr || radErr) {
      setError(raErr || decErr || radErr);
      setLoading(false);
      return;
    }

    const res = await searchStars({
      ra: form.ra,
      dec: form.dec,
      radius: form.radius,
      mag_min: form.magMin,
      mag_max: form.magMax,
      temp_min: form.tempMin,
      temp_max: form.tempMax,
      dist_min: form.distMin,
      dist_max: form.distMax,
      obs: form.obs || undefined,
    });

    if (!res.ok) {
      setError(res.error || 'Failed to fetch stars');
      onResults?.([]);
    } else {
      onResults?.(res.data);
      if (res.data.length === 0) {
        setError('No stars found matching the criteria. Try adjusting your filters.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="tab-content">
      <div className="star-filters-section">
        <div className="filter-content">
          {/* Sky position */}
          <div className="filter-group">
            <label className="filter-label">
              Sky position:
              <span className="info-icon" data-tooltip="RA 0-360°, Dec -90° to +90°, Radius in arcmin.">ⓘ</span>
            </label>
            <div className="sky-position-inputs">
              <div className="input-group">
                <label className="input-label">RA</label>
                <input
                  type="number"
                  className="filter-input"
                  placeholder="0-360"
                  min="0"
                  max="360"
                  defaultValue={form.ra}
                  onChange={(e) => update('ra', Number(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Dec</label>
                <input
                  type="number"
                  className="filter-input"
                  placeholder="-90 to 90"
                  min="-90"
                  max="90"
                  defaultValue={form.dec}
                  onChange={(e) => update('dec', Number(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Radius</label>
                <input
                  type="number"
                  className="filter-input"
                  placeholder="arcmin"
                  min="0.01"
                  max="30"
                  defaultValue={form.radius}
                  onChange={(e) => update('radius', Number(e.target.value))}
                />
                <span className="unit-label">arcmin</span>
              </div>
            </div>
          </div>

          {/* Magnitude */}
          <div className="filter-group">
            <label className="filter-label">
              Magnitude range:
              <span className="info-icon" data-tooltip="Lower = brighter">ⓘ</span>
            </label>
            <RangeNumberInput
              min={0} max={20}
              leftDefault={form.magMin} rightDefault={form.magMax}
              onLeftChange={(v) => update('magMin', v)}
              onRightChange={(v) => update('magMax', v)}
            />
          </div>

          {/* Temperature */}
          <div className="filter-group">
            <label className="filter-label">
              Temperature (K):
              <span className="info-icon" data-tooltip="Cool red dwarfs ~2500-4000K, Sun-like ~5000-6000K">ⓘ</span>
            </label>
            <RangeNumberInput
              min={2500} max={40000}
              leftDefault={form.tempMin} rightDefault={form.tempMax}
              onLeftChange={(v) => update('tempMin', v)}
              onRightChange={(v) => update('tempMax', v)}
            />
          </div>

          {/* Distance */}
          <div className="filter-group">
            <label className="filter-label">
              Distance (pc):
              <span className="info-icon" data-tooltip="1 pc ≈ 3.26 ly">ⓘ</span>
            </label>
            <RangeNumberInput
              min={1} max={10000}
              leftDefault={form.distMin} rightDefault={form.distMax}
              onLeftChange={(v) => update('distMin', v)}
              onRightChange={(v) => update('distMax', v)}
            />
          </div>

          {/* Observation */}
          <div className="filter-group">
            <label className="filter-label">
              Observation:
              <span className="info-icon" data-tooltip="Filter by mission">ⓘ</span>
            </label>
            <select className="filter-dropdown" value={form.obs} onChange={(e) => update('obs', e.target.value)}>
              <option value="">Select satellite</option>
              <option value="tess">TESS</option>
              <option value="k2">K2</option>
            </select>
          </div>

          {/* Filter button + errors */}
          <div className="filter-group">
            <button className="filter-btn" onClick={handleFilter} disabled={loading}>
              {loading ? 'Filtering...' : 'Filter'}
            </button>
            {error && (
              <div style={{ color: '#ff6b6b', marginTop: '8px', fontSize: '13px' }}>
                {error}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
