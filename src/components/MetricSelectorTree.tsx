import React, { useState } from 'react';
import { HelpCircle, RotateCcw, ChevronLeft, Target, ArrowRight, ShieldAlert, HeartHandshake, Scale } from 'lucide-react';

/**
 * Guía interactiva (basada en el "Fairness Tree" de Aequitas) que ayuda a elegir,
 * en lenguaje sencillo, QUÉ métrica de equidad conviene analizar y por qué.
 *
 * Al llegar a una métrica, además de recomendar la principal, se muestra el
 * CONTEXTO (asistencial / punitivo / representación) y TODAS las métricas de la
 * herramienta que conviene vigilar en ese contexto.
 */

// Paleta Civic Rose (heredada de la EIA).
const AZUL = '#2A2622';      // nodos de pregunta (tinta oscura cálida)
const TEAL = '#C08A93';      // opciones (rosa)
const TERRA = '#7A3B48';     // resultado (burdeos)

type Node =
  | { type: 'q'; text: string; help?: string; options: { label: string; help?: string; go: string }[] }
  | { type: 'metric'; metric: MetricKey }
  | { type: 'info'; title: string; text: string };

type MetricKey = 'ppr' | 'pprev' | 'fpr' | 'fdr' | 'fnr' | 'for' | 'tpr';
type Familia = 'punitiva' | 'asistencial' | 'representacion';

const METRIC_INFO: Record<MetricKey, {
  nombre: string; sigla: string; columna: string; idea: string; explica: string; familia: Familia;
}> = {
  ppr: {
    nombre: 'Paridad de Selección', sigla: 'PPR', familia: 'representacion',
    columna: 'Disparidad en Proporción de Predichos Positivos (PPR)',
    idea: '¿El modelo selecciona (predice “positivo”) a la misma proporción de personas en cada grupo?',
    explica: 'Compara qué fracción de cada grupo es marcada como positiva. Útil cuando quieres seleccionar un número similar de cada grupo, sin importar el resultado real.',
  },
  pprev: {
    nombre: 'Paridad Demográfica', sigla: 'Prev. Predicha', familia: 'representacion',
    columna: 'Disparidad en Prevalencia Predicha',
    idea: '¿La tasa de selección es proporcional entre los grupos?',
    explica: 'Mira la tasa de positivos predichos por grupo. Busca que la selección sea proporcional a la presencia de cada grupo.',
  },
  fpr: {
    nombre: 'Tasa de Falsos Positivos', sigla: 'FPR', familia: 'punitiva',
    columna: 'Disparidad en Tasa de Falsos Positivos (FPR)',
    idea: 'Entre quienes NO eran positivos, ¿a cuántos marcó el modelo por error como positivos?',
    explica: 'Clave cuando una predicción positiva desencadena una acción punitiva (vigilar, negar, detener): evita castigar de más a un grupo por errores del modelo.',
  },
  fdr: {
    nombre: 'Tasa de Falsos Descubrimientos', sigla: 'FDR', familia: 'punitiva',
    columna: 'Disparidad en Tasa de Falsos Descubrimientos (FDR)',
    idea: 'Entre las personas marcadas como positivas, ¿cuántas estaban mal clasificadas?',
    explica: 'Mide la precisión de la intervención por grupo: de a quienes se les aplica la medida, cuántos no la merecían.',
  },
  fnr: {
    nombre: 'Tasa de Falsos Negativos', sigla: 'FNR', familia: 'asistencial',
    columna: 'Disparidad en Tasa de Falsos Negativos (FNR)',
    idea: 'Entre quienes SÍ eran positivos, ¿a cuántos se le escapó el modelo?',
    explica: 'Clave cuando una predicción positiva da acceso a un beneficio o apoyo: evita dejar fuera a un grupo que lo necesita.',
  },
  for: {
    nombre: 'Tasa de Falsas Omisiones', sigla: 'FOR', familia: 'asistencial',
    columna: 'Disparidad en Tasa de Falsas Omisiones (FOR)',
    idea: 'Entre las personas marcadas como “negativas”, ¿cuántas eran realmente positivas?',
    explica: 'Relevante al negar un recurso: de a quienes se deja fuera, cuántos en realidad debían recibirlo.',
  },
  tpr: {
    nombre: 'Sensibilidad (Recall)', sigla: 'TPR', familia: 'asistencial',
    columna: 'Disparidad en Tasa de Verdaderos Positivos (TPR)',
    idea: 'Entre quienes SÍ eran positivos, ¿a cuántos logró detectar el modelo?',
    explica: 'Útil cuando solo puedes ayudar a una fracción de quienes lo necesitan: busca cubrir una proporción similar en cada grupo.',
  },
};

