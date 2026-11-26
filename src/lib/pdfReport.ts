import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { refMethodLabel, recommendedMetricName } from './referenceInfo';
import {
  RATE_NAME, RateKey, summaryRows, verdictSentence, isUnfair, positiveLabel, refGroupOf, attrRows, overallReason,
  fmtInt, fmtPct, fmtPts, fmtTimes, fmtTau, capitalize, totalCases,
} from './results';
import { orderClasses } from './classOrder';

/** Configuración elegida en el paso 3 (para la sección "Configuración usada"). */
export interface PdfConfig {
  fileName?: string;
  predictions?: string;
  actual?: string;
  /** Resultados completos (multiclase: para el veredicto considerando todas las clases). */
  fullResults?: any;
}

// Paleta "Civic Rose" (misma identidad de la herramienta / EIA).
const BURGUNDY: [number, number, number] = [122, 59, 72];   // #7A3B48
const ROSE: [number, number, number] = [192, 138, 147];     // #C08A93
const ROSE_TINT: [number, number, number] = [244, 228, 231];// #F4E4E7
const ROSE_PAPER: [number, number, number] = [251, 243, 244];// #FBF3F4
const PAPER: [number, number, number] = [250, 247, 244];    // #FAF7F4
const LINE: [number, number, number] = [229, 223, 215];     // #E5DFD7
const INK: [number, number, number] = [42, 38, 34];         // #2A2622
const MUTED: [number, number, number] = [90, 83, 76];       // #5A534C
const SUCCESS: [number, number, number] = [47, 107, 79];    // #2F6B4F
const DANGER: [number, number, number] = [176, 42, 58];     // rojo civic
const WARN: [number, number, number] = [162, 97, 31];       // ámbar de la paleta
const INFO: [number, number, number] = [90, 83, 76];        // neutro (ink60)

async function fetchPlot(url: string, body: unknown): Promise<string | null> {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.plot || null;
  } catch {
    return null;
  }
}


