// /src/services/api.js
const DEFAULT_BASE_URL = '/api';

const state = {
  baseUrl: DEFAULT_BASE_URL.replace(/\/$/, ''),
  defaultHeaders: { accept: 'application/json' },
};

export function setApiBaseUrl(url) {
  state.baseUrl = (url || DEFAULT_BASE_URL).replace(/\/$/, '');
}

export function setDefaultHeaders(headers = {}) {
  state.defaultHeaders = { ...state.defaultHeaders, ...headers };
}

async function request(path, { method = 'GET', headers, body, signal } = {}) {
  const url = `${state.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  try {
    const res = await fetch(url, {
      method,
      headers: { ...state.defaultHeaders, ...(headers || {}) },
      body,
      signal,
    });
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      return { ok: false, status: res.status, error: data?.message || String(data) };
    }
    return { ok: true, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, error: err?.message || 'Network error' };
  }
}

/** Shape backend /search responses into UI-ready star list */
function mapStarsToUI(list = []) {
  return list.map((star) => ({
    id: star.ID || star.objID || star.tid || star.GAIA || 'Unknown',
    name: star.ID || star.objID || `Star ${star.tid || star.GAIA || ''}`.trim(),
    type: star.typeSrc || star.lumclass || 'Unknown',
    magnitude: star.Tmag ?? star.GAIAmag ?? star.Vmag ?? 'N/A',
    distance: star.d ?? star.st_dist ?? 'N/A',
    ...star, // keep full object for later usage
  }));
}

export async function searchStars(params) {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  const res = await request(`/search?${q.toString()}`);
  if (!res.ok) return res;
  const payload = res.data;
  if (payload?.status === 'success' && Array.isArray(payload.data)) {
    return { ok: true, data: mapStarsToUI(payload.data), raw: payload };
  }
  return { ok: false, error: payload?.message || 'Failed to fetch stars' };
}

/** GET /analyze?id=... (single id) and normalize into resultsData structure for StarSystem/Results */
export async function analyzeById(id) {
  const res = await request(`/analyze?id=${encodeURIComponent(id)}`);
  if (!res.ok) return res;
  const detailed = res.data?.response || res.data?.data || res.data;

  const s = Array.isArray(detailed) ? detailed[0] : detailed;
  if (!s) return { ok: false, error: 'Empty analyze response' };

  const mapped = {
    starId: s?.GAIA || s?.ID || s?.tid || s?.ALLWISE || s?.TWOMASS || s?.UCAC || s?.TYC || 'Unknown',
    ra: (s?.ra ?? s?.RA_orig) != null ? String(s.ra ?? s.RA_orig) + '°' : '—',
    dec: (s?.dec ?? s?.Dec_orig) != null ? String(s?.dec ?? s?.Dec_orig) + '°' : '—',
    magnitude: s?.Tmag ?? s?.GAIAmag ?? s?.Vmag ?? s?.st_tmag ?? '—',
    temperature: s?.Teff ?? s?.st_teff ? String(s?.Teff ?? s?.st_teff) + ' K' : '—',
    distance: s?.d ?? s?.st_dist ? String(s?.d ?? s?.st_dist) + ' pc' : '—',
    exoplanetCount: s?.pl_pnum ?? undefined,
    transits: s?.pl_orbper
      ? [{
          period: `${s.pl_orbper} days`,
          depth: s.pl_trandep ? `${s.pl_trandep}` : undefined,
          duration: s.pl_trandurh ? `${s.pl_trandurh} h` : undefined,
        }]
      : undefined,
    confidence: undefined,
    threshold: undefined,
    snr: undefined,
    processingTime: undefined,
  };

  return { ok: true, data: mapped, raw: detailed };
}

/** Try multiple ids and return first successful analyze */
export async function analyzeFirstSuccessful(ids = []) {
  for (const id of ids.filter(Boolean)) {
    const out = await analyzeById(id);
    if (out.ok) return out;
  }
  return { ok: false, error: 'No identifier succeeded' };
}

/** Optional: upload data file (CSV/JSON/FITS) */
export async function uploadDataFile(file) {
  const form = new FormData();
  form.append('file', file);
  return request('/upload', { method: 'POST', body: form });
}



export default {
  setApiBaseUrl,
  setDefaultHeaders,
  searchStars,
  analyzeById,
  analyzeFirstSuccessful,
  uploadDataFile,


};
