import React from 'react';
import { Hash, List, ToggleLeft } from 'lucide-react';
import { EdaColumn } from '../../types';

const TYPE_META: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  numeric: { label: 'Numérica', className: 'bg-blue-50 text-blue-700', icon: <Hash size={13} /> },
  categorical: { label: 'Categórica', className: 'bg-violet-50 text-violet-700', icon: <List size={13} /> },
  binary: { label: 'Binaria', className: 'bg-emerald-50 text-emerald-700', icon: <ToggleLeft size={13} /> },
};

interface Props {
  column: EdaColumn;
  minGroupSize: number;
}

export const ColumnCard: React.FC<Props> = ({ column, minGroupSize }) => {
  const t = TYPE_META[column.dtype] || TYPE_META.categorical;
  const maxPct = Math.max(...column.top_values.map((v) => v.pct), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-semibold text-gray-900 truncate" title={column.name}>{column.name}</span>
        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${t.className}`}>
          {t.icon}{t.label}
        </span>
      </div>

      {/* Métricas de la columna */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span><b className="text-gray-800">{column.unique.toLocaleString()}</b> valores únicos</span>
        <span className="flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${column.missing_pct > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          <b className="text-gray-800">{column.missing_pct}%</b> faltantes
        </span>
      </div>

      {/* Distribución (barras horizontales) o resumen numérico */}
      {column.dtype === 'numeric' && column.stats ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600 mt-auto">
          <div>mín: <b className="text-gray-800">{fmt(column.stats.min)}</b></div>
          <div>máx: <b className="text-gray-800">{fmt(column.stats.max)}</b></div>
          <div>media: <b className="text-gray-800">{fmt(column.stats.mean)}</b></div>
          <div>mediana: <b className="text-gray-800">{fmt(column.stats.median)}</b></div>
        </div>
      ) : (
        <div className="space-y-1.5 mt-auto">
          {column.top_values.map((tv, i) => {
            const small = !tv.is_aggregate && tv.count < minGroupSize;
            return (
              <div key={i} title={`${tv.value}: ${tv.count.toLocaleString()} (${tv.pct}%)`}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className={`truncate ${tv.is_aggregate ? 'text-gray-400 italic' : 'text-gray-700'}`} style={{ maxWidth: '68%' }}>
                    {tv.value}{small && <span className="text-amber-600"> ⚠</span>}
                  </span>
                  <span className="text-gray-500 tabular-nums">{tv.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(tv.pct / maxPct) * 100}%`,
                      backgroundColor: tv.is_aggregate ? '#cbd5e1' : small ? '#fab219' : '#2a78d6',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function fmt(v: number): string {
  if (Number.isInteger(v)) return v.toLocaleString();
  return v.toFixed(2);
}
