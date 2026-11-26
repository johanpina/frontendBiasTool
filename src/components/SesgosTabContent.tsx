import React from 'react';
import { Download } from 'lucide-react';
import { DisparityPlotter } from './bias-analysis/DisparityPlotter';
import { biasMetricsCsv, downloadText, fmtInt, fmtPct, totalCases } from '../lib/results';

interface SesgosTabContentProps {
  results: any;
  BASE_API_URL: string;
}

// Columnas del detalle técnico (las demás solo van en el CSV).
const COUNT_COLS: [string, string][] = [
  ['pp', 'Predichos positivos'], ['pn', 'Predichos negativos'],
  ['fp', 'Falsos positivos'], ['fn', 'Falsos negativos'],
  ['tp', 'Verdaderos positivos'], ['tn', 'Verdaderos negativos'],
  ['group_size', 'Tamaño del grupo'],
];
const RATE_COLS: [string, string][] = [
  ['tpr', 'TPR'], ['tnr', 'TNR'], ['npv', 'NPV'], ['precision', 'PPV'],
  ['accuracy', 'Exactitud'], ['prev', 'Prevalencia observada'],
];

/** Pestaña "Detalle por grupo": matriz de confusión y todas las métricas (detalle técnico). */
export const SesgosTabContent: React.FC<SesgosTabContentProps> = ({ results, BASE_API_URL }) => {
  if (!results) return null;
  const bias: any[] = results.tables?.bias_metrics || [];
  const meta = results.metadata || {};
  const total = totalCases(bias);
  const fileTag = meta.selected_class ? `_clase_${meta.selected_class}` : '';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink">Detalle técnico</h3>
          <p className="text-sm text-ink-60 max-w-2xl">
            Matriz de confusión y métricas complementarias por grupo. TPR = 1 − FNR · TNR = 1 − FPR · NPV = 1 − FOR ·
            PPV = 1 − FDR. {total != null && <>Total de casos en el archivo: <b>{fmtInt(total)}</b>.</>}
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadText(`tabla_completa${fileTag}.csv`, biasMetricsCsv(bias))}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-rose-light bg-white text-burgundy font-semibold hover:border-burgundy"
        >
          <Download className="h-4 w-4" /> Descargar tabla completa (.csv)
        </button>
      </div>

      <div className="bg-white rounded-xl border border-rose-light overflow-x-auto">
        <table className="w-full text-sm min-w-[900px] tabular-nums">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-60 bg-indigo-50">
              <th className="px-3 py-2 font-semibold">Variable</th>
              <th className="px-3 py-2 font-semibold">Grupo</th>
              {[...COUNT_COLS, ...RATE_COLS].map(([, label]) => (
                <th key={label} className="px-3 py-2 font-semibold text-right">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bias.map((r, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-3 py-2 text-ink-60">{r.attribute_name}</td>
                <td className="px-3 py-2 font-medium text-ink">{r.attribute_value}</td>
                {COUNT_COLS.map(([k]) => <td key={k} className="px-3 py-2 text-right">{fmtInt(r[k])}</td>)}
                {RATE_COLS.map(([k]) => <td key={k} className="px-3 py-2 text-right">{fmtPct(r[k])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-60">
        El CSV incluye además las columnas que no se muestran aquí: ID de modelo, umbral, valor K, proporción predicha
        positiva (PPR) y todas las disparidades y paridades.
      </p>

      <DisparityPlotter
        biasMetrics={bias}
        protectedAttributes={meta.protected_attributes || []}
        fairnessThreshold={meta.fairness_threshold || 1.25}
        BASE_API_URL={BASE_API_URL}
        classLabel={meta.selected_class}
      />
    </div>
  );
};
