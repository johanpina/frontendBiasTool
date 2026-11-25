import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { fmtInt } from '../lib/format';

interface FileUploadProps {
  file: File | null;
  loading: boolean;
  /** Mensaje de error de la carga (formato, tamaño, archivo vacío…). */
  error?: string | null;
  /** Filas y columnas del archivo, cuando ya se leyó. */
  rows?: number | null;
  cols?: number | null;
  /** Bloquea la zona (p. ej. mientras corre el análisis). */
  disabled?: boolean;
  onFile: (file: File) => void;
}

/** Zona de carga con sus estados: vacío, arrastrando, foco, cargando, éxito, error y bloqueado (U4). */
export const FileUpload: React.FC<FileUploadProps> = ({ file, loading, error, rows, cols, disabled, onFile }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const blocked = loading || disabled;

  const open = () => { if (!blocked) inputRef.current?.click(); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (blocked) return;
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  const ok = !!file && !loading && !error;
  const tone = disabled
    ? 'border-ink-20 bg-paper-deep cursor-not-allowed opacity-70'
    : error
      ? 'border-red-400 bg-red-50'
      : dragging
        ? 'border-burgundy bg-rose-tint'
        : ok
          ? 'border-[#2F6B4F] bg-[#E7F0EA]/60'
          : 'border-rose-light bg-indigo-50 hover:bg-rose-tint';

  return (
    <div className="mb-8">
      <div
        role="button"
        tabIndex={blocked ? -1 : 0}
        aria-disabled={blocked}
        aria-label="Cargar archivo CSV"
        onClick={open}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
        onDragOver={(e) => { e.preventDefault(); if (!blocked) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center w-full min-h-[14rem] px-6 py-8 text-center border-2 border-dashed rounded-2xl cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2 ${tone}`}
      >
        {disabled ? (
          <p className="text-sm text-ink-60">Espera a que termine el análisis para cambiar el archivo.</p>
        ) : loading ? (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-burgundy mb-3" />
            <p className="text-sm text-ink-80">Leyendo <b>{file?.name}</b>…</p>
            <p className="text-xs text-ink-60 mt-1">Esto puede tardar hasta 30 segundos.</p>
          </>
        ) : dragging ? (
          <>
            <Upload className="w-10 h-10 mb-3 text-burgundy" />
            <p className="text-sm font-semibold text-burgundy">Suelta el archivo para cargarlo</p>
          </>
        ) : error ? (
          <>
            <AlertCircle className="w-10 h-10 mb-3 text-red-600" />
            <p className="text-sm font-medium text-red-700 max-w-md">{error}</p>
            <p className="text-sm font-semibold text-burgundy underline underline-offset-2 mt-2">Elegir otro archivo</p>
          </>
        ) : ok ? (
          <>
            <CheckCircle2 className="w-10 h-10 mb-3 text-[#2F6B4F]" />
            <p className="text-sm text-ink-80">
              <span className="font-semibold">{file!.name}</span>
              {rows != null && <> · {fmtInt(rows)} filas</>}
              {cols != null && <> · {fmtInt(cols)} columnas</>}
            </p>
            <p className="text-sm font-semibold text-burgundy underline underline-offset-2 mt-2">Cambiar archivo</p>
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
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".csv"
        disabled={blocked}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = ''; // permite volver a elegir el mismo archivo
        }}
      />
    </div>
  );
};
