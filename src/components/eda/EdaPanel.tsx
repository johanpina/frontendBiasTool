import React, { useMemo, useState } from 'react';
import {
  AlertTriangle, AlertOctagon, Info, Database, Columns3, CircleSlash2,
  ShieldAlert, BarChart3, Loader2, LayoutGrid, GitCompareArrows, ScatterChart,
} from 'lucide-react';
import { EdaResult, EdaAlert } from '../../types';
import { AssociationHeatmap } from './AssociationHeatmap';
import { ColumnCard } from './ColumnCard';
import { DistributionExplorer } from './DistributionExplorer';
import { BivariateExplorer } from './BivariateExplorer';
import { IntersectionHeatmap } from './IntersectionHeatmap';
import { STATUS } from '../../lib/vizPalette';

interface Props {
  eda: EdaResult | null;
  loading: boolean;
  error: string | null;
}

const ALERT_STYLE: Record<string, { border: string; bg: string; icon: React.ReactNode }> = {
  critical: { border: '#d03b3b', bg: '#fef2f2', icon: <AlertOctagon size={18} color={STATUS.critical} /> },
  warning: { border: '#fab219', bg: '#fffbeb', icon: <AlertTriangle size={18} color="#b45309" /> },
  info: { border: '#2a78d6', bg: '#eff6ff', icon: <Info size={18} color={STATUS.info} /> },
};

// Tonos de la paleta Civic Rose, distinguibles entre sí:
// resultado = verde éxito · protegida = burdeos · atributo = ámbar · id = neutro.
const ROLE_LABEL: Record<string, { label: string; className: string }> = {
  outcome: { label: 'resultado', className: 'bg-[#E7F0EA] text-[#2F6B4F]' },
  protected: { label: 'protegida', className: 'bg-rose-tint text-burgundy' },
  id: { label: 'identificador', className: 'bg-paper-deep text-ink-40' },
  feature: { label: 'atributo', className: 'bg-[#F6EADB] text-[#A2611F]' },
};

const StatTile: React.FC<{ icon: React.ReactNode; value: React.ReactNode; label: string; accent?: string }> =
  ({ icon, value, label, accent }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
    <div className="p-2 rounded-lg" style={{ backgroundColor: accent || '#eef2ff' }}>{icon}</div>
    <div>
      <div className="text-2xl font-bold text-gray-900 leading-tight tabular-nums">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  </div>
);

type TabId = 'resumen' | 'distribuciones' | 'relaciones' | 'sesgo';
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'resumen', label: 'Resumen', icon: <LayoutGrid size={16} /> },
  { id: 'distribuciones', label: 'Distribuciones', icon: <BarChart3 size={16} /> },
  { id: 'relaciones', label: 'Relaciones', icon: <GitCompareArrows size={16} /> },
  { id: 'sesgo', label: 'Vista de sesgo', icon: <ScatterChart size={16} /> },
];

