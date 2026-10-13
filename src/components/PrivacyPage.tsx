import React, { useEffect } from 'react';

const CONTACTO = 'goblab@uai.cl';

const Seccion: React.FC<{ n: number; titulo: string; children: React.ReactNode }> = ({ n, titulo, children }) => (
  <section className="mb-9">
    <h2 className="font-display font-medium text-[22px] text-burgundy mb-3 flex items-baseline gap-2.5">
      <span className="font-mono text-xs text-rose">{String(n).padStart(2, '0')}</span>
      {titulo}
    </h2>
    <div className="text-[15px] leading-relaxed text-ink-80 space-y-2.5">{children}</div>
  </section>
);

const Resumen: React.FC<{ titulo: string; children: React.ReactNode }> = ({ titulo, children }) => (
  <div className="bg-white border border-rose-light rounded-2xl px-5 py-4">
    <div className="font-mono text-[10.5px] tracking-[1.5px] uppercase text-burgundy mb-2">{titulo}</div>
    <div className="text-sm leading-relaxed text-ink-80">{children}</div>
  </div>
);

const DATOS: Array<[string, string, string]> = [
  [
    'Correo y tipo de organización',
    'Al iniciar la herramienta, solo si marcas «Acepto recibir novedades del proyecto y de la herramienta».',
    'Saber desde qué tipo de instituciones se usa la herramienta y enviarte novedades del proyecto.',
  ],
  [
    'Botón «Enviar feedback»',
    'Cuando lo envías.',
    'Entender y resolver los problemas reportados. Se guarda con la pantalla desde la que escribiste y, solo si marcaste la casilla, con tu correo.',
  ],
  [
    'Encuesta de satisfacción',
    'Si la respondes.',
    'Medir la satisfacción y mejorar la herramienta. Tu correo solo se guarda si marcaste la casilla.',
  ],
  [
    'Datos de uso anónimos',
    'Mientras navegas.',
    'Estadísticas agregadas: análisis iniciados y completados, pasos completados y descargas del informe.',
  ],
];

