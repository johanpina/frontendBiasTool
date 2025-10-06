
import React, { useState, useMemo } from 'react';
import { CustomMultiSelect } from './CustomMultiSelect';

interface PlotControlsProps {
  results: any;
  onUpdate: (selectedMetrics: string[], selectedAttributes: string[]) => void;
  loading: boolean;
}

export const PlotControls: React.FC<PlotControlsProps> = ({ results, onUpdate, loading }) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedAttribute, setSelectedAttribute] = useState<string>('all'); // Estado para el atributo único

  const availableMetrics = useMemo(() => {
    if (!results?.tables?.bias_metrics) return [];
    return Object.keys(results.tables.bias_metrics[0] || {}).filter(key => key.includes('_disparity'));
  }, [results]);

  const availableAttributes = useMemo(() => {
    return results?.metadata?.protected_attributes || [];
  }, [results]);

  const handleUpdateClick = () => {
    const metricsToSend = selectedMetrics.length > 0 ? selectedMetrics : availableMetrics;
    // Ahora enviamos un solo atributo o 'all'
    onUpdate(metricsToSend, [selectedAttribute]);
  };

  return (
    <div className="p-4 border-t border-gray-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <CustomMultiSelect 
          title="Métricas"
          options={availableMetrics.map(m => m.replace('_disparity', '').toUpperCase())}
          selected={selectedMetrics.map(m => m.replace('_disparity', '').toUpperCase())}
          onChange={(newSelected) => {
            setSelectedMetrics(newSelected.map(m => `${m.toLowerCase()}_disparity`));
          }}
        />
        
        {/* Selector de Atributo Único */}
        <div>
          <select
            id="attribute-selector"
            value={selectedAttribute}
            onChange={(e) => setSelectedAttribute(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">Todas las variables</option>
            {availableAttributes.map(attr => (
              <option key={attr} value={attr}>{attr}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleUpdateClick}
          disabled={loading}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {loading ? 'Actualizando...' : 'Actualizar Gráfico'}
        </button>
      </div>
    </div>
  );
};
