import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import { GitCompareArrows } from 'lucide-react';
import { EdaResult } from '../../types';
import { getCrosstab, rowTotals } from './edaUtils';
import { categoricalColor, INK } from '../../lib/vizPalette';

interface Props {
  eda: EdaResult;
  title?: string;
  description?: string;
  /** Selección inicial opcional (x = eje, y = series/color). */
  initialX?: string;
  initialY?: string;
  /** 'proportion' resalta tasas (apilado 100%); 'count' conteos agrupados. */
  defaultMode?: 'count' | 'proportion';
}

export const BivariateExplorer: React.FC<Props> = ({
  eda, title = 'Relación entre dos variables', description, initialX, initialY, defaultMode = 'proportion',
}) => {
  const cols = eda.crosstab_columns || [];
  const [x, setX] = useState(initialX && cols.includes(initialX) ? initialX : cols[0] || '');
  const [y, setY] = useState(initialY && cols.includes(initialY) ? initialY : cols[1] || cols[0] || '');
  const [mode, setMode] = useState<'count' | 'proportion'>(defaultMode);

  useEffect(() => {
    if (initialX && cols.includes(initialX)) setX(initialX);
    if (initialY && cols.includes(initialY)) setY(initialY);
  }, [initialX, initialY]); // eslint-disable-line

  const ct = useMemo(() => (x && y && x !== y ? getCrosstab(eda, x, y) : null), [eda, x, y]);

  const { data, series } = useMemo(() => {
    if (!ct) return { data: [] as any[], series: [] as string[] };
    const totals = rowTotals(ct);
    const rows = ct.x_values.map((xv, i) => {
      const row: any = { name: xv, __total: totals[i] };
      ct.y_values.forEach((yv, j) => {
        const c = ct.counts[i][j];
        row[yv] = mode === 'proportion' ? (totals[i] ? (100 * c) / totals[i] : 0) : c;
        row[`__count_${yv}`] = c;
      });
      return row;
    });
    return { data: rows, series: ct.y_values };
  }, [ct, mode]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <GitCompareArrows size={20} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {(['proportion', 'count'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`text-xs px-3 py-1.5 rounded-md ${mode === m ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {m === 'proportion' ? 'Proporción' : 'Conteo'}
            </button>
          ))}
        </div>
      </div>
      {description && <p className="text-sm text-gray-600 mb-3">{description}</p>}

      <div className="flex items-center gap-2 mb-4 flex-wrap text-sm">
        <span className="text-gray-500">Ver</span>
        <select value={y} onChange={(e) => setY(e.target.value)}
          className="bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          {cols.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-gray-500">según</span>
        <select value={x} onChange={(e) => setX(e.target.value)}
          className="bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          {cols.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {!ct || x === y ? (
        <p className="text-sm text-gray-500 py-8 text-center">Selecciona dos variables distintas.</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 44)}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
            <CartesianGrid horizontal={false} stroke={INK.grid} />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: INK.muted }}
              domain={mode === 'proportion' ? [0, 100] : undefined}
              tickFormatter={(v) => mode === 'proportion' ? `${Math.round(Number(v))}%` : Number(v).toLocaleString()}
            />
            <YAxis type="category" dataKey="name" width={130} interval={0}
              tick={{ fontSize: 11, fill: INK.secondary }} />
            <Tooltip
              formatter={(v: any, n: any, p: any) => {
                const count = p.payload[`__count_${n}`];
                return [mode === 'proportion' ? `${Number(v).toFixed(1)}% (${count})` : `${Number(v).toLocaleString()}`, n];
              }}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((s, i) => (
              <Bar key={s} dataKey={s} stackId="a" fill={categoricalColor(i)} maxBarSize={30}
                radius={i === series.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
