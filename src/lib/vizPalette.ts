// Paleta de visualización validada (dataviz skill). Ver docs/DECISIONES.
// Azul secuencial para magnitud (heatmap), slots categóricos para identidad,
// colores de estado para alertas.

export const SEQ_BLUE = [
  '#eef4fd', '#cde2fb', '#9ec5f4', '#6da7ec',
  '#3987e5', '#256abf', '#184f95', '#0d366b',
];

export const CATEGORICAL = [
  '#2a78d6', '#1baf7a', '#eda100', '#008300',
  '#4a3aa7', '#e34948', '#e87ba4', '#eb6834',
];

export const STATUS = {
  critical: '#d03b3b',
  warning: '#fab219',
  info: '#2a78d6',
  good: '#0ca30c',
};

export const INK = {
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
};

/** Color secuencial para un valor en [0,1] (asociación de Cramér's V). */
export function assocColor(v: number): string {
  const clamped = Math.max(0, Math.min(1, v));
  const idx = Math.min(SEQ_BLUE.length - 1, Math.round(clamped * (SEQ_BLUE.length - 1)));
  return SEQ_BLUE[idx];
}

/** Tinta legible sobre una celda de asociación (blanca si el fondo es oscuro). */
export function assocTextColor(v: number): string {
  return v >= 0.55 ? '#ffffff' : INK.primary;
}

/** Color categórico por índice (nunca se cicla más allá de 8: usa gris). */
export function categoricalColor(i: number): string {
  return i < CATEGORICAL.length ? CATEGORICAL[i] : '#9ca3af';
}
