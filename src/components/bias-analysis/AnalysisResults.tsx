import React from 'react';
import { DataTable } from '../DataTable';

interface AnalysisResultsProps {
  results: any;
  referenceMethod: 'custom' | 'majority' | 'minority';
}

const getTableTitle = (method: 'custom' | 'majority' | 'minority') => {
  switch (method) {
    case 'custom':
      return 'Análisis de Disparidad con Grupos de Referencia Personalizados';
    case 'majority':
      return 'Análisis de Disparidad usando Grupos Mayoritarios como Referencia';
    case 'minority':
      return 'Análisis de Disparidad usando Grupos Minoritarios como Referencia';
    default:
      return 'Resultados del Análisis de Disparidad';
  }
};

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  results,
  referenceMethod
}) => {
  if (!results?.bias_metrics) {
    return null;
  }

  return (
    <div className="space-y-8">
      <DataTable
        title={getTableTitle(referenceMethod)}
        data={results.bias_metrics}
        translateHeader={(header) => header}
        formatNumber={(value) => typeof value === 'number' ? value.toFixed(4) : value.toString()}
      />
      
      {results.bias_plot && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Visualización de Disparidad</h3>
          <img
            src={`data:image/png;base64,${results.bias_plot}`}
            alt="Gráfico de disparidad"
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
};