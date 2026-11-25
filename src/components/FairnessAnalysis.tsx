
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
  biasMetrics?: any[];
}

const VERDICT_METRICS = ['fpr', 'fnr', 'for', 'fdr'] as const;

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
  biasMetrics,
}) => {
  const performanceMetrics = ['fpr', 'fnr', 'for', 'fdr'];

  // Previsualiza QUÉ grupo quedará como referencia por atributo, según el método
  // elegido, replicando la lógica del backend (antes de "Analizar Equidad").
  const previewRef = (attr: string): { group: string | null; perMetric: Record<string, string> } => {
    const rows = (biasMetrics || []).filter((r: any) => r.attribute_name === attr);
    if (!rows.length) return { group: null, perMetric: {} };
    // Desempate determinista por orden alfabético (igual que el backend).
    const sorted = [...rows].sort((a: any, b: any) => String(a.attribute_value).localeCompare(String(b.attribute_value)));

    if (referenceMethod === 'custom') {
      const chosen = customReferenceGroups[attr];
      if (chosen) return { group: chosen, perMetric: {} };
      // Si aún no se eligió, el backend cae al grupo mayoritario.
      const majTmp = sorted.reduce((b: any, r: any) => (Number(r.group_size) > Number(b.group_size) ? r : b));
      return { group: String(majTmp.attribute_value), perMetric: {} };
    }
    if (referenceMethod === 'best_performance') {
      // El backend elige el mejor grupo por CADA métrica (puede variar).
      const perMetric: Record<string, string> = {};
      VERDICT_METRICS.forEach((m) => {
        const valid = sorted.filter((r: any) => r[m] != null && !Number.isNaN(Number(r[m])));
        if (valid.length) {
          const best = valid.reduce((b: any, r: any) => (Number(r[m]) < Number(b[m]) ? r : b));
          perMetric[m] = String(best.attribute_value);
        }
      });
      const uniq = [...new Set(Object.values(perMetric))];
      return { group: uniq.length === 1 ? uniq[0] : null, perMetric };
    }
    // majority (por defecto): el subgrupo más grande.
    const best = sorted.reduce((b: any, r: any) => (Number(r.group_size) > Number(b.group_size) ? r : b));
    return { group: String(best.attribute_value), perMetric: {} };
  };
  const referenceMethodOptions = [
    { id: 'majority', name: 'Grupo más numeroso (recomendado)', description: 'Compara cada grupo con el que tiene más casos.' },
    { id: 'best_performance', name: 'Grupo con menos errores', description: 'Compara con el grupo al que mejor le va en la métrica principal.' },
    { id: 'custom', name: 'Personalizado', description: 'Tú eliges el grupo, si hay una razón legal o institucional.' },
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
          <h3 className="text-lg font-medium mb-2">Grupo de referencia</h3>
          <p className="mb-3 text-gray-700">
            Cada grupo se compara con un grupo de referencia de su misma variable protegida. Elige cuál usar:
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            {referenceMethodOptions.map(method => (
              <label key={method.id}
                   className={`p-4 border rounded-lg cursor-pointer flex-1 flex items-start gap-3 ${referenceMethod === method.id ? 'bg-indigo-50 border-burgundy' : 'bg-gray-50 border-gray-200'}`}>
                <input
                  type="radio"
                  name="referenceMethod"
                  value={method.id}
                  checked={referenceMethod === method.id}
                  onChange={() => setReferenceMethod(method.id)}
                  className="mt-1 accent-burgundy"
                />
                <span>
                  <span className="block font-semibold">{method.name}</span>
                  <span className="block text-sm text-gray-600">{method.description}</span>
                </span>
              </label>
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

        {biasMetrics && biasMetrics.length > 0 && (
          <div className="mb-6 rounded-xl border border-rose-light bg-indigo-50 p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-burgundy mb-1">Grupo de referencia que se usará</p>
            <p className="text-xs text-ink-60 mb-3">
              Vista previa según el método elegido arriba. Se aplicará al pulsar <b>“Analizar Equidad”</b>.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {protectedColumns.map((attr) => {
                const pv = previewRef(attr);
                return (
                  <div key={attr} className="border border-rose-light rounded-lg px-3 py-2 text-sm bg-white">
                    <div className="flex items-center gap-2">
                      <span className="text-ink-60">{attr}</span>
                      <span className="text-ink-20">→</span>
                      <span className="font-semibold text-burgundy">{pv.group ?? 'varía por métrica'}</span>
                    </div>
                    {!pv.group && Object.keys(pv.perMetric).length > 0 && (
                      <div className="text-[11px] text-ink-60 mt-1 font-mono">
                        {VERDICT_METRICS.filter((m) => pv.perMetric[m]).map((m) => `${m.toUpperCase()}: ${pv.perMetric[m]}`).join('  ·  ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
