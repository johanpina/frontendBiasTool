// Formato de números en español de Chile: miles con punto, decimales con coma.
const nf = (digits: number) =>
  new Intl.NumberFormat('es-CL', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Entero con separador de miles: 7000 → "7.000". */
export const fmtInt = (v: number | string | null | undefined): string =>
  v == null || v === '' || Number.isNaN(Number(v)) ? '—' : nf(0).format(Number(v));

/** Tasa (0–1) como porcentaje con 1 decimal: 0.421 → "42,1%". */
export const fmtPct = (v: number | null | undefined): string =>
  v == null || Number.isNaN(Number(v)) ? '—' : `${nf(1).format(Number(v) * 100)}%`;

/** Cociente "veces": ≥10 sin decimales (16), si no con 1 decimal (2,3). */
export const fmtTimes = (v: number): string => (v >= 10 ? nf(0).format(v) : nf(1).format(v));
