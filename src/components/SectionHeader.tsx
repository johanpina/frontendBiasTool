import React from 'react';

interface SectionHeaderProps {
  /** Etiqueta mono en mayúsculas (ej. "PASO 01 · DATOS"). */
  eyebrow?: string;
  /** Título en serif Fraunces. */
  title: string;
  /** Descripción opcional bajo el título. */
  description?: React.ReactNode;
  /** Contenido alineado a la derecha (acciones, badges). */
  right?: React.ReactNode;
  className?: string;
}

/**
 * Encabezado de sección al estilo de la portada/EIA: una etiqueta mono en
 * mayúsculas (eyebrow), un título serif y una descripción opcional. Unifica la
 * presentación de todas las zonas del flujo (datos, EDA, sesgos, equidad, informe).
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ eyebrow, title, description, right, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 ${className}`}>
    <div>
      {eyebrow && (
        <p className="font-mono text-[11px] uppercase tracking-wider text-burgundy mb-1.5">{eyebrow}</p>
      )}
      <h2 className="font-display text-2xl font-semibold text-ink leading-tight">{title}</h2>
      {description && <p className="text-ink-60 mt-1.5 max-w-2xl">{description}</p>}
    </div>
    {right && <div className="shrink-0">{right}</div>}
  </div>
);
