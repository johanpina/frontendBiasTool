import React, { useState } from 'react';
import { Target, FileText, Flag, Users, Lock, ArrowRight, Globe } from 'lucide-react';
import { trackToolStart, registerToolUser } from '../lib/analytics';

interface LandingContentProps {
  onStart: () => void;
}

const VERSION = '2.0.0';

// Las 4 métricas de verdicto que mide la herramienta (para el gráfico del hero).
const METRICAS = [
  { sigla: 'FPR', nombre: 'Falsos Positivos' },
  { sigla: 'FDR', nombre: 'Falsos Descubrimientos' },
  { sigla: 'FOR', nombre: 'Falsas Omisiones' },
  { sigla: 'FNR', nombre: 'Falsos Negativos' },
];

// Gráfico radial de las 4 métricas, en el espíritu del hero de la EIA.
const MetricGraph: React.FC = () => {
  const cx = 200, cy = 200, R = 120;
  const pts = METRICAS.map((_, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / METRICAS.length;
    return { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang), ang };
  });
  const poly = pts.map((p) => `${p.x},${p.y}`).join(' ');
  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto">
      {/* anillos concéntricos */}
      {[0.4, 0.7, 1].map((f, i) => (
        <circle key={i} cx={cx} cy={cy} r={R * f} fill="none" stroke="#E8D1D5" strokeWidth="1" strokeDasharray="3 4" />
      ))}
      {/* radios */}
      {pts.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E8D1D5" strokeWidth="1" />
      ))}
      {/* polígono */}
      <polygon points={poly} fill="#C08A93" fillOpacity="0.1" stroke="#C08A93" strokeWidth="1.5" />
      {/* nodos */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="22" fill="#7A3B48" stroke="#fff" strokeWidth="3" />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700" fontFamily="'JetBrains Mono', monospace">
            {METRICAS[i].sigla}
          </text>
        </g>
      ))}
      {/* medallón central */}
      <circle cx={cx} cy={cy} r="48" fill="#fff" stroke="#E8D1D5" strokeWidth="1.5" />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#7A3B48" fontSize="20" fontStyle="italic" fontFamily="Fraunces, Georgia, serif">
        Equidad
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#8F877F" fontSize="8" letterSpacing="1.5" fontFamily="'JetBrains Mono', monospace">
        4 MÉTRICAS
      </text>
    </svg>
  );
};

const WHY = [
  {
    icon: Target,
    title: '¿Por qué utilizarla?',
    items: [
      'Detecta sesgos en modelos de clasificación antes de ponerlos en producción.',
      'Compara el trato del modelo entre grupos protegidos (sexo, edad, etnia…).',
    ],
  },
  {
    icon: FileText,
    title: '¿En qué consiste?',
    items: [
      'Mide tasas de disparidad con la metodología de Aequitas (Ghani, 2019).',
      'Cuatro métricas de error: FPR, FNR, FOR y FDR, por cada subgrupo.',
    ],
  },
  {
    icon: Flag,
    title: '¿Qué obtienes?',
    items: [
      'Un veredicto de equidad por atributo, con gráficos y tablas claras.',
      'Un informe PDF descargable con todos tus resultados.',
    ],
  },
];

const STEPS = [
  'Carga tus datos',
  'Configura y elige la métrica',
  'Analiza el modelo',
  'Descarga tu informe',
];

// Opciones de registro (mismas de la EIA para "origen"), bajo el correo.
const ORIGENES = [
  'Organismo público',
  'Empresa privada',
  'Institución académica',
  'Organización de la sociedad civil',
  'Persona independiente',
];
const TIPOS = [
  'Ciencia de datos / IA',
  'Desarrollo / Ingeniería',
  'Dirección / jefatura',
  'Investigación',
  'Estudiante',
  'Otro',
];

