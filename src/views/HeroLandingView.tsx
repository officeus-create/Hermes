import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Building2, 
  Activity, 
  Bot, 
  Star, 
  RefreshCw,
  Play
} from 'lucide-react';
import { VerticalCategory, UserRole } from '../types';

interface HeroLandingViewProps {
  onNavigateVertical: (v: VerticalCategory) => void;
  onOpenOnboarding: () => void;
}

export const HeroLandingView: React.FC<HeroLandingViewProps> = ({
  onNavigateVertical,
  onOpenOnboarding
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'flow' | 'niches'>('overview');

  const leadFlowSteps = [
    {
      id: 1,
      title: 'Новый лид с Instagram / Сайта',
      time: '2 мин назад',
      icon: <Users className="w-4 h-4 text-purple-400" />,
      tag: 'Instagram Direct',
      bg: 'bg-purple-500/10 border-purple-500/30'
    },
    {
      id: 2,
      title: 'ИИ-Рецепционист ответил',
      time: '2 мин назад',
      icon: <Bot className="w-4 h-4 text-indigo-400" />,
      tag: 'Hermes Intelligence',
      bg: 'bg-indigo-500/10 border-indigo-500/30'
    },
    {
      id: 3,
      title: 'Запись подтверждена',
      time: '3 мин назад',
      icon: <Calendar className="w-4 h-4 text-blue-400" />,
      tag: 'Автокалендарь',
      bg: 'bg-blue-500/10 border-blue-500/30'
    },
    {
      id: 4,
      title: 'Оплата получена — $180',
      time: '5 мин назад',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      tag: 'Stripe / Инвойс',
      bg: 'bg-emerald-500/10 border-emerald-500/30'
    },
    {
      id: 5,
      title: 'Отзыв запрошен и получен 5★',
      time: '5 мин назад',
      icon: <Star className="w-4 h-4 text-amber-400" />,
      tag: 'Автолояльность',
      bg: 'bg-amber-500/10 border-amber-500/30'
    }
  ];

  const nicheCards = [
    {
      id: 'monochrome',
      title: 'Professional Services',
      desc: 'Консалтинг, юриспруденция, агентства',
      vertical: 'marketing' as VerticalCategory,
      styleName: 'Monochrome',
      badgeBg: 'bg-slate-900 text-white border-slate-700',
      imageBg: 'from-slate-900 via-slate-800 to-black',
      tagline: 'Строгая черно-белая эстетика B2B'
    },
    {
      id: 'colorblock',
      title: 'Real Estate & Architecture',
      desc: 'Недвижимость, девелопмент, архитектура',
      vertical: 'auto_repair' as VerticalCategory,
      styleName: 'Color-Block',
      badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-800',
      imageBg: 'from-cyan-950 via-slate-900 to-teal-950',
      tagline: 'Пастельные геодезические формы'
    },
    {
      id: 'podium',
      title: 'Wellness & Health',
      desc: 'Фитнес-клубы, спа, медицинские центры',
      vertical: 'fitness' as VerticalCategory,
      styleName: 'Podium',
      badgeBg: 'bg-purple-950 text-purple-300 border-purple-800',
      imageBg: 'from-purple-950 via-slate-900 to-indigo-950',
      tagline: 'Мягкий градиентный подиум'
    },
    {
      id: 'technicolor',
      title: 'Beauty & Lifestyle',
      desc: 'Салоны красоты, барбершопы, бьюти-студии',
      vertical: 'beauty' as VerticalCategory,
      styleName: 'Technicolor',
      badgeBg: 'bg-rose-950 text-rose-300 border-rose-800',
      imageBg: 'from-rose-950 via-purple-950 to-slate-900',
      tagline: 'Яркое студийное освещение'
    }
  ];

  return (
    <div className="space-y-10">
      {/* 🌟 HERO MARKETING CANVAS (Pearl Light Storytelling) */}
      <section className="relative overflow-hidden rounded-3xl bg-[#F7F6F3] text-[#0B0D12] p-8 lg:p-12 border border-[#E6E2D8] shadow-2xl transition-all">
        {/* Subtle Background Flow Waves Effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-300 via-purple-100 to-transparent" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI OPERATING SYSTEM FOR BUSINESS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-none text-[#0B0D12]">
              Run your business with <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">AI</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
              Все, что нужно для управления, автоматизации и масштабирования бизнеса. ИИ-агенты работают 24/7, чтобы вы фокусировались на главном.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenOnboarding}
                className="px-6 py-3.5 rounded-full bg-[#0B0D12] text-white font-semibold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span>Запустить за $1 / мес</span>
                <ArrowRight className="w-4 h-4 text-indigo-400" />
              </button>

              <button
                onClick={() => onNavigateVertical('website_demo')}
                className="px-6 py-3.5 rounded-full bg-white border border-slate-300 text-[#0B0D12] font-semibold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 text-indigo-600" />
                <span>Смотреть демо</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="pt-4 flex items-center gap-3 border-t border-slate-200/80">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0B0D12]">+2,700 предприятий</p>
                <p className="text-[11px] text-slate-500">уже растут на платформе Hermes Connect</p>
              </div>
            </div>
          </div>

          {/* Center/Right Column: 3D Interconnected Loop & Live Flow Stream */}
          <div className="lg:col-span-6 space-y-4">
            {/* 3D Translucent Knot Visual Container */}
            <div className="relative rounded-2xl bg-white/80 p-6 border border-slate-200 shadow-xl backdrop-blur-md overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-[#0B0D12] uppercase tracking-wider">Автоматический поток лида</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Hermes OS v1</span>
              </div>

              {/* Step Sequence */}
              <div className="space-y-2.5">
                {leadFlowSteps.map((step) => (
                  <div 
                    key={step.id} 
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/60 hover:border-indigo-300 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-200">
                        {step.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0B0D12]">{step.title}</p>
                        <p className="text-[10px] text-slate-500">{step.time}</p>
                      </div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-200/80 font-medium text-slate-700">
                      {step.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 LIVE OPERATING COMMAND CENTER DASHBOARD (Anthracite Cosmic Dark) */}
      <section className="glass-panel p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-xl font-bold text-white font-heading">Операционный Дашборд (Live Command Center)</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">Центр управления бизнесом в реальном времени с единым ИИ Hermes Intelligence</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium">
              Ecosystem Status: Active
            </span>
          </div>
        </div>

        {/* Key Operational KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <p className="text-xs text-slate-400">Выручка (за месяц)</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-heading">$18,420</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +14.6% vs прошлый месяц
            </span>
          </div>

          <div className="glass-card p-4">
            <p className="text-xs text-slate-400">Записи / Заказы</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-heading">32</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +12.3%
            </span>
          </div>

          <div className="glass-card p-4">
            <p className="text-xs text-slate-400">Новые Лиды</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-heading">18</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +8.1%
            </span>
          </div>

          <div className="glass-card p-4">
            <p className="text-xs text-slate-400">ИИ-Диалоги 24/7</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-heading">43</p>
            <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1 mt-1">
              <Bot className="w-3 h-3" /> 100% автоответов
            </span>
          </div>
        </div>

        {/* Integrated AI Sub-Agents Orchestration Status */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-white">Активность ИИ-Модулей (Hermes Intelligence)</span>
            </div>
            <span className="text-xs text-slate-400">5 модулей синхронизированы</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-200 font-medium">Receptionist Agent</span>
              </div>
              <span className="text-slate-400 text-[10px]">24 диалога</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-200 font-medium">Sales Agent</span>
              </div>
              <span className="text-slate-400 text-[10px]">15 квад-лидов</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-200 font-medium">Finance Agent</span>
              </div>
              <span className="text-slate-400 text-[10px]">12 инвойсов</span>
            </div>
          </div>
        </div>
      </section>

      {/* 🎨 INDUSTRY MOOD DIRECTIONS (4 Canonical Categories) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Отраслевые Стили Направлений</h2>
          <p className="text-xs text-slate-400">4 уникальных визуальных мудборда под конкретный бизнес-сегмент</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nicheCards.map(niche => (
            <div 
              key={niche.id}
              onClick={() => onNavigateVertical(niche.vertical)}
              className="glass-card p-5 space-y-3 cursor-pointer group hover:border-indigo-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${niche.badgeBg}`}>
                  {niche.styleName}
                </span>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {niche.title}
                </h3>

                <p className="text-xs text-slate-400 leading-snug">
                  {niche.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 italic">{niche.tagline}</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔄 MIGRATION FROM ALTEGIO / PHOREST BANNER */}
      <section className="glass-panel p-6 bg-gradient-to-r from-purple-900/30 via-slate-900 to-indigo-900/30 border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Миграция в 1-клик</span>
          </div>
          <h3 className="text-xl font-bold text-white font-heading">
            Переход с Altegio, Phorest или Fresha за 5 минут
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            ИИ автоматически перенесет всю историю клиентов, каталог услуг, сотрудников и расписание без простоя бизнеса.
          </p>
        </div>

        <button
          onClick={onOpenOnboarding}
          className="btn-primary py-3 px-6 text-sm shrink-0"
        >
          <span>Мигрировать в 1 клик</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
