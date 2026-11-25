import { PreviewData } from '../types';

const MAX_MB = 10;

interface UseFileUploadProps {
  setFile: (file: File | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setPreviewData: (data: PreviewData | null) => void;
  BASE_API_URL: string;
}

/** Valida y lee el archivo (vista previa). Devuelve true si quedó listo para usar. */
export const useFileUpload = ({
  setFile,
  setError,
  setLoading,
  setPreviewData,
  BASE_API_URL
}: UseFileUploadProps) => {
  const handleFile = async (file: File): Promise<boolean> => {
    setPreviewData(null);
    setFile(file);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('El archivo debe ser .csv. Si lo tienes en Excel, guárdalo como CSV (UTF-8).');
      return false;
    }
    const mb = file.size / (1024 * 1024);
    if (mb > MAX_MB) {
      setError(`El archivo pesa ${mb.toLocaleString('es-CL', { maximumFractionDigits: 0 })} MB. El máximo es ${MAX_MB} MB.`);
      return false;
    }

    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${BASE_API_URL}/api/preview`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('No pudimos leer el archivo. Revisa que sea un CSV válido.');
      const data = await response.json();
      if (!data?.preview?.length) {
        setError('El archivo no tiene filas de datos. Revisa que la primera fila tenga los nombres de las columnas.');
        return false;
      }
      setPreviewData(data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { handleFile };
};
