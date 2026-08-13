import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  MessageSquare, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  Target, 
  Volume2, 
  Brain,
  ThumbsUp,
  AlertTriangle
} from 'lucide-react';

export const SalesCoachView: React.FC = () => {
  const [selectedScenario, setSelectedPersona] = useState<'carrier_sales' | 'shipper_outreach' | 'beauty_saas'>('carrier_sales');
  const [trustScore, setTrustScore] = useState(65);
  const [dealProgress, setDealProgress] = useState(40);
  const [userInput, setUserInput] = useState('');
  
  const [transcript, setTranscript] = useState([
    {
      sender: 'buyer',
      speaker: 'Грузоотправитель (Шиппер)',
      text: 'Ваша ставка $3,200 слишком высока. Конкуренты предлагают рейс Chicago -> Dallas за $2,950.',
      time: '14:20',
      trustDelta: '-5%'
    }
  ]);

  const scenarios = [
    { id: 'carrier_sales', title: 'Carrier Sales & Freight', buyer: 'Шиппер (Грузоотправитель)', goal: 'Защитить ставку $3,200 и закрыть договор-заявку' },
    { id: 'shipper_outreach', title: 'Outreach к Founder', buyer: 'Основатель Маркетплейса', goal: 'Договориться о 15-мин аудите конверсии' },
    { id: 'beauty_saas', title: 'Beauty CRM Re-booking', buyer: 'Владелица Сети Салонов', goal: 'Показать окупаемость LTV и подписать контракт' }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newTranscript = [
      ...transcript,
      {
        sender: 'user',
        speaker: 'Вы (Менеджер)',
        text: userInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        trustDelta: '+10%'
      }
    ];

    setTranscript(newTranscript);
    setUserInput('');

    // Update AI Game Telemetry
    setTrustScore(prev => Math.min(100, prev + 8));
    setDealProgress(prev => Math.min(100, prev + 15));

    // Simulate AI Buyer Persona Response
    setTimeout(() => {
      let buyerReply = '';
      if (selectedScenario === 'carrier_sales') {
        buyerReply = 'Понимаю вашу аргументацию по срочности и рефрижераторному режиму. Если гарантируете подачу трака к 8:00 утра, мы готовы подписать за $3,150.';
      } else if (selectedScenario === 'shipper_outreach') {
        buyerReply = 'Звучит логично. Покажите на демо, как ваш ИИ-Рецепционист отвечает клиентам в WhatsApp за 1.2 секунды.';
      } else {
        buyerReply = 'Если ваш ИИ действительно возвращает 25% оттекающих клиентов, давайте запишемся на консультацию во вторник.';
      }

      setTranscript(prev => [
        ...prev,
        {
          sender: 'buyer',
          speaker: 'Покупатель (ИИ-Симулятор)',
          text: buyerReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          trustDelta: '+5%'
        }
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border-amber-500/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>HERMES SALES COACH & AWS ROLEPLAY SIMULATOR</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white font-heading">
              ИИ-Тренажер Переговоров и Отработки Возражений
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Тренируйте продажи с ИИ-покупателем перед выходом к реальным клиентам. Мгновенная оценка Доверия (Trust) и Готовности Сделки (Deal Progress).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase">ИИ-Оценка Переговоров</p>
              <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 88 / 100 (Высокий ROI)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario Selection & Telemetry Gauges */}
        <div className="lg:col-span-4 glass-panel p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Сценарий и Телеметрия Сделки</span>
          </h2>

          <div>
            <p className="text-xs font-bold text-slate-300 mb-2">Выберите Сценарий:</p>
            <div className="space-y-2">
              {scenarios.map(sc => (
                <div
                  key={sc.id}
                  onClick={() => setSelectedPersona(sc.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedScenario === sc.id
                      ? 'bg-amber-500/15 border-amber-500/50 shadow'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-bold text-white">{sc.title}</p>
                  <p className="text-[10px] text-amber-300 mt-0.5">Оппонент: {sc.buyer}</p>
                  <p className="text-[10px] text-slate-300 mt-1">Цель: {sc.goal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Telemetry Progress Bars */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-indigo-400" /> Уровень Доверия (Trust)
                </span>
                <span className="font-black text-indigo-300">{trustScore}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500" style={{ width: `${trustScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Прогресс Сделки (Deal Progress)
                </span>
                <span className="font-black text-emerald-300">{dealProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-emerald-500 h-full transition-all duration-500" style={{ width: `${dealProgress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Live Conversation Stream */}
        <div className="lg:col-span-8 glass-panel p-5 flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <h3 className="text-xs font-bold text-white">
                  Разговор с ИИ-Покупателем (AWS Roleplay)
                </h3>
              </div>
              <span className="badge badge-amber text-[10px]">LIVE SIMULATOR</span>
            </div>

            {/* Chat Transcript */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {transcript.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-slate-400">{m.speaker}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      m.trustDelta.includes('+') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {m.trustDelta}
                    </span>
                  </div>
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

          {/* Speech / Input Bar */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-3 border-t border-white/10 mt-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Введите ваш ответ покупателю (отработка возражения)..."
              className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button type="submit" className="btn-primary text-xs py-2 px-4 bg-gradient-to-r from-amber-500 to-rose-600">
              Сказать Оппоненту
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
