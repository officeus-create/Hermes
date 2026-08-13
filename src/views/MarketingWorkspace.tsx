import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  Globe, 
  Sparkles, 
  BarChart2, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Target
} from 'lucide-react';
import { UserRole } from '../types';

interface MarketingWorkspaceProps {
  activeRole: UserRole;
}

export const MarketingWorkspace: React.FC<MarketingWorkspaceProps> = ({ activeRole }) => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl) return;

    setAnalyzing(true);
    setAuditResult(null);

    setTimeout(() => {
      setAnalyzing(false);
      setAuditResult({
        domain: websiteUrl,
        healthScore: 88,
        seoScore: 92,
        conversionScore: 74,
        mobileSpeedMs: 420,
        recommendations: [
          'Добавить микроразметку Schema.org (LocalBusiness & Service)',
          'Оптимизировать гео-теги Google Maps для локального поиска',
          'Внедрить виджет онлайн-записи Hermes Connect на главную страницу',
          'Увеличить скорость загрузки шрифтов и LCP до <0.8с'
        ]
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/30">
        <div className="max-w-3xl">
          <span className="badge badge-primary mb-2">ProgressoPro Digital & Growth Engine</span>
          <h2 className="text-2xl font-bold text-white font-heading">
            Превратите поисковый трафик в реальных клиентов и выручку
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Hermes Connect объединяет продвижение, SEO-оптимизацию и конверсионный путь записи в единый автоматизированный конвейер.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SEO Express Audit Tool */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-5">
            <h3 className="font-bold text-lg text-white font-heading mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" /> Экспресс-Аудит сайта и видимости бизнеса
            </h3>

            <form onSubmit={handleAudit} className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Введите сайт вашего бизнеса</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://mybusiness.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button type="submit" className="btn-primary">
                    {analyzing ? 'Анализ...' : 'Запустить аудит'}
                  </button>
                </div>
              </div>
            </form>

            {analyzing && (
              <div className="py-8 text-center text-xs text-indigo-300 animate-pulse flex flex-col items-center gap-2">
                <Sparkles className="w-6 h-6 animate-spin text-indigo-400" />
                Анализируем структуры данных, скоростные характеристики и метатеги...
              </div>
            )}

            {auditResult && (
              <div className="mt-6 pt-5 border-t border-white/10 space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] text-slate-400">SEO Оценка</span>
                    <div className="text-xl font-bold text-emerald-400 font-heading">{auditResult.seoScore}/100</div>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-[10px] text-slate-400">Конверсия</span>
                    <div className="text-xl font-bold text-indigo-400 font-heading">{auditResult.conversionScore}/100</div>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <span className="text-[10px] text-slate-400">Скорость (LCP)</span>
                    <div className="text-xl font-bold text-cyan-400 font-heading">{auditResult.mobileSpeedMs} мс</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-xs text-white">Рекомендации ProgressoPro Growth Engine:</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {auditResult.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Growth Package Callout */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-5 border border-indigo-500/30">
            <h3 className="font-bold text-base text-white font-heading mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" /> Рост лидов & Сквозная конверсия
            </h3>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Соединяем поисковое намерение клиента напрямую с вашей формой бронирования. Никаких потерянных заявок и долгих переписок в мессенджерах.
            </p>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Пакет «Hermes Connect Growth»</span>
                <span className="badge badge-emerald">Ready</span>
              </div>
              <p className="text-slate-400">Интеграция виджета + Настройка Google Business + Конверсионный лендинг</p>
              <button className="btn-primary w-full justify-center text-xs">
                Подключить маркетинг
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
