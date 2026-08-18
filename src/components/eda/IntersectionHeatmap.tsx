import React, { useState, useMemo } from 'react';
import { Grid3x3 } from 'lucide-react';
import { EdaResult } from '../../types';
import { getCrosstab } from './edaUtils';
import { assocColor } from '../../lib/vizPalette';

/** Cruce de dos variables por CONTEO. Resalta celdas con muestra pequeña, que
 *  son intersecciones (p. ej. "mujeres asiáticas") poco fiables para el análisis. */
export const IntersectionHeatmap: React.FC<{ eda: EdaResult }> = ({ eda }) => {
  const cols = eda.crosstab_columns || [];
  const [x, setX] = useState(cols[0] || '');
  const [y, setY] = useState(cols[1] || cols[0] || '');
  const ct = useMemo(() => (x && y && x !== y ? getCrosstab(eda, x, y) : null), [eda, x, y]);

  const maxCount = ct ? Math.max(...ct.counts.flat(), 1) : 1;
  const cellW = 60, labelW = 120;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Grid3x3 size={20} className="text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Intersecciones entre variables</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Número de casos por combinación de dos variables. Las celdas <span className="text-amber-600 font-medium">ámbar</span>{' '}
        tienen menos de {eda.min_group_size} casos: son intersecciones poco fiables para medir equidad.
      </p>

      <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
        <select value={y} onChange={(e) => setY(e.target.value)}
          className="bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          {cols.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-gray-400">×</span>
        <select value={x} onChange={(e) => setX(e.target.value)}
          className="bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          {cols.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {!ct || x === y ? (
        <p className="text-sm text-gray-500 py-8 text-center">Selecciona dos variables distintas.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Cabecera: valores de Y */}
            <div className="flex" style={{ marginLeft: labelW }}>
              {ct.y_values.map((yv) => (
                <div key={yv} style={{ width: cellW }} className="text-center text-[11px] text-gray-500 truncate px-1" title={yv}>
                  {yv}
                </div>
              ))}
            </div>
            {ct.x_values.map((xv, i) => (
              <div key={xv} className="flex items-center">
                <div style={{ width: labelW }} className="pr-2 text-right text-[12px] text-gray-700 truncate" title={xv}>{xv}</div>
                {ct.y_values.map((yv, j) => {
                  const c = ct.counts[i][j];
                  const small = c > 0 && c < eda.min_group_size;
                  const intensity = c / maxCount;
                  return (
                    <div key={yv} title={`${xv} × ${yv}: ${c.toLocaleString()} casos`}
                      style={{
                        width: cellW, height: 40,
                        backgroundColor: small ? '#fef3c7' : assocColor(intensity),
                        color: !small && intensity >= 0.55 ? '#fff' : '#111827',
                        outline: small ? '2px solid #fab219' : '2px solid #fcfcfb',
                        outlineOffset: '-1px',
                      }}
                      className="flex items-center justify-center text-[11px] font-medium tabular-nums cursor-default">
                      {c.toLocaleString()}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
