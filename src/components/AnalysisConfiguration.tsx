
import React from 'react';
import { ColumnSelector } from './ColumnSelector';
import { MetricSelectorTree } from './MetricSelectorTree';
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
        <h2 className="text-xl font-semibold mb-1">Paso 2: ¿Qué métrica debo mirar? (Opcional)</h2>
        <p className="text-gray-700 mb-4">
          No todas las métricas importan por igual: depende de qué hace tu modelo. Responde estas preguntas y te
          diremos, en palabras simples, <b>en qué métrica enfocarte</b> y por qué. Está basado en el
          <b> árbol de decisión de Aequitas</b>.
        </p>
        <MetricSelectorTree onComplete={onWizardComplete} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Paso 3: Define la Tolerancia de Disparidad</h2>
        <p className="text-gray-700 mb-2">
          La tolerancia define cuánta <b>disparidad</b> se acepta entre un subgrupo y el grupo de referencia
          antes de considerarlo inequitativo. Se expresa como un <b>multiplicador</b>: por ejemplo <b>1.25×</b>
          (la clásica "regla del 80%") tolera hasta un 25% de diferencia.
        </p>
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={fairnessThreshold}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="font-mono text-lg text-indigo-600 whitespace-nowrap">{fairnessThreshold.toFixed(2)}×</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Equitativo si la disparidad está entre <b>{(1 / fairnessThreshold).toFixed(2)}</b> y{' '}
          <b>{fairnessThreshold.toFixed(2)}</b> (1.00 = sin disparidad).
        </p>
      </div>
    </div>
  );
};
