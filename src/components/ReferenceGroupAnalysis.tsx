import React, { useState, useEffect } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { DataTable } from './DataTable';
import { PlotVisualization } from './PlotVisualization';

interface ReferenceGroupAnalysisProps {
  protectedColumns: string[];
  uniqueValues: Record<string, string[]>;
  onAnalyze: (refGroups: Record<string, string>) => void;
  results: any;
  loading: boolean;
}

export const ReferenceGroupAnalysis: React.FC<ReferenceGroupAnalysisProps> = ({
  protectedColumns,
  uniqueValues,
  onAnalyze,
  results,
  loading
}) => {
  const [refGroups, setRefGroups] = useState<Record<string, string>>({});
  const [pendingAnalysis, setPendingAnalysis] = useState(false);

  useEffect(() => {
    const initialRefGroups: Record<string, string> = {};
    protectedColumns.forEach(column => {
      if (uniqueValues[column]?.length > 0) {
        initialRefGroups[column] = uniqueValues[column][0];
      }
    });
    setRefGroups(initialRefGroups);
    setPendingAnalysis(true);
  }, [protectedColumns, uniqueValues]);

  const handleRefGroupChange = (column: string, value: string) => {
    const newRefGroups = { ...refGroups, [column]: value };
    setRefGroups(newRefGroups);
    setPendingAnalysis(true);
  };

  const handleAnalyze = () => {
    if (Object.keys(refGroups).length === protectedColumns.length) {
      onAnalyze(refGroups);
      setPendingAnalysis(false);
    }
  };

  const allGroupsSelected = Object.keys(refGroups).length === protectedColumns.length;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Selección de Grupos de Referencia
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                <option value="">Seleccionar grupo de referencia</option>
                {uniqueValues[column]?.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!allGroupsSelected || loading || !pendingAnalysis}
          className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md text-white font-medium transition-colors
            ${allGroupsSelected && !loading && pendingAnalysis
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-gray-400 cursor-not-allowed'
            }`}
        >
          {loading ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Analizando...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5" />
              <span>Actualizar Análisis</span>
            </>
          )}
        </button>
      </div>

      {results?.bias_metrics && (
        <div className="space-y-6">
          <DataTable
            title="Análisis por Grupos de Referencia"
            data={results.bias_metrics}
            translateHeader={(header) => header}
            formatNumber={(value) => typeof value === 'number' ? value.toFixed(4) : value.toString()}
          />
          
          {results.bias_plot && (
            <PlotVisualization
              plotData={results.bias_plot}
              title="Visualización de Disparidad por Grupos de Referencia"
            />
          )}
        </div>
      )}
    </div>
  );
};