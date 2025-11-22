
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { METRIC_TRANSLATIONS } from '../constants';

interface FairnessAnalysisProps {
  protectedColumns: string[];
  uniqueValues: Record<string, string[]>;
  loading: boolean;
  referenceMethod: string;
  setReferenceMethod: (method: string) => void;
  customReferenceGroups: Record<string, string>;
  handleCustomGroupChange: (attribute: string, value: string) => void;
  performanceMetric: string;
  setPerformanceMetric: (metric: string) => void;
  handleAnalysisClick: () => void;
}

export const FairnessAnalysis: React.FC<FairnessAnalysisProps> = ({
  protectedColumns,
  uniqueValues,
  loading,
  referenceMethod,
  setReferenceMethod,
  customReferenceGroups,
  handleCustomGroupChange,
  performanceMetric,
  setPerformanceMetric,
  handleAnalysisClick,
}) => {
  const performanceMetrics = ['fpr', 'fnr', 'for', 'fdr'];
  const referenceMethodOptions = [
    { id: 'majority', name: 'Grupo Mayoritario', description: 'Usa el subgrupo más grande como referencia.' },
    { id: 'best_performance', name: 'Grupo con Mejor Desempeño', description: 'Usa el subgrupo con el menor error.' },
    { id: 'custom', name: 'Personalizado', description: 'Selecciona manualmente cada grupo de referencia.' },
  ];

  if (!protectedColumns || protectedColumns.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500">Por favor, realice un análisis en la pestaña 'Análisis de Sesgos' para poder configurar el análisis de equidad.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-6 w-6" />
          Configuración del Análisis de Equidad
        </h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Método de selección de subgrupo de referencia</h3>
          <p className="mb-2">
            Para realizar un análisis de equidad, es necesario definir un subgrupo de referencia dentro de cada variable protegida. Este subgrupo servirá como base de comparación: la herramienta evaluará si los demás subgrupos presentan diferencias significativas en desempeño o error respecto a este.
          </p>
          <ul className="list-disc pl-6 mb-2">
            <li className="mb-2">
              <b>Grupo Mayoritario:</b> Se utiliza el subgrupo con mayor número de instancias en el dataset como referencia.<br/>
              Este enfoque es útil cuando el grupo dominante representa el estándar de comportamiento más frecuente del modelo, y permite contrastar si los grupos con menor representación están recibiendo un trato desigual.
            </li>
            <li>
              <b>Grupo con Mejor Desempeño:</b> Se utiliza el subgrupo que presenta el menor error (por ejemplo, menor tasa de falsos positivos o falsos negativos) como grupo de referencia.<br/>
              Este enfoque permite detectar qué grupos están sistemáticamente peor tratados que el grupo con mejor resultado, y es especialmente útil en contextos donde se busca garantizar que todos los grupos alcancen un umbral mínimo de equidad.<br/>
              Para usar esta opción, también debes seleccionar una métrica de rendimiento (por ejemplo: exactitud, precisión, tasa de falsos negativos). Puedes guiarte por la tabla de métricas de error por subgrupo vista en la sección anterior.
            </li>
            <li className="mb-2">
              <b>Personalizado:</b> Selecciona manualmente el grupo de referencia que consideres relevante para tu proyecto. Esta opción es útil cuando existe una justificación normativa, institucional o contextual para usar un grupo específico como base de comparación.
            </li>
          </ul>
          <br />

          <div className="flex flex-col md:flex-row gap-4">
            {referenceMethodOptions.map(method => (
              <div key={method.id} 
                   className={`p-4 border rounded-lg cursor-pointer flex-1 ${referenceMethod === method.id ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50'}`}
                   onClick={() => setReferenceMethod(method.id)}>
                <h4 className="font-semibold">{method.name}</h4>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 min-h-[100px]">
          {referenceMethod === 'custom' && (
            <div>
              <h4 className="text-md font-semibold mb-3">Define tus grupos de referencia:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {protectedColumns.map(col => (
                  <div key={col}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{col}</label>
                    <select 
                      value={customReferenceGroups[col] || ''}
                      onChange={(e) => handleCustomGroupChange(col, e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm"
                    >
                      {uniqueValues[col]?.map(val => <option key={val} value={val}>{val}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {referenceMethod === 'best_performance' && (
            <div>
              <h4 className="text-md font-semibold mb-3">Selecciona la métrica de rendimiento a minimizar:</h4>
              <select 
                value={performanceMetric}
                onChange={(e) => setPerformanceMetric(e.target.value)}
                className="max-w-xs w-full border-gray-300 rounded-md shadow-sm"
              >
                {performanceMetrics.map(metric => <option key={metric} value={metric}>{METRIC_TRANSLATIONS[metric] || metric.toUpperCase()}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleAnalysisClick}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? 'Analizando...' : 'Analizar Equidad'}
          </button>
        </div>
      </div>
    </div>
  );
};
