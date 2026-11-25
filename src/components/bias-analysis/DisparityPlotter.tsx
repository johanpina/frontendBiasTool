
import React, { useState, useMemo, useEffect } from 'react';
import { PlotVisualization } from '../PlotVisualization';
import { METRIC_TRANSLATIONS } from '../../constants';

const DISPARITY_TITLES: Record<string, string> = {
  fpr_disparity: 'Disparidad en la tasa de falsos positivos (FPR)',
  fnr_disparity: 'Disparidad en la tasa de falsos negativos (FNR)',
  for_disparity: 'Disparidad en la tasa de falsas omisiones (FOR)',
  fdr_disparity: 'Disparidad en la tasa de falsos descubrimientos (FDR)',
};

interface DisparityPlotterProps {
  biasMetrics: any[];
  protectedAttributes: string[];
  fairnessThreshold: number;
  BASE_API_URL: string;
  classLabel?: string | null; // clase vista en multiclase (va al título del gráfico)
}

export const DisparityPlotter: React.FC<DisparityPlotterProps> = ({ biasMetrics, protectedAttributes, fairnessThreshold, BASE_API_URL, classLabel }) => {
  const [metric, setMetric] = useState('fpr_disparity');
  const [attribute, setAttribute] = useState('all');
  const [plotData, setPlotData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableMetrics = useMemo(() => {
    if (!biasMetrics || biasMetrics.length === 0) return [];
    return Object.keys(biasMetrics[0]).filter(key => key.includes('_disparity'));
  }, [biasMetrics]);

  const handleUpdate = async () => {
    if (!biasMetrics || biasMetrics.length === 0) return;
    setLoading(true);
    try {
      const payload = { 
        bias_metrics: biasMetrics, 
        metrics: [metric], // El backend ahora espera una lista
        attributes: [attribute],
        class_label: classLabel,
      };
      const response = await fetch(`${BASE_API_URL}/api/rerender_plot`, { // Endpoint corregido
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Error al generar el gráfico de disparidad');
      const data = await response.json();
      setPlotData(data.plot);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // useEffect para cargar el gráfico inicial
  // El gráfico se actualiza al cambiar la métrica o la variable (sin botón).
  useEffect(() => {
    handleUpdate();
  }, [biasMetrics, metric, attribute]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <h3 className="text-lg font-semibold">Gráfico de disparidad</h3>
      <p className="text-sm text-gray-700">
        Elige una tasa y una variable protegida: el gráfico muestra cuántas veces la tasa de cada grupo es la del
        grupo de referencia (1,00 = sin diferencia).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <select value={metric} onChange={e => setMetric(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          {availableMetrics.map(m => <option key={m} value={m}>{METRIC_TRANSLATIONS[m] || m.replace('_disparity','').toUpperCase()}</option>)}
        </select>
        <select value={attribute} onChange={e => setAttribute(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          <option value="all">Todas las variables</option>
          {protectedAttributes.map(attr => <option key={attr} value={attr}>{attr}</option>)}
        </select>
        <span className="text-sm text-ink-60" aria-live="polite">{loading ? 'Actualizando el gráfico…' : ''}</span>
      </div>
      <PlotVisualization title={DISPARITY_TITLES[metric] || METRIC_TRANSLATIONS[metric] || metric.replace('_disparity','').toUpperCase()} plotData={plotData} />
    </div>
  );
};
