
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
        <h2 className="text-xl font-semibold mb-1">3a. Columnas</h2>
        <p className="mb-4 text-gray-700">Indica qué columna cumple cada función.</p>
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
        <h2 className="text-xl font-semibold mb-1">3b. ¿Qué error es más grave en tu caso? (recomendado)</h2>
        <p className="text-gray-700 mb-4">
          Responde 2 o 3 preguntas y te diremos qué tasa de error priorizar. Basado en el árbol de decisión de Aequitas.
        </p>
        <MetricSelectorTree onComplete={onWizardComplete} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">3c. ¿Cuánta diferencia entre grupos aceptas?</h2>
        <p className="text-gray-700 mb-2">
          Comparamos cada grupo con un <b>grupo de referencia</b>. Si un grupo se comporta igual que la referencia,
          su valor es <b>1.00</b>. La tolerancia marca <b>hasta dónde</b> esa diferencia se considera aceptable
          antes de llamarla <b>inequitativa</b>.
        </p>
        <div className="bg-indigo-50 border border-rose-light rounded-lg p-3 mb-3 text-sm text-ink-80">
          <b>Ejemplo con 1.25×:</b> toleras hasta un <b>25% de diferencia</b>. Si el grupo de referencia tiene un
          20% de error, un grupo con hasta 25% de error (1.25 veces) sigue siendo <b>equitativo</b>; si lo supera,
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
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="font-mono text-lg text-indigo-600 whitespace-nowrap">{fairnessThreshold.toFixed(2)}×</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Con esta tolerancia, un grupo se considera <b>equitativo</b> si su valor queda entre{' '}
          <b>{(1 / fairnessThreshold).toFixed(2)}</b> y <b>{fairnessThreshold.toFixed(2)}</b> veces el del grupo
          de referencia (1.00 = sin diferencia). Fuera de ese rango, <b>no equitativo</b>.
        </p>
      </div>
    </div>
  );
};
