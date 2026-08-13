import React from 'react';

export type LogoConceptId = 
  | 'quantum_node' 
  | 'continuous_loop' 
  | 'convergent_meridian' 
  | 'bento_matrix' 
  | 'minimal_h_node' 
  | 'kinetic_wing_v2';

export interface LogoConceptInfo {
  id: LogoConceptId;
  name: string;
  nameEn: string;
  tagline: string;
  description: string;
}

export const LOGO_CONCEPTS: LogoConceptInfo[] = [
  {
    id: 'quantum_node',
    name: 'Квантовый Узел',
    nameEn: 'Quantum Core Node',
    tagline: 'Центральный хаб & Орбиты намерений',
    description: 'Центральный управляющий модуль бизнеса с гладкими орбитами процессов. Символ устойчив при 4, 12 или 100+ направлениях.'
  },
  {
    id: 'continuous_loop',
    name: 'Петля Непрерывности',
    nameEn: 'Infinity Workflow Loop',
    tagline: 'Бесконечный цикл: Поиск → Продажи → Сервис → Рост',
    description: 'Элегантная петля Мебиуса, символизирующая непрерывный цикл работы бизнеса без задержек и потери лидов.'
  },
  {
    id: 'convergent_meridian',
    name: 'Меридиан Схождения',
    nameEn: 'Convergent Meridian',
    tagline: 'Конвергенция всех каналов в единый поток',
    description: 'Параллельные каналы (соцсети, звонки, сайты, мессенджеры) сходятся в одну точную управляемую магистраль.'
  },
  {
    id: 'bento_matrix',
    name: 'Модульное Ядро Bento',
    nameEn: 'Bento Grid Matrix',
    tagline: 'Адаптивные строительные блоки бизнеса',
    description: 'Минималистичный геодезический модуль из 4 элементов, отражающий структуру Bento Grid и точность операционной системы.'
  },
  {
    id: 'minimal_h_node',
    name: 'Монограмма H-Node',
    nameEn: 'Geometric H-Node',
    tagline: 'Лаконичная монограмма Hermes + Нейронная точка',
    description: 'Архитектурная буква H с центральной точкой интеллекта. Выглядит монументально, дорого и сдержанно.'
  },
  {
    id: 'kinetic_wing_v2',
    name: 'Минималистичное Крыло V2',
    nameEn: 'Kinetic Wing V2',
    tagline: 'Лаконичный аэродинамический крылатый модуль',
    description: 'Упрощенный вариант крыла из 2 скользящих линий. Не привязан к конкретному числу подразделений.'
  }
];

interface LogoProps {
  conceptId: LogoConceptId;
  size?: number;
  className?: string;
}

