import { ColumnSelection } from '../types';

interface UseAnalysisProps {
  BASE_API_URL: string;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResults: (results: any) => void;
}

interface AnalysisParams {
  file: File;
  columnSelection: ColumnSelection;
  endpoint: string;
  formData?: Record<string, any>;
  signal?: AbortSignal;
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

const handleApiRequest = async (url: string, formData: FormData, signal?: AbortSignal) => {
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    signal,
  });

  if (!response.ok) {
    let detail = '';
    try { detail = (await response.json())?.detail || ''; } catch { /* sin detalle */ }
    throw new Error(`No pudimos analizar el modelo. ${detail || 'Revisa la configuración e inténtalo de nuevo.'}`);
  }

  return response.json();
};

export const useAnalysis = ({
  BASE_API_URL,
  setLoading,
  setError,
  setResults,
}: UseAnalysisProps) => {
  /** Devuelve true si el análisis terminó bien (false si falló o se canceló). */
  const executeAnalysis = async (params: AnalysisParams): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const formData = createFormData(params);
      const data = await handleApiRequest(`${BASE_API_URL}/api/${params.endpoint}`, formData, params.signal);
      setResults(data); // Guardar directamente la respuesta completa del backend
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return false; // cancelado
      console.error('Error en análisis:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = (file: File, columnSelection: ColumnSelection, params: any, signal?: AbortSignal) =>
    executeAnalysis({
      file,
      columnSelection,
      endpoint: 'full_analysis',
      formData: { params },
      signal,
    });

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