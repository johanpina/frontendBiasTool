


import React, { useState, useEffect } from 'react';

import { FairnessAnalysis } from './FairnessAnalysis';

import { DisparityPlotter } from './bias-analysis/DisparityPlotter';

import { DataTable } from './DataTable';

import { METRIC_TRANSLATIONS } from '../constants';



interface EquidadTabContentProps {

  results: any;

  loading: boolean;

  onAnalyze: (params: any) => void;

  BASE_API_URL: string;

}



export const EquidadTabContent: React.FC<EquidadTabContentProps> = ({

  results,

  loading,

  onAnalyze,

  BASE_API_URL,

}) => {

  const protectedColumns = results?.metadata?.protected_attributes || [];

  const uniqueValues = results?.metadata?.unique_values || {};



  // --- State Lifted from FairnessAnalysis ---

  const [referenceMethod, setReferenceMethod] = useState('majority');

  const [customReferenceGroups, setCustomReferenceGroups] = useState<Record<string, string>>({});

  const [performanceMetric, setPerformanceMetric] = useState('fpr');

  

  // --- State for the new slider ---

  const [localThreshold, setLocalThreshold] = useState(results?.metadata?.fairness_threshold || 1.25);



  useEffect(() => {

    // Initialize localThreshold when results change

    if (results?.metadata?.fairness_threshold) {

      setLocalThreshold(results.metadata.fairness_threshold);

    }



    // Initialize custom reference groups

    if (protectedColumns && protectedColumns.length > 0) {

      const initialGroups: Record<string, string> = {};

      protectedColumns.forEach(col => {

        if (uniqueValues[col] && uniqueValues[col].length > 0) {

          initialGroups[col] = uniqueValues[col][0];

        }

      });

      setCustomReferenceGroups(initialGroups);

    }

  }, [results, protectedColumns, uniqueValues]);



  const handleCustomGroupChange = (attribute: string, value: string) => {

    setCustomReferenceGroups(prev => ({ ...prev, [attribute]: value }));

  };



  const handleAnalysisClick = (threshold?: number) => {

    const params = {

      referenceMethod,

      ...(referenceMethod === 'custom' && { referenceGroups: customReferenceGroups }),

      ...(referenceMethod === 'best_performance' && { performanceMetric }),

      fairness_threshold: threshold || localThreshold, // Use specified threshold or local state

    };

    onAnalyze(params);

  };

  

  return (

    <div className="space-y-8">

      <FairnessAnalysis

        protectedColumns={protectedColumns}

        uniqueValues={uniqueValues}

        loading={loading}

        referenceMethod={referenceMethod}

        setReferenceMethod={setReferenceMethod}

        customReferenceGroups={customReferenceGroups}

        handleCustomGroupChange={handleCustomGroupChange}

        performanceMetric={performanceMetric}

        setPerformanceMetric={setPerformanceMetric}

        handleAnalysisClick={() => handleAnalysisClick(results.metadata.fairness_threshold)} // Use original threshold

      />



      {results && (

        <div className="space-y-8 mt-8">

          <DisparityPlotter 

            biasMetrics={results.tables.bias_metrics}

            protectedAttributes={protectedColumns}

            fairnessThreshold={results.metadata.fairness_threshold || 1.25}

            BASE_API_URL={BASE_API_URL}

          />

          {/* Filtrar la columna 'score_threshold' de los datos */}

          {results && results.tables && results.tables.bias_metrics && (

            <DataTable

              title="Métricas de Disparidad (Análisis de Equidad)"

              data={results.tables.bias_metrics.map((row: any) => {

                const { score_threshold, ...rest } = row;

                return rest;

              })}

              translateHeader={(h) => METRIC_TRANSLATIONS[h] || h}

              formatNumber={(v) => String(v)}

            />

          )}

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



          {/* --- New Slider and Recalculate Button --- */}

          <div className="bg-white p-6 rounded-lg shadow-sm my-8 border border-gray-200">

            <h2 className="text-xl font-semibold mb-4">Ajustar Tolerancia y Recalcular</h2>

            <p className="text-gray-700 mb-4">

              Mueve el slider para ajustar el porcentaje de tolerancia de disparidad y haz clic en "Recalcular" para actualizar las conclusiones de equidad en las tablas.

            </p>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-4">

              <input

                type="range"

                min="0"

                max="100"

                step="1"

                value={(localThreshold - 1) * 100}

                onChange={(e) => setLocalThreshold(parseFloat(e.target.value) / 100 + 1)}

                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"

              />

              <span className="font-mono text-lg text-indigo-600">{`${((localThreshold - 1) * 100).toFixed(0)}%`}</span>

            </div>

            <div className="flex justify-end">

              <button 

                onClick={() => handleAnalysisClick()}

                disabled={loading}

                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400"

              >

                {loading ? 'Recalculando...' : 'Recalcular'}

              </button>

            </div>

          </div>



          <DataTable

            title="Resumen de Equidad por Atributo"

            data={results.tables.fairness_summary}

            translateHeader={(h) => METRIC_TRANSLATIONS[h] || h}

            formatNumber={(v) => String(v)}

          />

          <DataTable

            title="Test de Equidad Estadística por Atributo"

            data={results.tables.fairness_by_attribute}

            translateHeader={(h) => METRIC_TRANSLATIONS[h] || h}

            formatNumber={(v) => String(v)}

          />

        </div>

      )}

    </div>

  );

};


