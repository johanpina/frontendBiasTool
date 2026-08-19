import React from 'react';
import {
  Brain, CheckCircle2, Users, ChevronRight, Grid2x2, Scale, ShieldAlert, FileUp,
} from 'lucide-react';

/** Introducción visual y dinámica de la herramienta: qué datos hacen falta,
 *  cómo funciona el flujo y qué mide cada métrica clave. */
export const IntroGuide: React.FC = () => {
  const columnas = [
    {
      icon: <Brain className="h-5 w-5 text-burgundy" />,
      bg: 'bg-rose-tint',
      titulo: 'Predicciones del modelo',
      desc: 'Lo que tu modelo predijo para cada caso (0/1, o varias clases).',
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-[#2F6B4F]" />,
      bg: 'bg-[#E7F0EA]',
      titulo: 'Valores reales',
      desc: 'Lo que realmente ocurrió: las etiquetas verdaderas a comparar.',
    },
    {
      icon: <Users className="h-5 w-5 text-[#A2611F]" />,
      bg: 'bg-[#F6EADB]',
      titulo: 'Variables protegidas',
      desc: 'Atributos como etnia, sexo o edad sobre los que evaluar sesgos.',
    },
  ];

  const flujo = [
    { icon: <FileUp className="h-5 w-5" />, label: 'Tus datos', sub: 'CSV' },
    { icon: <Grid2x2 className="h-5 w-5" />, label: 'Matriz de confusión', sub: 'por subgrupo' },
    { icon: <Scale className="h-5 w-5" />, label: 'Métricas por grupo', sub: 'FPR · FNR · FOR · FDR' },
    { icon: <ShieldAlert className="h-5 w-5" />, label: 'Equidad', sub: 'disparidad + veredicto' },
  ];

  const metricas = [
    { s: 'FPR', n: 'Falsos Positivos', d: 'Marca como positivo a quien no lo era. Cuídala si un positivo trae una acción punitiva.', c: 'text-burgundy bg-rose-tint' },
    { s: 'FNR', n: 'Falsos Negativos', d: 'Se le escapa un caso positivo real. Cuídala si un positivo da acceso a un beneficio.', c: 'text-[#A2611F] bg-[#F6EADB]' },
    { s: 'FOR', n: 'Falsas Omisiones', d: 'De los marcados negativos, cuántos eran positivos. Relevante al negar un recurso.', c: 'text-[#2F6B4F] bg-[#E7F0EA]' },
    { s: 'FDR', n: 'Falsos Descubrimientos', d: 'De los marcados positivos, cuántos eran erróneos. Mide la precisión por grupo.', c: 'text-[#A15E6B] bg-rose-tint' },
  ];

  return (
    <div className="mb-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Analiza el sesgo de tu modelo en 3 pasos</h2>
        <p className="text-gray-600">
          Carga un archivo <b>.csv</b> con las predicciones de tu modelo, los valores reales y las
          variables protegidas. La herramienta mide si tu modelo comete sus errores de forma
          <b> desigual entre grupos</b>.
        </p>
      </div>

      {/* Columnas requeridas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columnas.map((c) => (
          <div key={c.titulo} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className={`inline-flex p-2 rounded-lg ${c.bg} mb-2`}>{c.icon}</div>
            <h3 className="font-semibold text-gray-900">{c.titulo}</h3>
            <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Diagrama de flujo */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">¿Cómo funciona?</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {flujo.map((f, i) => (
            <React.Fragment key={f.label}>
              <div className="flex-1 flex items-center gap-3 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
                <div className="text-indigo-600 shrink-0">{f.icon}</div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm leading-tight">{f.label}</div>
                  <div className="text-xs text-gray-500">{f.sub}</div>
                </div>
              </div>
              {i < flujo.length - 1 && (
                <ChevronRight className="h-5 w-5 text-gray-300 shrink-0 mx-auto rotate-90 sm:rotate-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Guía de métricas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Las 4 métricas clave del veredicto</h3>
          <span className="text-xs text-gray-500">El veredicto de equidad se basa en estas tasas de error.</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {metricas.map((m) => (
            <div key={m.s} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
              <span className={`shrink-0 font-mono font-bold text-sm px-2 py-1 rounded ${m.c}`}>{m.s}</span>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{m.n}</div>
                <p className="text-sm text-gray-600">{m.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nota legal y requisitos, condensado */}
      <div className="bg-indigo-50 border-l-4 border-burgundy rounded-r-lg p-4 text-sm text-ink-80">
        <p className="mb-1">
          <b>Marco legal.</b> La <b>Ley N.º 20.609</b> establece 16 categorías protegidas frente a la
          discriminación arbitraria (<a className="underline" href="https://www.bcn.cl/leychile/navegar?i=1042092" target="_blank" rel="noreferrer">ver ley</a>).
          También puedes evaluar variables <i>proxy</i> asociadas a ellas.
        </p>
        <p className="text-burgundy/90">
          Requisitos: cada columna debe estar claramente identificada, las variables protegidas deben ser
          <b> categóricas</b> y sin valores faltantes en las columnas clave.
        </p>
      </div>
    </div>
  );
};
