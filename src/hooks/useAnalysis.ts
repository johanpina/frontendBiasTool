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
}: UseAnalysisProps) => {
  const executeAnalysis = async (params: AnalysisParams) => {
    setLoading(true);
    setError(null);

    try {
      const formData = createFormData(params);
      const data = await handleApiRequest(`${BASE_API_URL}/api/${params.endpoint}`, formData);
      
      // Lógica de procesamiento de respuesta simplificada y corregida
      console.log('Análisis completado:', data);
      setResults(data); // Guardar directamente la respuesta completa del backend

    } catch (err) {
      console.error('Error en análisis:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (file: File, columnSelection: ColumnSelection, params: any) => {
    await executeAnalysis({
      file,
      columnSelection,
      endpoint: 'full_analysis',
      formData: { params }
    });
  };

  const handleBiasAnalysis = async (file: File, columnSelection: any, params: any) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('columns', JSON.stringify(columnSelection));
      formData.append('params', JSON.stringify(params));

      const response = await fetch(`${BASE_API_URL}/api/full_analysis`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en el análisis de sesgo');
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateFairness = async (currentResults: any, newThreshold: number) => {
    if (!currentResults?.tables?.bias_metrics) return;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        bias_metrics: currentResults.tables.bias_metrics,
        fairnessThreshold: newThreshold,
      };

      const response = await fetch(`${BASE_API_URL}/api/recalculate_fairness`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error recalculando la equidad');
      }

      const updatedTables = await response.json();
      
      setResults((prevResults: any) => ({
        ...prevResults,
        tables: {
          ...prevResults.tables,
          ...updatedTables,
        },
        metadata: {
            ...prevResults.metadata,
            fairnessThreshold: newThreshold
        }
      }));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { handleAnalyze, handleBiasAnalysis, handleRecalculateFairness };
};