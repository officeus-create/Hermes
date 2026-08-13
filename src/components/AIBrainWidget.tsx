import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, CheckCircle2, ChevronRight, X } from 'lucide-react';
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
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary rounded-full px-4 py-3 shadow-2xl hover:scale-105 transition-all group flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 border border-white/20"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
          </div>
          <span className="font-bold text-xs">ИИ-Ассистент Hermes</span>
        </button>
      ) : (
        <div className="glass-panel w-[360px] sm:w-[400px] h-[520px] flex flex-col shadow-2xl border border-indigo-500/30 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white font-heading">ИИ-Ассистент Hermes</h4>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Маршрутизация намерения
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
                      : 'bg-slate-800/80 text-slate-200 border border-white/10 rounded-bl-none shadow-md'
                  }`}
                >
                  <p>{msg.content}</p>

                  {/* Evidence Badge */}
                  {msg.evidenceBadge && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Доказательство: {msg.evidenceBadge}
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

                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="p-2 bg-slate-900/80 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => onSendMessage('Хочу записать машину на ТО')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/5 text-[10px]"
            >
              🚗 Запись авто
            </button>
            <button
              onClick={() => onSendMessage('Нужен груз на Dry Van из Чикаго')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/5 text-[10px]"
            >
              🚛 Load Board
            </button>
            <button
              onClick={() => onSendMessage('Сколько белка нужно в день для роста мышц?')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/5 text-[10px]"
            >
              💪 Фитнес
            </button>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSubmit} className="p-2.5 bg-slate-900 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Спросить ИИ-Ассистента..."
              className="flex-1 bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
