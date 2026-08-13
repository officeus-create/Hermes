import React from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  Puzzle, 
  Bot, 
  ShieldCheck, 
  Scissors, 
  Search
} from 'lucide-react';
import { VerticalCategory } from '../types';

interface MobileBottomDockProps {
  activeVertical: VerticalCategory;
  onSelectVertical: (v: VerticalCategory) => void;
  onOpenCommandPalette: () => void;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  activeVertical,
  onSelectVertical,
  onOpenCommandPalette
}) => {
  const dockItems: { id: VerticalCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'hero_landing', label: 'Бренд', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'os_command_center', label: 'Центр ОС', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'integrations', label: 'Интеграции', icon: <Puzzle className="w-4 h-4" /> },
    { id: 'candidate_auditor', label: 'Аудит', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'beauty', label: 'Салон', icon: <Scissors className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 lg:hidden">
      <div className="glass-panel p-2 bg-slate-900/95 border border-white/15 backdrop-blur-2xl rounded-2xl shadow-2xl flex items-center justify-around">
        {dockItems.map(item => {
          const isActive = activeVertical === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectVertical(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-bold leading-none">{item.label}</span>
            </button>
          );
        })}

        {/* Quick Cmd+K Search Mobile Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-amber-400 hover:text-amber-300"
          title="Поиск и команды"
        >
          <Search className="w-4 h-4" />
          <span className="text-[9px] font-bold leading-none">Поиск</span>
        </button>
      </div>
    </div>
  );
};
