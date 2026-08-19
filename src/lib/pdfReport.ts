import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { referenceByAttribute, refMethodLabel, recommendedMetricName } from './referenceInfo';

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

const num = (v: unknown) => (typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(3)) : (v ?? '—'));
const verdict = (v: unknown) => (v === 'Unfair' || v === 'No Equitativo' ? 'No Equitativo' : v === 'Fair' || v === 'Equitativo' ? 'Equitativo' : String(v ?? '—'));

/** Genera y descarga un informe PDF con las tablas y gráficos del análisis. */
export async function generatePdfReport(
  results: any,
  BASE_API_URL: string,
  recommendedMetricKey: string | null = null,
): Promise<void> {
  const tables = results?.tables || {};
  const meta = results?.metadata || {};
  const bias: any[] = tables.bias_metrics || [];
  const gmp: any[] = tables.group_metrics_for_plotting || [];
  const summary: any[] = tables.fairness_summary || [];

  // Gráficos (basados en FPR): valores absolutos + disparidad.
  const [absPlot, dispPlot] = await Promise.all([
    fetchPlot(`${BASE_API_URL}/api/absolute_plot`, { group_metrics_for_plotting: gmp, metric: 'fpr', attribute: 'all' }),
    fetchPlot(`${BASE_API_URL}/api/rerender_plot`, { bias_metrics: bias, metrics: ['fpr_disparity'], attributes: ['all'] }),
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
  doc.text(`GobLab UAI · Generado el ${new Date().toLocaleString('es-CL')}`, M, y); y += 22;

  // --- Métrica recomendada a observar (si se usó el árbol del Paso 2) ---
  const recName = recommendedMetricName(recommendedMetricKey);
  if (recName) {
    const boxH = 40;
    doc.setFillColor(...ROSE_PAPER); doc.setDrawColor(...ROSE);
    doc.roundedRect(M, y, W - 2 * M, boxH, 4, 4, 'FD');
    doc.setFont('courier', 'normal'); doc.setFontSize(8); doc.setTextColor(...BURGUNDY);
    doc.text('MÉTRICA RECOMENDADA A OBSERVAR', M + 12, y + 15);
    doc.setFont('times', 'bold'); doc.setFontSize(13); doc.setTextColor(...INK);
    doc.text(recName, M + 12, y + 31);
    y += boxH + 18;
  }

  // Estilos comunes de tabla (líneas civic).
  // Nota: no pintamos el fondo en didDrawPage porque ese hook corre DESPUÉS de
  // dibujar la tabla y la taparía. El fondo se pinta al inicio y en newPage().
  const tableBase = {
    styles: { lineColor: LINE, lineWidth: 0.5, textColor: INK as any, font: 'helvetica' },
    margin: { left: M, right: M },
  };

  // --- Resumen del análisis ---
  const gc0 = tables.group_counts?.[0] || {};
  const nFilas = gc0['Total Entidades'] ?? gc0['total_entities'] ?? '—';
  const tau = meta.fairness_threshold ?? 1.25;
  const resumen: [string, string][] = [
    ['Registros analizados', String(nFilas)],
    ['Variables protegidas', (meta.protected_attributes || []).join(', ') || '—'],
    ['Tolerancia de disparidad', `${Number(tau).toFixed(2)}×  (equitativo entre ${(1 / tau).toFixed(2)} y ${Number(tau).toFixed(2)})`],
    ['Grupo de referencia', refMethodLabel(meta.ref_method, meta.performance_metric)],
    ['Muestra mínima por subgrupo', String(meta.min_group_size ?? 50)],
    ['Tipo de modelo', meta.task_type === 'multiclass' ? `Multiclase — clase: ${meta.selected_class ?? ''}` : 'Binario'],
  ];
  autoTable(doc, {
    ...tableBase,
    startY: y,
    head: [['Parámetro', 'Valor']],
    body: resumen,
    theme: 'grid',
    headStyles: { fillColor: BURGUNDY, textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: ROSE_PAPER },
  });
  y = (doc as any).lastAutoTable.finalY + 26;

  // --- Resumen de Equidad por Atributo ---
  if (y > H - 120) newPage();
  doc.setFont('times', 'bold'); doc.setFontSize(14); doc.setTextColor(...INK);
  doc.text('Resumen de Equidad por Atributo', M, y); y += 10;
  autoTable(doc, {
    ...tableBase,
    startY: y,
    head: [['Atributo', 'Conclusión']],
    body: summary.map((r) => [r['Atributo'] ?? r.attribute_name, verdict(r['Conclusión Equidad'] ?? r.fairness_conclusion)]),
    theme: 'striped',
    headStyles: { fillColor: BURGUNDY, textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: ROSE_PAPER },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        data.cell.styles.textColor = data.cell.raw === 'No Equitativo' ? DANGER : SUCCESS;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 26;

  // --- Grupo de referencia por atributo ---
  const attrs: string[] = meta.protected_attributes || [...new Set(bias.map((r) => r.attribute_name))];
  const refs = referenceByAttribute(bias, attrs);
  if (refs.length) {
    if (y > H - 120) newPage();
    doc.setFont('times', 'bold'); doc.setFontSize(14); doc.setTextColor(...INK);
    doc.text('Grupo de referencia por atributo', M, y); y += 6;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
    doc.text(`Método: ${refMethodLabel(meta.ref_method, meta.performance_metric)}. Cada subgrupo se compara con su referencia (vale 1.00).`, M, y + 8); y += 16;
    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [['Atributo', 'Grupo de referencia']],
      body: refs.map((r) => [
        r.attribute,
        r.group ?? (Object.entries(r.perMetric).map(([m, g]) => `${m.toUpperCase()}: ${g}`).join('  ·  ') || '—'),
      ]),
      theme: 'striped',
      headStyles: { fillColor: BURGUNDY, textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: ROSE_PAPER },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          data.cell.styles.textColor = BURGUNDY;
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 26;
  }

  // --- Disparidades por subgrupo (por atributo) ---
  for (const attr of attrs) {
    const rows = bias.filter((r) => r.attribute_name === attr);
    if (!rows.length) continue;
    if (y > H - 140) newPage();
    doc.setFont('times', 'bold'); doc.setFontSize(12); doc.setTextColor(...INK);
    doc.text(`Disparidades — ${attr}`, M, y); y += 8;
    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [['Subgrupo', 'n', 'FPR', 'FNR', 'FOR', 'FDR', 'Conclusión']],
      body: rows.map((r) => [
        String(r.attribute_value) + (r.insufficient_sample ? ' *' : ''),
        num(r.group_size),
        num(r.fpr_disparity), num(r.fnr_disparity), num(r.for_disparity), num(r.fdr_disparity),
        verdict(r.fairness_conclusion),
      ]),
      theme: 'grid',
      headStyles: { fillColor: ROSE, textColor: INK, fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8.5 },
      alternateRowStyles: { fillColor: ROSE_TINT },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          data.cell.styles.textColor = data.cell.raw === 'No Equitativo' ? DANGER : SUCCESS;
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 18;
  }
  if (y > H - 60) newPage();
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...MUTED);
  doc.text('Valores = disparidad respecto al grupo de referencia (1.00 = sin diferencia). * muestra insuficiente (no afecta el veredicto).', M, y);
  y += 20;

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
    addPlot('Valores absolutos — Tasa de Falsos Positivos (FPR)', absPlot);
    addPlot('Disparidad — Tasa de Falsos Positivos (FPR)', dispPlot);
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