export const BrandLogoV2: React.FC<LogoProps> = ({ conceptId, size = 36, className = '' }) => {
  switch (conceptId) {
    case 'quantum_node':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="qn_g1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6D28D9" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <radialGradient id="qn_core" cx="24" cy="24" r="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#3B82F6" />
            </radialGradient>
          </defs>
          {/* Outer Ring 1 */}
          <ellipse cx="24" cy="24" rx="18" ry="8" stroke="url(#qn_g1)" strokeWidth="2.5" transform="rotate(-30 24 24)" strokeDasharray="90 10" />
          {/* Outer Ring 2 */}
          <ellipse cx="24" cy="24" rx="18" ry="8" stroke="url(#qn_g1)" strokeWidth="2.5" transform="rotate(30 24 24)" opacity="0.85" />
          {/* Central Quantum Node */}
          <circle cx="24" cy="24" r="5" fill="url(#qn_core)" />
          <circle cx="24" cy="24" r="8" stroke="#6D28D9" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );

    case 'continuous_loop':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="cl_g" x1="4" y1="24" x2="44" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6D28D9" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <path
            d="M 14 16 C 8 16 8 32 14 32 C 22 32 26 16 34 16 C 40 16 40 32 34 32 C 26 32 22 16 14 16 Z"
            stroke="url(#cl_g)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="24" r="2.5" fill="#6D28D9" />
          <circle cx="34" cy="24" r="2.5" fill="#D97706" />
        </svg>
      );

    case 'convergent_meridian':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="cm_g" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>
          </defs>
          {/* Parallel incoming streams merging into 1 vector */}
          <path d="M 6 10 C 18 10 24 24 38 24 L 44 24" stroke="url(#cm_g)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 6 24 L 44 24" stroke="url(#cm_g)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 6 38 C 18 38 24 24 38 24 L 44 24" stroke="url(#cm_g)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="42" cy="24" r="3" fill="#BE123C" />
        </svg>
      );

    case 'bento_matrix':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="bm_g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="14" height="14" rx="4" fill="url(#bm_g)" opacity="0.95" />
          <rect x="26" y="8" width="14" height="14" rx="4" fill="#2563EB" opacity="0.75" />
          <rect x="8" y="26" width="14" height="14" rx="4" fill="#D97706" opacity="0.8" />
          <rect x="26" y="26" width="14" height="14" rx="4" fill="url(#bm_g)" />
          {/* Subtle connecting cross */}
          <circle cx="24" cy="24" r="2.5" fill="#FFFFFF" />
        </svg>
      );

    case 'minimal_h_node':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="hn_g" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          {/* Left Vertical Bar */}
          <rect x="10" y="8" width="6" height="32" rx="3" fill="url(#hn_g)" />
          {/* Right Vertical Bar */}
          <rect x="32" y="8" width="6" height="32" rx="3" fill="url(#hn_g)" />
          {/* Horizontal Bridge with Central Intelligence Node */}
          <line x1="16" y1="24" x2="32" y2="24" stroke="#6D28D9" strokeWidth="3.5" />
          <circle cx="24" cy="24" r="4.5" fill="#D97706" />
          <circle cx="24" cy="24" r="2" fill="#FFFFFF" />
        </svg>
      );

    case 'kinetic_wing_v2':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="kw2_g" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          {/* Streamlined dual-wing curve */}
          <path d="M 8 36 C 14 18 28 10 42 12 C 30 18 22 28 20 40 Z" fill="url(#kw2_g)" />
          <path d="M 16 38 C 22 26 32 18 42 20 C 34 24 28 32 26 40 Z" fill="#2563EB" opacity="0.6" />
          <circle cx="42" cy="12" r="2.5" fill="#D97706" />
        </svg>
      );
  }
};

interface BrandLogoExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedConcept: LogoConceptId;
  onSelectConcept: (concept: LogoConceptId) => void;
}

export const BrandLogoExplorerModal: React.FC<BrandLogoExplorerModalProps> = ({
  isOpen,
  onClose,
  selectedConcept,
  onSelectConcept
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl glass-panel p-6 border border-white/20 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary font-mono">BRAND EXPLORATION V2</span>
              <span className="text-xs text-indigo-400 font-semibold uppercase">6 Future-Proof Logo Concepts</span>
            </div>
            <h2 className="text-xl font-extrabold text-white font-heading mt-1">
              Выберите фирменный знак Hermes Connect
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Все 6 концептов масштабируются независимо от количества подразделений компании (от 1 до 100+).
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 6 Logo Concepts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {LOGO_CONCEPTS.map(concept => {
            const isSelected = selectedConcept === concept.id;

            return (
              <div
                key={concept.id}
                onClick={() => {
                  onSelectConcept(concept.id);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                  isSelected 
                    ? 'bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/30 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 shrink-0">
                    <BrandLogoV2 conceptId={concept.id} size={40} />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-300 font-mono font-semibold uppercase">{concept.nameEn}</span>
                    <h3 className="font-bold text-sm text-white font-heading">{concept.name}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {concept.description}
                </p>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-amber-300 font-medium">{concept.tagline}</span>
                  <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 group-hover:text-white'
                  }`}>
                    {isSelected ? '✓ Выбран' : 'Примерить'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between text-xs text-slate-300">
          <span>
            Выбранный символ мгновенно отображается в шапке для тестирования пользовательского опыта.
          </span>
          <button 
            onClick={onClose}
            className="btn-primary text-xs py-1.5 px-4"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
