import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { MetricSelectorTree } from './MetricSelectorTree';
import { DataPreview } from './DataPreview';
import { ColumnSelection, EdaResult, PreviewData } from '../types';
import { ModelInfo, idLikeColumns } from '../lib/modelInfo';
import { fmtInt } from '../lib/format';

export type ConfigField = 'predictions' | 'actual' | 'protected' | 'positiveClass' | 'model';
export type ConfigErrors = Partial<Record<ConfigField, string>>;

export interface ReferenceConfig {
  method: 'majority' | 'best_performance' | 'custom';
  groups: Record<string, string>;
}

interface AnalysisConfigurationProps {
  previewData: PreviewData;
  eda: EdaResult | null;
  columnSelection: ColumnSelection;
  onColumnSelectionChange: (field: keyof ColumnSelection, value: string | string[]) => void;
  onSelectSuggested: () => void;
  modelInfo: ModelInfo;
  positiveClass: string;
  onPositiveClassChange: (value: string) => void;
  onWizardComplete: (recommendedMetric: string) => void;
  fairnessThreshold: number;
  onThresholdChange: (value: number) => void;
  reference: ReferenceConfig;
  onReferenceChange: (ref: ReferenceConfig) => void;
  /** Errores por campo (solo tras pulsar "Analizar el modelo"). */
  errors: ConfigErrors;
}

const fieldClass = (err?: string) =>
  `block w-full rounded-md shadow-sm focus:ring focus:ring-opacity-50 ${
    err ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-300 focus:ring-indigo-200'
  }`;

const FieldError: React.FC<{ id: string; msg?: string }> = ({ id, msg }) =>
  msg ? <p id={id} className="mt-1 text-sm text-red-600">{msg}</p> : null;

const REF_OPTIONS: { id: ReferenceConfig['method']; name: string; description: string }[] = [
  { id: 'majority', name: 'Grupo más numeroso (recomendado)', description: 'Compara cada grupo con el que tiene más casos.' },
  { id: 'best_performance', name: 'Grupo con menos errores', description: 'Compara con el grupo al que mejor le va en la métrica principal.' },
  { id: 'custom', name: 'Personalizado', description: 'Tú eliges el grupo, si hay una razón legal o institucional.' },
];

