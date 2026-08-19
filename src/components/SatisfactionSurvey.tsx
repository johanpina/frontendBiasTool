import React, { useState } from 'react';
import { Star, MessageSquareHeart, CheckCircle2 } from 'lucide-react';
import { submitSatisfactionSurvey } from '../lib/analytics';

const Stars: React.FC<{ value: number; onChange: (v: number) => void; label: string }> = ({ value, onChange, label }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} de 5`}
            className="p-0.5"
          >
            <Star
              className="h-6 w-6 transition-colors"
              fill={(hover || value) >= n ? '#fab219' : 'none'}
              color={(hover || value) >= n ? '#fab219' : '#cbd5e1'}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

interface SatisfactionSurveyProps {
  /** Se llama tras enviar la encuesta con éxito (p. ej. para descargar el PDF). */
  onSubmitted?: () => void;
  /** Acción para omitir la encuesta (p. ej. solo descargar). Si se define, se muestra el botón. */
  onSkip?: () => void;
  submitLabel?: string;
  skipLabel?: string;
}

export const SatisfactionSurvey: React.FC<SatisfactionSurveyProps> = ({
  onSubmitted,
  onSkip,
  submitLabel = 'Enviar respuesta',
  skipLabel = 'Omitir',
}) => {
  const [satisfaction, setSatisfaction] = useState(0);
  const [ease, setEase] = useState(0);
  const [usefulness, setUsefulness] = useState(0);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const canSend = satisfaction > 0 && ease > 0 && usefulness > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    await submitSatisfactionSurvey({ satisfaction, ease, usefulness, comment: comment.trim(), email: email.trim().toLowerCase() });
    setSending(false);
    setSent(true);
    onSubmitted?.();
  };

  if (sent) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-rose-light p-6 flex items-center gap-3">
        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        <p className="text-gray-800 font-medium">¡Gracias por tu retroalimentación! Nos ayuda a mejorar la herramienta.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-rose-light p-6">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquareHeart className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Encuesta de satisfacción</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">Tu opinión es anónima (salvo que dejes tu correo) y nos ayuda a mejorar.</p>
      <form onSubmit={handleSubmit}>
        <div className="divide-y divide-gray-100">
          <Stars value={satisfaction} onChange={setSatisfaction} label="Satisfacción general con la herramienta" />
          <Stars value={ease} onChange={setEase} label="¿Qué tan fácil fue usarla?" />
          <Stars value={usefulness} onChange={setUsefulness} label="¿Qué tan útil fue para tu análisis?" />
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comentarios o sugerencias (opcional)"
          rows={3}
          className="mt-4 w-full border border-rose-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico (opcional)"
          className="mt-3 w-full border border-rose-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex items-center justify-between gap-3 mt-4">
          {onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              className="text-sm text-ink-60 hover:text-burgundy underline underline-offset-2"
            >
              {skipLabel}
            </button>
          ) : <span />}
          <button
            type="submit"
            disabled={!canSend || sending}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {sending ? 'Enviando…' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};
