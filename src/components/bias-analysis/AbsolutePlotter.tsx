
import React, { useState, useMemo, useEffect } from 'react';
import { PlotVisualization } from '../PlotVisualization';
import { METRIC_TRANSLATIONS } from '../../constants';

interface AbsolutePlotterProps {
  groupMetrics: any[];
  protectedAttributes: string[];
  BASE_API_URL: string;
  classLabel?: string | null; // clase vista en multiclase (va al título del gráfico)
  /** Métrica a mostrar (p. ej. la principal); se sincroniza si cambia. */
  metricKey?: string;
  title?: string;
}

export const AbsolutePlotter: React.FC<AbsolutePlotterProps> = ({ groupMetrics, protectedAttributes, BASE_API_URL, classLabel, metricKey, title }) => {
  const [metric, setMetric] = useState(metricKey || 'fpr');
  useEffect(() => { if (metricKey) setMetric(metricKey); }, [metricKey]);
  const [attribute, setAttribute] = useState('all');
  const [plotData, setPlotData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableMetrics = useMemo(() => {
    if (!groupMetrics || groupMetrics.length === 0) return [];
    return Object.keys(groupMetrics[0]).filter(key => 
      key !== 'attribute_name' && key !== 'attribute_value' && !key.includes('_')
    );
  }, [groupMetrics]);

  const handleUpdate = async () => {
    if (!groupMetrics || groupMetrics.length === 0) return;
    setLoading(true);
    try {
      const payload = { group_metrics_for_plotting: groupMetrics, metric, attribute, class_label: classLabel };
      const response = await fetch(`${BASE_API_URL}/api/absolute_plot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Error al generar el gráfico');
      const data = await response.json();
      setPlotData(data.plot);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // El gráfico se actualiza al cambiar la métrica o la variable (sin botón).
  useEffect(() => {
    handleUpdate();
  }, [groupMetrics, metric, attribute]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <h3 className="text-lg font-semibold">{title || 'Gráfico de valores absolutos'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <select value={metric} onChange={e => setMetric(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          {availableMetrics.map(m => <option key={m} value={m}>{METRIC_TRANSLATIONS[m] || m.toUpperCase()}</option>)}
        </select>
        <select value={attribute} onChange={e => setAttribute(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          <option value="all">Todas las variables</option>
          {protectedAttributes.map(attr => <option key={attr} value={attr}>{attr}</option>)}
        </select>
        <span className="text-sm text-ink-60" aria-live="polite">{loading ? 'Actualizando el gráfico…' : ''}</span>
      </div>
      <PlotVisualization title={`Valores Absolutos para ${metric.toUpperCase()}`} plotData={plotData} />
    </div>
  );
};
