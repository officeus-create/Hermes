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
  ShieldCheck,
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
    { id: 'beauty', label: 'Beauty & Salon', icon: <Scissors className="w-4 h-4" /> },
    { id: 'auto_repair', label: 'Auto Repair', icon: <Wrench className="w-4 h-4" /> },
    { id: 'logistics', label: 'US Load Board', icon: <Truck className="w-4 h-4" />, badge: 'HOT' },
    { id: 'fitness', label: 'Fitness & Science', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'marketing', label: 'SEO & Growth', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'global_network', label: 'Global Intent Network', icon: <Globe className="w-4 h-4" />, badge: 'AI' },
    { id: 'website_demo', label: 'Site Integration Demo', icon: <Globe2 className="w-4 h-4" />, badge: 'EMBED' }
  ];

  const roles: { id: UserRole; label: string }[] = [
    { id: 'owner', label: 'Business Owner' },
    { id: 'specialist', label: 'Specialist / Staff' },
    { id: 'client', label: 'Client / Customer' },
    { id: 'driver', label: 'Carrier / Driver' },
    { id: 'ai_copilot', label: 'AI Agent' }
  ];

  return (
    <header className="glass-panel mb-6 p-4 border-b border-white/10 sticky top-2 z-50 mx-4 backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveVertical('global_network')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white font-heading tracking-tight">HERMES CONNECT</span>
              <span className="badge badge-primary text-[10px]">NEXT v1.0</span>
            </div>
            <p className="text-xs text-slate-400">Global Intent & Demand Operating Platform</p>
          </div>
        </div>

        {/* Vertical Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full p-1 bg-slate-900/60 rounded-xl border border-white/5">
          {verticals.map(v => {
            const isActive = activeVertical === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setActiveVertical(v.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {v.icon}
                <span>{v.label}</span>
                {v.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    v.badge === 'HOT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    v.badge === 'AI' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
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
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-white/10 text-xs">
          <UserCheck className="w-4 h-4 text-indigo-400 ml-1" />
          <span className="text-slate-400 hidden sm:inline">Role:</span>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as UserRole)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer border-none py-1 pr-2"
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
