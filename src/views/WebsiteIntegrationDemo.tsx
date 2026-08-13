import React, { useState } from 'react';
import { 
  Globe2, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ExternalLink, 
  ArrowRight,
  ShieldAlert,
  Calendar,
  Zap,
  Lock
} from 'lucide-react';

export const WebsiteIntegrationDemo: React.FC = () => {
  const [activeWidgetTab, setActiveWidgetTab] = useState<'booking_overlay' | 'lead_gate' | 'service_card'>('booking_overlay');

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="glass-panel p-5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white font-heading">
                Демонстрация Интеграции Hermes Connect в основной сайт Hermes
              </h3>
              <span className="badge badge-emerald text-[10px]">READ-ONLY ISOLATED DEMO</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Этот компонент наглядно показывает, как модуль Hermes Connect встраивается в страницы <code className="text-cyan-300 font-mono">hermeslogisticsus.com</code> (в разделы IT, услуг, главной страницы) без изменения продакшн-кода.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Mockup Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mock Browser Window */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel overflow-hidden border border-white/15 shadow-2xl">
            {/* Mock Browser Header */}
            <div className="p-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>

              <div className="px-4 py-1 rounded-full bg-slate-950 text-[11px] font-mono text-slate-300 border border-white/10 flex items-center gap-2">
                <Lock className="w-3 h-3 text-emerald-400" />
                https://hermeslogisticsus.com/services/hermes-connect/
              </div>

              <span className="text-[10px] text-slate-500">Astro / Pages Preview</span>
            </div>

            {/* Mock Website Body */}
            <div className="p-6 bg-slate-950 text-slate-200 space-y-6 min-h-[420px] relative">
              {/* Fake Website Navigation */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2 font-bold text-white font-heading">
                  <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-[10px]">H</div>
                  HERMES LOGISTICS & IT
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>Услуги</span>
                  <span>Логистика</span>
                  <span className="text-indigo-400 font-semibold">Hermes Connect</span>
                  <span>О компании</span>
                </div>
              </div>

              {/* Fake Hero Section */}
              <div className="space-y-3">
                <span className="badge badge-primary text-[10px]">Hermes Connect Web App Integration</span>
                <h2 className="text-2xl font-bold text-white font-heading">
                  Единая операционная система для вашего бизнеса и записей
                </h2>
                <p className="text-xs text-slate-400 max-w-lg">
                  Принимайте онлайн-записи клиентов, управляйте расписанием мастеров и автоматизируйте коммуникации.
                </p>
              </div>

              {/* EMBEDDED HERMES CONNECT WIDGET DEMO */}
              {activeWidgetTab === 'booking_overlay' && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/40 shadow-xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" /> Интерактивный Виджет Онлайн-Записи
                    </span>
                    <span className="badge badge-emerald text-[9px]">Live Web App</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-white/5">
                      <span className="text-slate-400 block text-[10px]">Услуга:</span>
                      <span className="font-bold text-white">Haircut & Aesthetic Styling</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-white/5">
                      <span className="text-slate-400 block text-[10px]">Время:</span>
                      <span className="font-bold text-emerald-400">Завтра, 11:00 AM</span>
                    </div>
                  </div>

                  <button className="btn-primary w-full justify-center text-xs py-2">
                    Забронировать через Hermes Connect Engine
                  </button>
                </div>
              )}

              {activeWidgetTab === 'lead_gate' && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/40 shadow-xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-400" /> Lead Gate / Request Controlled Access
                    </span>
                    <span className="badge badge-primary text-[9px]">Exact-Origin Adapter</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      readOnly
                      value="Название компании / Ваше имя"
                      className="w-full bg-slate-800 border border-white/10 rounded p-2 text-slate-400 text-xs"
                    />
                    <button className="btn-primary w-full justify-center bg-purple-600 text-xs py-2">
                      Запросить доступ к Hermes Connect
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Integration Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-bold text-base text-white font-heading flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Выберите формат интеграции
            </h3>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => setActiveWidgetTab('booking_overlay')}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  activeWidgetTab === 'booking_overlay'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white font-semibold'
                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                1. Виджет бронирования на сервисной странице
              </button>

              <button
                onClick={() => setActiveWidgetTab('lead_gate')}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  activeWidgetTab === 'lead_gate'
                    ? 'bg-purple-950/60 border-purple-500 text-white font-semibold'
                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                2. Форма подачи заявки Lead Gate (/api/connect-lead)
              </button>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Безопасный Origin-Adapter (/api/connect-lead)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero Production Impact guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
