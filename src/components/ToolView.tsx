
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
import { Download } from 'lucide-react';
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

  const onDownloadPdf = async () => {
    if (!effectiveResults) return;
    setPdfLoading(true);
    try {
      const { generatePdfReport } = await import('../lib/pdfReport');
      await generatePdfReport(effectiveResults, BASE_API_URL);
      trackToolExport('pdf');
    } finally {
      setPdfLoading(false);
    }
  };

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
              eyebrow="Resultados · Análisis del modelo"
              title="Resultados de tu evaluación"
              description="Explora el análisis de sesgos y el de equidad. Al final podrás descargar el informe en PDF."
              className="mb-6"
            />

            {isMulticlass && (
              <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-indigo-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="font-semibold text-gray-800 whitespace-nowrap">
                    Clase a analizar (uno-contra-el-resto):
                  </label>
                  <select
                    value={activeClass ?? ''}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {classes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Modelo <b>multiclase</b> ({classes.length} clases): cada clase se evalúa frente al resto.
                  Las tablas y gráficos muestran la clase <b>{activeClass}</b>.
                </p>
                {Array.isArray(results?.fairness_overall) && results.fairness_overall.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-800">Resumen global (inequidad en alguna clase):</span>
                    {results.fairness_overall.map((row: any, i: number) => {
                      const attr = row['Atributo'] ?? row['attribute_name'];
                      const verdict = row['Conclusión Equidad'] ?? row['fairness_conclusion'];
                      const unfair = verdict === 'Unfair' || verdict === 'No Equitativo';
                      return (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${unfair ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                        >
                          {attr}: {unfair ? 'No Equitativo' : 'Equitativo'}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <Tabs
              tabs={[
                {
                  name: 'Análisis de Sesgos',
                  content: (
                    <SesgosTabContent
                      results={effectiveResults}
                      BASE_API_URL={BASE_API_URL}
                    />
                  ),
                },
                {
                  name: 'Análisis de Equidad',
                  content: (
                    <EquidadTabContent
                      results={effectiveResults}
                      loading={loading}
                      onAnalyze={onBiasAnalysis}
                      BASE_API_URL={BASE_API_URL}
                    />
                  ),
                },
              ]}
            />

            <div className="mt-12 space-y-6">
              <SectionHeader
                eyebrow="Paso final · Informe"
                title="Descarga y evalúa"
              />
              <div className="bg-indigo-50 border border-rose-light rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">Tu informe está listo</h3>
                  <p className="text-sm text-ink-60">Incluye los metadatos del análisis, las tablas de disparidad y los gráficos de equidad.</p>
                </div>
                <button
                  onClick={onDownloadPdf}
                  disabled={pdfLoading || !effectiveResults}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-burgundy text-white font-semibold rounded-md shadow-sm hover:bg-rose disabled:bg-ink-20 whitespace-nowrap transition-colors"
                >
                  <Download className="h-5 w-5" />
                  {pdfLoading ? 'Generando PDF…' : 'Descargar informe PDF'}
                </button>
              </div>

              <SatisfactionSurvey />
            </div>
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
                      eyebrow="Paso 02 · Configuración"
                      title="Configuración del análisis"
                      description="Con el panorama de tus datos claro, selecciona las columnas y la tolerancia para medir la equidad."
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
                    const availableColumns = previewData.columns.filter(
                      col => col !== columnSelection.predictions && col !== columnSelection.actual
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
                  onWizardComplete={() => {}} // Placeholder
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
