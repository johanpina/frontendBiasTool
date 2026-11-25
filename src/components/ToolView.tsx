import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Download, X } from 'lucide-react';
import { trackStepComplete, trackToolComplete, trackToolExport } from '../lib/analytics';
import { FileUpload } from './FileUpload';
import { FileExample } from './FileExample';
import { InfoAlert } from './InfoAlert';
import { ErrorAlert } from './ErrorAlert';
import { Tabs } from './Tabs';
import { AnalysisConfiguration, ConfigErrors, ConfigField, ReferenceConfig } from './AnalysisConfiguration';
import { useAnalysisState } from '../hooks/useAnalysisState';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAnalysis } from '../hooks/useAnalysis';
import { useEda } from '../hooks/useEda';
import { EdaPanel } from './eda/EdaPanel';
import { IntroGuide } from './IntroGuide';
import { SatisfactionSurvey } from './SatisfactionSurvey';
import { SectionHeader } from './SectionHeader';
import { SesgosTabContent } from './SesgosTabContent';
import { EquidadTabContent } from './EquidadTabContent';
import { StepBar } from './StepBar';
import { getModelInfo, defaultPositive, idLikeColumns } from '../lib/modelInfo';
import { orderClasses } from '../lib/classOrder';
import { ColumnSelection } from '../types';

interface ToolViewProps {
  onBack: () => void;
}

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
const VERDICT_METRICS = ['fpr', 'fnr', 'for', 'fdr'];

// Rótulos del resumen "Para analizar falta completar" (orden = orden en pantalla).
const FIELD_LABEL: Record<ConfigField, string> = {
  predictions: 'Columna de predicciones (3a)',
  actual: 'Valor real (3a)',
  protected: 'Variables protegidas (3a)',
  model: 'Tipo de modelo (3b)',
  positiveClass: 'Clase positiva (3b)',
};
const FIELD_TARGET: Record<ConfigField, string> = {
  predictions: 'cfg-predictions',
  actual: 'cfg-actual',
  protected: 'cfg-protected',
  model: 'cfg-model',
  positiveClass: 'cfg-positiveClass',
};

/** Botonera al final de cada paso (U2, U11). */
const StepActions: React.FC<{ back?: React.ReactNode; next?: React.ReactNode }> = ({ back, next }) => (
  <div className="mt-8 pt-5 border-t border-rose-light flex flex-wrap items-center justify-between gap-3">
    <div>{back}</div>
    <div>{next}</div>
  </div>
);

const backBtn = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-rose-light bg-white text-burgundy font-semibold hover:border-burgundy focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2 transition-colors';
const nextBtn = 'inline-flex items-center gap-2 px-6 py-3 rounded-md bg-burgundy text-white font-semibold shadow-sm hover:bg-[#5f2d38] focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2 disabled:bg-ink-20 disabled:cursor-not-allowed transition-colors';