// Cada contexto define QUÉ familia de métricas mirar y por qué.
// El orden de `metricas` va de la más prioritaria a la complementaria.
const FAMILIA_INFO: Record<Familia, {
  etiqueta: string; icono: React.ReactNode; resumen: string; metricas: MetricKey[];
}> = {
  punitiva: {
    etiqueta: 'Contexto punitivo',
    icono: <ShieldAlert size={16} />,
    resumen: 'La predicción “positiva” desencadena una acción que puede perjudicar (vigilar, sancionar, negar un derecho). El error grave es señalar a quien NO correspondía, así que se vigilan los falsos positivos.',
    metricas: ['fpr', 'fdr'],
  },
  asistencial: {
    etiqueta: 'Contexto asistencial',
    icono: <HeartHandshake size={16} />,
    resumen: 'La predicción “positiva” entrega una ayuda o beneficio (apoyo social, cupo, admisión). El error grave es dejar fuera a quien SÍ lo necesitaba, así que se vigilan los falsos negativos.',
    metricas: ['fnr', 'for', 'tpr'],
  },
  representacion: {
    etiqueta: 'Representación / selección',
    icono: <Scale size={16} />,
    resumen: 'Aquí no importa el acierto frente a la etiqueta, sino A CUÁNTAS personas de cada grupo selecciona el modelo. Se vigila la proporción de seleccionados por grupo.',
    metricas: ['ppr', 'pprev'],
  },
};

const TREE: Record<string, Node> = {
  inicio: {
    type: 'q',
    text: '¿Qué te preocupa más de la equidad de tu modelo?',
    help: 'La representación mira A CUÁNTAS personas selecciona el modelo; los errores miran EN QUÉ se equivoca.',
    options: [
      { label: 'La representación entre grupos', help: 'Que el modelo elija una proporción justa de cada grupo.', go: 'rep' },
      { label: 'Los errores del modelo', help: 'Que el modelo se equivoque por igual entre grupos.', go: 'confia' },
    ],
  },
  rep: {
    type: 'q',
    text: '¿Cómo debería repartirse la selección entre los grupos?',
    options: [
      { label: 'Igual número de personas de cada grupo', go: 'm_ppr' },
      { label: 'Proporcional al tamaño de cada grupo', go: 'm_pprev' },
    ],
  },
  confia: {
    type: 'q',
    text: '¿Confías en las etiquetas (los “valores reales” de tus datos)?',
    help: 'Si las etiquetas ya vienen sesgadas (p. ej. arrestos históricos), medir errores contra ellas puede engañar.',
    options: [
      { label: 'Sí, reflejan bien la realidad', go: 'interv' },
      { label: 'No, podrían venir sesgadas', go: 'contrafactual' },
    ],
  },
  contrafactual: {
    type: 'info',
    title: 'Justicia contrafactual',
    text: 'Si no confías en las etiquetas, la evaluación por tasas de error puede no ser válida. En ese caso conviene revisar el origen de los datos y considerar enfoques de justicia contrafactual, que están fuera del alcance de esta herramienta. Aun así, puedes explorar las métricas de forma referencial.',
  },
  interv: {
    type: 'q',
    text: 'Cuando el modelo predice “positivo”, ¿qué ocurre con esa persona?',
    help: 'Esta es la pregunta clave: define si tu contexto es punitivo o asistencial, y con ello qué métricas debes vigilar.',
    options: [
      { label: 'Recibe una acción que puede perjudicarla (punitiva)', help: 'Ej.: vigilancia, negar un crédito, detener.', go: 'punitiva' },
      { label: 'Recibe una ayuda o beneficio (asistencial)', help: 'Ej.: apoyo social, cupo, admisión.', go: 'asistencial' },
    ],
  },
  punitiva: {
    type: 'q',
    text: 'En ese contexto punitivo, ¿a quién te importa más NO perjudicar?',
    help: 'Ambas opciones pertenecen al contexto punitivo: vigilarás FPR y FDR. Esto solo define cuál priorizar.',
    options: [
      { label: 'A quienes NO debían recibir la medida (que no los castiguen por error)', go: 'm_fpr' },
      { label: 'A que la medida, cuando se aplica, sea acertada por grupo', go: 'm_fdr' },
    ],
  },
  asistencial: {
    type: 'q',
    text: '¿A cuántas personas con necesidad puedes atender?',
    options: [
      { label: 'Solo a una fracción pequeña', help: 'Los recursos son muy limitados.', go: 'm_tpr' },
      { label: 'A la mayoría de quienes lo necesitan', go: 'asis2' },
    ],
  },
  asis2: {
    type: 'q',
    text: 'En ese contexto asistencial, ¿a quién te importa más NO dejar fuera?',
    help: 'Ambas opciones pertenecen al contexto asistencial: vigilarás FNR y FOR. Esto solo define cuál priorizar.',
    options: [
      { label: 'A quienes SÍ tienen necesidad (que no se les escape la ayuda)', go: 'm_fnr' },
      { label: 'A que “no dar ayuda” sea una decisión acertada por grupo', go: 'm_for' },
    ],
  },
  m_ppr: { type: 'metric', metric: 'ppr' },
  m_pprev: { type: 'metric', metric: 'pprev' },
  m_fpr: { type: 'metric', metric: 'fpr' },
  m_fdr: { type: 'metric', metric: 'fdr' },
  m_fnr: { type: 'metric', metric: 'fnr' },
  m_for: { type: 'metric', metric: 'for' },
  m_tpr: { type: 'metric', metric: 'tpr' },
};

