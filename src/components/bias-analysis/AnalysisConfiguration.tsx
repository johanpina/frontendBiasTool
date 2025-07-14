import React from 'react';
import { BarChart2 } from 'lucide-react';
import { ReferenceMethodSelector } from './ReferenceMethodSelector';
import { MetricSelector } from './MetricSelector';
import { ReferenceGroupSelector } from './ReferenceGroupSelector';
import { ValidationWarning } from './ValidationWarning';
import { AnalysisButton } from './AnalysisButton';

interface AnalysisConfigurationProps {
  referenceMethod: string;
  metricRef: string;
  protectedColumns: string[];
  uniqueValues: Record<string, string[]>;
  referenceGroups: Record<string, string>;
  loading: boolean;
  showWarning: boolean;
  isValidConfig: boolean;
  onReferenceMethodChange: (method: string) => void;
  onMetricChange: (metric: string) => void;
  onReferenceGroupChange: (attribute: string, value: string) => void;
  onAnalyze: () => void;
}

export const AnalysisConfiguration: React.FC<AnalysisConfigurationProps> = ({
  referenceMethod,
  metricRef,
  protectedColumns,
  uniqueValues,
  referenceGroups,
  loading,
  showWarning,
  isValidConfig,
  onReferenceMethodChange,
  onMetricChange,
  onReferenceGroupChange,
  onAnalyze
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <BarChart2 className="h-6 w-6" />
        Configuración del Análisis de Equidad
      </h2>
      <div className="mb-6 text-gray-700">
        <p className="mb-2 font-semibold">Método de selección de subgrupo de referencia</p>
        <p className="mb-2">
          Para realizar un análisis de equidad, es necesario definir un subgrupo de referencia dentro de cada variable protegida. Este subgrupo servirá como base de comparación: la herramienta evaluará si los demás subgrupos presentan diferencias significativas en desempeño o error respecto a este.
        </p>
        <ul className="list-disc pl-6 mb-2">
          <li className="mb-2">
            <b>Personalizado:</b> Selecciona manualmente el grupo de referencia que consideres relevante para tu proyecto. Esta opción es útil cuando existe una justificación normativa, institucional o contextual para usar un grupo específico como base de comparación.
          </li>
          <li className="mb-2">
            <b>Grupo Mayoritario:</b> Se utiliza el subgrupo con mayor número de instancias en el dataset como referencia.<br/>
            Este enfoque es útil cuando el grupo dominante representa el estándar de comportamiento más frecuente del modelo, y permite contrastar si los grupos con menor representación están recibiendo un trato desigual.
          </li>
          <li>
            <b>Grupo con Mejor Desempeño:</b> Se utiliza el subgrupo que presenta el menor error (por ejemplo, menor tasa de falsos positivos o falsos negativos) como grupo de referencia.<br/>
            Este enfoque permite detectar qué grupos están sistemáticamente peor tratados que el grupo con mejor resultado, y es especialmente útil en contextos donde se busca garantizar que todos los grupos alcancen un umbral mínimo de equidad.<br/>
            Para usar esta opción, también debes seleccionar una métrica de rendimiento (por ejemplo: exactitud, precisión, tasa de falsos negativos). Puedes guiarte por la tabla de métricas de error por subgrupo vista en la sección anterior.
          </li>
        </ul>
      </div>

      <ReferenceMethodSelector
        referenceMethod={referenceMethod}
        onMethodChange={onReferenceMethodChange}
      />

      {referenceMethod === 'minority' && (
        <MetricSelector
          metricRef={metricRef}
          onMetricChange={onMetricChange}
        />
      )}

      {referenceMethod === 'custom' && (
        <ReferenceGroupSelector
          protectedColumns={protectedColumns}
          uniqueValues={uniqueValues}
          referenceGroups={referenceGroups}
          onGroupChange={onReferenceGroupChange}
        />
      )}

      <ValidationWarning
        show={showWarning}
        message="Por favor, seleccione un grupo de referencia para cada variable protegida."
      />

      <AnalysisButton
        onClick={onAnalyze}
        disabled={!isValidConfig}
        loading={loading}
      />
    </div>
  );
};