export const ToolView: React.FC<ToolViewProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  // La encuesta de satisfacción solo se muestra al pedir la descarga del PDF.
  const [showSurvey, setShowSurvey] = useState(false);
  // Métrica recomendada por el árbol (3c), para destacarla en el PDF.
  const [recommendedMetric, setRecommendedMetric] = useState<string | null>(null);
  const [positiveClass, setPositiveClass] = useState('');
  const [reference, setReference] = useState<ReferenceConfig>({ method: 'majority', groups: {} });
  const [submitted, setSubmitted] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const {
    file,
    loading,
    error,
    previewData,
    results,
    columnSelection,
    fairnessThreshold,
    setFile,
    setLoading,
    setError,
    setPreviewData,
    setResults,
    setColumnSelection,
    setFairnessThreshold
  } = useAnalysisState();

  const { handleFile } = useFileUpload({ setFile, setError, setLoading, setPreviewData, BASE_API_URL });
  const { eda, edaLoading, edaError, runEda } = useEda({ BASE_API_URL });
  const { handleAnalyze } = useAnalysis({ BASE_API_URL, setLoading, setError, setResults });

  const goTo = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0 });
  };

  // Al cargar un archivo nuevo: se reinicia todo lo que dependía del anterior.
  const onFile = async (f: File) => {
    setResults(null);
    setSubmitted(false);
    setPositiveClass('');
    setSelectedClass(null);
    setColumnSelection({ predictions: '', actual: '', protected: [] });
    setReference({ method: 'majority', groups: {} });
    const ok = await handleFile(f);
    if (ok) runEda(f);
  };

  // Precarga el paso 3 con los roles que detectó la exploración (paso 2), solo en
  // los campos que la persona aún no ha elegido. Puede cambiarlos después.
  useEffect(() => {
    if (!eda || !previewData) return;
    const cols = new Set(previewData.columns);
    const byRole = (role: string) => eda.columns.filter(c => c.role_hint === role && cols.has(c.name)).map(c => c.name);
    const [pred] = byRole('prediction');
    const [actual] = byRole('actual');
    const prot = byRole('protected');
    setColumnSelection(prev => ({
      ...prev,
      predictions: prev.predictions || pred || '',
      actual: prev.actual || actual || '',
      protected: prev.protected.length ? prev.protected : prot,
    }));
  }, [eda, previewData, setColumnSelection]);

  const modelInfo = useMemo(
    () => getModelInfo(eda, columnSelection.predictions, columnSelection.actual),
    [eda, columnSelection.predictions, columnSelection.actual]
  );

  // La clase positiva vuelve a su valor por defecto si deja de existir.
  useEffect(() => {
    if (!modelInfo.classes.includes(positiveClass)) setPositiveClass(defaultPositive(modelInfo));
  }, [modelInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  const idWarnings = idLikeColumns(eda, columnSelection.protected);

  // Errores de los campos obligatorios (se muestran tras pulsar "Analizar el modelo").
  const configErrors: ConfigErrors = useMemo(() => {
    const e: ConfigErrors = {};
    if (!columnSelection.predictions) e.predictions = 'Elige la columna con las predicciones del modelo.';
    if (!columnSelection.actual) e.actual = 'Elige la columna con los valores reales.';
    if (columnSelection.protected.length === 0) e.protected = 'Elige al menos una variable protegida.';
    if (modelInfo.errors.length) e.model = modelInfo.errors[0];
    if (modelInfo.kind && !positiveClass) {
      e.positiveClass = modelInfo.kind === 'binary'
        ? 'Indica con qué valor el modelo marca a una persona.'
        : 'Elige la clase más importante para tu decisión.';
    }
    return e;
  }, [columnSelection, modelInfo, positiveClass]);
  const shownErrors = submitted ? configErrors : {};
  const missing = (Object.keys(FIELD_LABEL) as ConfigField[]).filter((k) => configErrors[k]);

  const focusField = (field: ConfigField) => {
    const el = document.getElementById(FIELD_TARGET[field]);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (el as HTMLElement | null)?.focus({ preventScroll: true });
  };

  const onAnalyze = async () => {
    setSubmitted(true);
    if (missing.length) {
      focusField(missing[0]);
      return;
    }
    if (!file) return;

    const base = recommendedMetric?.replace('_disparity', '');
    const groups = { ...reference.groups };
    if (reference.method === 'custom') {
      // Las variables sin grupo elegido usan su grupo más numeroso.
      columnSelection.protected.forEach((col) => {
        if (!groups[col]) {
          const top = eda?.columns.find((c) => c.name === col)?.top_values?.[0]?.value;
          if (top != null) groups[col] = String(top);
        }
      });
    }
    const params = {
      fairnessThreshold,
      referenceMethod: reference.method,
      ...(reference.method === 'custom' && { referenceGroups: groups }),
      performanceMetric: base && VERDICT_METRICS.includes(base) ? base : 'fpr',
      ...(positiveClass && { positiveClass }),
    };

    const controller = new AbortController();
    abortRef.current = controller;
    const ok = await handleAnalyze(file, columnSelection, params, controller.signal);
    abortRef.current = null;
    if (!ok) return;
    setSelectedClass(null);
    trackStepComplete('configuracion', 0, 2);
    trackToolComplete();
    goTo(4);
  };

  const cancelAnalysis = () => abortRef.current?.abort();

  // --- Multiclase: selección de clase (one-vs-rest) ---
  const isMulticlass = results?.metadata?.task_type === 'multiclass';
  const classes: string[] = useMemo(
    () => orderClasses(results?.metadata?.classes || [], results?.metadata?.focus_class),
    [results]
  );
  const activeClass = isMulticlass
    ? (selectedClass && classes.includes(selectedClass)
      ? selectedClass
      : (results?.metadata?.focus_class && classes.includes(results.metadata.focus_class) ? results.metadata.focus_class : classes[0]))
    : null;

  // Para multiclase, presentamos al resto de la app las tablas/plots de la clase
  // seleccionada (forma binaria), de modo que las pestañas no cambian.
  const effectiveResults = useMemo(() => {
    if (!results || !isMulticlass || !activeClass) return results;
    const bc = results.by_class?.[activeClass];
    if (!bc) return results;
    return {
      ...results,
      tables: bc.tables,
      plots: bc.plots,
      metadata: { ...results.metadata, selected_class: activeClass },
    };
  }, [results, isMulticlass, activeClass]);

  // Genera y descarga el PDF (se llama al enviar u omitir la encuesta).
  const doDownloadPdf = async () => {
    if (!effectiveResults) return;
    setPdfLoading(true);
    try {
      const { generatePdfReport } = await import('../lib/pdfReport');
      await generatePdfReport(effectiveResults, BASE_API_URL, recommendedMetric, eda);
      trackToolExport('pdf');
    } finally {
      setPdfLoading(false);
    }
  };

  // El botón "Descargar informe PDF" abre primero la encuesta (que se puede omitir).
  const onRequestDownload = () => setShowSurvey(true);
  const onSkipSurvey = () => { setShowSurvey(false); doDownloadPdf(); };

  // Qué pasos se pueden abrir desde la barra.
  const fileReady = !!previewData && !error;
  const canGo = (n: number) => {
    if (loading) return false;
    if (n <= 1) return true;
    if (n <= 3) return fileReady;
    return !!results;
  };

  const updateColumn = (field: keyof ColumnSelection, value: string | string[]) =>
    setColumnSelection(prev => ({ ...prev, [field]: value }));

  const onSelectSuggested = () => {
    if (!previewData) return;
    // Solo las columnas que la exploración (paso 2) sugiere como variable protegida.
    const suggested = new Set(
      (eda?.columns || []).filter(c => c.role_hint === 'protected').map(c => c.name)
    );
    const availableColumns = previewData.columns.filter(
      (col: string) => col !== columnSelection.predictions && col !== columnSelection.actual &&
        (suggested.size === 0 || suggested.has(col))
    );
    setColumnSelection(prev => ({ ...prev, protected: availableColumns }));
  };

  const meta = results?.metadata || {};

  return (
    <div className="min-h-screen bg-paper">
      {/* Barra superior estilo EIA */}
      <header className="flex items-center justify-between px-5 sm:px-10 py-3.5 border-b border-rose-light bg-white sticky top-0 z-20 h-[65px]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Volver al inicio"
            className="p-2 rounded-full hover:bg-indigo-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-burgundy" />
          </button>
          <img src="/images/goblab-uai.png" alt="GobLab - Universidad Adolfo Ibáñez" className="h-8 w-auto" />
          <span className="hidden sm:block w-px h-6 bg-rose-light" />
          <div className="hidden sm:block leading-none">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-rose">Herramientas · Algoritmos éticos</span>
            <span className="block font-display text-base font-semibold text-ink">Análisis de Sesgos y Equidad</span>
          </div>
        </div>
      </header>

      <StepBar current={step} canGo={canGo} onGo={goTo} />

      {/* pb-28: deja espacio para el botón flotante "Enviar feedback" (U11) */}
      <div className="max-w-7xl mx-auto pt-8 pb-28 px-4">

        {/* ---------------- Paso 1 · Carga tus datos ---------------- */}
        {step === 1 && (
          <>
            <IntroGuide />
            <FileExample />
            <InfoAlert />
            <FileUpload
              file={file}
              loading={loading}
              error={error}
              rows={eda?.n_rows ?? null}
              cols={eda?.n_cols ?? previewData?.columns?.length ?? null}
              onFile={onFile}
            />
            <StepActions
              next={
                <button className={nextBtn} disabled={!fileReady || loading} onClick={() => goTo(2)}>
                  Siguiente: explorar los datos <ArrowRight className="h-4 w-4" />
                </button>
              }
            />
          </>
        )}

        {/* ---------------- Paso 2 · Explora tus datos ---------------- */}
        {step === 2 && (
          <>
            <EdaPanel eda={eda} loading={edaLoading} error={edaError} />
            <StepActions
              back={<button className={backBtn} onClick={() => goTo(1)}><ArrowLeft className="h-4 w-4" /> Cambiar archivo</button>}
              next={
                <button className={nextBtn} disabled={edaLoading} onClick={() => goTo(3)}>
                  Siguiente: configurar el análisis <ArrowRight className="h-4 w-4" />
                </button>
              }
            />
          </>
        )}

        {/* ---------------- Paso 3 · Configura el análisis ---------------- */}
        {step === 3 && previewData && (
          <>
            <SectionHeader
              eyebrow="Paso 3"
              title="Configura el análisis"
              description="Define cómo se medirá la equidad de tu modelo. Los campos con * son obligatorios."
              className="mb-6"
            />
            <AnalysisConfiguration
              previewData={previewData}
              eda={eda}
              columnSelection={columnSelection}
              onColumnSelectionChange={updateColumn}
              onSelectSuggested={onSelectSuggested}
              modelInfo={modelInfo}
              positiveClass={positiveClass}
              onPositiveClassChange={setPositiveClass}
              onWizardComplete={setRecommendedMetric}
              fairnessThreshold={fairnessThreshold}
              onThresholdChange={setFairnessThreshold}
              reference={reference}
              onReferenceChange={setReference}
              errors={shownErrors}
            />

            {submitted && missing.length > 0 && (
              <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-semibold mb-1">Para analizar falta completar:</p>
                <ul className="list-disc pl-5 space-y-0.5">
                  {missing.map((f) => (
                    <li key={f}>
                      <button type="button" onClick={() => focusField(f)} className="underline underline-offset-2 hover:text-red-900">
                        {FIELD_LABEL[f]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {error && <div className="mt-4"><ErrorAlert message={error} /></div>}

            <StepActions
              back={<button className={backBtn} disabled={loading} onClick={() => goTo(2)}><ArrowLeft className="h-4 w-4" /> Volver a la exploración</button>}
              next={
                <div className="flex flex-wrap items-center justify-end gap-3">
                  {loading && (
                    <>
                      <span className="text-sm text-ink-60" aria-live="polite">Analizando… Esto puede tardar hasta 30 segundos.</span>
                      <button type="button" onClick={cancelAnalysis} className="text-sm font-semibold text-burgundy underline underline-offset-2">
                        Cancelar
                      </button>
                    </>
                  )}
                  <button
                    className={nextBtn}
                    onClick={onAnalyze}
                    disabled={loading || idWarnings.length > 0}
                    title={idWarnings.length ? 'Quita las columnas que parecen identificadores para analizar.' : undefined}
                  >
                    {loading ? 'Analizando…' : 'Analizar el modelo'}
                  </button>
                </div>
              }
            />
          </>
        )}

        {/* ---------------- Paso 4 · Revisa los resultados ---------------- */}
        {step === 4 && results && (
          <div>
            <SectionHeader
              eyebrow="Paso 4"
              title="Revisa los resultados"
              description="Primero el veredicto por variable protegida; luego el detalle por grupo."
              className="mb-4"
            />

            {!isMulticlass && (
              <p className="mb-6 text-sm text-ink-80">
                <b>Modelo binario</b> · Clase positiva: <b>{meta.positive_class ?? '1'}</b> · Método: Aequitas
              </p>
            )}

            {isMulticlass && (
              <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-rose-light">
                <SectionHeader
                  eyebrow={`Modelo multiclase (${classes.length} clases)`}
                  title="Estás viendo la clase:"
                  description={<>Cada clase se compara contra {classes.length === 3 ? 'las otras dos juntas' : 'las demás juntas'}. Las tablas y gráficos de abajo muestran la clase seleccionada.</>}
                />

                {/* Selector de clase (pills) */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {classes.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedClass(c)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                        activeClass === c
                          ? 'bg-burgundy text-white border-burgundy'
                          : 'bg-white text-ink-80 border-rose-light hover:border-burgundy'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Resumen global por atributo */}
                {Array.isArray(results?.fairness_overall) && results.fairness_overall.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-line">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-burgundy mb-2">
                      Veredicto considerando las {classes.length} clases
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {results.fairness_overall.map((row: any, i: number) => {
                        const attr = row['Atributo'] ?? row['attribute_name'];
                        const verdict = row['Conclusión Equidad'] ?? row['fairness_conclusion'];
                        const unfair = verdict === 'Unfair' || verdict === 'No Equitativo';
                        return (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                              unfair
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {attr}: {unfair ? 'No equitativo' : 'Equitativo'}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-xs text-ink-60 mt-2">
                      Una variable es <b>no equitativa</b> si lo es en <b>al menos una</b> clase.
                    </p>
                  </div>
                )}
              </div>
            )}

            <Tabs
              tabs={[
                {
                  name: 'Veredicto y resumen',
                  content: (
                    <EquidadTabContent
                      results={effectiveResults}
                      BASE_API_URL={BASE_API_URL}
                      onEditConfig={() => goTo(3)}
                    />
                  ),
                },
                {
                  name: 'Detalle por grupo',
                  content: (
                    <SesgosTabContent
                      results={effectiveResults}
                      BASE_API_URL={BASE_API_URL}
                    />
                  ),
                },
              ]}
            />

            <StepActions
              back={<button className={backBtn} onClick={() => goTo(3)}><ArrowLeft className="h-4 w-4" /> Cambiar la configuración</button>}
              next={
                <button className={nextBtn} onClick={() => goTo(5)}>
                  Siguiente: descargar el informe <ArrowRight className="h-4 w-4" />
                </button>
              }
            />
          </div>
        )}

        {/* ---------------- Paso 5 · Descarga el informe ---------------- */}
        {step === 5 && results && (
          <div className="space-y-6">
            <SectionHeader eyebrow="Paso 5" title="Descarga el informe" />
            <div className="bg-indigo-50 border border-rose-light rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">El PDF incluye:</h3>
                <ul className="list-disc pl-5 text-sm text-ink-60">
                  <li>La exploración de tus datos y la configuración usada.</li>
                  <li>El veredicto por variable protegida y el grupo de referencia.</li>
                  <li>Las tablas de disparidad y los gráficos.</li>
                </ul>
                {isMulticlass && activeClass && (
                  <p className="text-sm text-ink-80 mt-2">Clase incluida en el informe: <b>{activeClass}</b>.</p>
                )}
              </div>
              <button
                onClick={onRequestDownload}
                disabled={pdfLoading || !effectiveResults}
                className={`${nextBtn} whitespace-nowrap`}
              >
                <Download className="h-5 w-5" />
                {pdfLoading ? 'Generando PDF…' : 'Descargar informe PDF'}
              </button>
            </div>
            <StepActions
              back={<button className={backBtn} onClick={() => goTo(4)}><ArrowLeft className="h-4 w-4" /> Volver a los resultados</button>}
            />
          </div>
        )}

        {/* Al pulsar "Descargar", primero se ofrece la encuesta (se puede omitir). */}
        {showSurvey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowSurvey(false)} aria-hidden />
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowSurvey(false)}
                aria-label="Cerrar sin descargar"
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white border border-rose-light transition-colors"
              >
                <X className="h-5 w-5 text-ink-60" />
              </button>
              <SatisfactionSurvey
                onSubmitted={doDownloadPdf}
                onSkip={onSkipSurvey}
                submitLabel="Enviar y descargar"
                skipLabel="Omitir y descargar"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
