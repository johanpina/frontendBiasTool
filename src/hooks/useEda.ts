import { useState, useCallback } from 'react';
import { EdaResult } from '../types';

interface UseEdaProps {
  BASE_API_URL: string;
}

export const useEda = ({ BASE_API_URL }: UseEdaProps) => {
  const [eda, setEda] = useState<EdaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runEda = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setEda(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${BASE_API_URL}/api/eda`, { method: 'POST', body: formData });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Error en el análisis exploratorio: ${detail}`);
      }
      const data: EdaResult = await res.json();
      setEda(data);
    } catch (err: any) {
      setError(err.message || 'Error desconocido en el EDA');
    } finally {
      setLoading(false);
    }
  }, [BASE_API_URL]);

  return { eda, edaLoading: loading, edaError: error, runEda };
};
