export const metrics = [
  { name: 'accuracy', description: 'Precisión general del modelo' },
  { name: 'tpr', description: 'Tasa de Verdaderos Positivos (Sensibilidad)' },
  { name: 'tnr', description: 'Tasa de Verdaderos Negativos (Especificidad)' },
  { name: 'for', description: 'Tasa de Falsos Negativos' },
  { name: 'fdr', description: 'Tasa de Falsos Descubrimientos' },
  { name: 'fpr', description: 'Tasa de Falsos Positivos' },
  { name: 'fnr', description: 'Tasa de Falsos Negativos' },
  { name: 'npv', description: 'Valor Predictivo Negativo' },
  { name: 'precision', description: 'Precisión (Valor Predictivo Positivo)' },
  { name: 'ppr', description: 'Ratio de Predicción Positiva' },
  { name: 'pprev', description: 'Prevalencia Predicha' },
  { name: 'prev', description: 'Prevalencia Real' }
];

export const metrics_bias = [
  { name: 'pprev_disparity', description: 'Disparidad en Prevalencia Predicha' },
  { name: 'ppr_disparity', description: 'Disparidad en Tasa de Predicción Positiva' },
  { name: 'fdr_disparity', description: 'Disparidad en Tasa de Falsos Descubrimientos' },
  { name: 'for_disparity', description: 'Disparidad en Tasa de Falsa Omisión' },
  { name: 'fpr_disparity', description: 'Disparidad en Tasa de Falsos Positivos' },
  { name: 'fnr_disparity', description: 'Disparidad en Tasa de Falsos Negativos' }
];