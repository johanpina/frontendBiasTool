import { useState } from 'react';
import { PreviewData } from '../types';

interface UseFileUploadProps {
  setFile: (file: File | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setPreviewData: (data: PreviewData | null) => void;
  BASE_API_URL: string;
}

export const useFileUpload = ({
  setFile,
  setError,
  setLoading,
  setPreviewData,
  BASE_API_URL
}: UseFileUploadProps) => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('El archivo debe ser un CSV');
      return;
    }

    setFile(file);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${BASE_API_URL}/api/preview`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al procesar el archivo');
      }

      const data = await response.json();
      setPreviewData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return { handleFileUpload };
};