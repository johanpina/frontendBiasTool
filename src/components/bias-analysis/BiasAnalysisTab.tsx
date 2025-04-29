import React, { useState } from 'react';
import { useBiasAnalysis } from '../../hooks/useBiasAnalysis';
import { AnalysisConfiguration } from './AnalysisConfiguration';
import { AnalysisResults } from './AnalysisResults';
import { DisparityPlotControls } from './DisparityPlotControls';
import { metrics } from '../../constants';

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
      
      // Update only the bias_plot in the results
      onAnalyze({
        ...results,
        bias_plot: data.plot
      });
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

      <DisparityPlotControls
        metrics={metrics}
        protectedAttributes={protectedColumns}
        onUpdatePlot={handleUpdatePlot}
        loading={plotLoading}
      />

      <AnalysisResults
        results={results}
        referenceMethod={referenceMethod}
      />
    </div>
  );
};