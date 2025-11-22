
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
          <ul className="list-disc pl-6 mb-2">
            <li><b>Columna de Predicciones:</b> selecciona la columna que contiene las predicciones generadas por tu modelo.</li>
            <li><b>Columna de Valores Reales:</b> selecciona la columna que contiene las etiquetas reales u observadas.</li>
            <li><b>Selecciona solo las variables protegidas: </b><br/>
              <span className="ml-2">- En el campo “Selecciona las columnas que quieres analizar”, marca únicamente las variables protegidas que deseas evaluar por sesgos (por ejemplo: género, edad, situación socioeconómica).</span><br/>
              <span className="ml-2">- No incluyas columnas de identificadores como ID, entity_id u otras variables que no representen atributos demográficos, ya que pueden interferir con los resultados del análisis.</span>
            </li>
          </ul>
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
        <h2 class="text-xl font-semibold mb-4">Paso 3: Define el Porcentaje de Tolerancia de Disparidad</h2>
        <p class="text-gray-700 mb-4">
          Define el porcentaje máximo de disparidad aceptable entre un grupo y el grupo de referencia. Por ejemplo, un 25% de tolerancia significa que la métrica de un grupo puede ser hasta un 25% diferente a la del grupo de referencia antes de considerarse injusta. Como ejemplo práctico, si la tasa de aprobación del grupo de referencia es del 50%, con una tolerancia del 20%, se aceptarían tasas de aprobación de hasta el 60% (50% * 1.20) para otros grupos.
        </p>
        <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={(fairnessThreshold - 1) * 100}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value) / 100 + 1)}
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span class="font-mono text-lg text-indigo-600">{`${((fairnessThreshold - 1) * 100).toFixed(0)}%`}</span>
        </div>
      </div>
    </div>
  );
};
