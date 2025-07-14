import React, { useState } from 'react';
import { useBiasAnalysis } from '../hooks/useBiasAnalysis';
import { AnalysisConfiguration } from './bias-analysis/AnalysisConfiguration';
import { AnalysisResults } from './bias-analysis/AnalysisResults';
import { DisparityPlotControls } from './bias-analysis/DisparityPlotControls';
import { FairnessSection } from './bias-analysis/FairnessSection';
import { metrics_bias } from '../constants';

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
  BASE_API_URL
}) => {
  const [plotLoading, setPlotLoading] = useState(false);
  const [localResults, setLocalResults] = useState(results);
  
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

  const handleUpdatePlot = async (selectedMetrics: string[], selectedAttributes: string[]) => {    
    setPlotLoading(true);
    try {
      const response = await fetch(`${BASE_API_URL}/api/bias_plot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metrics: selectedMetrics,
          attributes: selectedAttributes
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al actualizar la gráfica: ${errorText}`);
      }

      const data = await response.json();
      
      setLocalResults(prev => ({
        ...prev,
        bias_plot: data.plot
      }));
    } catch (err) {
      console.error('Error al actualizar el gráfico:', err);
    } finally {
      setPlotLoading(false);
    }
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

      

      <AnalysisResults
        results={{
          ...results,
          bias_plot: localResults?.bias_plot || results?.bias_plot
        }}
        referenceMethod={referenceMethod}
      />
      <DisparityPlotControls
        metrics={metrics_bias}
        protectedAttributes={protectedColumns}
        onUpdatePlot={handleUpdatePlot}
        loading={plotLoading}
      />

      <FairnessSection
        protectedColumns={protectedColumns}
        uniqueValues={uniqueValues}
        results={results}
      />
    </div>
  );
};