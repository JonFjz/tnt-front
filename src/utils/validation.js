// /src/utils/validation.js
export const validateRA = (value) => {
  const ra = Number(value);
  if (Number.isNaN(ra) || ra < 0 || ra >= 360) return 'Right Ascension must be between 0° and 360°';
  return null;
};

export const validateDec = (value) => {
  const dec = Number(value);
  if (Number.isNaN(dec) || dec < -90 || dec > 90) return 'Declination must be between -90° and +90°';
  return null;
};

export const validateRadius = (value) => {
  const r = Number(value);
  if (Number.isNaN(r) || r <= 0 || r > 30) return 'Radius must be between 0.01 and 30 arcmin';
  return null;
};
