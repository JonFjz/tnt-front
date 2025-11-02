// /src/components/Results/StarInfo.jsx
export default function StarInfo({ data = {} }) {
  const val = (x, suffix = '') =>
    x === undefined || x === null || x === '—' ? '—' : `${x}${suffix}`;

  const catalogLine = [
    data.catalogs?.ALLWISE,
    data.catalogs?.TWOMASS,
    data.catalogs?.UCAC,
    data.catalogs?.APASS,
  ].filter(Boolean).join(' • ') || '—';

  const rows = [
    ['Source', data.source],
    ['TIC', data.tic],
    ['GAIA', data.gaiaId],
    ['RA', val(data.ra, '°')],
    ['Dec', val(data.dec, '°')],
    ['TESS mag (Tmag)', data.tmag],
    ['V mag', data.vmag],
    ['Teff', val(data.teff, ' K')],
    ['Distance', val(data.dist_pc, ' pc')],
    ['Radius', val(data.radius_sun, ' R☉')],
    ['Mass', val(data.mass_sun, ' M☉')],
    ['log g', data.logg],
    ['Luminosity', val(data.lum_sun, ' L☉')],
    ['Luminosity Class', data.lumclass],
    ['Parallax', val(data.parallax_mas, ' mas')],
    ['pmRA', val(data.pmRA, ' mas/yr')],
    ['pmDEC', val(data.pmDEC, ' mas/yr')],
    ['Catalog IDs', catalogLine],
    // timing goes LAST like you asked
    ['Timing', val(data.timing_ms, ' ms')],
  ];

  return (
    <section className="results-section">
      <h4 className="section-title">Star Information</h4>
      <dl className="info-list">
        {rows.map(([label, value]) => (
          <div className={`info-row ${label === 'Timing' ? 'info-row--last' : ''}`} key={label}>
            <dt className="info-row-label">{label}</dt>
            <dd className="info-row-value">{value ?? '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
