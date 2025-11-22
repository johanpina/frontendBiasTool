
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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
import { SesgosTabContent } from './SesgosTabContent';
import { EquidadTabContent } from './EquidadTabContent';

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
    setShowAnalysis(true);
  };

  const onBiasAnalysis = async (params: any) => {
    if (!file) return;
    const fullParams = { ...params, fairnessThreshold };
    await handleBiasAnalysis(file, columnSelection, fullParams);
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
            Herramienta de Análisis de Sesgo y Equidad
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
                    <SesgosTabContent
                      results={results}
                      BASE_API_URL={BASE_API_URL}
                    />
                  ),
                },
                {
                  name: 'Análisis de Equidad',
                  content: (
                    <EquidadTabContent
                      results={results}
                      loading={loading}
                      onAnalyze={onBiasAnalysis}
                      BASE_API_URL={BASE_API_URL}
                    />
                  ),
                },
              ]}
            />
          </div>
        ) : (
          <>
            <div className="mb-6 text-justify">
              <p className="text-gray-800 mb-2 font-semibold">
                Para iniciar el análisis de sesgos y equidad, carga un archivo en formato <b>.csv</b> que contenga las siguientes columnas:
              </p>
              <ul className="list-disc pl-6 mb-2 text-gray-700">
                <li><b>Predicciones del modelo:</b> los valores generados por el modelo de inteligencia artificial o machine learning que deseas evaluar.</li>
                <li><b>Valores reales:</b> las etiquetas verdaderas con las que se comparan las predicciones.</li>
                <li><b>Variables protegidas:</b> atributos demográficos o relevantes para el análisis de sesgos. Por ejemplo: género, edad, situación socioeconómica, entre otros. La Ley N.º 20.609 chilena establece 16 categorías protegidas frente a la discriminación arbitraria (<a href='https://www.bcn.cl/leychile/navegar?i=1042092'>ver ley</a>). Si alguna de estas variables está presente en tus datos, debe ser evaluada para identificar posibles sesgos.</li>
              </ul>
              <p className="text-gray-700 mb-2">
                También pueden usarse variables proxy (sustitutas) que estén razonablemente asociadas a estas categorías. La selección de las variables protegidas debe ser realizada por el equipo responsable del proyecto.
              </p>
              <p className="text-gray-700">
                Asegúrate de que cada columna esté claramente identificada y que no hayan valores faltantes en las variables clave. Cada variable debe ser <b>categorica</b>, por lo que columnas con valores reales no serán procesadas.
              </p>
            </div>
            <InfoAlert />
            <FileUpload
              file={file}
              loading={loading}
              onFileUpload={onFileUpload}
            />

            {previewData && (
              <>

                
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
                  {loading ? 'Analizando...' : 'Analizar Datos'}
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