/** Genera y descarga un informe PDF con las tablas y gráficos del análisis. */
export async function generatePdfReport(
  results: any,
  BASE_API_URL: string,
  recommendedMetricKey: string | null = null,
  eda: any = null,
  config: PdfConfig = {},
): Promise<void> {
  const tables = results?.tables || {};
  const meta = results?.metadata || {};
  const bias: any[] = tables.bias_metrics || [];
  const gmp: any[] = tables.group_metrics_for_plotting || [];
  const summary: any[] = tables.fairness_summary || [];
  const mainMetric: RateKey | null = meta.main_metric ?? null;
  const shownRate: RateKey = mainMetric ?? 'fpr';
  const tau: number = meta.fairness_threshold ?? 1.25;
  const minN: number = meta.min_group_size ?? 50;
  const pos = positiveLabel(meta);
  const rateTitle = `${capitalize(RATE_NAME[shownRate].nombre)} (${RATE_NAME[shownRate].sigla})`;

  // Gráficos de la métrica principal: valores por grupo + disparidad.
  const [absPlot, dispPlot] = await Promise.all([
    fetchPlot(`${BASE_API_URL}/api/absolute_plot`, { group_metrics_for_plotting: gmp, metric: shownRate, attribute: 'all', class_label: meta.selected_class }),
    fetchPlot(`${BASE_API_URL}/api/rerender_plot`, { bias_metrics: bias, metrics: [`${shownRate}_disparity`], attributes: ['all'], class_label: meta.selected_class }),
  ]);

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;
  let y = M;

  // Fondo "paper" de la página actual (se repite en cada página nueva).
  const paintBg = () => {
    doc.setFillColor(...PAPER);
    doc.rect(0, 0, W, H, 'F');
  };
  const newPage = () => { doc.addPage(); paintBg(); y = M; };

  paintBg();

  // --- Encabezado (solo primera página) ---
  doc.setFont('courier', 'normal'); doc.setFontSize(8); doc.setTextColor(...ROSE);
  doc.text('HERRAMIENTAS · ALGORITMOS ÉTICOS', M, y + 4);
  doc.setFont('times', 'bold'); doc.setFontSize(22); doc.setTextColor(...INK);
  doc.text('Informe de Sesgo y Equidad', M, y + 26); y += 44;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...MUTED);
  doc.text(`GobLab UAI · Generado el ${new Date().toLocaleString('es-CL')}`, M, y); y += 24;

  // --- Página inicial: resultado del Análisis Exploratorio (EDA) ---
  const tableBaseEda = {
    styles: { lineColor: LINE, lineWidth: 0.5, textColor: INK as any, font: 'helvetica' },
    margin: { left: M, right: M },
  };
  if (eda) {
    doc.setFont('courier', 'normal'); doc.setFontSize(8); doc.setTextColor(...ROSE);
    doc.text('PASO 2 · EXPLORA TUS DATOS', M, y);
    doc.setFont('times', 'bold'); doc.setFontSize(16); doc.setTextColor(...INK);
    doc.text('Exploración de los datos', M, y + 18); y += 32;

    // Panorama general.
    autoTable(doc, {
      ...tableBaseEda,
      startY: y,
      head: [['Filas', 'Columnas', 'Celdas faltantes', 'Alertas detectadas']],
      body: [[
        Number(eda.n_rows).toLocaleString('es-CL'),
        String(eda.n_cols),
        `${eda.missing_cells_pct}%`,
        String((eda.alerts || []).length),
      ]],
      theme: 'grid',
      headStyles: { fillColor: BURGUNDY, textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 13, fontStyle: 'bold', halign: 'center' },
    });
    y = (doc as any).lastAutoTable.finalY + 22;

    // Alertas de calidad y posibles sesgos.
    const alerts: any[] = eda.alerts || [];
    if (alerts.length) {
      if (y > H - 120) newPage();
      doc.setFont('times', 'bold'); doc.setFontSize(13); doc.setTextColor(...INK);
      doc.text('Alertas de calidad y posibles sesgos', M, y); y += 8;
      const LEVEL: Record<string, string> = { critical: 'Crítica', warning: 'Advertencia', info: 'Informativa' };
      autoTable(doc, {
        ...tableBaseEda,
        startY: y,
        head: [['Nivel', 'Columnas', 'Descripción']],
        body: alerts.map((a) => [LEVEL[a.level] || a.level, (a.columns || []).join(', '), a.message]),
        theme: 'striped',
        headStyles: { fillColor: ROSE, textColor: INK, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: ROSE_TINT },
        columnStyles: { 0: { cellWidth: 72 }, 1: { cellWidth: 90 } },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const raw = data.cell.raw;
            data.cell.styles.textColor = raw === 'Crítica' ? DANGER : raw === 'Advertencia' ? WARN : INFO;
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });
      y = (doc as any).lastAutoTable.finalY + 22;
    }

    // Roles sugeridos de las columnas.
    const cols: any[] = eda.columns || [];
    if (cols.length) {
      if (y > H - 120) newPage();
      doc.setFont('times', 'bold'); doc.setFontSize(13); doc.setTextColor(...INK);
      doc.text('Roles de las columnas', M, y); y += 8;
      const ROLE: Record<string, string> = { prediction: 'predicción del modelo', actual: 'valor real', outcome: 'predicción o valor real', protected: 'variable protegida', id: 'identificador', unused: 'sin uso', feature: 'sin uso' };
      const DTYPE: Record<string, string> = { numeric: 'Numérica', categorical: 'Categórica', binary: 'Binaria' };
      autoTable(doc, {
        ...tableBaseEda,
        startY: y,
        head: [['Columna', 'Tipo', 'Rol sugerido', 'Únicos', '% faltantes']],
        body: cols.map((c) => [c.name, DTYPE[c.dtype] || c.dtype, ROLE[c.role_hint] || c.role_hint, String(c.unique), `${c.missing_pct}%`]),
        theme: 'striped',
        headStyles: { fillColor: BURGUNDY, textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: ROSE_PAPER },
      });
      y = (doc as any).lastAutoTable.finalY + 22;
    }

    // El análisis de sesgo/equidad empieza en una página nueva.
    newPage();
  }

  // Estilos comunes de tabla (líneas civic).
  // Nota: no pintamos el fondo en didDrawPage porque ese hook corre DESPUÉS de
  // dibujar la tabla y la taparía. El fondo se pinta al inicio y en newPage().
  const tableBase = {
    styles: { lineColor: LINE, lineWidth: 0.5, textColor: INK as any, font: 'helvetica' },
    margin: { left: M, right: M },
  };
  const sectionTitle = (eyebrow: string, title: string) => {
    if (y > H - 140) newPage();
    doc.setFont('courier', 'normal'); doc.setFontSize(8); doc.setTextColor(...ROSE);
    doc.text(eyebrow, M, y);
    doc.setFont('times', 'bold'); doc.setFontSize(15); doc.setTextColor(...INK);
    doc.text(title, M, y + 18); y += 30;
  };

  // --- Configuración usada ---
  const attrs: string[] = meta.protected_attributes || [...new Set(bias.map((r) => r.attribute_name))];
  const isMulti = meta.task_type === 'multiclass';
  const recName = recommendedMetricName(recommendedMetricKey);
  const configRows: [string, string][] = [
    ['Archivo', config.fileName || '—'],
    ['Casos analizados', fmtInt(totalCases(bias))],
    ['Predicción del modelo', config.predictions || '—'],
    ['Valor real', config.actual || '—'],
    ['Variables protegidas', attrs.join(', ') || '—'],
    ['Tipo de modelo', isMulti
      ? `Multiclase (${(meta.classes || []).length} clases) · cada clase se compara contra las demás`
      : 'Binario · Método: Aequitas'],
    [isMulti ? 'Clase de este informe' : 'Clase positiva', String(isMulti ? meta.selected_class ?? '—' : meta.positive_class ?? '1')],
    ['Métrica principal', mainMetric
      ? `${capitalize(RATE_NAME[mainMetric].nombre)} (${RATE_NAME[mainMetric].sigla})`
      : `Sin métrica elegida: el veredicto considera las 4 tasas de error${recName ? ` (la guía sugirió ${recName})` : ''}`],
    ['Tolerancia', `${fmtTimes(tau)} · equitativo entre ${fmtTau(tau)} veces la referencia`],
    ['Grupo de referencia', meta.ref_method === 'best_performance' ? 'grupo con menos errores' : refMethodLabel(meta.ref_method, meta.performance_metric)],
    ['Muestra mínima', `${fmtInt(minN)} casos evaluados por tasa`],
  ];
  sectionTitle('PASO 3 · CONFIGURACIÓN', 'Configuración usada');
  autoTable(doc, {
    ...tableBase,
    startY: y,
    body: configRows,
    theme: 'grid',
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 140, fontStyle: 'bold', textColor: BURGUNDY } },
    alternateRowStyles: { fillColor: ROSE_PAPER },
  });
  y = (doc as any).lastAutoTable.finalY + 26;

  // --- Veredicto por variable protegida ---
  sectionTitle('PASO 4 · RESULTADOS', isMulti ? `Veredicto para la clase ${meta.selected_class}` : 'Veredicto por variable protegida');
  autoTable(doc, {
    ...tableBase,
    startY: y,
    head: [['Variable', 'Veredicto', 'Explicación']],
    body: attrs.map((attr) => {
      const unfair = isUnfair(summary, attr);
      return [attr, unfair ? 'No equitativo' : 'Equitativo', verdictSentence(bias, attr, mainMetric, unfair, tau, minN, pos).text];
    }),
    theme: 'striped',
    headStyles: { fillColor: BURGUNDY, textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 80 } },
    alternateRowStyles: { fillColor: ROSE_PAPER },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        data.cell.styles.textColor = data.cell.raw === 'No equitativo' ? DANGER : SUCCESS;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  // Multiclase: veredicto considerando todas las clases.
  const full = config.fullResults;
  if (isMulti && Array.isArray(full?.fairness_overall) && full.fairness_overall.length) {
    const classes = orderClasses(full.metadata?.classes || []);
    if (y > H - 100) newPage();
    doc.setFont('times', 'bold'); doc.setFontSize(12); doc.setTextColor(...INK);
    doc.text(`Veredicto considerando las ${classes.length} clases`, M, y); y += 8;
    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [['Variable', 'Veredicto', 'Motivo']],
      body: full.fairness_overall.map((row: any) => {
        const attr = row['Atributo'] ?? row.attribute_name;
        const unfair = isUnfair(full.fairness_overall, attr);
        const why = unfair ? overallReason(full.by_class, classes, attr, mainMetric, tau, minN) : null;
        return [attr, unfair ? 'No equitativo' : 'Equitativo', why ? capitalize(why) + '.' : '—'];
      }),
      theme: 'striped',
      headStyles: { fillColor: ROSE, textColor: INK, fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 80 } },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          data.cell.styles.textColor = data.cell.raw === 'No equitativo' ? DANGER : SUCCESS;
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text('Una variable es no equitativa si lo es en al menos una clase.', M, y + 8);
    y += 22;
  }

  // --- Tabla resumida (6 columnas) por variable ---
  y += 8;
  if (y > H - 140) newPage();
  doc.setFont('times', 'bold'); doc.setFontSize(14); doc.setTextColor(...INK);
  doc.text(`Resultados por grupo · ${rateTitle}`, M, y); y += 12;
  for (const attr of attrs) {
    const rows = summaryRows(bias, attr, shownRate, tau, minN, pos);
    if (!rows.length) continue;
    if (y > H - 120) newPage();
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...INK);
    doc.text(`${attr} · ${rateTitle} · Referencia: ${refGroupOf(attrRows(bias, attr), shownRate) ?? '—'} · Tolerancia ${fmtTau(tau)}`, M, y + 4);
    y += 8;
    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [['Grupo', 'Casos evaluados', `Tasa ${RATE_NAME[shownRate].sigla}`, 'Diferencia con la referencia', 'Veces la referencia', 'Resultado']],
      body: rows.map((r) => [
        r.group, fmtInt(r.n), fmtPct(r.rate), r.isRef ? '—' : fmtPts(r.diffPts), r.isRef ? '1,00×' : fmtTimes(r.times), r.result,
      ]),
      theme: 'grid',
      headStyles: { fillColor: ROSE, textColor: INK, fontSize: 8.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { cellWidth: 150 } },
      alternateRowStyles: { fillColor: ROSE_TINT },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const raw = String(data.cell.raw);
          if (raw.startsWith('Fuera')) { data.cell.styles.textColor = DANGER; data.cell.styles.fontStyle = 'bold'; }
          else if (raw.startsWith('Dentro')) data.cell.styles.textColor = SUCCESS;
          else data.cell.styles.textColor = MUTED;
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 16;
  }
  if (y > H - 60) newPage();
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...MUTED);
  doc.text(`Diferencia en puntos porcentuales respecto de la referencia. 2,00× = el doble de errores; 0,50× = la mitad. Menos de ${fmtInt(minN)} casos evaluados = muestra insuficiente (no cuenta para el veredicto).`, M, y, { maxWidth: W - 2 * M });
  y += 24;

  // --- Gráficos (al final) ---
  const addPlot = (title: string, dataUri: string | null) => {
    if (!dataUri) return;
    const props = doc.getImageProperties(dataUri);
    const imgW = W - 2 * M;
    const imgH = (props.height / props.width) * imgW;
    if (y + imgH + 30 > H - M) newPage();
    doc.setFont('times', 'bold'); doc.setFontSize(12); doc.setTextColor(...INK);
    doc.text(title, M, y); y += 14;
    doc.addImage(dataUri, 'PNG', M, y, imgW, imgH); y += imgH + 24;
  };
  if (absPlot || dispPlot) {
    newPage();
    doc.setFont('times', 'bold'); doc.setFontSize(15); doc.setTextColor(...INK);
    doc.text('Gráficos del análisis', M, y); y += 22;
    addPlot(`${rateTitle} por grupo`, absPlot);
    addPlot(`Disparidad en ${RATE_NAME[shownRate].nombre} (veces la referencia)`, dispPlot);
  }

  // --- Anexo: detalle técnico por grupo ---
  if (bias.length) {
    newPage();
    sectionTitle('ANEXO', 'Detalle técnico por grupo');
    const counts: [string, string][] = [['pp', 'Pred. +'], ['pn', 'Pred. -'], ['fp', 'FP'], ['fn', 'FN'], ['tp', 'VP'], ['tn', 'VN'], ['group_size', 'Tamaño']];
    const rates: [string, string][] = [['tpr', 'TPR'], ['tnr', 'TNR'], ['npv', 'NPV'], ['precision', 'PPV'], ['accuracy', 'Exactitud'], ['prev', 'Prevalencia']];
    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [['Variable', 'Grupo', ...counts.map(([, l]) => l), ...rates.map(([, l]) => l)]],
      body: bias.map((r) => [
        r.attribute_name, String(r.attribute_value),
        ...counts.map(([k]) => fmtInt(r[k])), ...rates.map(([k]) => fmtPct(r[k])),
      ]),
      theme: 'grid',
      headStyles: { fillColor: BURGUNDY, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7 },
      alternateRowStyles: { fillColor: ROSE_PAPER },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(...MUTED);
    doc.text('FP/FN = falsos positivos/negativos · VP/VN = verdaderos positivos/negativos · TPR = 1 - FNR · TNR = 1 - FPR · NPV = 1 - FOR · PPV = 1 - FDR.', M, y + 6, { maxWidth: W - 2 * M });
  }

  // --- Barra superior de marca + pie de página en TODAS las páginas ---
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    // Barra burdeos superior.
    doc.setFillColor(...BURGUNDY);
    doc.rect(0, 0, W, 5, 'F');
    // Regla y pie.
    doc.setDrawColor(...LINE); doc.setLineWidth(0.5);
    doc.line(M, H - 30, W - M, H - 30);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text('GobLab UAI · Análisis de Sesgos y Equidad', M, H - 18);
    doc.text(`Página ${i} de ${pages}`, W - M, H - 18, { align: 'right' });
  }

  doc.save('informe-sesgo-equidad.pdf');
}
