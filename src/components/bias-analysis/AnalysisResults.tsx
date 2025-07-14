import React from 'react';
import { DataTable } from '../DataTable';

interface AnalysisResultsProps {
  results: any;
  referenceMethod: 'custom' | 'majority' | 'minority';
}

const getTableTitle = (method: 'custom' | 'majority' | 'minority') => {
  switch (method) {
    case 'custom':
      return 'Análisis de Equidad con Grupos de Referencia Personalizados';
    case 'majority':
      return 'Análisis de Equidad usando Grupos Mayoritarios como Referencia';
    case 'minority':
      return 'Análisis de Equidad usando Grupos Minoritarios como Referencia';
    default:
      return 'Resultados del Análisis de Equidad';
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
      <div className="mt-2 mb-6 text-gray-700">
        <p className="mb-2">
          Esta tabla muestra los resultados del análisis de disparidad en base al grupo de referencia que seleccionaste previamente. Para cada métrica seleccionada, se calcula la relación entre el desempeño del subgrupo y el del grupo de referencia.
        </p>
        <p className="mb-2 font-semibold">¿Cómo se interpretan los valores?</p>
        <ul className="list-disc pl-6 mb-2">
          <li>Cada celda refleja el cociente entre la métrica del subgrupo y la métrica del grupo de referencia.</li>
          <li>Por construcción, el grupo de referencia tiene asignado el valor <b>1.00</b>.</li>
          <li>Si el valor es mayor a 1, significa que el error o diferencia es mayor en el subgrupo evaluado.</li>
          <li>Si el valor es menor a 1, significa que el grupo de referencia tiene mayor error o menor desempeño.</li>
          <li>Cuanto más cercano a 1, más similares son los desempeños entre los subgrupos y, por tanto, menor la disparidad, es decir, más equitativo es el desempeño.</li>
        </ul>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded mt-4">
          <span className="font-semibold text-blue-800">Nota:</span> Desliza la tabla hacia la derecha para explorar todas las métricas disponibles: exactitud, tasas de error, sensibilidad, precisión, entre otras.
        </div>
      </div>
      
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