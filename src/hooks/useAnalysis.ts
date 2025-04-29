import { ColumnSelection } from '../types';

interface UseAnalysisProps {
  BASE_API_URL: string;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResults: (results: any) => void;
  setPlotData: (plotData: string | null) => void;
}

interface AnalysisParams {
  file: File;
  columnSelection: ColumnSelection;
  endpoint: string;
  formData?: Record<string, any>;
}

const createFormData = (params: AnalysisParams): FormData => {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('columns', JSON.stringify(params.columnSelection));
  
  if (params.formData) {
    Object.entries(params.formData).forEach(([key, value]) => {
      formData.append(key, JSON.stringify(value));
    });
  }
  
  return formData;
};

const handleApiRequest = async (url: string, formData: FormData) => {
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Error en la solicitud: ${errorData}`);
  }

  return response.json();
};

const processAnalysisResponse = (
  data: any,
  setResults: (results: any) => void,
  setPlotData: (plotData: string | null) => void
) => {
  console.log('Análisis completado:', data);
  setResults(data);
  setPlotData(data.initial_plot);
};

const processBiasResponse = (
  data: any,
  endpoint: string,
  setResults: (results: any) => void
) => {
  console.log('Análisis de sesgos completado:', data);
  
  if (endpoint === 'analyze_fairness') {
    setResults(prev => ({
      ...prev,
      fairness_metrics: data.fairness_metrics,
      protected_attributes: data.protected_attributes,
      unique_values: data.unique_values
    }));
  } else {
    setResults(prev => ({
      ...prev,
      bias_metrics: data.bias_metrics,
      bias_plot: data.bias_plot,
      protected_attributes: data.protected_attributes,
      fairness_metrics: data.fairness_metrics,
      unique_values: data.unique_values
    }));
  }
};

export const useAnalysis = ({
  BASE_API_URL,
  setLoading,
  setError,
  setResults,
  setPlotData
}: UseAnalysisProps) => {
  const executeAnalysis = async (params: AnalysisParams) => {
    setLoading(true);
    setError(null);

    try {
      const formData = createFormData(params);
      const data = await handleApiRequest(`${BASE_API_URL}/api/${params.endpoint}`, formData);
      
      if (params.endpoint === 'analyze') {
        processAnalysisResponse(data, setResults, setPlotData);
      } else {
        processBiasResponse(data, params.endpoint, setResults);
      }
    } catch (err) {
      console.error('Error en análisis:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (file: File, columnSelection: ColumnSelection) => {
    await executeAnalysis({
      file,
      columnSelection,
      endpoint: 'analyze'
    });
  };

  const handleBiasAnalysis = async (
    file: File,
    columnSelection: ColumnSelection,
    params: any
  ) => {
    const endpoint = params.referenceMethod === 'custom' 
      ? 'analyze_fairness'
      : 'analyze_bias';

    await executeAnalysis({
      file,
      columnSelection,
      endpoint,
      formData: {
        params: {
          metric_ref: params.metric_ref || 'fpr',
          ref_groups: params.referenceGroups || {},
          reference_method: params.referenceMethod
        }
      }
    });
  };

  return {
    handleAnalyze,
    handleBiasAnalysis
  };
};