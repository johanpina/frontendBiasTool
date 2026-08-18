import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { EdaResult } from '../../types';
import { STATUS, categoricalColor, INK } from '../../lib/vizPalette';

const BALANCE_STYLE: Record<string, string> = {
  equilibrada: 'bg-emerald-50 text-emerald-700',
  moderada: 'bg-amber-50 text-amber-700',
  desbalanceada: 'bg-red-50 text-red-700',
};

export const DistributionExplorer: React.FC<{ eda: EdaResult }> = ({ eda }) => {
  const cols = eda.columns.filter((c) => c.dtype !== 'numeric' ? c.categorical_like || c.dtype === 'binary' : true);
  // Por defecto, arranca en una columna significativa (no un identificador).
  const defaultCol = cols.find((c) => c.role_hint !== 'id') || cols[0];
  const [name, setName] = useState<string>(defaultCol?.name || '');
  const [asPct, setAsPct] = useState(false);
  const col = eda.columns.find((c) => c.name === name) || cols[0];

  const data = useMemo(() => {
    if (!col) return [];
    if (col.dtype === 'numeric' && col.histogram) {
      const total = col.histogram.reduce((a, b) => a + b.count, 0) || 1;
      return col.histogram.map((b) => ({
        name: `${round(b.x0)}–${round(b.x1)}`,
        value: asPct ? (100 * b.count) / total : b.count,
        count: b.count, small: false,
      }));
    }
    const total = eda.n_rows || 1;
    return col.top_values.map((tv) => ({
      name: tv.value,
      value: asPct ? tv.pct : tv.count,
      count: tv.count,
      small: !tv.is_aggregate && tv.count < eda.min_group_size,
    }));
  }, [col, asPct, eda]);

  if (!col) return null;
  const isNumeric = col.dtype === 'numeric';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Distribución por variable</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAsPct((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {asPct ? 'Ver conteo' : 'Ver %'}
          </button>
          <select
            value={col.name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {cols.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Metadatos de la variable */}
      <div className="flex items-center gap-3 mb-3 text-xs flex-wrap">
        <span className="text-gray-500"><b className="text-gray-800">{col.unique.toLocaleString()}</b> valores únicos</span>
        <span className="text-gray-500"><b className="text-gray-800">{col.missing_pct}%</b> faltantes</span>
        {col.balance && (
          <span className={`px-2 py-0.5 rounded-full font-medium ${BALANCE_STYLE[col.balance.label]}`}>
            Balance: {col.balance.label} ({(col.balance.evenness * 100).toFixed(0)}%)
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={Math.max(180, data.length * (isNumeric ? 20 : 36))}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 28, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke={INK.grid} />
          <XAxis type="number" tick={{ fontSize: 12, fill: INK.muted }}
            tickFormatter={(v) => asPct ? `${v}%` : v.toLocaleString()} />
          <YAxis type="category" dataKey="name" width={isNumeric ? 96 : 130}
            tick={{ fontSize: 11, fill: INK.secondary }} interval={0} />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            formatter={(v: any, _n: any, p: any) =>
              [asPct ? `${Number(v).toFixed(1)}% (${p.payload.count.toLocaleString()})` : `${Number(v).toLocaleString()} casos`, 'Valor']}
          />
          <Bar
            dataKey="value"
            maxBarSize={26}
            isAnimationActive={false}
            shape={(props: any) => {
              const { x, y, width, height, payload } = props;
              const fill = payload.small ? STATUS.warning : categoricalColor(0);
              const r = Math.min(4, height / 2);
              return <rect x={x} y={y} width={Math.max(0, width)} height={height} rx={r} ry={r} fill={fill} />;
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      {!isNumeric && data.some((d) => d.small) && (
        <p className="text-xs text-gray-500 mt-2">
          Las barras <span style={{ color: STATUS.warning }}>ámbar</span> son subgrupos con muestra pequeña
          (&lt;{eda.min_group_size} casos).
        </p>
      )}
    </div>
  );
};

function round(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
