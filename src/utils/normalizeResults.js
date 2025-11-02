// /src/utils/normalizeResults.js
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const toPercent = (p) => {
  if (p == null || Number.isNaN(p)) return null;
  if (p <= 0) return 0;
  if (p > 0 && p <= 1) return Math.round(p * 100);
  if (p > 1 && p < 6) return Math.round((1 / (1 + Math.exp(-p))) * 100);
  return clamp(Math.round(p), 0, 100);
};

export default function normalizeResults(api) {
  const manual = api?.manual_search ?? {};
  const raw = manual.raw ?? {};
  const stellar = manual.stellar ?? {};
  const timingMs = manual.timing_ms ?? null;

  // Left panel “Star Information”
  const star = {
    source: manual.source || '—',
    tic: raw.ID ?? '—',
    gaiaId: raw.GAIA ?? '—',
    ra: raw.ra ?? raw.RA_orig ?? '—',
    dec: raw.dec ?? raw.Dec_orig ?? '—',
    tmag: stellar.st_tmag ?? raw.Tmag ?? '—',
    vmag: raw.Vmag ?? '—',
    teff: stellar.st_teff ?? raw.Teff ?? '—',
    dist_pc: stellar.st_dist ?? raw.d ?? '—',
    radius_sun: stellar.st_rad ?? raw.rad ?? '—',
    mass_sun: stellar.st_mass ?? raw.mass ?? '—',
    logg: stellar.st_logg ?? raw.logg ?? '—',
    lum_sun: raw.lum ?? '—',
    lumclass: raw.lumclass ?? '—',
    parallax_mas: raw.plx ?? '—',
    pmRA: raw.pmRA ?? '—',
    pmDEC: raw.pmDEC ?? '—',
    bp: raw.gaiabp ?? '—',
    rp: raw.gaiarp ?? '—',
    catalogs: { ALLWISE: raw.ALLWISE, TWOMASS: raw.TWOMASS, UCAC: raw.UCAC, APASS: raw.APASS },
    timing_ms: timingMs,
  };

  // Visualizations (0–3)
  const visualizations = [];
    (api?.processed_json || []).forEach(p => {
    (p.visualizations || []).forEach(v => {
        if (v?.data?.startsWith?.('data:image/')) {
        visualizations.push({ type: v.type, filename: v.filename, dataUrl: v.data });
        }
    });
    });

  // AI model panel
  const mr = api?.model_result ?? {};
  const r0 = mr.results?.[0] ?? {};
  const cls = (r0.class || '').toLowerCase();
  const label = cls.includes('false') ? 'False Positive'
               : cls.includes('candidate') || cls.includes('confirmed') ? 'Planet Candidate'
               : 'Result';

  const model = {
    raw: mr,                             // keep everything for the full table
    label,
    probabilityPct: toPercent(r0.probability),
  };

  return { star, visualizations, model };
}
