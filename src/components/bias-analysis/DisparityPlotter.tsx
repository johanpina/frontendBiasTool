
import React, { useState, useMemo, useEffect } from 'react';
import { PlotVisualization } from '../PlotVisualization';
import { METRIC_TRANSLATIONS } from '../../constants';

interface DisparityPlotterProps {
  biasMetrics: any[];
  protectedAttributes: string[];
  fairnessThreshold: number;
  BASE_API_URL: string;
}

export const DisparityPlotter: React.FC<DisparityPlotterProps> = ({ biasMetrics, protectedAttributes, fairnessThreshold, BASE_API_URL }) => {
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
        attributes: [attribute] 
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
  useEffect(() => {
    handleUpdate();
  }, [biasMetrics]); // Se ejecuta cuando las métricas están disponibles

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <h3 className="text-lg font-semibold">Gráfico de Disparidad Detallado</h3>
      <div className="mb-6 text-gray-700 text-justify">
        <p className="mb-2">
          En esta sección puedes analizar una métrica de desempeño del modelo desagregada por una variable protegida. Esto te permitirá identificar posibles disparidades en el funcionamiento del modelo entre distintos grupos.
        </p>
        <ul className="list-disc pl-6 mb-2">
          <li>
            <b>Métrica:</b> selecciona una métrica de interés (por ejemplo, tasa de falsos negativos, precisión, sensibilidad, etc.). La métrica que elijas debe estar alineada con el objetivo de tu proyecto y con la forma en que se definen las categorías positivas y negativas en tu modelo.
          </li>
          <li>
            <b>Variable protegida:</b> selecciona la variable sobre la que deseas evaluar el sesgo. También puedes elegir "todas las variables" para visualizar el desglose completo.
          </li>
        </ul>
        <p>
          Puedes repetir este proceso para distintas métricas y variables. La herramienta realiza el análisis una métrica a la vez, pero puedes volver a esta pestaña cuantas veces necesites.
        </p>
        <br />
        <p>Una vez realizada tu selección, haz clic en “Actualizar gráfico” para ver los resultados desagregados.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <select value={metric} onChange={e => setMetric(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          {availableMetrics.map(m => <option key={m} value={m}>{METRIC_TRANSLATIONS[m] || m.replace('_disparity','').toUpperCase()}</option>)}
        </select>
        <select value={attribute} onChange={e => setAttribute(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          <option value="all">Todas las variables</option>
          {protectedAttributes.map(attr => <option key={attr} value={attr}>{attr}</option>)}
        </select>
        <button onClick={handleUpdate} disabled={loading} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
          {loading ? 'Actualizando...' : 'Actualizar Gráfico'}
        </button>
      </div>
      <PlotVisualization title={`Disparidad para ${METRIC_TRANSLATIONS[metric] || metric.replace('_disparity','').toUpperCase()}`} plotData={plotData} />
    </div>
  );
};
