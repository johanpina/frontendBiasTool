import { EdaResult, EdaCrosstab } from '../../types';

/** Devuelve la tabla de contingencia X×Y en cualquier orden (transpone si hace falta). */
export function getCrosstab(eda: EdaResult, x: string, y: string): EdaCrosstab | null {
  const direct = eda.crosstabs?.[`${x}|||${y}`];
  if (direct) return direct;
  const rev = eda.crosstabs?.[`${y}|||${x}`];
  if (rev) {
    return {
      x_values: rev.y_values,
      y_values: rev.x_values,
      counts: rev.y_values.map((_, i) => rev.x_values.map((__, j) => rev.counts[j][i])),
    };
  }
  return null;
}

export function rowTotals(ct: EdaCrosstab): number[] {
  return ct.counts.map((r) => r.reduce((a, b) => a + b, 0));
}
