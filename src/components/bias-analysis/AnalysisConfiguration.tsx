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
        Configuración del Análisis de Disparidad
      </h2>

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
        message="Por favor, seleccione un grupo de referencia para cada atributo protegido."
      />

      <AnalysisButton
        onClick={onAnalyze}
        disabled={!isValidConfig}
        loading={loading}
      />
    </div>
  );
};