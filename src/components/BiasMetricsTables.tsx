import React, { useState, useEffect } from 'react';
import { Users, Settings, AlertCircle, RefreshCw } from 'lucide-react';
import { MetricDefinition } from '../types';

interface BiasMetricsTablesProps {
  biasMetrics: {
    predefined: any[] | null;
    major_group: any[] | null;
    min_metric: any[] | null;
  };
  metrics: MetricDefinition[];
  protectedColumns: string[];
  uniqueValues: Record<string, string[]>;
  onUpdateMetrics: (metric: string, refGroups: Record<string, string>) => void;
}

export const BiasMetricsTables: React.FC<BiasMetricsTablesProps> = ({
  biasMetrics,
  metrics,
  protectedColumns,
  uniqueValues,
  onUpdateMetrics,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('fpr');
  const [refGroups, setRefGroups] = useState<Record<string, string>>({});
  const [showWarning, setShowWarning] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false);

  useEffect(() => {
    // Initialize reference groups with first value for each column
    const initialRefGroups: Record<string, string> = {};
    protectedColumns.forEach(column => {
      if (uniqueValues[column]?.length > 0) {
        initialRefGroups[column] = uniqueValues[column][0];
      }
    });
    setRefGroups(initialRefGroups);
    
    // Check if we have all reference groups
    setShowWarning(Object.keys(initialRefGroups).length !== protectedColumns.length);
    setPendingChanges(true);
  }, [protectedColumns, uniqueValues]);

  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric);
    setPendingChanges(true);
  };

  const handleRefGroupChange = (column: string, value: string) => {
    const newRefGroups = { ...refGroups, [column]: value };
    setRefGroups(newRefGroups);
    setPendingChanges(true);
    setShowWarning(Object.keys(newRefGroups).length !== protectedColumns.length);
  };

  const handleUpdate = () => {
    if (Object.keys(refGroups).length === protectedColumns.length) {
      onUpdateMetrics(selectedMetric, refGroups);
      setPendingChanges(false);
      setShowWarning(false);
    } else {
      setShowWarning(true);
    }
  };

  const renderTable = (data: any[] | null, title: string) => {
    if (!data || data.length === 0) return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users size={24} />
          {title}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(data[0]).map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value: any, i: number) => (
                    <td
                      key={i}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {typeof value === 'number' ? value.toFixed(3) : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings size={24} />
            Configuración de Métricas
          </h2>
          <button
            onClick={handleUpdate}
            disabled={showWarning}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white
              ${pendingChanges 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-gray-400 cursor-not-allowed'
              } ${showWarning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={16} className={pendingChanges ? 'animate-spin' : ''} />
            Actualizar Análisis
          </button>
        </div>

        {showWarning && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <p className="ml-3 text-yellow-700">
                Por favor seleccione un grupo de referencia para cada variable protegida.
              </p>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Métrica de Referencia
            </label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={selectedMetric}
              onChange={(e) => handleMetricChange(e.target.value)}
            >
              {metrics.map((metric) => (
                <option key={metric.name} value={metric.name}>
                  {metric.name.toUpperCase()} - {metric.description}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Grupos de Referencia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {protectedColumns.map((column) => (
                <div key={column} className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {column}
                  </label>
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    value={refGroups[column] || ''}
                    onChange={(e) => handleRefGroupChange(column, e.target.value)}
                  >
                    <option value="">Seleccionar grupo</option>
                    {uniqueValues[column]?.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Análisis de Disparidades</h2>
      
      {biasMetrics && renderTable(
        biasMetrics.predefined,
        'Disparidades con Grupos de Referencia Predefinidos'
      )}
      
      {biasMetrics && renderTable(
        biasMetrics.major_group,
        'Disparidades usando Grupo Mayoritario como Referencia'
      )}
      
      {biasMetrics && renderTable(
        biasMetrics.min_metric,
        'Disparidades usando Grupo con Menor Error como Referencia'
      )}
    </div>
  );
};