interface Props {
  onComplete?: (metricDisparityKey: string) => void;
}

export const MetricSelectorTree: React.FC<Props> = ({ onComplete }) => {
  const [path, setPath] = useState<string[]>(['inicio']);
  const current = TREE[path[path.length - 1]];

  const choose = (go: string) => {
    setPath((p) => [...p, go]);
    const node = TREE[go];
    if (node?.type === 'metric' && onComplete) onComplete(node.metric + '_disparity');
  };
  const back = () => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
  const restart = () => setPath(['inicio']);

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Barra superior con ruta y controles */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <HelpCircle size={14} /> Guía para elegir tu métrica (árbol de Aequitas)
        </div>
        <div className="flex items-center gap-2">
          {path.length > 1 && (
            <button onClick={back} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
              <ChevronLeft size={14} /> Atrás
            </button>
          )}
          {path.length > 1 && (
            <button onClick={restart} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
              <RotateCcw size={13} /> Reiniciar
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        {current.type === 'q' && (
          <>
            <div className="rounded-lg px-4 py-3 mb-4" style={{ backgroundColor: AZUL }}>
              <p className="text-white font-semibold">{current.text}</p>
              {current.help && <p className="text-white/80 text-sm mt-1">{current.help}</p>}
            </div>
            <div className="space-y-2.5">
              {current.options.map((o, i) => (
                <button
                  key={i}
                  onClick={() => choose(o.go)}
                  className="w-full text-left rounded-lg px-4 py-3 border transition-colors group"
                  style={{ borderColor: TEAL }}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <span className="font-medium" style={{ color: TEAL }}>{o.label}</span>
                      {o.help && <span className="block text-sm text-gray-500 mt-0.5">{o.help}</span>}
                    </span>
                    <ArrowRight size={16} className="shrink-0 text-gray-300 group-hover:text-gray-500" />
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {current.type === 'info' && (
          <div className="rounded-lg border-l-4 p-4 bg-amber-50" style={{ borderColor: '#fab219' }}>
            <p className="font-semibold text-gray-900 mb-1">{(current as any).title}</p>
            <p className="text-sm text-gray-700">{(current as any).text}</p>
          </div>
        )}

        {current.type === 'metric' && (() => {
          const mk = (current as any).metric as MetricKey;
          const m = METRIC_INFO[mk];
          const fam = FAMILIA_INFO[m.familia];
          return (
            <div>
              {/* Contexto detectado */}
              <div
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
                style={{ color: TERRA, backgroundColor: '#F4E4E7', border: `1px solid ${TEAL}` }}
              >
                {fam.icono} {fam.etiqueta}
              </div>

              {/* Métrica principal recomendada */}
              <div className="rounded-lg p-4 text-white" style={{ backgroundColor: TERRA }}>
                <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                  <Target size={16} /> Métrica principal a analizar
                </div>
                <div className="text-xl font-bold">{m.nombre} <span className="text-white/80 text-base font-mono">({m.sigla})</span></div>
              </div>

              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p><b>La pregunta que responde:</b> <i>{m.idea}</i></p>
                <p>{m.explica}</p>
                <div className="rounded-lg p-3 mt-2" style={{ backgroundColor: '#FBF3F4', border: `1px solid ${TEAL}` }}>
                  <b style={{ color: TERRA }}>¿Dónde la reviso?</b> En la pestaña <b>Análisis de Equidad</b>, observa la columna
                  <b> “{m.columna}”</b> de la tabla de disparidades y su gráfico. Una disparidad cercana a <b>1.00</b> indica equidad
                  en esa métrica; valores lejanos a 1 señalan un posible sesgo.
                </div>
              </div>

              {/* Métricas a tener en cuenta según el contexto */}
              <div className="mt-4 rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-2.5 text-sm" style={{ backgroundColor: '#FAF7F4', borderBottom: '1px solid #E5DFD7' }}>
                  <span className="font-semibold" style={{ color: AZUL }}>
                    Métricas a vigilar en un {fam.etiqueta.toLowerCase()}
                  </span>
                  <p className="text-gray-600 mt-0.5">{fam.resumen}</p>
                </div>
                <ul className="divide-y divide-gray-100">
                  {fam.metricas.map((k) => {
                    const info = METRIC_INFO[k];
                    const esPrincipal = k === mk;
                    return (
                      <li key={k} className="flex items-start gap-3 px-4 py-3">
                        <span
                          className="mt-0.5 shrink-0 inline-flex items-center justify-center w-14 text-xs font-mono font-semibold rounded px-1.5 py-0.5"
                          style={{
                            color: '#fff',
                            backgroundColor: esPrincipal ? TERRA : TEAL,
                          }}
                        >
                          {info.sigla}
                        </span>
                        <div className="text-sm">
                          <p className="text-gray-800">
                            <b>{info.nombre}</b>
                            {esPrincipal && (
                              <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: TERRA }}>
                                · principal
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 mt-0.5">{info.idea}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Prioriza la métrica <b>principal</b>, pero revisa también las demás de este contexto: una disparidad alta en
                cualquiera de ellas es señal de un trato desigual entre grupos.
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
