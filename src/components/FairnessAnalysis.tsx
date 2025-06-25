import React, { useState, useEffect } from 'react';
import { Scale, Users } from 'lucide-react';
import { DataTable } from './DataTable';

interface FairnessAnalysisProps {
  protectedColumns: string[];
  uniqueValues: Record<string, string[]>;
  onAnalyze: (params: any) => void;
  results: any;
  loading: boolean;
}

export const FairnessAnalysis: React.FC<FairnessAnalysisProps> = ({
  protectedColumns,
  uniqueValues,
  onAnalyze,
  results,
  loading
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);

  useEffect(() => {
    if (protectedColumns.length > 0) {
      setSelectedAttributes([protectedColumns[0]]);
    }
  }, [protectedColumns]);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Scale className="h-6 w-6" />
          Análisis de Equidad
        </h2>
        
        <div className="prose max-w-none mb-6">
          <p className="text-gray-600">
            El análisis de equidad evalúa si el modelo trata de manera justa a diferentes grupos demográficos,
            identificando posibles sesgos y discriminaciones en las predicciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Variables Protegidas
            </h3>
            <div className="space-y-4">
              {protectedColumns.map(column => (
                <div key={column} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{column}</h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueValues[column]?.map(value => (
                      <span
                        key={value}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Métricas de Equidad</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Paridad Demográfica</h4>
                <p className="text-sm text-gray-600">
                  Evalúa si la tasa de predicciones positivas es similar entre diferentes grupos demográficos.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Igualdad de Oportunidades</h4>
                <p className="text-sm text-gray-600">
                  Mide si la tasa de verdaderos positivos es similar entre grupos.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Paridad Predictiva</h4>
                <p className="text-sm text-gray-600">
                  Analiza si la precisión predictiva es consistente entre grupos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {results?.fairness_metrics && (
        <DataTable
          title="Métricas de Equidad por Grupo"
          data={results.fairness_metrics}
          translateHeader={(header) => header}
          formatNumber={(value) => typeof value === 'number' ? value.toFixed(4) : value.toString()}
        />
      )}
    </div>
  );
};