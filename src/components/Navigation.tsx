import React from 'react';
import { 
  Sparkles, 
  Scissors, 
  Wrench, 
  Truck, 
  Dumbbell, 
  TrendingUp, 
  Globe, 
  Globe2, 
  UserCheck
} from 'lucide-react';
import { VerticalCategory, UserRole } from '../types';

interface NavigationProps {
  activeVertical: VerticalCategory;
  setActiveVertical: (v: VerticalCategory) => void;
  activeRole: UserRole;
  setActiveRole: (r: UserRole) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeVertical,
  setActiveVertical,
  activeRole,
  setActiveRole
}) => {
  const verticals: { id: VerticalCategory; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'beauty', label: 'Салон красоты', icon: <Scissors className="w-3.5 h-3.5" /> },
    { id: 'auto_repair', label: 'Авторемонт', icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'logistics', label: 'US Load Board', icon: <Truck className="w-3.5 h-3.5" />, badge: 'ГОРЯЧИЙ' },
    { id: 'fitness', label: 'Фитнес и наука', icon: <Dumbbell className="w-3.5 h-3.5" /> },
    { id: 'marketing', label: 'SEO и развитие', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'global_network', label: 'Сеть намерений', icon: <Globe className="w-3.5 h-3.5" />, badge: 'ИИ' },
    { id: 'website_demo', label: 'Демо сайта', icon: <Globe2 className="w-3.5 h-3.5" />, badge: 'EMBED' }
  ];

  const roles: { id: UserRole; label: string }[] = [
    { id: 'owner', label: 'Владелец бизнеса' },
    { id: 'specialist', label: 'Специалист / Мастер' },
    { id: 'client', label: 'Клиент' },
    { id: 'driver', label: 'Водитель / Перевозчик' },
    { id: 'ai_copilot', label: 'ИИ-Ассистент' }
  ];

  return (
    <header className="glass-panel mb-6 p-3.5 border-b border-white/10 sticky top-2 z-50 mx-4 backdrop-blur-xl">
      <div className="flex flex-col xl:flex-row items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer shrink-0" 
          onClick={() => setActiveVertical('global_network')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-white font-heading tracking-tight">HERMES CONNECT</span>
              <span className="badge badge-primary text-[9px] px-2 py-0.5">NEXT</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Платформа намерений и спроса</p>
          </div>
        </div>

        {/* Vertical Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full p-1 bg-slate-900/80 rounded-xl border border-white/10 no-scrollbar">
          {verticals.map(v => {
            const isActive = activeVertical === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setActiveVertical(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {v.icon}
                <span>{v.label}</span>
                {v.badge && (
                  <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-bold ${
                    v.badge === 'ГОРЯЧИЙ' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    v.badge === 'ИИ' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                    'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {v.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/10 text-xs shrink-0">
          <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400 hidden sm:inline">Роль:</span>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as UserRole)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer border-none py-0.5 text-xs"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
