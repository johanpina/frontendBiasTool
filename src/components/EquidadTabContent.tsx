


import React from 'react';


import { DisparityPlotter } from './bias-analysis/DisparityPlotter';

import { DataTable } from './DataTable';

import { SectionHeader } from './SectionHeader';

import { referenceByAttribute, refMethodLabel } from '../lib/referenceInfo';

import { METRIC_TRANSLATIONS } from '../constants';
import { fmtInt, fmtPct, fmtTimes } from '../lib/format';



interface EquidadTabContentProps {

  results: any;

  BASE_API_URL: string;

  /** Vuelve al paso 3 para cambiar la tolerancia o el grupo de referencia. */
  onEditConfig: () => void;

}



export const EquidadTabContent: React.FC<EquidadTabContentProps> = ({

  results,

  BASE_API_URL,

  onEditConfig,

}) => {

  const protectedColumns = results?.metadata?.protected_attributes || [];




  // --- Diagnóstico de transparencia: qué subgrupos explican cada veredicto ---
  const minGroupSize = results?.metadata?.min_group_size ?? 50;
  const tau = results?.metadata?.fairness_threshold ?? 1.25;
  const ERROR_METRICS: [string, string][] = [
    ['fpr_disparity', 'FPR'], ['fnr_disparity', 'FNR'],
    ['for_disparity', 'FOR'], ['fdr_disparity', 'FDR'],
  ];
  // Clase evaluada: en multiclase la seleccionada; en binario, "positivos".
  const posMeta = results?.metadata?.positive_class;
  const pos: string = results?.metadata?.selected_class
    ?? (posMeta != null && posMeta !== '1' && posMeta !== '0' ? posMeta : 'positivos');
  // Frase en lenguaje simple de qué mide cada tasa para un grupo.
  const describeRate = (m: string, pct: string) => {
    switch (m) {
      case 'fnr': return `el modelo no detecta al ${pct} de los casos que sí eran ${pos}`;
      case 'fpr': return `el modelo marca por error al ${pct} de los casos que no eran ${pos}`;
      case 'for': return `el ${pct} de los casos que el modelo descartó sí eran ${pos}`;
      case 'fdr': return `el ${pct} de los casos que el modelo marcó como ${pos} no lo eran`;
      default: return `${m.toUpperCase()} = ${pct}`;
    }
  };
  // Qué casos cuenta cada tasa (su denominador).
  const evaluatedCases = (m: string, n: string) => {
    switch (m) {
      case 'fnr': return `${n} casos ${pos}`;
      case 'fpr': return `${n} casos que no eran ${pos}`;
      case 'for': return `${n} casos descartados por el modelo`;
      case 'fdr': return `${n} casos marcados como ${pos}`;
      default: return `${n} casos`;
    }
  };
  const buildDiagnostics = () => {
    const bias = results?.tables?.bias_metrics || [];
    const lower = 1 / tau, upper = tau;
    const byAttr: Record<string, { offenders: any[]; insufficient: any[]; partial: any[] }> = {};
    bias.forEach((r: any) => {
      const a = r.attribute_name;
      if (!byAttr[a]) byAttr[a] = { offenders: [], insufficient: [], partial: [] };
      if (r.insufficient_sample) {
        byAttr[a].insufficient.push({ group: r.attribute_value, n: r.group_size, npos: r.group_label_pos });
        return;
      }
      // Tasas con pocos casos evaluados: no cuentan para el veredicto.
      const lowRates = ERROR_METRICS
        .map(([k, label]) => ({ m: k.replace('_disparity', ''), label }))
        .filter(({ m }) => r[`${m}_insufficient`]);
      if (lowRates.length) {
        byAttr[a].partial.push({ group: r.attribute_value, rates: lowRates.map(({ m, label }) => ({ m, label, n: r[`${m}_n_eval`] })) });
      }
      if (r.fairness_conclusion === 'Unfair') {
        let worst: any = null;
        ERROR_METRICS.forEach(([k, label]) => {
          if (r[`${k.replace('_disparity', '')}_insufficient`]) return;
          const v = r[k];
          if (v == null || Number.isNaN(v)) return;
          if (v < lower || v > upper) {
            const dev = Math.max(v, 1 / v);
            if (!worst || dev > worst.dev) {
              const m = k.replace('_disparity', '');
              const refName = r[`${m}_ref_group_value`];
              const refRow = bias.find((x: any) => x.attribute_name === a && String(x.attribute_value) === String(refName));
              worst = { label, metric: m, val: v, dev, rate: r[m], refName, refRate: refRow?.[m] };
            }
          }
        });
        byAttr[a].offenders.push({ group: r.attribute_value, n: r.group_size, worst });
      }
    });
    return byAttr;
  };
  const diagnostics = buildDiagnostics();
  const hasDiagnostics = Object.values(diagnostics).some(
    (d) => d.offenders.length > 0 || d.insufficient.length > 0 || d.partial.length > 0
  );

  return (

    <div className="space-y-8">

      <p className="text-sm text-ink-80">
        Tolerancia: <b>{tau.toFixed(2).replace('.', ',')}×</b> ({(1 / tau).toFixed(2).replace('.', ',')}–{tau.toFixed(2).replace('.', ',')}) ·{' '}
        <button type="button" onClick={onEditConfig} className="text-burgundy font-semibold underline underline-offset-2">
          Cambiar tolerancia o grupo de referencia
        </button>
      </p>

      {results && (

        <div className="space-y-8 mt-8">

          {/* --- Grupo de referencia: contra qué se compara cada subgrupo --- */}
          {(() => {
            const refs = referenceByAttribute(results.tables.bias_metrics, protectedColumns);
            if (!refs.length) return null;
            const metodo = refMethodLabel(results.metadata?.ref_method, results.metadata?.performance_metric);
            return (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-light">
                <SectionHeader
                  eyebrow="Grupo de referencia"
                  title="¿Contra qué se compara cada grupo?"
                  description={<>Método usado: <b>{metodo}</b>. Cada subgrupo se compara con su grupo de referencia, que por definición vale <b>1.00</b> (sin diferencia).</>}
                />
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {refs.map((r) => (
                    <span key={r.attribute} className="inline-flex items-center gap-2 border border-rose-light rounded-lg px-3 py-2 text-sm bg-indigo-50">
                      <span className="text-ink-60">{r.attribute}</span>
                      <span className="text-ink-20">→</span>
                      {r.group ? (
                        <span className="font-semibold text-burgundy">{r.group}</span>
                      ) : (
                        <span className="font-semibold text-burgundy" title={Object.entries(r.perMetric).map(([m, g]) => `${m.toUpperCase()}: ${g}`).join(' · ')}>
                          varía por métrica
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          <DisparityPlotter

            biasMetrics={results.tables.bias_metrics}

            protectedAttributes={protectedColumns}

            fairnessThreshold={results.metadata.fairness_threshold || 1.25}

            BASE_API_URL={BASE_API_URL}

            classLabel={results.metadata.selected_class}

          />

          {/* Filtrar columnas internas de los datos mostrados */}

          {results && results.tables && results.tables.bias_metrics && (

            <DataTable

              title="Métricas de Disparidad (Análisis de Equidad)"

              data={(() => {
                const refMap: Record<string, string | null> = Object.fromEntries(
                  referenceByAttribute(results.tables.bias_metrics, protectedColumns).map((r) => [r.attribute, r.group])
                );
                return results.tables.bias_metrics.map((row: any) => {
                  const out: any = {};
                  Object.keys(row).forEach((k) => {
                    if (['score_threshold', 'insufficient_sample', 'model_id', 'k'].includes(k)) return;
                    if (k.endsWith('_significance') || k.endsWith('_ref_group_value')) return;
                    if (k.endsWith('_insufficient') || k.endsWith('_n_eval')) return;
                    out[k] = row[k];
                  });
                  // Marca la fila del grupo de referencia con "(ref)".
                  const ref = refMap[row.attribute_name];
                  if (ref != null && String(row.attribute_value) === String(ref)) {
                    out.attribute_value = `${row.attribute_value} (ref)`;
                  }
                  return out;
                });
              })()}

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

              <li>
                Para las tasas de error (FPR, FNR, FOR, FDR):
                <ul className="list-[circle] pl-6">
                  <li><b>Mayor que 1:</b> este grupo tiene más errores que la referencia.</li>
                  <li><b>Menor que 1:</b> este grupo tiene menos errores que la referencia.</li>
                </ul>
                Ej.: 2,00× = el doble de errores; 0,50× = la mitad.
              </li>

              <li>Cuanto más cercano a 1, más similares son los desempeños entre los subgrupos y, por tanto, menor la disparidad, es decir, más equitativo es el desempeño.</li>

            </ul>

            <div className="bg-indigo-50 border-l-4 border-burgundy p-3 rounded mt-4">

              <span className="font-semibold text-burgundy">Nota:</span> Desliza la tabla hacia la derecha para explorar todas las métricas disponibles: exactitud, tasas de error, sensibilidad, precisión, entre otras.

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
                Una tasa calculada sobre menos de <b>{minGroupSize}</b> casos se considera de <b>muestra insuficiente</b> y no afecta la conclusión.
              </p>
              <div className="space-y-4">
                {Object.entries(diagnostics)
                  .filter(([, d]) => d.offenders.length > 0 || d.insufficient.length > 0 || d.partial.length > 0)
                  .map(([attr, d]) => (
                  <div key={attr} className="border-l-4 pl-3" style={{ borderColor: d.offenders.length ? '#ef4444' : '#22c55e' }}>
                    <p className="font-semibold text-gray-800">
                      {attr}:{' '}
                      {d.offenders.length ? (
                        <span className="text-red-600">No equitativo</span>
                      ) : (
                        <span className="text-green-600">Equitativo</span>
                      )}
                    </p>
                    {d.offenders.length > 0 && (
                      <ul className="list-disc pl-6 text-sm text-gray-700 mt-1">
                        {d.offenders.map((o: any, i: number) => (
                          <li key={i}>
                            <b>{o.group}</b> ({fmtInt(o.n)} casos)
                            {o.worst && (
                              <>
                                : {describeRate(o.worst.metric, fmtPct(o.worst.rate))}
                                {o.worst.refName ? <>, frente al {fmtPct(o.worst.refRate)} en {o.worst.refName} (referencia)</> : null}.
                                {Number.isFinite(o.worst.val) && o.worst.val > 0 && (
                                  <> Es {fmtTimes(o.worst.val >= 1 ? o.worst.val : 1 / o.worst.val)} veces {o.worst.val >= 1 ? 'más' : 'menos'}.</>
                                )}
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {d.partial.length > 0 && (
                      <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                        {d.partial.map((g: any, i: number) => (
                          <li key={i}>
                            {g.group}: muestra insuficiente para {g.rates.map((r: any) => `${r.label} (${evaluatedCases(r.m, fmtInt(r.n))})`).join(', ')}. No se usa en el veredicto.
                          </li>
                        ))}
                      </ul>
                    )}
                    {d.insufficient.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        No evaluados por tener pocos casos: {d.insufficient.map((g: any) => `${g.group} (${fmtInt(g.n)} casos${g.npos != null ? `, ${fmtInt(g.npos)} ${pos}` : ''})`).join(', ')}.
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


