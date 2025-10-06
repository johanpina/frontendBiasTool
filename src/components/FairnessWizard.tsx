import React, { useState } from 'react';
import { METRIC_TRANSLATIONS } from '../constants';

interface FairnessWizardProps {
  onComplete: (recommendedMetric: string) => void;
}

const questions = [
  {
    id: 'q1',
    text: '¿En qué se quiere centrar para medir la equidad?',
    answers: [
      { text: 'Representación Dispar', next: 'q2a', value: null },
      { text: 'Errores Dispares', next: 'q2b', value: null },
    ],
  },
  {
    id: 'q2a',
    text: '¿Cómo necesita seleccionar a las personas?',
    answers: [
      { text: 'En números iguales para cada grupo', next: null, value: 'ppr_disparity' },
      { text: 'De forma proporcional al tamaño del grupo', next: null, value: 'pprev_disparity' },
    ],
  },
  {
    id: 'q2b',
    text: '¿Sus intervenciones son punitivas o asistenciales?',
    answers: [
      { text: 'Punitivas (pueden perjudicar)', next: 'q3a', value: null },
      { text: 'Asistenciales (buscan ayudar)', next: 'q3b', value: null },
    ],
  },
  {
    id: 'q3a',
    text: '¿Qué grupo le preocupa más en un contexto punitivo?',
    answers: [
      { text: 'Personas que reciben la intervención (ej. se les niega el crédito)', next: null, value: 'fdr_disparity' },
      { text: 'Personas que deberían haber recibido la intervención pero no lo hicieron', next: null, value: 'fpr_disparity' },
    ],
  },
  {
    id: 'q3b',
    text: '¿Qué grupo le preocupa más en un contexto asistencial?',
    answers: [
      { text: 'Personas que necesitan la asistencia', next: null, value: 'fnr_disparity' },
      { text: 'Personas que no reciben la asistencia', next: null, value: 'for_disparity' },
    ],
  },
];

export const FairnessWizard: React.FC<FairnessWizardProps> = ({ onComplete }) => {
  const [currentQuestionId, setCurrentQuestionId] = useState('q1');
  const [isCompleted, setIsCompleted] = useState(false);
  const [recommendedMetric, setRecommendedMetric] = useState<string | null>(null);

  const handleAnswer = (next: string | null, value: string | null) => {
    if (value) {
      onComplete(value);
      setRecommendedMetric(value);
      setIsCompleted(true);
    } else if (next) {
      setCurrentQuestionId(next);
    }
  };

  const resetWizard = () => {
    setCurrentQuestionId('q1');
    setIsCompleted(false);
    setRecommendedMetric(null);
  };

  const currentQuestion = questions.find(q => q.id === currentQuestionId);

  if (isCompleted) {
    return (
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">Métrica recomendada: <b>{recommendedMetric ? METRIC_TRANSLATIONS[recommendedMetric] || recommendedMetric : ''}</b></p>
            <div className="mt-2 text-sm text-green-700">
              <p>Hemos guardado esta preferencia para guiar el análisis en la tabla de Métricas de Disparidad.</p>
            </div>
            <button onClick={resetWizard} className="text-sm text-indigo-600 hover:text-indigo-800 mt-4">Reiniciar cuestionario</button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Guía para la Métrica de Equidad</h3>
      <p className="text-gray-600 mb-4">{currentQuestion.text}</p>
      <div className="space-y-3">
        {currentQuestion.answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(answer.next, answer.value)}
            className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-indigo-50 rounded-md border border-gray-200 transition-colors duration-200"
          >
            {answer.text}
          </button>
        ))}
      </div>
    </div>
  );
};