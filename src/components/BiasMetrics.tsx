import React from 'react';
import { BarChart2, RefreshCw } from 'lucide-react';
import { MetricDefinition } from '../types';

interface BiasMetricsProps {
  metrics: MetricDefinition[];
  selectedMetric: string;
  selectedAttribute: string;
  protectedAttributes: string[];
  onMetricChange: (metric: string) => void;
  onAttributeChange: (attribute: string) => void;
  plotData: string | null;
  loading: boolean;
  onUpdatePlot: (metric: string, attribute: string) => void;
}

export const BiasMetrics: React.FC<BiasMetricsProps> = ({
  metrics,
  selectedMetric,
  selectedAttribute,
  protectedAttributes,
  onMetricChange,
  onAttributeChange,
  plotData,
  loading,
  onUpdatePlot,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <BarChart2 size={24} />
        Métricas de Sesgo
      </h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Métrica
            </label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={selectedMetric}
              onChange={(e) => onMetricChange(e.target.value)}
            >
              {metrics.map((metric) => (
                <option key={metric.name} value={metric.name}>
                  {metric.name.toUpperCase()} - {metric.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variable Protegida
            </label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={selectedAttribute}
              onChange={(e) => onAttributeChange(e.target.value)}
            >
              <option value="todas">Todas las variables</option>
              {protectedAttributes.filter(attr => attr !== 'todas').map((attr) => (
                <option key={attr} value={attr}>
                  {attr}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onUpdatePlot(selectedMetric, selectedAttribute)}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Actualizando...' : 'Actualizar Gráfico'}
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : plotData ? (
            <div className="relative w-full" style={{ minHeight: "400px" }}>
              <img
                src={`data:image/png;base64,${plotData}`}
                alt={`Gráfico de ${selectedMetric}`}
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  console.error('Error al cargar la imagen');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay datos disponibles para mostrar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};