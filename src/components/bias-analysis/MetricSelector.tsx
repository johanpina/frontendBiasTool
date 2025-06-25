import React from 'react';

export const referenceMetrics = [
  { id: 'fpr', label: 'Tasa de Falsos Positivos (FPR)' },
  { id: 'fnr', label: 'Tasa de Falsos Negativos (FNR)' },
  { id: 'pprev', label: 'Prevalencia Predicha' },
  { id: 'precision', label: 'Precisión' },
  { id: 'npv', label: 'Valor Predictivo Negativo' }
];

interface MetricSelectorProps {
  metricRef: string;
  onMetricChange: (metric: string) => void;
}

export const MetricSelector: React.FC<MetricSelectorProps> = ({
  metricRef,
  onMetricChange
}) => {
  return (
    <div className="mt-6 space-y-4">
      <h4 className="text-sm font-medium text-gray-700">
        Seleccionar métrica de referencia
      </h4>
      <select
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        value={metricRef}
        onChange={(e) => onMetricChange(e.target.value)}
      >
        {referenceMetrics.map((metric) => (
          <option key={metric.id} value={metric.id}>
            {metric.label}
          </option>
        ))}
      </select>
    </div>
  );
};