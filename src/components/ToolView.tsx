import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { InfoAlert } from './InfoAlert';
import { ErrorAlert } from './ErrorAlert';
import { DataPreview } from './DataPreview';
import { ColumnSelector } from './ColumnSelector';
import { Tabs } from './Tabs';
import { BiasAnalysis } from './BiasAnalysis';
import { ReferenceGroupAnalysis } from './ReferenceGroupAnalysis';
import { BiasAnalysisTab } from './BiasAnalysisTab';
import { useAnalysisState } from '../hooks/useAnalysisState';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAnalysis } from '../hooks/useAnalysis';
import { metrics } from '../constants';

interface ToolViewProps {
  onBack: () => void;
}

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export const ToolView: React.FC<ToolViewProps> = ({ onBack }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const {
    file,
    loading,
    error,
    previewData,
    results,
    selectedMetric,
    selectedAttribute,
    plotData,
    columnSelection,
    setFile,
    setLoading,
    setError,
    setPreviewData,
    setResults,
    setSelectedMetric,
    setSelectedAttribute,
    setPlotData,
    setColumnSelection
  } = useAnalysisState();

  const { handleFileUpload: onFileUpload } = useFileUpload({
    setFile,
    setError,
    setLoading,
    setPreviewData,
    BASE_API_URL
  });

  const { handleAnalyze, handleBiasAnalysis } = useAnalysis({
    BASE_API_URL,
    setLoading,
    setError,
    setResults,
    setPlotData
  });

  const onAnalyze = async () => {
    if (!file || !columnSelection.predictions || !columnSelection.actual) {
      setError('Por favor selecciona todas las columnas requeridas');
      return;
    }

    if (columnSelection.protected.length === 0) {
      setError('Por favor selecciona al menos una variable protegida');
      return;
    }

    await handleAnalyze(file, columnSelection);
    setShowAnalysis(true);
  };

  const onBiasAnalysis = async (params: any) => {
    if (!file) return;
    await handleBiasAnalysis(file, columnSelection, params);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Análisis de Sesgos y Equidad
          </h1>
        </div>

        {showAnalysis ? (
          <div>
            <button
              onClick={() => setShowAnalysis(false)}
              className="mb-6 flex items-center text-indigo-600 hover:text-indigo-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver a la configuración
            </button>

            <Tabs
              tabs={[
                {
                  name: 'Análisis de Sesgos',
                  content: (
                    <BiasAnalysis
                      results={results}
                      metrics={metrics}
                      selectedMetric={selectedMetric}
                      selectedAttribute={selectedAttribute}
                      onMetricChange={setSelectedMetric}
                      onAttributeChange={setSelectedAttribute}
                      plotData={plotData}
                      loading={loading}
                      onUpdatePlot={async (metric: string, attribute: string) => {
                        if (!file) return;
                        setLoading(true);
                        try {
                          const response = await fetch(
                            `${BASE_API_URL}/api/plot/${metric}?attribute=${attribute}`,
                            { method: 'GET' }
                          );
                          if (!response.ok) throw new Error('Error al obtener la gráfica');
                          const data = await response.json();
                          setPlotData(data.plot);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Error al cargar la gráfica');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    />
                  ),
                },
                {
                  name: 'Análisis por Grupos de Referencia',
                  content: (
                    <ReferenceGroupAnalysis
                      protectedColumns={results.protected_attributes || []}
                      uniqueValues={results.unique_values || {}}
                      onAnalyze={onBiasAnalysis}
                      results={results}
                      loading={loading}
                    />
                  ),
                },
                {
                  name: 'Análisis de Disparidad',
                  content: (
                    <BiasAnalysisTab
                      protectedColumns={results.protected_attributes || []}
                      uniqueValues={results.unique_values || {}}
                      onAnalyze={onBiasAnalysis}
                      results={results}
                      loading={loading}
                      BASE_API_URL={BASE_API_URL}
                    />
                  ),
                },
              ]}
            />
          </div>
        ) : (
          <>
            <InfoAlert />
            <FileUpload
              file={file}
              loading={loading}
              onFileUpload={onFileUpload}
            />

            {previewData && (
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-4">Configurar Columnas</h2>
                
                <DataPreview previewData={previewData} />
                
                <ColumnSelector
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
                />

                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={onAnalyze}
                  disabled={loading}
                >
                  {loading ? 'Analizando...' : 'Analizar Datos'}
                </button>
              </div>
            )}

            {error && <ErrorAlert message={error} />}
          </>
        )}
      </div>
    </div>
  );
};