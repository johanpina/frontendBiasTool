
import React from 'react';
import { useBiasAnalysis } from '../hooks/useBiasAnalysis';
import { AnalysisConfiguration } from './bias-analysis/AnalysisConfiguration';
import { DataTable } from './DataTable';
import { DisparityPlotter } from './bias-analysis/DisparityPlotter';
import { AbsolutePlotter } from './bias-analysis/AbsolutePlotter';
import { METRIC_TRANSLATIONS } from '../constants';

interface BiasAnalysisTabProps {
  protectedColumns: string[];
  uniqueValues: Record<string, string[]>;
  onAnalyze: (params: any) => void;
  results: any;
  loading: boolean;
  BASE_API_URL: string;
}

export const BiasAnalysisTab: React.FC<BiasAnalysisTabProps> = ({
  protectedColumns,
  uniqueValues,
  onAnalyze,
  results,
  loading,
  BASE_API_URL,
}) => {
  const {
    referenceMethod,
    referenceGroups,
    metricRef,
    setMetricRef,
    isValidConfiguration,
    shouldShowReferenceGroupWarning,
    handleReferenceMethodChange,
    handleReferenceGroupChange,
    prepareAnalysisParams
  } = useBiasAnalysis();

  const handleAnalyze = () => {
    const params = prepareAnalysisParams();
    onAnalyze(params);
  };

  return (
    <div className="space-y-8">
      <AnalysisConfiguration
        referenceMethod={referenceMethod}
        metricRef={metricRef}
        protectedColumns={protectedColumns}
        uniqueValues={uniqueValues}
        referenceGroups={referenceGroups}
        loading={loading}
        showWarning={shouldShowReferenceGroupWarning(protectedColumns)}
        isValidConfig={isValidConfiguration(loading, protectedColumns)}
        onReferenceMethodChange={handleReferenceMethodChange}
        onMetricChange={setMetricRef}
        onReferenceGroupChange={handleReferenceGroupChange}
        onAnalyze={handleAnalyze}
      />

      {results && (
        <div className="space-y-8 mt-8">
          <DataTable
            title="Resumen de Equidad por Atributo"
            data={results.tables.fairness_summary}
            translateHeader={(h) => METRIC_TRANSLATIONS[h] || h}
            formatNumber={(v) => String(v)}
          />
          <DisparityPlotter 
            biasMetrics={results.tables.bias_metrics}
            protectedAttributes={results.metadata.protected_attributes}
            fairnessThreshold={results.metadata.fairness_threshold || 1.25}
            BASE_API_URL={BASE_API_URL}
          />
          <AbsolutePlotter 
            groupMetrics={results.tables.group_metrics_for_plotting}
            protectedAttributes={results.metadata.protected_attributes}
            BASE_API_URL={BASE_API_URL}
          />
        </div>
      )}
    </div>
  );
};
