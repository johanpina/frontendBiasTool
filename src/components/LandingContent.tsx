import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface LandingContentProps {
  onStart: () => void;
}

export const LandingContent: React.FC<LandingContentProps> = ({ onStart }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    setEmail('');
    onStart();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <img 
            src="https://algoritmospublicos.cl/static/img/Logo_herramientas_algoritmos.png" 
            alt="Logo"
            className="h-16"
          />
          <img 
            src="https://goblab.uai.cl/wp-content/uploads/2024/11/logo-goblab-uai.png" 
            alt="Secondary Logo"
            className="h-16"
          />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Herramienta de medición de sesgos y equidad estadistica
          </h1>
          <p className="text-sm text-gray-500 mb-2">V.0.0.3 Beta</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-6">
            Esta herramienta es un apoyo para la medición de sesgos en los modelos de ciencia de datos de clasificación binaria. Su objetivo es medir las tasas de disparidad en las variables protegidas de un conjunto de datos, para utilizar este análisis en la creación modelos de ciencias de datos más equitativos y responsables con la ciudadanía. Para la medición de sesgos se utilizan 4 métricas: tasa de falsos positivos, tasa de falsos negativos, tasa de falsa omisión y tasa de falso descubrimiento.

            </p>

            <p className="text-gray-700 mb-6">
              
            La herramienta está desarrollada basados en el framework de Aequitas, y se espera que los usuarios sean científicos de datos o posiciones afines. Debe ser utilizada en la fase de desarrollo del piloto, durante la etapa de evaluación de las métricas del modelo de ciencia de datos.

            </p>

            <p className="text-gray-700 mb-6">
              Para más información sobre las fases, consultar la Guía Permitido Innovar: ¿Cómo podemos desarrollar proyectos de ciencia de datos para innovar en el sector público? disponible en https://www.lab.gob.cl/permitido-innovar .
            </p>
            <p className="text-gray-700 mb-6">Para utilizar la herramienta, es necesario contar con el conjunto de datos en formato .xsls o .csv Como requisito mínimo, este conjunto de datos debe contener una columna para las predicciones que generó el modelo (binario), una columna para los valores reales (binario), y las columnas de las variables protegidas. A partir de esto, se seleccionan las variables protegidas del proyecto y se calcula la matriz de confusión y métricas de medición de sesgos.</p>
            
            <p className="text-gray-700 mb-6">La elección de las variables protegidas es realizada por el usuario de la herramienta y se debe llevar a cabo en conformidad con la legislación chilena actual (Ley N° 20.609), que establece la no discriminación arbitraria para las siguientes variables protegidas: la raza o etnia, el sexo, la nacionalidad, la situación socioeconómica, el idioma, la ideología u opinión política, la religión o creencia, la sindicación o participación en organizaciones gremiales o la falta de ellas, la maternidad, la lactancia materna y el amamantamiento, la orientación sexual, la identidad y expresión de género, el estado civil, la edad, la filiación, la apariencia personal y la enfermedad o discapacidad.</p>

            <p className="text-gray-700 mb-6">El flujo de la herramienta de medición de sesgos y equidad implementa funciones y la metodología de Aequitas (2019, Ghani).</p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Para obtener los mejores resultados, recomendamos que un equipo multidisciplinario participe
                    en el proceso de completar esta ficha.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Comienza tu evaluación
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico (opcional)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Iniciar Evaluación
              </button>
            </form>

            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aviso de Privacidad
              </h3>
              <p className="text-gray-600">
                La información ingresada en esta herramienta no es almacenada por la plataforma. Todos los datos
                son procesados localmente en tu navegador para garantizar tu privacidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};