import React from 'react';
import { 
  Globe, 
  Sparkles, 
  Scissors, 
  Wrench, 
  Truck, 
  Dumbbell, 
  TrendingUp, 
  ArrowRight,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { VerticalCategory } from '../types';

interface GlobalIntentNetworkViewProps {
  onNavigateVertical: (v: VerticalCategory) => void;
}

export const GlobalIntentNetworkView: React.FC<GlobalIntentNetworkViewProps> = ({
  onNavigateVertical
}) => {
  const nodes: { id: VerticalCategory; title: string; subtitle: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'beauty',
      title: 'Beauty & Appointments',
      subtitle: 'Customer ↔ Salon / Specialist',
      icon: <Scissors className="w-6 h-6 text-indigo-400" />,
      color: 'from-indigo-600/30 to-purple-600/30 border-indigo-500/40'
    },
    {
      id: 'auto_repair',
      title: 'Auto Repair & Services',
      subtitle: 'Vehicle Owner ↔ Service Shop',
      icon: <Wrench className="w-6 h-6 text-cyan-400" />,
      color: 'from-cyan-600/30 to-blue-600/30 border-cyan-500/40'
    },
    {
      id: 'logistics',
      title: 'US Freight & Load Board',
      subtitle: 'Carrier ↔ Load / Driver ↔ Shipment',
      icon: <Truck className="w-6 h-6 text-amber-400" />,
      color: 'from-amber-600/30 to-orange-600/30 border-amber-500/40'
    },
    {
      id: 'fitness',
      title: 'Fitness & Science Coaching',
      subtitle: 'Trainer ↔ Client / Science Evidence',
      icon: <Dumbbell className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-600/30 to-pink-600/30 border-purple-500/40'
    },
    {
      id: 'marketing',
      title: 'Marketing, SEO & Growth',
      subtitle: 'Business ↔ Marketing / SEO / AI',
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-600/30 to-teal-600/30 border-emerald-500/40'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Network Header */}
      <div className="glass-panel p-8 text-center max-w-4xl mx-auto space-y-4 relative overflow-hidden bg-gradient-to-b from-indigo-950/60 to-slate-900/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
          <Globe className="w-4 h-4 text-cyan-400 animate-spin" />
          Global Intent & Demand Operating Platform
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight leading-tight">
          Единая Сеть Маршрутизации Спроса и Намерений
        </h1>

        <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
          Hermes Connect — это не просто отдельная система бронирования. Это архитектура, связывающая поисковое намерение клиента, сервисную запись, логистику, тренеров и ИИ-ассистентов в единую рабочую среду.
        </p>

        {/* Core Formula Badge */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 text-xs font-mono text-cyan-300 inline-block shadow-inner">
          Search Intent ↔ Useful Tool ↔ Lead ↔ Service Delivery ↔ Revenue
        </div>
      </div>

      {/* Interactive Network Node Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nodes.map(node => (
          <div
            key={node.id}
            onClick={() => onNavigateVertical(node.id)}
            className={`glass-panel p-6 cursor-pointer bg-gradient-to-br ${node.color} hover:scale-[1.02] transition-all group space-y-4`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 group-hover:border-white/20 transition-colors">
                {node.icon}
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-heading">{node.title}</h3>
              <p className="text-xs text-slate-300 mt-1">{node.subtitle}</p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> Интерактивно</span>
              <span className="text-cyan-300 font-semibold group-hover:underline">Открыть модуль →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Architecture Highlights */}
      <div className="glass-panel p-6 bg-slate-900/80 space-y-4">
        <h3 className="font-bold text-lg text-white font-heading flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" /> Архитектурные принципы Hermes Connect
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <h4 className="font-bold text-white text-sm">1. Domain-Agnostic Core</h4>
            <p className="text-slate-400">Единые сущности Workspace, User, Client, Service и Booking легко расширяются отраслевыми плагинами.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <h4 className="font-bold text-white text-sm">2. Human-in-the-loop AI</h4>
            <p className="text-slate-400">ИИ анализирует и подготавливает решения, но финансовые и договорные действия подтверждаются человеком.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <h4 className="font-bold text-white text-sm">3. Zero-Leakage Safety</h4>
            <p className="text-slate-400">Строгое разделение окружений: изолированный dev-контур и отсутствие реальных персональных данных в Git.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
