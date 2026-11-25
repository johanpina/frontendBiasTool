import React from 'react';
import { Check } from 'lucide-react';

export const STEP_LABELS = [
  'Carga tus datos',
  'Explora tus datos',
  'Configura el análisis',
  'Revisa los resultados',
  'Descarga el informe',
];

interface StepBarProps {
  current: number;           // 1..5
  canGo: (step: number) => boolean;
  onGo: (step: number) => void;
}

/** Barra de pasos fija, igual en todas las pantallas (U1). */
export const StepBar: React.FC<StepBarProps> = ({ current, canGo, onGo }) => (
  <nav aria-label="Pasos del análisis" className="bg-white border-b border-rose-light px-4 sm:px-10 py-3 sticky top-[65px] z-10">
    <ol className="max-w-5xl mx-auto flex items-center gap-1.5 sm:gap-3">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const isCurrent = n === current;
        const done = !isCurrent && canGo(n) && n < current;
        const reachable = !isCurrent && canGo(n);
        return (
          <React.Fragment key={n}>
            <li className="shrink-0">
              <button
                type="button"
                onClick={() => reachable && onGo(n)}
                disabled={!reachable}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-full pr-2 transition-colors ${
                  reachable ? 'cursor-pointer hover:text-burgundy' : 'cursor-default'
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-mono text-[11px] font-bold ${
                    isCurrent
                      ? 'bg-burgundy text-white'
                      : done || reachable
                        ? 'bg-rose-tint text-burgundy'
                        : 'bg-paper-deep text-ink-40'
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
                </span>
                <span
                  className={`text-[13px] hidden md:block ${
                    isCurrent ? 'font-bold text-ink' : reachable ? 'text-ink-80' : 'text-ink-40'
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
            {n < STEP_LABELS.length && <span aria-hidden className="flex-1 h-px bg-rose-light min-w-2" />}
          </React.Fragment>
        );
      })}
    </ol>
    <p className="md:hidden text-center text-xs text-ink-80 mt-1.5">
      Paso {current} · <b>{STEP_LABELS[current - 1]}</b>
    </p>
  </nav>
);
