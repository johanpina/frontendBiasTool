import React from 'react';
import { Download } from 'lucide-react';

const MUESTRA = `id,prediccion,valor_real,sexo,rango_edad
1,1,1,Masculino,Menor de 25
2,1,0,Femenino,25 a 45
3,0,1,Femenino,Mayor de 45`;

/** Cómo debe verse el archivo + descargas de ejemplo (U3). */
export const FileExample: React.FC = () => (
  <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
    <h3 className="font-semibold text-gray-900 mb-2">¿Cómo debe verse tu archivo?</h3>
    <pre className="font-mono text-[13px] leading-relaxed bg-paper border border-line rounded-lg px-4 py-3 overflow-x-auto text-ink-80">
      {MUESTRA}
    </pre>
    <div className="flex flex-wrap gap-2.5 mt-3">
      <a
        href="/ejemplos/ejemplo_binario.csv"
        download
        className="inline-flex items-center gap-2 text-sm font-semibold text-burgundy border border-rose-light rounded-md px-3 py-2 hover:border-burgundy transition-colors"
      >
        <Download className="h-4 w-4" /> Descargar ejemplo binario (.csv)
      </a>
      <a
        href="/ejemplos/ejemplo_multiclase.csv"
        download
        className="inline-flex items-center gap-2 text-sm font-semibold text-burgundy border border-rose-light rounded-md px-3 py-2 hover:border-burgundy transition-colors"
      >
        <Download className="h-4 w-4" /> Descargar ejemplo multiclase (.csv)
      </a>
    </div>
    <p className="text-xs text-ink-60 mt-3">
      El orden de las columnas no importa, porque las elegirás en el paso 3. Recomendamos este orden para revisar el
      archivo más fácil.
    </p>
  </div>
);
