
import React, { useState, useMemo, useEffect } from 'react';
import { PlotVisualization } from './PlotVisualization';

interface GroupMetricPlotProps {
  groupMetrics: any[];
  protectedAttributes: string[];
  BASE_API_URL: string;
}

export const GroupMetricPlot: React.FC<GroupMetricPlotProps> = ({ groupMetrics, protectedAttributes, BASE_API_URL }) => {
  const [selectedMetric, setSelectedMetric] = useState('fpr'); // Default a FPR
  const [selectedAttribute, setSelectedAttribute] = useState('all');
  const [plotData, setPlotData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableMetrics = useMemo(() => {
    if (!groupMetrics || groupMetrics.length === 0) return [];
    // Excluir columnas que no son métricas numéricas
    return Object.keys(groupMetrics[0]).filter(key => 
      key !== 'attribute_name' && key !== 'attribute_value' && key !== 'group_size' && !key.includes('Parity') && !key.includes('conclusion')
    );
  }, [groupMetrics]);

  const handleUpdate = async () => {
    if (!groupMetrics || groupMetrics.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        group_metrics: groupMetrics,
        metric: selectedMetric,
        attribute: selectedAttribute,
      };
      const response = await fetch(`${BASE_API_URL}/api/group_metric_plot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Error al generar el gráfico de métrica de grupo');
      }
      const data = await response.json();
      setPlotData(data.plot);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Hook para cargar el gráfico inicial
  useEffect(() => {
    handleUpdate();
  }, [groupMetrics]); // Se ejecuta cuando groupMetrics está disponible por primera vez

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <h2 className="text-xl font-semibold">Visualizador de Métricas de Grupo</h2>
      <p className="text-gray-600">
        Selecciona una métrica de desempeño y una variable protegida para analizar posibles disparidades en el funcionamiento del modelo entre distintos grupos.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Selector de Métrica */}
        <div>
          <label htmlFor="metric-select" className="block text-sm font-medium text-gray-700">Métrica</label>
          <select
            id="metric-select"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {availableMetrics.map(metric => (
              <option key={metric} value={metric}>{metric.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Selector de Atributo */}
        <div>
          <label htmlFor="attribute-select-group" className="block text-sm font-medium text-gray-700">Variable Protegida</label>
          <select
            id="attribute-select-group"
            value={selectedAttribute}
            onChange={(e) => setSelectedAttribute(e.target.value)}
            className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">Todas las variables</option>
            {protectedAttributes.map(attr => (
              <option key={attr} value={attr}>{attr}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 self-end"
        >
          {loading ? 'Actualizando...' : 'Actualizar Gráfico'}
        </button>
      </div>

      <PlotVisualization 
        title={`Métrica: ${selectedMetric.toUpperCase()}`}
        plotData={plotData}
      />
    </div>
  );
};
