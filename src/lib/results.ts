// Lógica compartida de la pantalla de resultados, la tabla resumida y el PDF
// (hoja "Tabla" del Excel MSE: T1–T7). Trabaja sobre las filas de bias_metrics.
import { METRIC_TRANSLATIONS } from '../constants';
import { fmtInt, fmtPct } from './format';

export { fmtInt, fmtPct };

export type RateKey = 'fpr' | 'fnr' | 'for' | 'fdr';
export const RATES: RateKey[] = ['fpr', 'fnr', 'for', 'fdr'];

export const RATE_NAME: Record<RateKey, { sigla: string; nombre: string }> = {
  fpr: { sigla: 'FPR', nombre: 'tasa de falsos positivos' },
  fnr: { sigla: 'FNR', nombre: 'tasa de falsos negativos' },
  for: { sigla: 'FOR', nombre: 'tasa de falsas omisiones' },
  fdr: { sigla: 'FDR', nombre: 'tasa de falsos descubrimientos' },
};

// Mismo denominador que el backend (EVALUATED_CASES_COL).
const DENOMINATOR: Record<RateKey, string> = { fpr: 'group_label_neg', fnr: 'group_label_pos', fdr: 'pp', for: 'pn' };

const nf = (d: number) => new Intl.NumberFormat('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtTimes = (v: unknown) =>
  v == null || !Number.isFinite(Number(v)) ? '—' : `${nf(2).format(Number(v))}×`;
export const fmtPts = (v: number | null) =>
  v == null || Number.isNaN(v) ? '—' : `${v > 0 ? '+' : ''}${nf(1).format(v)} pts`;
export const fmtTau = (tau: number) => `${nf(2).format(1 / tau)}–${nf(2).format(tau)}`;
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Etiqueta de la métrica principal que viene de la guía (3c), o null. */
export function mainMetricFromGuide(recommended: string | null | undefined): RateKey | null {
  const base = recommended?.replace('_disparity', '');
  // Las tasas complementarias apuntan al mismo error: TPR = 1 − FNR, etc.
  const map: Record<string, RateKey> = { fpr: 'fpr', fnr: 'fnr', for: 'for', fdr: 'fdr', tpr: 'fnr', tnr: 'fpr', npv: 'for', precision: 'fdr' };
  return base && map[base] ? map[base] : null;
}

/** Cómo llamar a los casos positivos: la clase vista (multiclase), la positiva de texto o "positivos". */
export function positiveLabel(meta: any): string {
  if (meta?.selected_class) return String(meta.selected_class);
  const p = meta?.positive_class;
  return p != null && p !== '1' && p !== '0' ? String(p) : 'positivos';
}

export function evaluatedCasesText(m: RateKey, n: unknown, pos: string): string {
  const k = fmtInt(n as number);
  switch (m) {
    case 'fpr': return `${k} casos que no eran ${pos}`;
    case 'fnr': return `${k} casos ${pos}`;
    case 'for': return `${k} casos descartados`;
    case 'fdr': return `${k} casos marcados como ${pos}`;
  }
}

export interface SummaryRow {
  group: string;
  n: number | null;          // casos evaluados (denominador de la tasa)
  rate: number | null;
  diffPts: number | null;    // tasa del grupo − tasa de la referencia, en puntos
  times: number | null;      // disparidad (veces la referencia)
  isRef: boolean;
  insufficient: boolean;
  result: string;
  outOfRange: boolean;
}

export const attrRows = (bias: any[], attr: string) => bias.filter((r) => r.attribute_name === attr);
export const refGroupOf = (rows: any[], m: RateKey): string | null =>
  rows.length ? (rows[0][`${m}_ref_group_value`] ?? null) : null;

/** Filas de la tabla resumida (6 columnas) de una variable para la tasa m. */
export function summaryRows(bias: any[], attr: string, m: RateKey, tau: number, minN: number, pos: string): SummaryRow[] {
  const rows = attrRows(bias, attr);
  const ref = refGroupOf(rows, m);
  const refRow = rows.find((r) => String(r.attribute_value) === String(ref));
  const refRate = refRow ? Number(refRow[m]) : null;
  const lower = 1 / tau;
  return rows.map((r) => {
    const n = r[`${m}_n_eval`] ?? r[DENOMINATOR[m]] ?? null;
    const insufficient = r[`${m}_insufficient`] ?? (n != null && Number(n) < minN);
    const rate = r[m] == null ? null : Number(r[m]);
    const times = r[`${m}_disparity`] == null ? null : Number(r[`${m}_disparity`]);
    const isRef = String(r.attribute_value) === String(ref);
    const diffPts = rate != null && refRate != null ? (rate - refRate) * 100 : null;
    let result: string;
    let outOfRange = false;
    if (isRef) result = 'Referencia';
    else if (insufficient) result = `Muestra insuficiente (${evaluatedCasesText(m, n, pos)})`;
    else if (times == null || Number.isNaN(times)) result = 'Sin dato';
    else if (times > tau) { result = 'Fuera del rango · más errores que la referencia'; outOfRange = true; }
    else if (times < lower) { result = 'Fuera del rango · menos errores que la referencia'; outOfRange = true; }
    else result = 'Dentro del rango';
    return { group: String(r.attribute_value), n: n == null ? null : Number(n), rate, diffPts, times, isRef, insufficient: !!insufficient && !isRef, result, outOfRange };
  });
}

/** Grupo con la tasa más alta y más baja (solo grupos con muestra suficiente). */
function extremes(rows: SummaryRow[]) {
  const valid = rows.filter((r) => !r.insufficient && r.rate != null);
  if (valid.length < 2) return null;
  const hi = valid.reduce((a, b) => (b.rate! > a.rate! ? b : a));
  const lo = valid.reduce((a, b) => (b.rate! < a.rate! ? b : a));
  return { hi, lo };
}

/**
 * Frase del veredicto (plantilla de la hoja "Tabla"):
 * "[Grupo con la tasa más alta] tiene la mayor [métrica]: x%, frente a y% de [grupo con la más baja] (z veces)."
 * Sin métrica principal se explica con la tasa de error más dispar entre las que quedan fuera del rango.
 */
export function verdictSentence(
  bias: any[], attr: string, mainMetric: RateKey | null, unfair: boolean, tau: number, minN: number, pos: string,
): { metric: RateKey | null; text: string } {
  let metric: RateKey | null = mainMetric;
  if (!metric) {
    const candidates = RATES.map((m) => {
      const rows = summaryRows(bias, attr, m, tau, minN, pos);
      const ex = extremes(rows);
      const spread = ex && ex.lo.rate! > 0 ? ex.hi.rate! / ex.lo.rate! : ex ? Infinity : 0;
      return { m, spread, out: rows.some((r) => r.outOfRange) };
    }).filter((c) => (unfair ? c.out : true));
    if (!unfair) return { metric: null, text: 'Las cuatro tasas de error están dentro del rango de tolerancia en todos los grupos con casos suficientes.' };
    candidates.sort((a, b) => b.spread - a.spread);
    metric = candidates[0]?.m ?? null;
  }
  if (!metric) return { metric: null, text: '' };
  const ex = extremes(summaryRows(bias, attr, metric, tau, minN, pos));
  if (!ex) return { metric, text: 'No hay suficientes grupos con casos para comparar.' };
  const ratio = ex.lo.rate! > 0 ? ` (${nf(2).format(ex.hi.rate! / ex.lo.rate!)} veces)` : '';
  return {
    metric,
    text: `${ex.hi.group} tiene la mayor ${RATE_NAME[metric].nombre}: ${fmtPct(ex.hi.rate)}, frente a ${fmtPct(ex.lo.rate)} de ${ex.lo.group}${ratio}.`,
  };
}

/** ¿El atributo es no equitativo según el resumen del backend? */
export function isUnfair(summary: any[], attr: string): boolean {
  const row = summary.find((r) => (r['Atributo'] ?? r.attribute_name) === attr);
  const v = row?.['Conclusión Equidad'] ?? row?.fairness_conclusion;
  return v === 'Unfair' || v === 'No Equitativo';
}

/** Explicación corta del veredicto global multiclase para un atributo. */
export function overallReason(byClass: Record<string, any>, classes: string[], attr: string, mainMetric: RateKey | null, tau: number, minN: number): string | null {
  for (const c of classes) {
    const t = byClass?.[c]?.tables;
    if (!t || !isUnfair(t.fairness_summary || [], attr)) continue;
    const bias = t.bias_metrics || [];
    const metrics = mainMetric ? [mainMetric] : RATES;
    let best: { m: RateKey; row: SummaryRow; dev: number; ref: string } | null = null;
    for (const m of metrics) {
      const rows = summaryRows(bias, attr, m, tau, minN, c);
      const ref = refGroupOf(attrRows(bias, attr), m) || '';
      for (const r of rows) {
        if (!r.outOfRange || r.times == null || r.times <= 0) continue;
        const dev = Math.max(r.times, 1 / r.times);
        if (!best || dev > best.dev) best = { m, row: r, dev, ref };
      }
    }
    if (best) {
      return `en la clase ${c}: ${best.row.group} tiene ${nf(2).format(best.row.times!)} veces la ${RATE_NAME[best.m].nombre} de ${best.ref}`;
    }
  }
  return null;
}

/** Total de casos del archivo (igual en todas las filas). */
export const totalCases = (bias: any[]) => (bias[0]?.total_entities ?? null);

/** CSV con todas las columnas de bias_metrics (incluidas las que no se muestran en pantalla). */
export function biasMetricsCsv(bias: any[]): string {
  if (!bias.length) return '';
  const keys = Object.keys(bias[0]);
  const cell = (v: unknown) => {
    if (v == null) return '';
    if (typeof v === 'number') return Number.isFinite(v) ? String(v).replace('.', ',') : '';
    const s = String(v);
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = keys.map((k) => cell(METRIC_TRANSLATIONS[k] || k)).join(';');
  const body = bias.map((r) => keys.map((k) => cell(r[k])).join(';')).join('\n');
  return `﻿${head}\n${body}\n`; // BOM: Excel abre bien los acentos
}

export function downloadText(filename: string, text: string, mime = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
