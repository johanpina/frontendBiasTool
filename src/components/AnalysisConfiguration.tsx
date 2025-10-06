
import React from 'react';
import { ColumnSelector } from './ColumnSelector';
import { FairnessWizard } from './FairnessWizard';
import { DataPreview } from './DataPreview';

interface AnalysisConfigurationProps {
  columnSelection: any;
  previewData: any;
  onColumnSelectionChange: (field: string, value: any) => void;
  onSelectAllProtected: () => void;
  onRemoveProtectedColumn: (column: string) => void;
  onAddProtectedColumn: (column: string) => void;
  getAvailableColumns: () => string[];
  onWizardComplete: (recommendedMetric: string) => void;
  fairnessThreshold: number;
  onThresholdChange: (value: number) => void;
}

export const AnalysisConfiguration: React.FC<AnalysisConfigurationProps> = ({
  columnSelection,
  previewData,
  onColumnSelectionChange,
  onSelectAllProtected,
  onRemoveProtectedColumn,
  onAddProtectedColumn,
  getAvailableColumns,
  onWizardComplete,
  fairnessThreshold,
  onThresholdChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Paso 1: Configura tu Dataset</h2>
        <div className="mb-4 text-gray-700">
          <p>Asocia correctamente cada columna del archivo con su función en el análisis.</p>
        </div>
        <DataPreview previewData={previewData} />
        <ColumnSelector
          columnSelection={columnSelection}
          previewData={previewData}
          onColumnSelectionChange={onColumnSelectionChange}
          onSelectAllProtected={onSelectAllProtected}
          onRemoveProtectedColumn={onRemoveProtectedColumn}
          onAddProtectedColumn={onAddProtectedColumn}
          getAvailableColumns={getAvailableColumns}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Paso 2: Define tu Contexto de Equidad (Opcional)</h2>
        <p className="text-gray-700 mb-4">
          Responde estas preguntas para que podamos recomendarte la métrica de equidad más relevante para tu caso de uso, basado en el árbol de decisión de Aequitas.
        </p>
        <FairnessWizard onComplete={onWizardComplete} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Paso 3: Define el Umbral de Equidad</h2>
        <p className="text-gray-700 mb-4">
          Define el umbral para determinar si una disparidad es injusta. Un valor común es 1.25, lo que significa que una disparidad es aceptable si la métrica de un grupo es como máximo un 25% diferente a la del grupo de referencia. Un valor de 1.0 exigiría paridad perfecta.
        </p>
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.05"
            value={fairnessThreshold}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="font-mono text-lg text-indigo-600">{fairnessThreshold.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
