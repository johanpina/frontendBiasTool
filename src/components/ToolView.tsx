
import React, { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { trackStepComplete, trackToolComplete, trackToolExport } from '../lib/analytics';
import { FileUpload } from './FileUpload';
import { InfoAlert } from './InfoAlert';
import { ErrorAlert } from './ErrorAlert';
import { DataPreview } from './DataPreview';
import { ColumnSelector } from './ColumnSelector';
import { Tabs } from './Tabs';
import { AnalysisConfiguration } from './AnalysisConfiguration';
import { useAnalysisState } from '../hooks/useAnalysisState';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAnalysis } from '../hooks/useAnalysis';
import { useEda } from '../hooks/useEda';
import { EdaPanel } from './eda/EdaPanel';
import { IntroGuide } from './IntroGuide';
import { SatisfactionSurvey } from './SatisfactionSurvey';
import { SectionHeader } from './SectionHeader';
import { Download, X } from 'lucide-react';
import { SesgosTabContent } from './SesgosTabContent';
import { EquidadTabContent } from './EquidadTabContent';

interface ToolViewProps {
  onBack: () => void;
}

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export const ToolView: React.FC<ToolViewProps> = ({ onBack }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  // La encuesta de satisfacción solo se muestra al pedir la descarga del PDF.
  const [showSurvey, setShowSurvey] = useState(false);
  // Métrica recomendada por el árbol (Paso 2), para destacarla en el PDF.
  const [recommendedMetric, setRecommendedMetric] = useState<string | null>(null);
  
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

  const { handleFileUpload: onFileUpload } = useFileUpload({
    setFile,
    setError,
    setLoading,
    setPreviewData,
    BASE_API_URL
  });

  const { eda, edaLoading, edaError, runEda } = useEda({ BASE_API_URL });

  // Al cargar el CSV: preview (para la config) + análisis exploratorio en paralelo.
  const handleFileUploadWithEda = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onFileUpload(event);
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      runEda(file);
    }
  };

  const { handleAnalyze, handleBiasAnalysis, handleRecalculateFairness } = useAnalysis({
    BASE_API_URL,
    setLoading,
    setError,
    setResults,
  });

  const handleThresholdChange = (newValue: number) => {
    setFairnessThreshold(newValue);
    if (results) {
      handleRecalculateFairness(results, newValue);
    }
  };

  const onAnalyze = async () => {
    if (!file || !columnSelection.predictions || !columnSelection.actual) {
      setError('Por favor selecciona todas las columnas requeridas');
      return;
    }

    if (columnSelection.protected.length === 0) {
      setError('Por favor selecciona al menos una variable protegida');
      return;
    }

    await handleAnalyze(file, columnSelection, { fairnessThreshold });
    trackStepComplete('configuracion', 0, 2);
    trackToolComplete();
    setShowAnalysis(true);
  };

  const onBiasAnalysis = async (params: any) => {
    if (!file) return;
    // El slider de la pestaña de Equidad envía el umbral en `fairness_threshold`;
    // lo usamos como fuente de verdad para que la tolerancia realmente se aplique.
    const threshold = params.fairness_threshold ?? fairnessThreshold;
    setFairnessThreshold(threshold);
    const fullParams = { ...params, fairnessThreshold: threshold };
    await handleBiasAnalysis(file, columnSelection, fullParams);
  };

  // --- Multiclase: selección de clase (one-vs-rest) ---
  const isMulticlass = results?.metadata?.task_type === 'multiclass';
  const classes: string[] = results?.metadata?.classes || [];
  const activeClass = isMulticlass
    ? (selectedClass && classes.includes(selectedClass) ? selectedClass : classes[0])
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

  return (
    <div className="min-h-screen bg-paper">
      {/* Barra superior estilo EIA */}
      <header className="flex items-center justify-between px-5 sm:px-10 py-3.5 border-b border-rose-light bg-white sticky top-0 z-20">
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

      <div className="max-w-7xl mx-auto py-8 px-4">

        {showAnalysis ? (
          <div>
            <button
              onClick={() => setShowAnalysis(false)}
              className="mb-6 flex items-center text-indigo-600 hover:text-indigo-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver a la configuración
            </button>

            <SectionHeader
              eyebrow="Paso 4"
              title="Revisa los resultados"
              description="Primero el veredicto por variable protegida; luego el detalle por grupo. Al final podrás descargar el informe en PDF."
              className="mb-6"
            />

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
                      loading={loading}
                      onAnalyze={onBiasAnalysis}
                      BASE_API_URL={BASE_API_URL}
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

            <div className="mt-12 space-y-6">
              <SectionHeader
                eyebrow="Paso 5"
                title="Descarga el informe"
              />
              <div className="bg-indigo-50 border border-rose-light rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">El PDF incluye:</h3>
                  <ul className="list-disc pl-5 text-sm text-ink-60">
                    <li>La exploración de tus datos y la configuración usada.</li>
                    <li>El veredicto por variable protegida y el grupo de referencia.</li>
                    <li>Las tablas de disparidad y los gráficos.</li>
                  </ul>
                </div>
                <button
                  onClick={onRequestDownload}
                  disabled={pdfLoading || !effectiveResults}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-burgundy text-white font-semibold rounded-md shadow-sm hover:bg-rose disabled:bg-ink-20 whitespace-nowrap transition-colors"
                >
                  <Download className="h-5 w-5" />
                  {pdfLoading ? 'Generando PDF…' : 'Descargar informe PDF'}
                </button>
              </div>
            </div>

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
        ) : (
          <>
            <IntroGuide />
            <InfoAlert />
            <FileUpload
              file={file}
              loading={loading}
              onFileUpload={handleFileUploadWithEda}
            />

            {(edaLoading || eda || edaError) && (
              <div className="mt-8">
                <EdaPanel eda={eda} loading={edaLoading} error={edaError} />
              </div>
            )}

            {previewData && (
              <>
                {eda && (
                  <div className="mt-10 mb-2 border-t border-line pt-8">
                    <SectionHeader
                      eyebrow="Paso 3"
                      title="Configura el análisis"
                      description="Define cómo se medirá la equidad de tu modelo. Los campos con * son obligatorios."
                    />
                  </div>
                )}

                <AnalysisConfiguration
                  columnSelection={columnSelection}
                  previewData={previewData}
                  onColumnSelectionChange={(field, value) => 
                    setColumnSelection(prev => ({ ...prev, [field]: value }))
                  }
                  onSelectAllProtected={() => {
                    // Solo las columnas que la exploración (paso 2) sugiere como variable protegida.
                    const suggested = new Set(
                      (eda?.columns || []).filter(c => c.role_hint === 'protected').map(c => c.name)
                    );
                    const availableColumns = previewData.columns.filter(
                      col => col !== columnSelection.predictions && col !== columnSelection.actual &&
                        (suggested.size === 0 || suggested.has(col))
                    );
                    setColumnSelection(prev => ({ ...prev, protected: availableColumns }));
                  }}
                  onRemoveProtectedColumn={(column) => {
                    setColumnSelection(prev => ({
                      ...prev,
                      protected: prev.protected.filter(c => c !== column)
                    }));
                  }}
                  onAddProtectedColumn={(column) => {
                    if (!columnSelection.protected.includes(column)) {
                      setColumnSelection(prev => ({
                        ...prev,
                        protected: [...prev.protected, column]
                      }));
                    }
                  }}
                  getAvailableColumns={() => 
                    previewData.columns.filter(
                      col => 
                        col !== columnSelection.predictions && 
                        col !== columnSelection.actual &&
                        !columnSelection.protected.includes(col)
                    )
                  }
                  onWizardComplete={setRecommendedMetric}
                  fairnessThreshold={fairnessThreshold}
                  onThresholdChange={handleThresholdChange}
                />

                <button
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-lg font-semibold"
                  onClick={onAnalyze}
                  disabled={loading}
                >
                  {loading ? 'Analizando...' : 'Analizar Modelo'}
                </button>
              </>
            )}

            {error && <ErrorAlert message={error} />}
          </>
        )}
      </div>
    </div>
  );
};
