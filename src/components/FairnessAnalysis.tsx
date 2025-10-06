
import React, { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface FairnessAnalysisProps {
  protectedColumns: string[];
  uniqueValues: Record<string, string[]>;
  onAnalyze: (params: any) => void;
  loading: boolean;
  results: any; 
}

export const FairnessAnalysis: React.FC<FairnessAnalysisProps> = ({
  protectedColumns,
  uniqueValues,
  onAnalyze,
  loading,
}) => {
  const [referenceMethod, setReferenceMethod] = useState('majority');
  const [customReferenceGroups, setCustomReferenceGroups] = useState<Record<string, string>>({});
  const [performanceMetric, setPerformanceMetric] = useState('fpr');

  console.log("LOG: Props en FairnessAnalysis", { protectedColumns, uniqueValues });
  console.log("LOG: Estado de referenceMethod", referenceMethod);


  useEffect(() => {
    if (protectedColumns && protectedColumns.length > 0) {
      const initialGroups: Record<string, string> = {};
      protectedColumns.forEach(col => {
        if (uniqueValues[col] && uniqueValues[col].length > 0) {
          initialGroups[col] = uniqueValues[col][0];
        }
      });
      setCustomReferenceGroups(initialGroups);
    }
  }, [protectedColumns, uniqueValues]);

  const handleCustomGroupChange = (attribute: string, value: string) => {
    setCustomReferenceGroups(prev => ({ ...prev, [attribute]: value }));
  };

  const handleAnalysisClick = () => {
    const params = {
      referenceMethod,
      ...(referenceMethod === 'custom' && { referenceGroups: customReferenceGroups }),
      ...(referenceMethod === 'best_performance' && { performanceMetric }),
    };
    onAnalyze(params);
  };

  const performanceMetrics = ['fpr', 'fnr', 'for', 'fdr'];
  const referenceMethodOptions = [
    { id: 'majority', name: 'Grupo Mayoritario', description: 'Usa el subgrupo más grande como referencia.' },
    { id: 'best_performance', name: 'Grupo con Mejor Desempeño', description: 'Usa el subgrupo con el menor error.' },
    { id: 'custom', name: 'Personalizado', description: 'Selecciona manualmente cada grupo de referencia.' },
  ];

  // Si no hay resultados del análisis, no mostrar nada o un mensaje.
  if (!protectedColumns || protectedColumns.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500">Por favor, realice un análisis en la pestaña 'Análisis de Sesgos' para poder configurar el análisis de equidad.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-6 w-6" />
          Configuración del Análisis de Equidad
        </h2>

        {/* Selector de Método de Referencia */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Método de selección de subgrupo de referencia</h3>
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

        {/* Controles Condicionales */}
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
                {performanceMetrics.map(metric => <option key={metric} value={metric}>{metric.toUpperCase()}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Botón de Acción */}
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
