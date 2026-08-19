


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

  // --- Diagnóstico de transparencia: qué subgrupos explican cada veredicto ---
  const minGroupSize = results?.metadata?.min_group_size ?? 50;
  const tau = results?.metadata?.fairness_threshold ?? localThreshold;
  const ERROR_METRICS: [string, string][] = [
    ['fpr_disparity', 'FPR'], ['fnr_disparity', 'FNR'],
    ['for_disparity', 'FOR'], ['fdr_disparity', 'FDR'],
  ];
  const buildDiagnostics = () => {
    const bias = results?.tables?.bias_metrics || [];
    const lower = 1 / tau, upper = tau;
    const byAttr: Record<string, { offenders: any[]; insufficient: any[] }> = {};
    bias.forEach((r: any) => {
      const a = r.attribute_name;
      if (!byAttr[a]) byAttr[a] = { offenders: [], insufficient: [] };
      if (r.insufficient_sample) {
        byAttr[a].insufficient.push({ group: r.attribute_value, n: r.group_size });
        return;
      }
      if (r.fairness_conclusion === 'Unfair') {
        let worst: any = null;
        ERROR_METRICS.forEach(([k, label]) => {
          const v = r[k];
          if (v == null || Number.isNaN(v)) return;
          if (v < lower || v > upper) {
            const dev = Math.max(v, 1 / v);
            if (!worst || dev > worst.dev) worst = { label, val: v, dev };
          }
        });
        byAttr[a].offenders.push({ group: r.attribute_value, n: r.group_size, worst });
      }
    });
    return byAttr;
  };
  const diagnostics = buildDiagnostics();
  const hasDiagnostics = Object.values(diagnostics).some(
    (d) => d.offenders.length > 0 || d.insufficient.length > 0
  );

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

          {/* Filtrar columnas internas de los datos mostrados */}

          {results && results.tables && results.tables.bias_metrics && (

            <DataTable

              title="Métricas de Disparidad (Análisis de Equidad)"

              data={results.tables.bias_metrics.map((row: any) => {

                const out: any = {};

                Object.keys(row).forEach((k) => {

                  if (['score_threshold', 'insufficient_sample', 'model_id', 'k'].includes(k)) return;

                  if (k.endsWith('_significance') || k.endsWith('_ref_group_value')) return;

                  out[k] = row[k];

                });

                return out;

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

            <div className="bg-indigo-50 border-l-4 border-burgundy p-3 rounded mt-4">

              <span className="font-semibold text-burgundy">Nota:</span> Desliza la tabla hacia la derecha para explorar todas las métricas disponibles: exactitud, tasas de error, sensibilidad, precisión, entre otras.

            </div>

          </div>



          {/* --- Slider de tolerancia (multiplicador ×) y Recalcular --- */}

          <div className="bg-white p-6 rounded-lg shadow-sm my-8 border border-gray-200">

            <h2 className="text-xl font-semibold mb-2">Ajustar Tolerancia y Recalcular</h2>

            <p className="text-gray-700 mb-4">

              La tolerancia define cuánta <b>disparidad</b> se acepta antes de considerar un subgrupo inequitativo.
              Un valor de <b>1.25×</b> equivale a la regla del 80%: se tolera hasta un 25% de diferencia respecto al grupo de referencia.

            </p>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-2">

              <input

                type="range"

                min="1"

                max="3"

                step="0.05"

                value={localThreshold}

                onChange={(e) => setLocalThreshold(parseFloat(e.target.value))}

                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"

              />

              <span className="font-mono text-lg text-indigo-600 whitespace-nowrap">{localThreshold.toFixed(2)}×</span>

            </div>

            <p className="text-sm text-gray-600 mb-4">

              Se considera <b>equitativo</b> si la disparidad del subgrupo está entre{' '}
              <b>{(1 / localThreshold).toFixed(2)}</b> y <b>{localThreshold.toFixed(2)}</b> (donde 1.00 = sin disparidad).

            </p>

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

          {hasDiagnostics && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-1">¿Por qué estas conclusiones?</h2>
              <p className="text-sm text-gray-600 mb-4">
                Detalle de los subgrupos que determinan cada veredicto, con la tolerancia actual de <b>{tau.toFixed(2)}×</b>.
                Los subgrupos con menos de <b>{minGroupSize}</b> casos se consideran de <b>muestra insuficiente</b> y no afectan la conclusión.
              </p>
              <div className="space-y-4">
                {Object.entries(diagnostics)
                  .filter(([, d]) => d.offenders.length > 0 || d.insufficient.length > 0)
                  .map(([attr, d]) => (
                  <div key={attr} className="border-l-4 pl-3" style={{ borderColor: d.offenders.length ? '#ef4444' : '#22c55e' }}>
                    <p className="font-semibold text-gray-800">
                      {attr}:{' '}
                      {d.offenders.length ? (
                        <span className="text-red-600">No Equitativo</span>
                      ) : (
                        <span className="text-green-600">Equitativo</span>
                      )}
                    </p>
                    {d.offenders.length > 0 && (
                      <ul className="list-disc pl-6 text-sm text-gray-700 mt-1">
                        {d.offenders.map((o: any, i: number) => (
                          <li key={i}>
                            <b>{o.group}</b> (n={o.n})
                            {o.worst && (
                              <> — mayor disparidad en <b>{o.worst.label}</b> = {o.worst.val.toFixed(2)}×</>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {d.insufficient.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        No evaluados por muestra insuficiente: {d.insufficient.map((g: any) => `${g.group} (n=${g.n})`).join(', ')}.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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


