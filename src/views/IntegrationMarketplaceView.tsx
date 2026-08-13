import React, { useState } from 'react';
import { 
  Puzzle, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowUpRight, 
  Bot, 
  MessageSquare, 
  Phone, 
  Award, 
  Zap, 
  Play, 
  Lock, 
  Check, 
  ExternalLink,
  Sliders,
  TrendingUp,
  Cpu,
  Star,
  RotateCcw
} from 'lucide-react';

interface IntegrationApp {
  id: string;
  name: string;
  category: 'Communication' | 'CRM & Productivity' | 'Developer & Tasks' | 'Payments & Finance';
  description: string;
  icon: string;
  connected: boolean;
  mcpProtocol: string;
  approvalRequired: boolean;
  usageCount: string;
}

export const IntegrationMarketplaceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'sales_roleplay'>('marketplace');

  // Composio MCP Apps
  const [apps, setApps] = useState<IntegrationApp[]>([
    {
      id: 'composio_gmail',
      name: 'Gmail & Google Workspace',
      category: 'Communication',
      description: 'Автоматическая отправка коммерческих предложений, подтверждений визитов и счетов.',
      icon: '✉️',
      connected: true,
      mcpProtocol: 'Composio Connect MCP v2',
      approvalRequired: true,
      usageCount: '1,420 отправлено'
    },
    {
      id: 'composio_slack',
      name: 'Slack Team Hub',
      category: 'Communication',
      description: 'Мгновенные уведомления о новых VIP-лидах и отчетах P&L прямо в каналы команды.',
      icon: '💬',
      connected: true,
      mcpProtocol: 'Composio Connect MCP v2',
      approvalRequired: false,
      usageCount: '380 алертов'
    },
    {
      id: 'composio_linear',
      name: 'Linear & Issue Tracker',
      category: 'Developer & Tasks',
      description: 'Автоматическое создание задач для мастеров и разработчиков при багах или отменах.',
      icon: '📐',
      connected: true,
      mcpProtocol: 'Composio Connect MCP v2',
      approvalRequired: false,
      usageCount: '94 задачи'
    },
    {
      id: 'composio_notion',
      name: 'Notion Knowledge Base',
      category: 'CRM & Productivity',
      description: 'Синхронизация стандартов обслуживания, скриптов продаж и клиентских заметок.',
      icon: '📝',
      connected: false,
      mcpProtocol: 'Composio Connect MCP v2',
      approvalRequired: false,
      usageCount: 'Готов к подключению'
    },
    {
      id: 'composio_github',
      name: 'GitHub Repository',
      category: 'Developer & Tasks',
      description: 'ИИ-исправление ошибок кода и автоматическое создание Pull Request.',
      icon: '🐙',
      connected: true,
      mcpProtocol: 'Composio Connect MCP v2',
      approvalRequired: true,
      usageCount: '12 PR создано'
    },
    {
      id: 'composio_stripe',
      name: 'Stripe Payments',
      category: 'Payments & Finance',
      description: 'Генерация ссылок на оплату и автоматическое проведение авансов.',
      icon: '💳',
      connected: true,
      mcpProtocol: 'Composio Connect MCP v2',
      approvalRequired: true,
      usageCount: '$18,420 получено'
    }
  ]);

  // AWS Sales Roleplay State
  const [selectedPersona, setSelectedPersona] = useState<'skeptical_cfo' | 'demanding_client' | 'busy_owner'>('skeptical_cfo');
  const [roleplayActive, setRoleplayActive] = useState(false);
  const [userSpeechInput, setUserSpeechInput] = useState('');
  const [roleplayHistory, setRoleplayResponseHistory] = useState([
    {
      sender: 'buyer',
      text: 'Здравствуйте. Наш текущий софт стоит $20/мес. Почему мы должны платить за Hermes Connect $99/мес? В чем реальный ROI?',
      time: '14:20'
    }
  ]);
  const [score, setScore] = useState<number | null>(null);

  const toggleConnect = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, connected: !a.connected } : a));
  };

  const handleRoleplaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSpeechInput.trim()) return;

    const newHistory = [
      ...roleplayHistory,
      { sender: 'user', text: userSpeechInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ];

    setRoleplayResponseHistory(newHistory);
    setUserSpeechInput('');

    // Simulate AI Buyer Persona Response & Real-time Sales Scoring
    setTimeout(() => {
      let buyerReply = '';
      if (selectedPersona === 'skeptical_cfo') {
        buyerReply = 'Интересно. То есть вы утверждаете, что ИИ-Рецепционист окупает себя уже с первых 2 забронированных клиентов? Покажите расчет LTV.';
      } else if (selectedPersona === 'demanding_client') {
        buyerReply = 'Мне нужны гарантии, что ИИ не запишет двух человек на один и тот же слот в субботу. Как работает проверка накладок?';
      } else {
        buyerReply = 'У меня 10 минут перед встречей. Быстро скажите, за сколько минут вы можете перенести всю нашу базу из Altegio?';
      }

      setRoleplayResponseHistory(prev => [
        ...prev,
        { sender: 'buyer', text: buyerReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);

      setScore(88); // AWS AI Sales Score
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950/70 border-indigo-500/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
              <Puzzle className="w-3.5 h-3.5 text-indigo-400" />
              <span>COMPOSIO MCP & AWS SALES ROLEPLAY ENGINE</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white font-heading">
              Маркетплейс Интеграций & ИИ-Симулятор Продаж
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Подключайте 1000+ внешних сервисов через Composio MCP и тренируйте отдел продаж на ИИ-симуляторе AWS Sales Roleplay.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'marketplace'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                  : 'bg-slate-900/80 text-slate-300 border border-white/10 hover:bg-white/5'
              }`}
            >
              Интеграции Composio (1000+)
            </button>
            <button
              onClick={() => setActiveTab('sales_roleplay')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'sales_roleplay'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow'
                  : 'bg-slate-900/80 text-slate-300 border border-white/10 hover:bg-white/5'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>AWS ИИ-Тренер Продаж</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: COMPOSIO MCP INTEGRATION MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Подключенные Интеграции Composio MCP</span>
            </h2>
            <span className="badge badge-emerald">5 ИЗ 6 АКТИВНЫ</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map(app => (
              <div 
                key={app.id} 
                className={`p-4 rounded-xl border transition-all ${
                  app.connected 
                    ? 'bg-slate-900/90 border-indigo-500/40 shadow-md' 
                    : 'bg-slate-900/50 border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-slate-800 border border-white/10">{app.icon}</span>
                    <div>
                      <h3 className="text-xs font-bold text-white">{app.name}</h3>
                      <p className="text-[10px] text-indigo-300 font-medium">{app.category}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleConnect(app.id)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border transition-all ${
                      app.connected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                        : 'bg-indigo-600 text-white border-indigo-400/40 hover:bg-indigo-500'
                    }`}
                  >
                    {app.connected ? 'Подключено' : 'Подключить'}
                  </button>
                </div>

                <p className="text-xs text-slate-300 mb-3">{app.description}</p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-400" /> {app.mcpProtocol}
                  </span>
                  <span className="text-emerald-400 font-semibold">{app.usageCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AWS AI SALES ROLEPLAY SIMULATOR */}
      {activeTab === 'sales_roleplay' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Persona Selection & Scoring Panel */}
          <div className="lg:col-span-4 glass-panel p-5 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>AWS AI Sales Roleplay Engine</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Симулятор переговоров на базе модуля `aws-samples/sample-ai-sales-roleplay`.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-300 mb-2">Выберите Персону Покупателя:</p>
              <div className="space-y-2">
                {[
                  { id: 'skeptical_cfo', label: 'Скептичный CFO', desc: 'Требует строгий расчет ROI и гарантии сохранения бюджета.' },
                  { id: 'demanding_client', label: 'Требовательный Владелец', desc: 'Задает жесткие вопросы по заполнению слотов и заменам.' },
                  { id: 'busy_owner', label: 'Занятой Предприниматель', desc: 'Хочет решение за 3 минуты без лишней воды.' }
                ].map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id as any)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPersona === p.id
                        ? 'bg-amber-500/10 border-amber-500/50 shadow'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{p.label}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Sales Skill Score Card */}
            {score !== null && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-300">Оценка Продаж (AWS AI):</span>
                  <span className="text-xl font-black text-white">{score} / 100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-400 to-rose-500 h-full" style={{ width: `${score}%` }} />
                </div>
                <p className="text-[10px] text-slate-200">
                  <strong className="text-emerald-400">Сильная сторона:</strong> Отличная аргументация окупаемости (ROI).
                </p>
              </div>
            )}
          </div>

          {/* Interactive Roleplay Chat Sandbox */}
          <div className="lg:col-span-8 glass-panel p-5 flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <h3 className="text-xs font-bold text-white">
                    Симуляция Переговоров с Покупателем ({selectedPersona === 'skeptical_cfo' ? 'Скептичный CFO' : 'Владелец'})
                  </h3>
                </div>
                <span className="badge badge-amber text-[10px]">ГОЛОСОВОЙ И ТЕКСТОВЫЙ ТРЕНАЖЕР</span>
              </div>

              {/* Chat Log */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {roleplayHistory.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/10'
                    }`}>
                      <p>{m.text}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleRoleplaySubmit} className="flex items-center gap-2 pt-3 border-t border-white/10 mt-3">
              <input
                type="text"
                value={userSpeechInput}
                onChange={(e) => setUserSpeechInput(e.target.value)}
                placeholder="Введите ваш ответ покупателю (отработка возражения)..."
                className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button type="submit" className="btn-primary text-xs py-2 px-4 bg-gradient-to-r from-amber-500 to-rose-600">
                Ответить Покупателю
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
