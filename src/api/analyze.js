import api, { ApiError } from './client';

export async function analyzeStar({
  id,
  mission = 'tess',              // use lowercase consistently
  oi_lookup = false,
  optimization_type = 'recall',
  model_name = 'default_model',
  // file, parameters: only needed if you later switch to POST+FormData
}) {
  if (!id) {
    return { ok: false, status: 0, error: 'Missing required parameter: id' };
  }

  try {
    // GET -> zero preflight, params go into the query string
    const data = await api.get('/analyze', {
      id,
      mission,                     // 'tess' or 'kepler'
      oi_lookup: oi_lookup ? 1 : 0,
      optimization_type,
      model_name,
    });
    return { ok: true, status: 200, data };
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 0;
    return { ok: false, status, error: e.message, data: e.data };
  }
}
