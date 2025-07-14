import React from 'react';
import { FileUpload } from './FileUpload';
import { InfoAlert } from './InfoAlert';
import { ErrorAlert } from './ErrorAlert';
import { DataPreview } from './DataPreview';
import { ColumnSelector } from './ColumnSelector';
import { AnalysisTabs } from './AnalysisTabs';
import { ColumnSelection, PreviewData } from '../types';

interface AnalysisStepsProps {
  step: 'upload' | 'configure' | 'analysis';
  file: File | null;
  loading: boolean;
  error: string | null;
  previewData: PreviewData | null;
  columnSelection: ColumnSelection;
  results: any;
  selectedMetric: string;
  selectedAttribute: string;
  plotData: string | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onColumnSelectionChange: (field: keyof ColumnSelection, value: string | string[]) => void;
  onAnalyze: () => void;
  onBiasAnalysis: (params: any) => void;
  setSelectedMetric: (metric: string) => void;
  setSelectedAttribute: (attribute: string) => void;
  onUpdatePlot: (file: File, columnSelection: any, metric: string, attribute: string) => void;
}

export const AnalysisSteps: React.FC<AnalysisStepsProps> = ({
  step,
  file,
  loading,
  error,
  previewData,
  columnSelection,
  results,
  selectedMetric,
  selectedAttribute,
  plotData,
  onFileUpload,
  onColumnSelectionChange,
  onAnalyze,
  onBiasAnalysis,
  setSelectedMetric,
  setSelectedAttribute,
  onUpdatePlot
}) => {
  return (
    <>
      {step === 'upload' && (
        <>
          <InfoAlert />
          <FileUpload
            file={file}
            loading={loading}
            onFileUpload={onFileUpload}
          />
        </>
      )}

      {step === 'configure' && previewData && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Configura tu dataset para el análisis</h2>
          <div className="mb-4 text-gray-700">
            <p className="mb-2">
              Antes de comenzar, es necesario que asocies correctamente cada columna del archivo cargado con su función en el análisis:
            </p>
            <ul className="list-disc pl-6 mb-2">
              <li><b>Columna de Predicciones:</b> selecciona la columna que contiene las predicciones generadas por tu modelo.</li>
              <li><b>Columna de Valores Reales:</b> selecciona la columna que contiene las etiquetas reales u observadas.</li>
              <li><b>Selecciona solo las variables protegidas: </b><br/>
                <span className="ml-2">- En el campo “Selecciona las columnas que quieres analizar”, marca únicamente las variables protegidas que deseas evaluar por sesgos (por ejemplo: género, edad, situación socioeconómica).</span><br/>
                <span className="ml-2">- No incluyas columnas de identificadores como ID, entity_id u otras variables que no representen atributos demográficos, ya que pueden interferir con los resultados del análisis.</span>
              </li>
            </ul>
            <p>
              Una vez que hayas verificado que la configuración es correcta, haz clic en “Analizar datos” para iniciar el proceso de evaluación de sesgos y equidad.
            </p>
          </div>
          
          <DataPreview previewData={previewData} />
          
          <ColumnSelector
            columnSelection={columnSelection}
            previewData={previewData}
            onColumnSelectionChange={onColumnSelectionChange}
            onSelectAllProtected={() => {
              const availableColumns = previewData.columns.filter(
                col => col !== columnSelection.predictions && col !== columnSelection.actual
              );
              onColumnSelectionChange('protected', availableColumns);
            }}
            onRemoveProtectedColumn={(column) => {
              onColumnSelectionChange(
                'protected',
                columnSelection.protected.filter(c => c !== column)
              );
            }}
            onAddProtectedColumn={(column) => {
              if (!columnSelection.protected.includes(column)) {
                onColumnSelectionChange(
                  'protected',
                  [...columnSelection.protected, column]
                );
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

      {step === 'analysis' && results && (
        <AnalysisTabs
          results={results}
          selectedMetric={selectedMetric}
          selectedAttribute={selectedAttribute}
          plotData={plotData}
          loading={loading}
          file={file}
          columnSelection={columnSelection}
          onBiasAnalysis={onBiasAnalysis}
          setSelectedMetric={setSelectedMetric}
          setSelectedAttribute={setSelectedAttribute}
          onUpdatePlot={onUpdatePlot}
        />
      )}
    </>
  );
};