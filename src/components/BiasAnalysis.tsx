import React from 'react';
import { BiasMetrics } from './BiasMetrics';
import { DataTable } from './DataTable';

interface BiasAnalysisProps {
  results: any;
  metrics: any[];
  selectedMetric: string;
  selectedAttribute: string;
  onMetricChange: (metric: string) => void;
  onAttributeChange: (attribute: string) => void;
  plotData: string | null;
  loading: boolean;
  onUpdatePlot: (metric: string, attribute: string) => void;
}

export const BiasAnalysis: React.FC<BiasAnalysisProps> = ({
  results,
  metrics,
  selectedMetric,
  selectedAttribute,
  onMetricChange,
  onAttributeChange,
  plotData,
  loading,
  onUpdatePlot
}) => {
  if (!results) return null;

  return (
    <div className="space-y-8">
      <BiasMetrics
        metrics={metrics}
        selectedMetric={selectedMetric}
        selectedAttribute={selectedAttribute}
        protectedAttributes={results.protected_attributes || []}
        onMetricChange={onMetricChange}
        onAttributeChange={onAttributeChange}
        plotData={plotData}
        loading={loading}
        onUpdatePlot={onUpdatePlot}
      />

      <div className="space-y-8">
        {results.instance_per_subgroup && results.instance_per_subgroup.length > 0 && (
          <DataTable
            title="Total de Instancias por Subgrupo"
            data={results.instance_per_subgroup}
            translateHeader={(header) => header}
            formatNumber={(value) => value.toString()}
          />
        )}

        {results.metrics && results.metrics.length > 0 && (
          <DataTable
            title="Métricas de error para cada subgrupo"
            data={results.metrics}
            translateHeader={(header) => header}
            formatNumber={(value) => typeof value === 'number' ? value.toFixed(4) : value.toString()}
          />
        )}
      </div>
    </div>
  );
};