import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, CheckCircle2, ChevronRight, X, Cpu, Zap, Activity, ShieldCheck } from 'lucide-react';
import { AIMessage, VerticalCategory } from '../types';

interface AIBrainWidgetProps {
  messages: AIMessage[];
  onSendMessage: (text: string) => void;
  onNavigateVertical: (v: VerticalCategory) => void;
}

export const AIBrainWidget: React.FC<AIBrainWidgetProps> = ({
  messages,
  onSendMessage,
  onNavigateVertical
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'orchestrator'>('chat');
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const orchestratedTasks = [
    {
      id: '1',
      title: 'Автоматическая запись & Рецепция',
      summary: '42 входящих диалога → 8 новых броней в системе',
      agentTag: 'Reception Sub-Module',
      time: '10:42 AM'
    },
    {
      id: '2',
      title: 'Квалификация & Лидогенерация',
      summary: '15 новых обращений из Instagram/WhatsApp → 3 сделки ($1,240 USD)',
      agentTag: 'Sales Sub-Module',
      time: '10:35 AM'
    },
    {
      id: '3',
      title: 'Финансовый расчет & Зарплата',
      summary: 'Налоговая оптимизация 4.2% + ведомости мастеров',
      agentTag: 'Finance Sub-Module',
      time: '10:15 AM'
    },
    {
      id: '4',
      title: 'Логистические ставки (DAT & Truckstop)',
      summary: '12 встречных торга на фрахт Chicago → Dallas ($3,200 USD)',
      agentTag: 'Logistics Sub-Module',
      time: '09:50 AM'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary rounded-full px-4 py-3 shadow-2xl hover:scale-105 transition-all group flex items-center gap-3 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 border border-white/20"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
          </div>
          <span className="font-bold text-xs">Hermes Intelligence</span>
        </button>
      ) : (
        <div className="glass-panel w-[360px] sm:w-[420px] h-[540px] flex flex-col shadow-2xl border border-indigo-500/40 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header — Unified Single Point of Intelligence */}
          <div className="p-3.5 bg-slate-950/95 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4.5 h-4.5 text-indigo-400" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-xs text-white font-heading tracking-tight flex items-center gap-1.5">
                  Hermes Intelligence
                  <span className="badge badge-primary text-[8px] py-0 px-1.5">ONE OS</span>
                </h4>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Единый центр управления
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-Header Tabs */}
          <div className="flex items-center justify-between bg-slate-950/80 px-3 py-1.5 border-b border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1 text-center font-medium rounded-md transition-all ${
                activeTab === 'chat' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Диалог с Hermes
            </button>
            <button
              onClick={() => setActiveTab('orchestrator')}
              className={`flex-1 py-1 text-center font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'orchestrator' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> Фоновые задачи (4)
            </button>
          </div>

          {activeTab === 'chat' ? (
            <>
              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-950/40">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                          : 'bg-slate-900/90 text-slate-100 border border-white/10 rounded-bl-none shadow-md'
                      }`}
                    >
                      <p>{msg.content}</p>

                      {/* Evidence Badge */}
                      {msg.evidenceBadge && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Подтверждено: {msg.evidenceBadge}
                        </div>
                      )}

                      {/* Action Route Prompt */}
                      {msg.routedVertical && (
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[10px] text-indigo-300 font-medium">Маршрут: {msg.routedVertical.toUpperCase()}</span>
                          <button
                            onClick={() => {
                              onNavigateVertical(msg.routedVertical!);
                              setIsOpen(false);
                            }}
                            className="text-[11px] font-semibold text-cyan-300 hover:underline inline-flex items-center gap-1"
                          >
                            Перейти <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Action Prompt Shortcuts */}
              <div className="p-2 bg-slate-900/90 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
                <button
                  onClick={() => onSendMessage('Записать клиента на завтра')}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/5 text-[10px]"
                >
                  📅 Запись клиента
                </button>
                <button
                  onClick={() => onSendMessage('Заказать запчасти по VIN')}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/5 text-[10px]"
                >
                  🚗 Запчасти VIN
                </button>
                <button
                  onClick={() => onSendMessage('Найти фрахт Dry Van из Чикаго')}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/5 text-[10px]"
                >
                  🚛 Load Board
                </button>
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSubmit} className="p-2.5 bg-slate-900 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Отдать распоряжение Hermes..."
                  className="flex-1 bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            /* Background Orchestration Summary */
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/80 text-xs">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-purple-300 font-mono font-semibold uppercase">Единый Интеллект Hermes</span>
                  <h5 className="font-bold text-white text-sm">Автоматическое распределение задач</h5>
                </div>
                <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Вы общаетесь с единым интеллектом Hermes. Внутренние модули автоматически обрабатывают задачи без необходимости настройки вручную:
              </p>

              <div className="space-y-2.5">
                {orchestratedTasks.map(task => (
                  <div key={task.id} className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{task.title}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{task.time}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{task.summary}</p>
                    <div className="flex items-center justify-between pt-1 text-[9px]">
                      <span className="text-indigo-400 font-mono font-medium">{task.agentTag}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Автономно выполнено
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
