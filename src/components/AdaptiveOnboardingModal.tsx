import React from 'react';
import { 
  Scissors, 
  Wrench, 
  Truck, 
  Dumbbell, 
  Sparkles, 
  X, 
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { VerticalCategory } from '../types';

interface AdaptiveOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVertical: (vertical: VerticalCategory) => void;
  activeVertical: VerticalCategory;
}

export const AdaptiveOnboardingModal: React.FC<AdaptiveOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSelectVertical,
  activeVertical
}) => {
  if (!isOpen) return null;

  const personas = [
    {
      id: 'beauty' as VerticalCategory,
      title: 'Салон красоты / Спа',
      description: 'Автоматическая запись клиенток, расписание мастеров, касса и онлайн-запись 24/7.',
      icon: Scissors,
      accent: 'border-pink-500/50 hover:border-pink-500 bg-pink-500/10 text-pink-400',
      badge: 'Beauty & Wellness',
      kpi: 'Заполнение кресел: 94%'
    },
    {
      id: 'auto_repair' as VerticalCategory,
      title: 'Автосервис / СТО',
      description: 'Прием авто на диагностику, расчет смет запчастей, статусы ремонта и заказ-наряды.',
      icon: Wrench,
      accent: 'border-blue-500/50 hover:border-blue-500 bg-blue-500/10 text-blue-400',
      badge: 'Automotive',
      kpi: 'Очередь постов: 8 авто'
    },
    {
      id: 'logistics' as VerticalCategory,
      title: 'US Freight Логистика',
      description: 'Интерактивный US Load Board, торги с диспетчерами, ставка за милю и трекинг BOL.',
      icon: Truck,
      accent: 'border-amber-500/50 hover:border-amber-500 bg-amber-500/10 text-amber-400',
      badge: 'US Freight',
      kpi: 'Средняя ставка: $3.37 / mi'
    },
    {
      id: 'fitness' as VerticalCategory,
      title: 'Фитнес & Тренеры',
      description: 'Планы тренировок, сдача отчетов атлетами, PAR-Q+ верификация и Science Copilot.',
      icon: Dumbbell,
      accent: 'border-purple-500/50 hover:border-purple-500 bg-purple-500/10 text-purple-400',
      badge: 'Sports & Science',
      kpi: 'Соблюдение плана: 88.5%'
    },
    {
      id: 'marketing' as VerticalCategory,
      title: 'IT & Маркетинг Агентство',
      description: 'Генерация лидов, локальный SEO-аудит бизнеса, интеграция сайта и конверсии.',
      icon: Sparkles,
      accent: 'border-emerald-500/50 hover:border-emerald-500 bg-emerald-500/10 text-emerald-400',
      badge: 'Growth Engine',
      kpi: 'Конверсия лидов: +38%'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel p-6 border border-white/20 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary font-mono">1-CLICK ADAPTIVE SETUP</span>
              <span className="text-xs text-indigo-400 font-semibold uppercase">Hermes OS 2026</span>
            </div>
            <h2 className="text-xl font-extrabold text-white font-heading mt-1">
              Каким бизнесом вы управляете?
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Интерфейс Hermes Connect мгновенно перестроит Bento-карточки, AI-агентов и рабочие процессы под вашу индустрию.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {personas.map(persona => {
            const IconComponent = persona.icon;
            const isSelected = activeVertical === persona.id;

            return (
              <div
                key={persona.id}
                onClick={() => {
                  onSelectVertical(persona.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                  isSelected 
                    ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/30 hover:bg-slate-900/90'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-indigo-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${persona.accent} shrink-0`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-mono block">{persona.badge}</span>
                    <h3 className="font-bold text-sm text-white font-heading">{persona.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {persona.description}
                </p>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-indigo-300 font-medium">{persona.kpi}</span>
                  <span className="text-slate-400 font-semibold group-hover:text-white flex items-center gap-1 transition-colors">
                    Выбрать <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            Универсальная ОС: все 5 модулей можно переключать в любой момент из верхнего меню.
          </span>
          <button 
            onClick={onClose}
            className="btn-primary text-xs py-1.5 px-4"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
