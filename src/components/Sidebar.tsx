import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface SidebarProps {
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle feedback submission
    console.log('Feedback submitted:', { feedback, email });
    setFeedback('');
    setEmail('');
  };

  return (
    <div className="w-80 h-full bg-white shadow-xl flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Información</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comparte tus comentarios o sugerencias aquí
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico (opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Send className="h-4 w-4" />
              Enviar Feedback
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Agradecimientos</h3>
          <div className="space-y-4">
            <div>
              <img
                src="https://herramienta-sesgos-equidad-goblab-uai.streamlit.app/~/+/media/da753cc850f5985217dc57e23f1bc344d18b0f033a2cabf6868a67f5.png"
                alt="ANID Logo"
                className="h-16 mb-2"
              />
              <p className="text-sm text-gray-600">
                Subdirección de Investigación Aplicada/Concurso IDeA I+D 2023 proyecto ID23I10357
              </p>
            </div>
          </div>
          <br></br>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Exención de responsabilidad</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                La herramienta de medición de sesgos y equidad estadística es un recurso diseñado para evaluar el desempeño de los modelos de ciencia de datos e IA en términos de equidad. La herramienta pretende asistir en la identificación de sesgos potenciales, pero no asegura el correcto funcionamiento o eficacia de los sistemas evaluados con ella. La herramienta está diseñada como un soporte para quienes deben tomar decisiones respecto del desempeño de los modelos, con el fin de fomentar prácticas más justas y equitativas en la ciencia de datos.
              </p>
              <p className="text-sm text-gray-600">
                La Universidad Adolfo Ibáñez (UAI) no es responsable de ningún tipo de daño directo, indirecto, incidental, especial o consecuente, ni de pérdidas de beneficios que puedan surgir directa o indirectamente de la aplicación de la herramienta, en el uso o la confianza en los resultados obtenidos a través de ésta.
              </p>
              <p className="text-sm text-gray-600">
                El empleo de las herramientas desarrolladas por la Universidad no implica ni constituye un sello ni certificado de aprobación por parte de esta, respecto al cumplimiento, legal, ético o funcional de un algoritmo de inteligencia artificial.
              </p>
              <p className="text-sm text-gray-600">
                Aquellos interesados en ser considerados como un caso de éxito mediante el uso de estas herramientas de IA responsable deben inscribirse en los pilotos a través del formulario <a href="https://algoritmospublicos.cl/quiero_participar">https://algoritmospublicos.cl/quiero_participar</a>. Es importante destacar que el uso de nuestras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};