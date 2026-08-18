import React, { useState } from 'react';
import { Network } from 'lucide-react';
import { assocColor, assocTextColor, SEQ_BLUE } from '../../lib/vizPalette';

interface Props {
  columns: string[];
  matrix: number[][];
  onSelectPair?: (x: string, y: string) => void;
}

/** Mapa de calor de asociación (Cramér's V) entre variables categóricas.
 *  Celdas oscuras = asociación fuerte = posible proxy. */
export const AssociationHeatmap: React.FC<Props> = ({ columns, matrix, onSelectPair }) => {
  const [hover, setHover] = useState<{ i: number; j: number } | null>(null);
  if (!columns || columns.length < 2) return null;

  const cell = 46; // px
  const label = 92; // px para etiquetas

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Network size={20} className="text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Mapa de asociaciones</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Fuerza de asociación entre variables (Cramér's V, 0 = independientes, 1 = equivalentes).
        Los pares <b>oscuros</b> están muy relacionados: uno podría ser un <b>proxy</b> del otro
        (p. ej. una variable geográfica que "esconde" un atributo protegido).
      </p>

      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Cabecera de columnas */}
          <div className="flex" style={{ marginLeft: label }}>
            {columns.map((c) => (
              <div key={c} style={{ width: cell }} className="text-center">
                <span className="inline-block text-[11px] text-gray-500 truncate" style={{ maxWidth: cell }} title={c}>
                  {c}
                </span>
              </div>
            ))}
          </div>
          {/* Filas */}
          {matrix.map((row, i) => (
            <div key={i} className="flex items-center">
              <div style={{ width: label }} className="pr-2 text-right text-[12px] text-gray-700 truncate" title={columns[i]}>
                {columns[i]}
              </div>
              {row.map((v, j) => {
                const isHover = hover && hover.i === i && hover.j === j;
                const isDiag = i === j;
                const clickable = !isDiag && !!onSelectPair;
                return (
                  <div
                    key={j}
                    onMouseEnter={() => setHover({ i, j })}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => clickable && onSelectPair!(columns[i], columns[j])}
                    title={clickable
                      ? `${columns[i]} ↔ ${columns[j]}: ${v.toFixed(2)} — clic para explorar`
                      : `${columns[i]} ↔ ${columns[j]}: ${v.toFixed(2)}`}
                    style={{
                      width: cell, height: cell,
                      backgroundColor: isDiag ? '#f3f4f6' : assocColor(v),
                      color: isDiag ? '#9ca3af' : assocTextColor(v),
                      outline: isHover ? '2px solid #0b0b0b' : '2px solid #fcfcfb',
                      outlineOffset: '-1px',
                    }}
                    className={`flex items-center justify-center text-[11px] font-medium transition-transform ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {isDiag ? '—' : v.toFixed(2)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda secuencial */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-xs text-gray-500">0.0</span>
        <div className="flex rounded overflow-hidden">
          {SEQ_BLUE.map((c) => (
            <div key={c} style={{ backgroundColor: c, width: 22, height: 12 }} />
          ))}
        </div>
        <span className="text-xs text-gray-500">1.0</span>
        <span className="text-xs text-gray-500 ml-2">asociación</span>
      </div>
    </div>
  );
};
