import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Zap, 
  Share2, 
  Calendar, 
  Sparkles,
  Palette,
  RotateCcw,
  Instagram,
  Globe
} from 'lucide-react';
import { Workspace, UserRole } from '../types';
import { useConnectStore } from '../store/useStore';

interface SidebarProps {
  workspace: Workspace;
  activeRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ workspace, activeRole }) => {
  const { activeBrandTheme, analyzeAndApplyBrandTheme, clearBrandTheme } = useConnectStore();
  const [socialInput, setSocialInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleSyncTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialInput.trim()) return;

    setAnalyzing(true);
    setTimeout(() => {
      analyzeAndApplyBrandTheme(socialInput);
      setAnalyzing(false);
    }, 700);
  };

  return (
    <aside className="glass-panel p-5 space-y-6">
      {/* Workspace Header */}
      <div className="flex items-start gap-4 pb-5 border-b border-white/10">
        {workspace.avatarUrl ? (
          <img 
            src={workspace.avatarUrl} 
            alt={workspace.name} 
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-lg"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xl text-white">
            {workspace.name.substring(0, 2)}
          </div>
        )}

        <div>
          <h3 className="font-bold text-base text-white font-heading leading-tight">{workspace.name}</h3>
          <p className="text-xs text-indigo-300 font-medium mt-0.5">{workspace.tagline}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {workspace.rating}
            </span>
            <span className="text-[11px] text-slate-400">({workspace.reviewCount} отзывов)</span>
          </div>
        </div>
      </div>

      {/* BRAND THEME AUTO-SYNC ENGINE (NEW FEATURE) */}
      <div className="p-4 rounded-xl bg-gradient-to-b from-purple-950/40 to-slate-900/80 border border-purple-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-white flex items-center gap-1.5 font-heading">
            <Palette className="w-4 h-4 text-purple-400" /> Brand Theme AI Sync
          </span>
          <span className="badge badge-primary text-[9px]">AUTO-PALETTE</span>
        </div>

        <p className="text-[11px] text-slate-300 leading-snug">
          Вставьте ваш Instagram или сайт — ИИ проанализирует стиль бренда и сгенерирует уникальный фон приложения.
        </p>

        <form onSubmit={handleSyncTheme} className="space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="instagram.com/my_brand"
              value={socialInput}
              onChange={(e) => setSocialInput(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 pr-8"
            />
            <Instagram className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>

          <button
            type="submit"
            disabled={analyzing}
            className="w-full btn-primary justify-center text-xs py-1.5 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {analyzing ? (
              <span className="flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Анализируем бренд...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Применить стиль бренда
              </span>
            )}
          </button>
        </form>

        {activeBrandTheme && activeBrandTheme.active && (
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-pink-500/30 space-y-1.5 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-pink-300 text-[11px]">{activeBrandTheme.brandName}</span>
              <button
                onClick={clearBrandTheme}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Сброс
              </button>
            </div>
            <p className="text-[10px] text-slate-300 leading-tight">{activeBrandTheme.moodDescription}</p>
          </div>
        )}
      </div>

      {/* Info Details */}
      <div className="space-y-3 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Владелец: <strong className="text-white">{workspace.ownerName}</strong></span>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>{workspace.location}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>{workspace.phone}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Mail className="w-4 h-4 text-purple-400" />
          <span className="truncate">{workspace.email}</span>
        </div>
      </div>

      {/* Active Role Status Box */}
      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-400" /> Активный режим
          </span>
          <span className="badge badge-primary uppercase text-[9px]">{activeRole}</span>
        </div>
        <p className="text-[11px] text-slate-400">
          {activeRole === 'owner' ? 'Полный доступ к аналитике, управлению услугами и расписанием.' :
           activeRole === 'client' ? 'Интерактивный интерфейс записи клиента и бронирования слотов.' :
           activeRole === 'driver' ? 'Интерфейс водителя/перевозчика: отклик на грузы, просмотр рейсов.' :
           'Специализированный рабочий экран мастера/сотрудника.'}
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-2 pt-2">
        <button className="w-full btn-primary justify-center text-xs py-2.5">
          <Share2 className="w-4 h-4" /> Поделиться ссылкой
        </button>
        <button className="w-full btn-secondary justify-center text-xs py-2.5">
          <Calendar className="w-4 h-4 text-slate-400" /> Настройки календаря
        </button>
      </div>
    </aside>
  );
};