export const AnalysisConfiguration: React.FC<AnalysisConfigurationProps> = ({
  previewData,
  eda,
  columnSelection,
  onColumnSelectionChange,
  onSelectSuggested,
  modelInfo,
  positiveClass,
  onPositiveClassChange,
  onWizardComplete,
  fairnessThreshold,
  onThresholdChange,
  reference,
  onReferenceChange,
  errors,
}) => {
  const roleOf = (col: string) => eda?.columns.find((c) => c.name === col)?.role_hint;
  const candidates = previewData.columns.filter(
    (c) => c !== columnSelection.predictions && c !== columnSelection.actual
  );
  const toggleProtected = (col: string, on: boolean) => {
    const next = on
      ? [...columnSelection.protected, col]
      : columnSelection.protected.filter((c) => c !== col);
    onColumnSelectionChange('protected', previewData.columns.filter((c) => next.includes(c)));
  };
  const idWarnings = idLikeColumns(eda, columnSelection.protected);
  const valuesOf = (col: string) =>
    (eda?.columns.find((c) => c.name === col)?.top_values || [])
      .filter((t: any) => !t.is_aggregate)
      .map((t: any) => String(t.value));
  const positiveLabel = modelInfo.kind && positiveClass ? positiveClass : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 space-y-10">
      {/* --- 3a. Columnas --- */}
      <section>
        <h2 className="text-xl font-semibold mb-1">3a. Columnas</h2>
        <p className="mb-4 text-gray-700">Indica qué columna cumple cada función.</p>
        <DataPreview previewData={previewData} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="cfg-predictions" className="block text-sm font-medium text-gray-700">
              Predicción del modelo <span className="text-burgundy">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Lo que predijo el modelo.</p>
            <select
              id="cfg-predictions"
              aria-invalid={!!errors.predictions}
              aria-describedby={errors.predictions ? 'err-predictions' : undefined}
              className={fieldClass(errors.predictions)}
              value={columnSelection.predictions}
              onChange={(e) => onColumnSelectionChange('predictions', e.target.value)}
            >
              <option value="">Seleccionar columna</option>
              {previewData.columns.map((column) => <option key={column} value={column}>{column}</option>)}
            </select>
            <FieldError id="err-predictions" msg={errors.predictions} />
          </div>

          <div>
            <label htmlFor="cfg-actual" className="block text-sm font-medium text-gray-700">
              Valor real <span className="text-burgundy">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Lo que realmente ocurrió.</p>
            <select
              id="cfg-actual"
              aria-invalid={!!errors.actual}
              aria-describedby={errors.actual ? 'err-actual' : undefined}
              className={fieldClass(errors.actual)}
              value={columnSelection.actual}
              onChange={(e) => onColumnSelectionChange('actual', e.target.value)}
            >
              <option value="">Seleccionar columna</option>
              {previewData.columns.map((column) => <option key={column} value={column}>{column}</option>)}
            </select>
            <FieldError id="err-actual" msg={errors.actual} />
          </div>
        </div>

        <fieldset
          id="cfg-protected"
          tabIndex={-1}
          aria-invalid={!!errors.protected}
          aria-describedby={errors.protected ? 'err-protected' : undefined}
          className="outline-none"
        >
          <div className="flex justify-between items-start gap-4 mb-2">
            <div>
              <legend className="block text-sm font-medium text-gray-700">
                Variables protegidas <span className="text-burgundy">*</span>
              </legend>
              <p className="text-xs text-gray-500">
                Características de las personas que quieres comparar (ej.: sexo, edad). No incluyas identificadores como RUT o ID.
              </p>
            </div>
            <button
              type="button"
              onClick={onSelectSuggested}
              className="text-sm text-indigo-600 hover:text-indigo-500 whitespace-nowrap"
            >
              Seleccionar las sugeridas
            </button>
          </div>
          <div className={`flex flex-wrap gap-2 rounded-lg p-3 border ${errors.protected ? 'border-red-500' : 'border-gray-200'}`}>
            {candidates.map((col) => {
              const checked = columnSelection.protected.includes(col);
              return (
                <label
                  key={col}
                  className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border cursor-pointer ${
                    checked ? 'border-burgundy bg-rose-tint text-burgundy' : 'border-gray-200 bg-white text-ink-80'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggleProtected(col, e.target.checked)}
                    className="accent-burgundy"
                  />
                  {col}
                  {roleOf(col) === 'id' && <span className="text-xs text-ink-40">(identificador)</span>}
                </label>
              );
            })}
          </div>
          {columnSelection.protected.length === 0 && !errors.protected && (
            <p className="mt-1 text-sm text-ink-60">Elige al menos una variable protegida.</p>
          )}
          <FieldError id="err-protected" msg={errors.protected} />
          {idWarnings.map((w) => (
            <div key={w.name} role="alert" className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                '{w.name}' tiene {fmtInt(w.unique)} valores distintos: parece un identificador. Analizarla crearía{' '}
                {fmtInt(w.unique)} grupos de {w.perGroup <= 1.05 ? '1 caso' : 'muy pocos casos'}.
              </span>
              <button
                type="button"
                onClick={() => toggleProtected(w.name, false)}
                className="ml-auto font-semibold underline underline-offset-2"
              >
                Quitar {w.name}
              </button>
            </div>
          ))}
        </fieldset>
      </section>

      {/* --- 3b. Tipo de modelo --- */}
      <section id="cfg-model" tabIndex={-1} className="outline-none">
        <h2 className="text-xl font-semibold mb-1">3b. Tipo de modelo</h2>
        {!columnSelection.predictions || !columnSelection.actual ? (
          <p className="text-gray-600">Aparece al elegir las columnas de predicción y valor real.</p>
        ) : modelInfo.errors.length > 0 ? (
          <div role="alert" className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 space-y-1">
            {modelInfo.errors.map((e) => <p key={e}>{e}</p>)}
          </div>
        ) : !modelInfo.kind ? (
          <p className="text-gray-600">Detectaremos el tipo de modelo al analizar.</p>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-ink-80 space-y-0.5">
              <p>
                <b>Tipo de modelo:</b> {modelInfo.kind === 'binary' ? 'Binario' : 'Multiclase'} ({modelInfo.classes.length} valores:{' '}
                {modelInfo.classes.join(', ')})
              </p>
              <p>
                <b>Método:</b>{' '}
                {modelInfo.kind === 'binary' ? 'Aequitas' : 'cada clase se compara contra las demás juntas.'}
              </p>
            </div>
            <fieldset
              id="cfg-positiveClass"
              tabIndex={-1}
              aria-invalid={!!errors.positiveClass}
              aria-describedby={errors.positiveClass ? 'err-positiveClass' : undefined}
              className="outline-none"
            >
              <legend className="block text-sm font-medium text-gray-700 mb-1.5">
                {modelInfo.kind === 'binary'
                  ? '¿Con qué valor el modelo marca a una persona?'
                  : '¿Qué clase es la más importante para tu decisión?'}{' '}
                <span className="text-burgundy">*</span>
              </legend>
              <div className={`flex flex-wrap gap-2 rounded-lg p-2 border ${errors.positiveClass ? 'border-red-500' : 'border-transparent'}`}>
                {modelInfo.classes.map((c) => (
                  <label
                    key={c}
                    className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border cursor-pointer ${
                      positiveClass === c ? 'border-burgundy bg-rose-tint text-burgundy' : 'border-gray-200 bg-white text-ink-80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="positiveClass"
                      value={c}
                      checked={positiveClass === c}
                      onChange={() => onPositiveClassChange(c)}
                      className="accent-burgundy"
                    />
                    {c}
                  </label>
                ))}
              </div>
              <FieldError id="err-positiveClass" msg={errors.positiveClass} />
              <p className="text-xs text-gray-500 mt-1">
                {modelInfo.kind === 'binary'
                  ? 'Es el resultado que activa la acción (fiscalizar, otorgar un beneficio, etc.). Las tasas de error se calculan respecto de este valor.'
                  : 'El veredicto principal se mostrará para esta clase. Podrás revisar las otras en los resultados.'}
              </p>
            </fieldset>
          </div>
        )}
      </section>

      {/* --- 3c. Error más grave --- */}
      <section>
        <h2 className="text-xl font-semibold mb-1">3c. ¿Qué error es más grave en tu caso? (recomendado)</h2>
        <p className="text-gray-700 mb-4">
          Responde 2 o 3 preguntas y te diremos qué tasa de error priorizar. Basado en el árbol de decisión de Aequitas.
        </p>
        <MetricSelectorTree onComplete={onWizardComplete} positiveLabel={positiveLabel} />
      </section>

      {/* --- 3d. Tolerancia --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">3d. ¿Cuánta diferencia entre grupos aceptas?</h2>
        <p className="text-gray-700 mb-2">
          Comparamos cada grupo con un <b>grupo de referencia</b>. Si un grupo se comporta igual que la referencia,
          su valor es <b>1,00</b>. La tolerancia marca <b>hasta dónde</b> esa diferencia se considera aceptable
          antes de llamarla <b>inequitativa</b>.
        </p>
        <div className="bg-indigo-50 border border-rose-light rounded-lg p-3 mb-3 text-sm text-ink-80">
          <b>Ejemplo con 1,25×:</b> toleras hasta un <b>25% de diferencia</b>. Si el grupo de referencia tiene un
          20% de error, un grupo con hasta 25% de error (1,25 veces) sigue siendo <b>equitativo</b>; si lo supera,
          pasa a <b>no equitativo</b>. Es la conocida <b>“regla del 80%”</b>.
        </div>
        <p className="text-gray-700 mb-2 text-sm">
          Mueve el control: <b>más a la derecha</b> = más permisivo (aceptas mayores diferencias);
          <b> más a la izquierda</b> = más estricto.
        </p>
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={fairnessThreshold}
            aria-label="Tolerancia"
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-burgundy"
          />
          <span className="font-mono text-lg text-indigo-600 whitespace-nowrap">{fairnessThreshold.toFixed(2).replace('.', ',')}×</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Con esta tolerancia, un grupo se considera <b>equitativo</b> si su valor queda entre{' '}
          <b>{(1 / fairnessThreshold).toFixed(2).replace('.', ',')}</b> y <b>{fairnessThreshold.toFixed(2).replace('.', ',')}</b> veces el del grupo
          de referencia (1,00 = sin diferencia). Fuera de ese rango, <b>no equitativo</b>. Si no la cambias, se usa 1,25×.
        </p>

        {/* Opciones avanzadas: grupo de referencia */}
        <details className="mt-6 rounded-lg border border-gray-200 bg-white" open={reference.method !== 'majority'}>
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-ink-80">
            Opciones avanzadas · Grupo de referencia
            <span className="font-normal text-ink-60"> ({REF_OPTIONS.find((o) => o.id === reference.method)?.name})</span>
          </summary>
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-700 mb-3">
              Cada grupo se compara con un grupo de referencia de su misma variable protegida. Elige cuál usar:
            </p>
            <div className="flex flex-col md:flex-row gap-3">
              {REF_OPTIONS.map((o) => (
                <label
                  key={o.id}
                  className={`p-3 border rounded-lg cursor-pointer flex-1 flex items-start gap-3 ${
                    reference.method === o.id ? 'bg-indigo-50 border-burgundy' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="referenceMethod"
                    checked={reference.method === o.id}
                    onChange={() => onReferenceChange({ ...reference, method: o.id })}
                    className="mt-1 accent-burgundy"
                  />
                  <span>
                    <span className="block font-semibold text-sm">{o.name}</span>
                    <span className="block text-sm text-gray-600">{o.description}</span>
                  </span>
                </label>
              ))}
            </div>
            {reference.method === 'custom' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {columnSelection.protected.length === 0 && (
                  <p className="text-sm text-ink-60">Primero elige las variables protegidas (3a).</p>
                )}
                {columnSelection.protected.map((col) => {
                  const vals = valuesOf(col);
                  return (
                    <div key={col}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{col}</label>
                      <select
                        value={reference.groups[col] || ''}
                        onChange={(e) => onReferenceChange({ ...reference, groups: { ...reference.groups, [col]: e.target.value } })}
                        className="w-full border-gray-300 rounded-md shadow-sm"
                      >
                        <option value="">Grupo más numeroso</option>
                        {vals.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </details>
      </section>
    </div>
  );
};