const PillGroup: React.FC<{ label: string; options: string[]; value: string; onChange: (v: string) => void }> =
  ({ label, options, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-ink-80 mb-1.5">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(value === o ? '' : o)}
          className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
            value === o
              ? 'bg-burgundy text-white border-burgundy'
              : 'bg-white text-ink-80 border-rose-light hover:border-burgundy'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  </div>
);

export const LandingContent: React.FC<LandingContentProps> = ({ onStart }) => {
  const [email, setEmail] = useState('');
  const [origen, setOrigen] = useState('');
  const [tipo, setTipo] = useState('');
  const [consent, setConsent] = useState(false);
  const [starting, setStarting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStarting(true);
    // El registro a Supabase se envía SOLO si la persona acepta; si no, igual entra.
    if (consent) {
      const origin = [origen, tipo].filter(Boolean).join(' · ') || undefined;
      registerToolUser(email.trim().toLowerCase(), origin);
    }
    trackToolStart();
    onStart();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* a) Header bar */}
      <header className="flex items-center justify-between px-5 sm:px-10 py-3.5 border-b border-rose-light bg-white">
        <div className="flex items-center gap-4">
          <img src="/images/goblab-uai.png" alt="GobLab - Universidad Adolfo Ibáñez" className="h-9 w-auto" />
          <span className="hidden sm:block w-px h-6 bg-rose-light" />
          <div className="hidden sm:block leading-none text-right">
            <span className="block text-rose text-sm font-extrabold tracking-tight">HERRAMIENTAS</span>
            <span className="block text-ink text-base font-extrabold tracking-tight">ALGORITMOS ÉTICOS</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="#privacidad" className="text-sm text-ink-60 hover:text-burgundy transition-colors">Privacidad</a>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-rose-light text-burgundy text-xs font-semibold px-3 py-1">
            <Globe className="h-3.5 w-3.5" /> ES
          </span>
        </div>
      </header>

      {/* b) Hero */}
      <section className="grid lg:grid-cols-[minmax(360px,1fr)_minmax(480px,1.1fr)] bg-indigo-50">
        {/* Columna izquierda: copy */}
        <div className="px-6 sm:px-11 py-12 lg:border-r border-rose-light">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-white border border-rose-light text-burgundy text-[11px] font-semibold px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-rose" />
            Herramienta · v{VERSION} · 4 métricas de equidad
          </span>
          <h1 className="font-display font-medium text-ink leading-[1.02] tracking-tight mb-5"
              style={{ fontSize: 'clamp(32px, 4vw, 50px)', letterSpacing: '-1.5px' }}>
            Medición de <em className="text-burgundy italic font-medium">sesgos</em> y equidad estadística.
          </h1>
          <p className="text-base text-ink-60 leading-relaxed max-w-md mb-8">
            Evalúa si tu modelo de clasificación trata de forma equitativa a los distintos grupos de la población,
            y obtén un diagnóstico claro para construir sistemas más justos y responsables.
          </p>

          {/* 3 tarjetas "por qué" */}
          <div className="space-y-3 max-w-lg">
            {WHY.map((w) => {
              const Icon = w.icon;
              return (
                <div key={w.title} className="bg-white border border-rose-light rounded-xl px-4 py-3.5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-burgundy">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-[13px] font-semibold text-ink-80">{w.title}</h3>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {w.items.map((it, i) => (
                      <li key={i} className="text-[12.5px] text-ink-60 leading-snug">{it}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna derecha: gráfico */}
        <div className="flex items-center justify-center px-4 py-8"
             style={{ background: 'radial-gradient(circle at 50% 50%, #FBF3F4 0%, #ffffff 75%)' }}>
          <MetricGraph />
        </div>
      </section>

      {/* c) Tira de pasos */}
      <section className="bg-white px-6 sm:px-10 py-7 border-b border-rose-light">
        <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-4">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-mono text-[11px] font-bold ${
                  i === 0 ? 'bg-burgundy text-white' : 'bg-indigo-50 text-burgundy'
                }`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[13px] text-ink-80 hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && <span className="flex-1 h-px bg-rose-light" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* d) Formulario + avisos */}
      <section className="grid lg:grid-cols-[1.2fr_1fr] gap-7 bg-indigo-50 px-6 sm:px-10 py-12">
        {/* Formulario */}
        <div className="bg-white border border-rose-light rounded-2xl px-7 py-6">
          <h2 className="font-display text-2xl font-semibold text-ink mb-1">Comienza tu evaluación</h2>
          <p className="text-sm text-ink-60 mb-5">
            Necesitas un archivo <b>.csv</b> o <b>.xlsx</b> con las predicciones del modelo, los valores reales y
            las variables protegidas.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-80 mb-1.5">
                Correo electrónico (opcional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@ejemplo.com"
                className="w-full border border-rose-light bg-indigo-50 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
              />
            </div>

            <PillGroup label="¿Desde dónde participas?" options={ORIGENES} value={origen} onChange={setOrigen} />
            <PillGroup label="Tipo de usuario" options={TIPOS} value={tipo} onChange={setTipo} />

            <label className="flex items-start gap-2.5 text-sm text-ink-60 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 shrink-0"
              />
              <span>
                Acepto registrar mi participación (correo, institución y rol) para ayudar a mejorar la
                herramienta. Es <b>opcional</b>: puedes iniciar igualmente sin marcarla.
              </span>
            </label>

            <button
              type="submit"
              disabled={starting}
              className="w-full inline-flex items-center justify-center gap-2 bg-burgundy text-white font-bold tracking-wide rounded-md px-4 py-3.5 hover:bg-rose disabled:bg-ink-20 transition-colors"
            >
              {starting ? 'INICIANDO…' : 'INICIAR EVALUACIÓN'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Avisos */}
        <div className="space-y-4">
          <div className="bg-white border border-rose-light rounded-xl px-5 py-4">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-burgundy">
                <Users className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-semibold text-ink-80">Mejor en equipo</h3>
            </div>
            <p className="text-[12.5px] text-ink-60 leading-snug">
              Recomendamos que un equipo multidisciplinario participe en la evaluación de las métricas del modelo.
            </p>
          </div>

          <div id="privacidad" className="bg-white border border-rose-light rounded-xl px-5 py-4">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-burgundy">
                <Lock className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-semibold text-ink-80">Privacidad</h3>
            </div>
            <p className="text-[12.5px] text-ink-60 leading-snug">
              Los datos que cargas no se almacenan: se procesan y luego se eliminan de nuestros servidores.
            </p>
          </div>

          <div className="bg-indigo-50 border border-rose-light rounded-xl px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-burgundy mb-1.5">Exención de responsabilidad</p>
            <p className="text-[12px] text-ink-60 leading-snug">
              La herramienta asiste en la identificación de sesgos, pero no garantiza el correcto funcionamiento de
              los sistemas evaluados. La UAI no se responsabiliza por decisiones tomadas a partir de sus resultados.
              La elección de variables protegidas debe hacerse conforme a la Ley N.º 20.609 (no discriminación arbitraria).
            </p>
          </div>
        </div>
      </section>

      {/* e) Agradecimientos */}
      <section className="bg-white px-6 sm:px-10 py-10 border-t border-rose-light">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-40 mb-4">Agradecimientos</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img src="/images/ANID.png" alt="ANID" className="h-16 w-auto" />
            <p className="text-sm text-ink-60 max-w-xl">
              Desarrollada por el <b>GobLab UAI</b>. Financiada por ANID — Subdirección de Investigación Aplicada /
              Concurso IDeA I+D 2023, proyecto ID23I10357.
            </p>
          </div>
        </div>
      </section>

      {/* f) Footer oscuro */}
      <footer className="px-6 sm:px-10 py-4 bg-ink text-white/75 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
        <span>Desarrollado por GobLab UAI · Escuela de Gobierno, Universidad Adolfo Ibáñez</span>
        <span className="font-mono">ANID ID23I10357</span>
      </footer>
    </div>
  );
};
