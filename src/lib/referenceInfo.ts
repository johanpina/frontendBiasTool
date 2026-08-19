// Utilidades para mostrar QUÉ grupo queda como referencia en el análisis de
// equidad. El grupo de referencia viene en la tabla bias_metrics, en las
// columnas `<metrica>_ref_group_value` (una por métrica). Con métodos
// "mayoritario"/"personalizado" la referencia es la misma para todas las
// métricas; con "mejor desempeño" puede variar por métrica.

const VERDICT_METRICS = ['fpr', 'fnr', 'for', 'fdr'];

export interface AttrReference {
  attribute: string;
  /** Grupo de referencia si es el mismo para las 4 métricas de veredicto; null si varía. */
  group: string | null;
  /** Grupo de referencia por métrica (fpr/fnr/for/fdr). */
  perMetric: Record<string, string>;
}

/** Deriva, por atributo, el grupo de referencia a partir de bias_metrics. */
export function referenceByAttribute(bias: any[], attrs?: string[]): AttrReference[] {
  if (!Array.isArray(bias) || bias.length === 0) return [];
  const names = attrs && attrs.length ? attrs : [...new Set(bias.map((r) => r.attribute_name))];
  return names.map((a) => {
    const rows = bias.filter((r) => r.attribute_name === a);
    const perMetric: Record<string, string> = {};
    if (rows.length) {
      VERDICT_METRICS.forEach((m) => {
        const v = rows[0][`${m}_ref_group_value`];
        if (v != null && v !== '') perMetric[m] = String(v);
      });
    }
    const uniq = [...new Set(Object.values(perMetric))];
    return { attribute: a, group: uniq.length === 1 ? uniq[0] : null, perMetric };
  });
}

/** Etiqueta legible del método de referencia usado. */
export function refMethodLabel(method?: string, perfMetric?: string): string {
  switch (method) {
    case 'majority':
      return 'grupo mayoritario (el subgrupo más grande)';
    case 'minority':
      return 'grupo minoritario (el subgrupo más pequeño)';
    case 'best_performance':
      return `grupo con mejor desempeño (menor ${(perfMetric || 'fpr').toUpperCase()})`;
    case 'custom':
      return 'grupo definido manualmente';
    default:
      return 'grupo mayoritario (el subgrupo más grande)';
  }
}

// Nombre legible de la métrica recomendada por el árbol (Paso 2).
const METRIC_NAMES: Record<string, string> = {
  ppr: 'Paridad de Selección (PPR)',
  pprev: 'Paridad Demográfica (Prevalencia Predicha)',
  fpr: 'Tasa de Falsos Positivos (FPR)',
  fdr: 'Tasa de Falsos Descubrimientos (FDR)',
  fnr: 'Tasa de Falsos Negativos (FNR)',
  for: 'Tasa de Falsas Omisiones (FOR)',
  tpr: 'Sensibilidad / Recall (TPR)',
};

/** Convierte la clave del árbol (p.ej. "fpr_disparity") en nombre legible. */
export function recommendedMetricName(metricDisparityKey?: string | null): string | null {
  if (!metricDisparityKey) return null;
  const base = metricDisparityKey.replace('_disparity', '');
  return METRIC_NAMES[base] || base.toUpperCase();
}
