import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const INDIGO: [number, number, number] = [79, 70, 229];
const INK: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [107, 114, 128];

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
export async function generatePdfReport(results: any, BASE_API_URL: string): Promise<void> {
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

  // --- Encabezado ---
  doc.setFillColor(...INDIGO);
  doc.rect(0, 0, W, 6, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(...INK);
  doc.text('Informe de Sesgo y Equidad', M, y + 20); y += 38;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...MUTED);
  doc.text(`GobLab UAI · Generado el ${new Date().toLocaleString('es-CL')}`, M, y); y += 22;

  // --- Resumen del análisis ---
  const gc0 = tables.group_counts?.[0] || {};
  const nFilas = gc0['Total Entidades'] ?? gc0['total_entities'] ?? '—';
  const tau = meta.fairness_threshold ?? 1.25;
  const resumen: [string, string][] = [
    ['Registros analizados', String(nFilas)],
    ['Variables protegidas', (meta.protected_attributes || []).join(', ') || '—'],
    ['Tolerancia de disparidad', `${Number(tau).toFixed(2)}×  (equitativo entre ${(1 / tau).toFixed(2)} y ${Number(tau).toFixed(2)})`],
    ['Muestra mínima por subgrupo', String(meta.min_group_size ?? 50)],
    ['Tipo de modelo', meta.task_type === 'multiclass' ? `Multiclase — clase: ${meta.selected_class ?? ''}` : 'Binario'],
  ];
  autoTable(doc, {
    startY: y,
    head: [['Parámetro', 'Valor']],
    body: resumen,
    theme: 'grid',
    headStyles: { fillColor: INDIGO, fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: INK },
    margin: { left: M, right: M },
  });
  y = (doc as any).lastAutoTable.finalY + 24;

  // --- Resumen de Equidad por Atributo ---
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...INK);
  doc.text('Resumen de Equidad por Atributo', M, y); y += 8;
  autoTable(doc, {
    startY: y,
    head: [['Atributo', 'Conclusión']],
    body: summary.map((r) => [r['Atributo'] ?? r.attribute_name, verdict(r['Conclusión Equidad'] ?? r.fairness_conclusion)]),
    theme: 'striped',
    headStyles: { fillColor: INDIGO, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        data.cell.styles.textColor = data.cell.raw === 'No Equitativo' ? [208, 59, 59] : [12, 163, 12];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: M, right: M },
  });
  y = (doc as any).lastAutoTable.finalY + 24;

  // --- Disparidades por subgrupo (por atributo) ---
  const attrs: string[] = meta.protected_attributes || [...new Set(bias.map((r) => r.attribute_name))];
  for (const attr of attrs) {
    const rows = bias.filter((r) => r.attribute_name === attr);
    if (!rows.length) continue;
    if (y > H - 140) { doc.addPage(); y = M; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...INK);
    doc.text(`Disparidades — ${attr}`, M, y); y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Subgrupo', 'n', 'FPR', 'FNR', 'FOR', 'FDR', 'Conclusión']],
      body: rows.map((r) => [
        String(r.attribute_value) + (r.insufficient_sample ? ' *' : ''),
        num(r.group_size),
        num(r.fpr_disparity), num(r.fnr_disparity), num(r.for_disparity), num(r.fdr_disparity),
        verdict(r.fairness_conclusion),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [55, 65, 81], fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: INK },
      margin: { left: M, right: M },
    });
    y = (doc as any).lastAutoTable.finalY + 18;
  }
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...MUTED);
  doc.text('Valores = disparidad respecto al grupo de referencia (1.00 = sin diferencia). * muestra insuficiente (no afecta el veredicto).', M, y);
  y += 20;

  // --- Gráficos (al final) ---
  const addPlot = (title: string, dataUri: string | null) => {
    if (!dataUri) return;
    const props = doc.getImageProperties(dataUri);
    const imgW = W - 2 * M;
    const imgH = (props.height / props.width) * imgW;
    if (y + imgH + 30 > H - M) { doc.addPage(); y = M; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...INK);
    doc.text(title, M, y); y += 12;
    doc.addImage(dataUri, 'PNG', M, y, imgW, imgH); y += imgH + 24;
  };
  if (absPlot || dispPlot) {
    doc.addPage(); y = M;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(...INK);
    doc.text('Gráficos del análisis', M, y); y += 20;
    addPlot('Valores absolutos — Tasa de Falsos Positivos (FPR)', absPlot);
    addPlot('Disparidad — Tasa de Falsos Positivos (FPR)', dispPlot);
  }

  // Pie de página con numeración.
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text(`Página ${i} de ${pages}`, W - M, H - 20, { align: 'right' });
  }

  doc.save('informe-sesgo-equidad.pdf');
}
