import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Zap, 
  CheckCircle2, 
  Share2, 
  Calendar, 
  Layers
} from 'lucide-react';
import { Workspace, UserRole } from '../types';

interface SidebarProps {
  workspace: Workspace;
  activeRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ workspace, activeRole }) => {
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

      {/* Quick Action Button */}
      <div className="space-y-2 pt-2">
        <button className="w-full btn-primary justify-center text-xs py-2.5">
          <Share2 className="w-4 h-4" /> Поделиться публичной ссылкой
        </button>
        <button className="w-full btn-secondary justify-center text-xs py-2.5">
          <Calendar className="w-4 h-4 text-slate-400" /> Настройки календаря
        </button>
      </div>
    </aside>
  );
};
