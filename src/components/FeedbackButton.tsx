import React, { useState } from 'react';
import { MessageSquareHeart, X, Send, CheckCircle2 } from 'lucide-react';
import { submitFeedback } from '../lib/analytics';

/**
 * Botón flotante de feedback fijo al borde derecho de la pantalla.
 * Reemplaza el antiguo sidebar de "Información". Abre un modal donde la
 * persona puede dejar un comentario o reportar un error en cualquier momento;
 * el envío va a la tabla compartida `tool_feedback` de Supabase.
 */
export const FeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('Comentario general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const close = () => {
    setOpen(false);
    // Reinicia el estado tras cerrar (con pequeño retardo para no ver el salto)
    setTimeout(() => {
      setSent(false);
      setMessage('');
      setEmail('');
      setType('Comentario general');
    }, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    await submitFeedback({ type, message, email: email.trim().toLowerCase() });
    setSending(false);
    setSent(true);
  };

  return (
    <>
      {/* Pill flotante abajo a la derecha (estilo portada EIA) */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Enviar feedback"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2
                   bg-white text-burgundy border border-rose-light px-4 py-2.5 rounded-full
                   shadow-[0_8px_28px_rgba(0,0,0,0.14)] text-sm font-semibold
                   hover:border-burgundy hover:-translate-y-0.5 transition-all duration-200"
      >
        <MessageSquareHeart className="h-4 w-4" />
        Enviar feedback
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={close}
            aria-hidden
          />
          <div className="relative w-full max-w-md bg-paper rounded-2xl shadow-2xl border border-line overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-burgundy text-white">
              <div className="flex items-center gap-2">
                <MessageSquareHeart className="h-5 w-5" />
                <h2 className="font-display text-lg font-semibold">Tu opinión nos ayuda</h2>
              </div>
              <button onClick={close} aria-label="Cerrar" className="p-1 rounded-full hover:bg-white/15 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {sent ? (
              <div className="p-8 flex flex-col items-center text-center gap-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                <p className="text-ink-80 font-medium">¡Gracias por tu comentario!</p>
                <p className="text-sm text-ink-60">Lo tendremos en cuenta para mejorar la herramienta.</p>
                <button
                  onClick={close}
                  className="mt-2 px-5 py-2 bg-burgundy text-white font-semibold rounded-md hover:bg-rose transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <p className="text-sm text-ink-60">
                  Cuéntanos qué te pareció la herramienta o repórtanos un error. Tu opinión es anónima
                  (salvo que dejes tu correo).
                </p>
                <div>
                  <label className="block text-sm font-medium text-ink-80 mb-1.5">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-line rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                  >
                    <option value="Comentario general">Comentario o sugerencia</option>
                    <option value="Reporte de error">Reporte de error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-80 mb-1.5">Tu mensaje</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    required
                    placeholder="Escribe aquí tus comentarios o el problema que encontraste…"
                    className="w-full border border-line rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-80 mb-1.5">Correo electrónico (opcional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    className="w-full border border-line rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-burgundy text-white font-semibold rounded-md shadow-sm hover:bg-rose disabled:bg-ink-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? 'Enviando…' : 'Enviar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
