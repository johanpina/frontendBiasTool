import React, { useEffect, useState } from 'react';
import { AbsolutePlotter } from './bias-analysis/AbsolutePlotter';
import {
  RATES, RATE_NAME, RateKey, summaryRows, verdictSentence, isUnfair, positiveLabel, refGroupOf, attrRows,
  fmtInt, fmtPct, fmtPts, fmtTimes, fmtTau, capitalize,
} from '../lib/results';

interface EquidadTabContentProps {
  results: any;
  BASE_API_URL: string;
  /** Métrica principal elegida en 3c (null = las cuatro tasas). */
  mainMetric: RateKey | null;
  /** Abre la pestaña de detalle técnico. */
  onShowDetail: () => void;
}

const RESULT_TONE = (r: { isRef: boolean; insufficient: boolean; outOfRange: boolean }) =>
  r.isRef ? 'text-ink-60' : r.insufficient ? 'text-ink-40' : r.outOfRange ? 'text-red-700 font-semibold' : 'text-emerald-700';

/** Pestaña "Veredicto y resumen": veredicto por variable, tabla de 6 columnas y gráfico (T1–T7). */
export const EquidadTabContent: React.FC<EquidadTabContentProps> = ({ results, BASE_API_URL, mainMetric, onShowDetail }) => {
  const [rate, setRate] = useState<RateKey>(mainMetric ?? 'fpr');
  useEffect(() => { setRate(mainMetric ?? 'fpr'); }, [mainMetric]);
  if (!results) return null;

  const meta = results.metadata || {};
  const bias: any[] = results.tables?.bias_metrics || [];
  const summary: any[] = results.tables?.fairness_summary || [];
  const attrs: string[] = meta.protected_attributes || [];
  const tau: number = meta.fairness_threshold ?? 1.25;
  const minN: number = meta.min_group_size ?? 50;
  const pos = positiveLabel(meta);

  return (
    <div className="space-y-8">
      {/* --- 2. Veredicto: una tarjeta por variable protegida --- */}
      <section>
        <h3 className="font-display text-xl font-semibold text-ink mb-3">
          {meta.selected_class ? <>Veredicto para la clase {meta.selected_class}</> : 'Veredicto'}
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {attrs.map((attr) => {
            const unfair = isUnfair(summary, attr);
            const { text } = verdictSentence(bias, attr, mainMetric, unfair, tau, minN, pos);
            return (
              <div
                key={attr}
                className={`bg-white rounded-xl border p-4 border-l-4 ${unfair ? 'border-l-red-500 border-rose-light' : 'border-l-emerald-500 border-rose-light'}`}
              >
                <p className="font-semibold text-ink">
                  {attr} —{' '}
                  <span className={unfair ? 'text-red-700' : 'text-emerald-700'}>{unfair ? 'No equitativo' : 'Equitativo'}</span>
                </p>
                {text && <p className="text-sm text-ink-80 mt-1">{text}</p>}
                <a href={`#tabla-${attr}`} className="inline-block mt-2 text-sm font-semibold text-burgundy hover:underline">
                  Ver detalle de {attr}
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- 3. Tabla resumida (6 columnas) por variable protegida --- */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-ink">Resultados por grupo</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm" role="group" aria-label="Ver otra tasa de error">
            <span className="text-ink-60">Ver otra tasa de error:</span>
            {RATES.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={rate === m}
                onClick={() => setRate(m)}
                className={`px-3 py-1 rounded-full border font-mono text-xs font-semibold ${
                  rate === m ? 'bg-burgundy text-white border-burgundy' : 'bg-white text-ink-80 border-rose-light hover:border-burgundy'
                }`}
              >
                {RATE_NAME[m].sigla}{m === mainMetric ? ' · principal' : ''}
              </button>
            ))}
          </div>
        </div>

        {attrs.map((attr) => {
          const rows = summaryRows(bias, attr, rate, tau, minN, pos);
          const ref = refGroupOf(attrRows(bias, attr), rate);
          return (
            <div key={attr} id={`tabla-${attr}`} className="bg-white rounded-xl border border-rose-light overflow-hidden scroll-mt-32">
              <p className="px-4 py-3 text-sm text-ink-80 border-b border-rose-light bg-indigo-50">
                <b>{attr}</b> · {capitalize(RATE_NAME[rate].nombre)} ({RATE_NAME[rate].sigla}) · Referencia: <b>{ref ?? '—'}</b> · Tolerancia {fmtTau(tau)}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-ink-60">
                      <th className="px-4 py-2 font-semibold">Grupo</th>
                      <th className="px-4 py-2 font-semibold text-right">Casos evaluados</th>
                      <th className="px-4 py-2 font-semibold text-right">Tasa {RATE_NAME[rate].sigla}</th>
                      <th className="px-4 py-2 font-semibold text-right">Diferencia con la referencia</th>
                      <th className="px-4 py-2 font-semibold text-right">Veces la referencia</th>
                      <th className="px-4 py-2 font-semibold">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.group} className="border-t border-line tabular-nums">
                        <td className="px-4 py-2 font-medium text-ink">{r.group}</td>
                        <td className="px-4 py-2 text-right">{fmtInt(r.n)}</td>
                        <td className="px-4 py-2 text-right">{fmtPct(r.rate)}</td>
                        <td className="px-4 py-2 text-right">{r.isRef ? '—' : fmtPts(r.diffPts)}</td>
                        <td className="px-4 py-2 text-right">{r.isRef ? '1,00×' : fmtTimes(r.times)}</td>
                        <td className={`px-4 py-2 ${RESULT_TONE(r)}`}>{r.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        <p className="text-xs text-ink-60">
          Diferencia en puntos porcentuales respecto del grupo de referencia. Veces la referencia: 2,00× = el doble de
          errores; 0,50× = la mitad. Un grupo con menos de {fmtInt(minN)} casos evaluados no cuenta para el veredicto.
        </p>
      </section>

      {/* --- 4. Gráfico de la métrica por grupo --- */}
      <AbsolutePlotter
        groupMetrics={results.tables.group_metrics_for_plotting}
        protectedAttributes={attrs}
        BASE_API_URL={BASE_API_URL}
        classLabel={meta.selected_class}
        metricKey={rate}
        title={`${capitalize(RATE_NAME[rate].nombre)} por grupo`}
      />

      {/* --- 5. Detalle técnico (otra pestaña) --- */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onShowDetail}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-rose-light bg-white text-burgundy font-semibold hover:border-burgundy"
        >
          ▸ Ver matriz de confusión y todas las métricas
        </button>
      </div>
    </div>
  );
};
