import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Bot, 
  Puzzle, 
  ShieldCheck, 
  Zap, 
  X, 
  ArrowRight,
  MessageSquare,
  Globe,
  Scissors,
  Wrench,
  Truck,
  Dumbbell
} from 'lucide-react';
import { VerticalCategory } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVertical: (v: VerticalCategory) => void;
  onSendMessage: (msg: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectVertical,
  onSendMessage
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open palette
          // Props handler can be triggered if parent controls state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { label: 'Открыть Операционный Центр ОС V1.1', icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />, action: () => { onSelectVertical('os_command_center'); onClose(); } },
    { label: 'Маркетплейс Интеграций Composio MCP & AWS Sales', icon: <Puzzle className="w-3.5 h-3.5 text-purple-400" />, action: () => { onSelectVertical('integrations'); onClose(); } },
    { label: 'ИИ-Аудит Резюме и Bio-ссылки', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />, action: () => { onSelectVertical('candidate_auditor'); onClose(); } },
    { label: 'Салон красоты: Панель записей', icon: <Scissors className="w-3.5 h-3.5 text-pink-400" />, action: () => { onSelectVertical('beauty'); onClose(); } },
    { label: 'Авторемонт: Заказы-наряды', icon: <Wrench className="w-3.5 h-3.5 text-amber-400" />, action: () => { onSelectVertical('auto_repair'); onClose(); } },
    { label: 'US Freight Load Board', icon: <Truck className="w-3.5 h-3.5 text-cyan-400" />, action: () => { onSelectVertical('logistics'); onClose(); } }
  ];

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    onSendMessage(query);
    setQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-xl p-0 overflow-hidden border border-indigo-500/40 shadow-2xl bg-slate-900/95 rounded-2xl">
        {/* Command Search Bar */}
        <form onSubmit={handleQuerySubmit} className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите команду для Hermes Intelligence или ищите раздел... (например, 'Запиши клиента на 14:00')"
            className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-slate-400 font-medium"
            autoFocus
          />
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Actions List */}
        <div className="p-3 space-y-1 max-h-[320px] overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Быстрый Переход & Разделы</p>
          {quickActions
            .filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
            .map((act, idx) => (
              <div
                key={idx}
                onClick={act.action}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-transparent cursor-pointer transition-all text-xs font-semibold text-slate-200 hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  {act.icon}
                  <span>{act.label}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ))}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
          <span>Нажмите <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px] border border-white/10">Enter</kbd> для отправки ИИ</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px] border border-white/10">Esc</kbd> чтобы закрыть</span>
        </div>
      </div>
    </div>
  );
};