/** Política de Privacidad y Protección de Datos (ruta /privacidad). */
export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Política de Privacidad — Herramienta de sesgos y equidad GobLab UAI';
  }, []);

  const link = 'text-burgundy font-semibold hover:underline';

  return (
    <main className="bg-paper min-h-screen text-ink">
      <div className="max-w-[860px] mx-auto px-6 pt-10 pb-14">
        <a href="/" className={`${link} text-[13px] no-underline`}>← Volver al inicio</a>

        <div className="font-mono text-[11px] tracking-[1.5px] uppercase text-ink-60 mt-7 mb-2">
          Herramienta de sesgos y equidad · GobLab UAI
        </div>
        <h1 className="font-display font-medium text-[34px] sm:text-[40px] leading-[1.1] tracking-tight mb-2.5">
          Política de Privacidad y <em className="text-burgundy">Protección de Datos</em>
        </h1>
        <p className="text-[13px] text-ink-60 mb-8">Última actualización: octubre de 2026</p>

        {/* Resumen */}
        <div className="grid md:grid-cols-3 gap-3 mb-10">
          <Resumen titulo="Tus datos de análisis">
            Se procesan en nuestros servidores solo para calcular las métricas y <strong>no se guardan</strong>: se eliminan al terminar el cálculo.
          </Resumen>
          <Resumen titulo="Lo que guardamos">
            Tu correo y tipo de organización, solo si marcas la casilla de novedades. También los comentarios que nos envías y la encuesta si la respondes.
          </Resumen>
          <Resumen titulo="Lo que nunca hacemos">
            Vender tus datos, cederlos a terceros, usarlos con fines comerciales o publicitarios, ni usarlos para algo distinto de lo descrito aquí.
          </Resumen>
        </div>

        <Seccion n={1} titulo="¿Quiénes somos?">
          <p>
            Esta herramienta es desarrollada y mantenida por <strong>GobLab UAI</strong>, laboratorio de innovación de la
            Escuela de Gobierno de la Universidad Adolfo Ibáñez (Santiago, Chile), responsable del tratamiento de los datos
            descritos en esta política. Contacto: <a href={`mailto:${CONTACTO}`} className={link}>{CONTACTO}</a>.
          </p>
        </Seccion>

        <Seccion n={2} titulo="Los datos que analizas">
          <p>
            Para calcular las métricas de sesgo y equidad, el archivo que cargas (.csv o .xlsx) se envía a <strong>nuestros
            servidores</strong>, donde se procesa. Esos datos se usan <strong>únicamente</strong> para generar los resultados
            que ves en pantalla.
          </p>
          <p>
            <strong>No persistimos tus datos:</strong> no se guardan en ninguna base de datos ni se conservan después del
            análisis. Cada archivo se elimina de nuestros servidores apenas termina el cálculo, y lo que queda en tu navegador
            desaparece al cerrar la sesión. El informe PDF se genera en tu propio equipo.
          </p>
        </Seccion>

        <Seccion n={3} titulo="Lo que guardamos y para qué">
          <div className="overflow-x-auto border border-rose-light rounded-xl bg-white mb-3.5">
            <table className="w-full border-collapse min-w-[560px]">
              <thead>
                <tr>
                  {['Dato', 'Cuándo lo capturamos', 'Para qué lo usamos'].map((h, i) => (
                    <th
                      key={h}
                      className={`text-left px-3 py-2.5 bg-indigo-50 text-burgundy text-[12.5px] border-b-[1.5px] border-rose ${
                        i === 0 ? 'w-[26%]' : i === 1 ? 'w-[30%]' : ''
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DATOS.map(([dato, cuando, para]) => (
                  <tr key={dato}>
                    <td className="px-3 py-2.5 border-b border-rose-light align-top text-[13.5px] leading-normal font-semibold text-ink">{dato}</td>
                    <td className="px-3 py-2.5 border-b border-rose-light align-top text-[13.5px] leading-normal">{cuando}</td>
                    <td className="px-3 py-2.5 border-b border-rose-light align-top text-[13.5px] leading-normal">{para}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            <strong>Tu correo solo se guarda si marcas la casilla de novedades</strong>, y lo capturamos con el objetivo de
            saber desde dónde se usa la herramienta. Si no la marcas, tus comentarios y tu encuesta se guardan de forma anónima.
          </p>
          <p>
            Usamos esta información <strong>solo</strong> para métricas y estadísticas del proyecto, para mejorar la
            herramienta y para enviarte novedades si lo autorizaste. Los resultados que publiquemos o reportemos a nuestros
            financiadores son siempre <strong>agregados y anónimos</strong>.
          </p>
        </Seccion>

        <Seccion n={4} titulo="¿Con quién se comparte?">
          <p>
            <strong>Con nadie.</strong> No vendemos, cedemos ni compartimos tus datos con terceros. La herramienta funciona
            sobre los servicios de <strong>Vercel</strong>, <strong>Supabase</strong> y <strong>Google Analytics</strong>.
          </p>
        </Seccion>

        <Seccion n={5} titulo="Base legal">
          <p>
            Tratamos tus datos sobre la base de tu <strong>consentimiento</strong>: al marcar la casilla de novedades, al
            enviar un comentario o al responder la encuesta. Puedes retirarlo en cualquier momento.
          </p>
        </Seccion>

        <Seccion n={6} titulo="¿Cuánto tiempo los conservamos?">
          <p>
            Los datos que analizas, ningún tiempo: se eliminan al terminar el cálculo. Tu correo, comentarios y encuesta,
            mientras dure el proyecto o hasta que nos pidas eliminarlos.
          </p>
        </Seccion>

        <Seccion n={7} titulo="Tus derechos">
          <p>
            Puedes pedir <strong>acceso, rectificación, eliminación u oposición</strong> al tratamiento de tus datos, y{' '}
            <strong>retirar tu consentimiento</strong> para dejar de recibir comunicaciones. Escríbenos a{' '}
            <a href={`mailto:${CONTACTO}`} className={link}>{CONTACTO}</a> con el asunto{' '}
            <em>«Datos personales Herramienta de sesgos»</em>.
          </p>
        </Seccion>

        <Seccion n={8} titulo="Cambios a esta política">
          <p>
            Si cambiamos la forma en que tratamos los datos, actualizaremos esta página y su fecha, y lo informaremos a
            quienes autorizaron recibir novedades.
          </p>
        </Seccion>

        <footer className="border-t border-rose-light pt-5 text-[13px] text-ink-60 leading-relaxed">
          GobLab UAI — Escuela de Gobierno, Universidad Adolfo Ibáñez. Santiago, Chile.
          <br />
          Nosotros:{' '}
          <a href="https://www.uai.cl/goblab" target="_blank" rel="noopener noreferrer" className={link}>www.uai.cl/goblab</a>
          {' · '}
          Contacto: <a href={`mailto:${CONTACTO}`} className={link}>{CONTACTO}</a>
        </footer>
      </div>
    </main>
  );
};
