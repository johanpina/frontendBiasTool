import { useState } from 'react';
import { ColumnSelection } from '../types';

export const useAnalysisState = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('fnr');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('todas');
  const [plotData, setPlotData] = useState<string | null>(null);
  const [columnSelection, setColumnSelection] = useState<ColumnSelection>({
    predictions: '',
    actual: '',
    protected: []
  });
  const [recommendedMetric, setRecommendedMetric] = useState<string>('');
  const [fairnessThreshold, setFairnessThreshold] = useState<number>(1.25);

  return {
    file,
    setFile,
    loading,
    setLoading,
    error,
    setError,
    previewData,
    setPreviewData,
    results,
    setResults,
    selectedMetric,
    setSelectedMetric,
    selectedAttribute,
    setSelectedAttribute,
    plotData,
    setPlotData,
    columnSelection,
    setColumnSelection,
    recommendedMetric,
    setRecommendedMetric,
    fairnessThreshold,
    setFairnessThreshold
  };
};