export const EdaPanel: React.FC<Props> = ({ eda, loading, error }) => {
  const [tab, setTab] = useState<TabId>('resumen');
  const [pair, setPair] = useState<{ x: string; y: string } | null>(null);

  const defaults = useMemo(() => {
    if (!eda) return { outcome: '', protected: '' };
    const cols = eda.crosstab_columns || [];
    const outcome = eda.columns.find((c) => c.role_hint === 'outcome' && cols.includes(c.name))?.name || cols[0] || '';
    const prot = eda.columns.find((c) => c.role_hint === 'protected' && cols.includes(c.name))?.name
      || cols.find((c) => c !== outcome) || '';
    return { outcome, protected: prot };
  }, [eda]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 flex items-center justify-center gap-3 text-gray-600">
        <Loader2 className="animate-spin" size={22} /> Explorando los datos…
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl border-l-4 p-4" style={{ borderColor: STATUS.critical, background: '#fef2f2' }}>
        <span className="text-red-700 text-sm">{error}</span>
      </div>
    );
  }
  if (!eda) return null;

  const alertCounts = eda.alerts.reduce(
    (acc, a) => ((acc[a.level] = (acc[a.level] || 0) + 1), acc),
    {} as Record<string, number>
  );

  const goToRelation = (x: string, y: string) => { setPair({ x, y }); setTab('relaciones'); };

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="text-indigo-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Análisis Exploratorio de los Datos</h2>
        </div>
        <p className="text-gray-600">
          Antes de medir sesgos, explora la calidad, el balance y las relaciones de tus datos.
          Las alertas y vistas destacan posibles <b>desbalances</b> y <b>proxies</b> que pueden esconder discriminación.
        </p>
      </div>

      {/* Barra de pestañas */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {t.icon}{t.label}
            {t.id === 'resumen' && eda.alerts.length > 0 && (
              <span className="ml-1 text-[10px] bg-red-100 text-red-700 rounded-full px-1.5 py-0.5 font-semibold">{eda.alerts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* --- RESUMEN --- */}
      {tab === 'resumen' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatTile icon={<Database size={20} className="text-indigo-600" />} value={eda.n_rows.toLocaleString()} label="Filas" />
            <StatTile icon={<Columns3 size={20} className="text-indigo-600" />} value={eda.n_cols} label="Columnas" />
            <StatTile icon={<CircleSlash2 size={20} className="text-amber-600" />} value={`${eda.missing_cells_pct}%`} label="Celdas faltantes" accent="#fffbeb" />
            <StatTile icon={<ShieldAlert size={20} className="text-red-600" />} value={eda.alerts.length} label="Alertas detectadas" accent="#fef2f2" />
          </div>

          {eda.alerts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert size={20} className="text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Alertas de calidad y posibles sesgos</h3>
                <span className="text-xs text-gray-500">
                  {alertCounts.critical ? `${alertCounts.critical} críticas · ` : ''}
                  {alertCounts.warning ? `${alertCounts.warning} advertencias · ` : ''}
                  {alertCounts.info ? `${alertCounts.info} informativas` : ''}
                </span>
              </div>
              <div className="space-y-2">
                {eda.alerts.map((a: EdaAlert, i: number) => {
                  const s = ALERT_STYLE[a.level] || ALERT_STYLE.info;
                  const canExplore = a.type === 'proxy' && a.columns.length === 2;
                  return (
                    <div key={i} className="flex items-start gap-3 rounded-lg p-3 border-l-4" style={{ borderColor: s.border, background: s.bg }}>
                      <div className="mt-0.5">{s.icon}</div>
                      <div className="text-sm text-gray-800 flex-1">
                        {a.message}
                        {a.columns.length > 0 && (
                          <span className="ml-2">
                            {a.columns.map((c) => (
                              <span key={c} className="inline-block text-[11px] bg-white/70 border border-gray-200 rounded px-1.5 py-0.5 mr-1 font-mono text-gray-600">{c}</span>
                            ))}
                          </span>
                        )}
                        {canExplore && (
                          <button onClick={() => goToRelation(a.columns[0], a.columns[1])}
                            className="ml-1 text-[12px] text-indigo-600 hover:underline">explorar →</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Roles sugeridos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Roles sugeridos de las columnas</h3>
            <p className="text-sm text-gray-600 mb-3">Una pista automática del papel de cada columna. Tú decides la selección final en la configuración.</p>
            <div className="flex flex-wrap gap-2">
              {eda.columns.map((c) => {
                const r = ROLE_LABEL[c.role_hint] || ROLE_LABEL.feature;
                return (
                  <span key={c.name} className="inline-flex items-center gap-1.5 text-sm border border-rose-light rounded-lg px-2.5 py-1">
                    <span className="font-medium text-ink-80">{c.name}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${r.className}`}>{r.label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- DISTRIBUCIONES --- */}
      {tab === 'distribuciones' && (
        <div className="space-y-5">
          <DistributionExplorer eda={eda} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Perfil de columnas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {eda.columns.map((c) => <ColumnCard key={c.name} column={c} minGroupSize={eda.min_group_size} />)}
            </div>
          </div>
        </div>
      )}

      {/* --- RELACIONES --- */}
      {tab === 'relaciones' && (
        <div className="space-y-5">
          <AssociationHeatmap columns={eda.associations.columns} matrix={eda.associations.matrix} onSelectPair={(x, y) => setPair({ x, y })} />
          <BivariateExplorer
            eda={eda}
            title="Explorador de relaciones"
            description="Elige dos variables para ver cómo se distribuye una según la otra. Consejo: haz clic en una celda del mapa de arriba para cargar ese par."
            initialX={pair?.x}
            initialY={pair?.y}
          />
        </div>
      )}

      {/* --- VISTA DE SESGO --- */}
      {tab === 'sesgo' && (
        <div className="space-y-5">
          <div className="rounded-xl border-l-4 p-4" style={{ borderColor: '#7A3B48', background: '#FBF3F4' }}>
            <p className="text-sm text-gray-800">
              <b>Vista preliminar de sesgo.</b> Compara cómo se reparte el <b>resultado</b> (predicción o etiqueta) entre los
              grupos de una <b>variable protegida</b>. Diferencias grandes entre grupos anticipan posibles inequidades que el
              análisis formal confirmará.
            </p>
          </div>
          <BivariateExplorer
            eda={eda}
            title="Resultado por grupo"
            description="Proporción de cada resultado dentro de cada grupo. Barras muy distintas entre grupos = posible sesgo."
            initialX={defaults.protected}
            initialY={defaults.outcome}
            defaultMode="proportion"
          />
          <IntersectionHeatmap eda={eda} />
        </div>
      )}
    </div>
  );
};
