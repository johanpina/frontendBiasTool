import { useState } from 'react';

type ReferenceMethod = 'custom' | 'majority' | 'minority';

export const useBiasAnalysis = () => {
  const [referenceMethod, setReferenceMethod] = useState<ReferenceMethod>('custom');
  const [referenceGroups, setReferenceGroups] = useState<Record<string, string>>({});
  const [metricRef, setMetricRef] = useState<string>('fpr');

  const isValidConfiguration = (loading: boolean, protectedColumns: string[]) => {
    if (loading) return false;
    
    if (referenceMethod === 'custom') {
      return Object.keys(referenceGroups).length === protectedColumns.length;
    }
    
    return true;
  };

  const shouldShowReferenceGroupWarning = (protectedColumns: string[]) => {
    return referenceMethod === 'custom' && 
           Object.keys(referenceGroups).length !== protectedColumns.length;
  };

  const handleReferenceMethodChange = (method: ReferenceMethod) => {
    setReferenceMethod(method);
    if (method !== 'custom') {
      setReferenceGroups({});
    }
  };

  const handleReferenceGroupChange = (attribute: string, value: string) => {
    setReferenceGroups(prev => ({
      ...prev,
      [attribute]: value
    }));
  };

  const prepareAnalysisParams = () => {
    const params = {
      referenceMethod,
      ...(referenceMethod === 'custom' && { referenceGroups }),
      ...(referenceMethod === 'minority' && { metric_ref: metricRef })
    };
    return params;
  };

  return {
    referenceMethod,
    referenceGroups,
    metricRef,
    setMetricRef,
    isValidConfiguration,
    shouldShowReferenceGroupWarning,
    handleReferenceMethodChange,
    handleReferenceGroupChange,
    prepareAnalysisParams
  };
};