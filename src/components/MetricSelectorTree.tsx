import React, { useState } from 'react';
import { HelpCircle, RotateCcw, ChevronLeft, Target, ArrowRight } from 'lucide-react';

/**
 * Guía interactiva (basada en el "Fairness Tree" de Aequitas) que ayuda a elegir,
 * en lenguaje sencillo, QUÉ métrica de equidad conviene analizar y por qué.
 */

// Paleta del Fairness Tree de Aequitas.
const AZUL = '#2b5f8a';      // nodos de pregunta
const TEAL = '#2e7d8c';      // opciones
const TERRA = '#a8683f';     // resultado (métrica)

type Node =
  | { type: 'q'; text: string; help?: string; options: { label: string; help?: string; go: string }[] }
  | { type: 'metric'; metric: MetricKey }
  | { type: 'info'; title: string; text: string };

type MetricKey = 'ppr' | 'pprev' | 'fpr' | 'fdr' | 'fnr' | 'for' | 'tpr';

const METRIC_INFO: Record<MetricKey, {
  nombre: string; sigla: string; columna: string; idea: string; explica: string;
}> = {
  ppr: {
    nombre: 'Paridad de Selección', sigla: 'PPR',
    columna: 'Disparidad en Proporción de Predichos Positivos (PPR)',
    idea: '¿El modelo selecciona (predice “positivo”) a la misma proporción de personas en cada grupo?',
    explica: 'Compara qué fracción de cada grupo es marcada como positiva. Útil cuando quieres seleccionar un número similar de cada grupo, sin importar el resultado real.',
  },
  pprev: {
    nombre: 'Paridad Demográfica', sigla: 'Prev. Predicha',
    columna: 'Disparidad en Prevalencia Predicha',
    idea: '¿La tasa de selección es proporcional entre los grupos?',
    explica: 'Mira la tasa de positivos predichos por grupo. Busca que la selección sea proporcional a la presencia de cada grupo.',
  },
  fpr: {
    nombre: 'Tasa de Falsos Positivos', sigla: 'FPR',
    columna: 'Disparidad en Tasa de Falsos Positivos (FPR)',
    idea: 'Entre quienes NO eran positivos, ¿a cuántos marcó el modelo por error como positivos?',
    explica: 'Clave cuando una predicción positiva desencadena una acción punitiva (vigilar, negar, detener): evita castigar de más a un grupo por errores del modelo.',
  },
  fdr: {
    nombre: 'Tasa de Falsos Descubrimientos', sigla: 'FDR',
    columna: 'Disparidad en Tasa de Falsos Descubrimientos (FDR)',
    idea: 'Entre las personas marcadas como positivas, ¿cuántas estaban mal clasificadas?',
    explica: 'Mide la precisión de la intervención por grupo: de a quienes se les aplica la medida, cuántos no la merecían.',
  },
  fnr: {
    nombre: 'Tasa de Falsos Negativos', sigla: 'FNR',
    columna: 'Disparidad en Tasa de Falsos Negativos (FNR)',
    idea: 'Entre quienes SÍ eran positivos, ¿a cuántos se le escapó el modelo?',
    explica: 'Clave cuando una predicción positiva da acceso a un beneficio o apoyo: evita dejar fuera a un grupo que lo necesita.',
  },
  for: {
    nombre: 'Tasa de Falsas Omisiones', sigla: 'FOR',
    columna: 'Disparidad en Tasa de Falsas Omisiones (FOR)',
    idea: 'Entre las personas marcadas como “negativas”, ¿cuántas eran realmente positivas?',
    explica: 'Relevante al negar un recurso: de a quienes se deja fuera, cuántos en realidad debían recibirlo.',
  },
  tpr: {
    nombre: 'Sensibilidad (Recall)', sigla: 'TPR',
    columna: 'Disparidad en Tasa de Verdaderos Positivos (TPR)',
    idea: 'Entre quienes SÍ eran positivos, ¿a cuántos logró detectar el modelo?',
    explica: 'Útil cuando solo puedes ayudar a una fracción de quienes lo necesitan: busca cubrir una proporción similar en cada grupo.',
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
    options: [
      { label: 'Recibe una acción que puede perjudicarla (punitiva)', help: 'Ej.: vigilancia, negar un crédito, detener.', go: 'punitiva' },
      { label: 'Recibe una ayuda o beneficio (asistencial)', help: 'Ej.: apoyo social, cupo, admisión.', go: 'asistencial' },
    ],
  },
  punitiva: {
    type: 'q',
    text: 'En ese contexto punitivo, ¿a quién te importa más NO perjudicar?',
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
          const m = METRIC_INFO[(current as any).metric as MetricKey];
          return (
            <div>
              <div className="rounded-lg p-4 text-white" style={{ backgroundColor: TERRA }}>
                <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                  <Target size={16} /> Métrica recomendada para analizar
                </div>
                <div className="text-xl font-bold">{m.nombre} <span className="text-white/80 text-base font-mono">({m.sigla})</span></div>
              </div>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p><b>La pregunta que responde:</b> <i>{m.idea}</i></p>
                <p>{m.explica}</p>
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-2">
                  <b className="text-indigo-800">¿Dónde la reviso?</b> En la pestaña <b>Análisis de Equidad</b>, observa la columna
                  <b> “{m.columna}”</b> de la tabla de disparidades y su gráfico. Una disparidad cercana a <b>1.00</b> indica equidad
                  en esa métrica; valores lejanos a 1 señalan un posible sesgo.
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
