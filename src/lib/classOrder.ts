// Orden fijo de las clases (U6): el mismo en todos los gráficos y en el PDF.
// - Ordinales conocidas (Bajo < Medio < Alto, Low < High…) y números: de menor a mayor.
// - Resto: la clase positiva primero y luego alfabético.

const ORDINAL_RANK: Record<string, number> = {
  'muy bajo': 0, 'muy baja': 0, 'very low': 0,
  'bajo': 1, 'baja': 1, 'low': 1,
  'medio': 2, 'media': 2, 'moderado': 2, 'moderada': 2, 'medium': 2,
  'alto': 3, 'alta': 3, 'high': 3,
  'muy alto': 4, 'muy alta': 4, 'very high': 4,
};

const norm = (v: string) => v.trim().toLowerCase();

export function orderClasses(values: string[], positive?: string | null): string[] {
  const uniq = [...new Set(values.map(String))];
  if (uniq.length && uniq.every((v) => norm(v) in ORDINAL_RANK)) {
    return uniq.sort((a, b) => ORDINAL_RANK[norm(a)] - ORDINAL_RANK[norm(b)]);
  }
  if (uniq.length && uniq.every((v) => v.trim() !== '' && !Number.isNaN(Number(v)))) {
    return uniq.sort((a, b) => Number(a) - Number(b));
  }
  const rest = uniq.filter((v) => v !== positive).sort((a, b) => a.localeCompare(b, 'es'));
  return positive != null && uniq.includes(positive) ? [positive, ...rest] : rest;
}
