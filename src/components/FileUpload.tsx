import React from 'react';
import { FileText, Upload } from 'lucide-react';

interface FileUploadProps {
  file: File | null;
  loading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ file, loading, onFileUpload }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-rose-light border-dashed rounded-2xl cursor-pointer bg-indigo-50 hover:bg-rose-tint transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {loading ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-burgundy"></div>
            ) : (
              <>
                {file ? (
                  <>
                    <FileText className="w-10 h-10 mb-3 text-burgundy" />
                    <p className="mb-2 text-sm text-ink-80">
                      Archivo cargado: <span className="font-semibold">{file.name}</span>
                    </p>
                    <p className="text-sm font-semibold text-burgundy underline underline-offset-2">
                      Haz clic para cambiar el archivo
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mb-3 text-rose" />
                    <p className="mb-2 text-sm text-ink-60">
                      <span className="font-semibold text-ink-80">Haz clic para cargar</span> o arrastra el archivo aquí
                    </p>
                    <p className="text-xs text-ink-60">Archivo .csv, máximo 10 MB</p>
                  </>
                )}
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept=".csv"
            onChange={onFileUpload}
            disabled={loading}
          />
        </label>
      </div>
    </div>
  );
};
