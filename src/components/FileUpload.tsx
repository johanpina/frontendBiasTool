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
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {loading ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            ) : (
              <>
                {file ? (
                  <>
                    <FileText className="w-10 h-10 mb-3 text-indigo-600" />
                    <p className="mb-2 text-sm text-gray-600">
                      Archivo cargado: <span className="font-semibold">{file.name}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Haz click para cambiar el archivo
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click para cargar</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-gray-500">CSV (MAX. 10MB)</p>
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