import React, { useState } from 'react';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  TrendingUp, 
  Megaphone, 
  DollarSign, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  PhoneCall, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  ChevronRight, 
  Send, 
  Eye, 
  Check, 
  BarChart3, 
  SlidersHorizontal,
  Bot,
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';

export type OSModuleTab = 
  | 'inbox' 
  | 'customers' 
  | 'calendar' 
  | 'sales' 
  | 'marketing' 
  | 'finance' 
  | 'operations';

export const OSCommandCenterView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OSModuleTab>('inbox');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'ai_replied' | 'pending'>('all');
  const [activeChatId, setActiveChatId] = useState<string>('c_1');
  const [chatInput, setChatInput] = useState<string>('');

  // Mock Inbox Conversations
  const [conversations, setConversations] = useState([
    {
      id: 'c_1',
      clientName: 'Елена Смирнова',
      channel: 'Instagram DM',
      lastMessage: 'Хочу записаться на окрашивание и уход в эту субботу!',
      aiReply: 'Отлично! Свободные слоты у мастера Анны: 12:00 и 15:30. Какой вариант вам удобнее?',
      status: 'AI Handled',
      time: '2 мин назад',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      messages: [
        { sender: 'client', text: 'Здравствуйте! Подскажите, есть ли свободна запись в субботу?', time: '14:20' },
        { sender: 'ai', text: 'Здравствуйте, Елена! Я ИИ-ассистент Hermes. Для какого специалиста вы ищете время?', time: '14:20' },
        { sender: 'client', text: 'Хочу записаться на окрашивание и уход в эту субботу!', time: '14:21' },
        { sender: 'ai', text: 'Отлично! Свободные слоты у топ-мастера Анны: 12:00 и 15:30. Какой вариант вам удобнее?', time: '14:21' }
      ]
    },
    {
      id: 'c_2',
      clientName: 'Михаил Ковалев',
      channel: 'WhatsApp Web',
      lastMessage: 'Нужен расчет стоимости диагностики двигателя BMW X5.',
      aiReply: 'Диагностика двигателей X5 занимает 45 минут ($60). Записать вас на завтра 10:00?',
      status: 'Booking Confirmed',
      time: '15 мин назад',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      messages: [
        { sender: 'client', text: 'Нужен расчет стоимости диагностики двигателя BMW X5.', time: '14:05' },
        { sender: 'ai', text: 'Диагностика двигателей X5 занимает 45 минут ($60). Записать вас на завтра 10:00?', time: '14:06' },
        { sender: 'client', text: 'Да, давайте на 10:00 завтра!', time: '14:07' },
        { sender: 'ai', text: 'Запись подтверждена! Ссылка на подтверждение отправлена.', time: '14:07' }
      ]
    },
    {
      id: 'c_3',
      clientName: 'Apex Freight Logistics',
      channel: 'US Load Board',
      lastMessage: 'Подтвердите ставку $3,400 за рейс Chicago -> Dallas.',
      aiReply: 'Ставка $3,400 принята! Договор-заявка сформирован ИИ-Диспетчером.',
      status: 'Contract Signed',
      time: '42 мин назад',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      messages: [
        { sender: 'client', text: 'Подтвердите ставку $3,400 за рейс Chicago -> Dallas.', time: '13:40' },
        { sender: 'ai', text: 'Ставка $3,400 принята! Договор-заявка сформирован ИИ-Диспетчером.', time: '13:41' }
      ]
    }
  ]);

  // Mock Customers Data
  const customers = [
    { name: 'Елена Смирнова', visits: 12, ltv: '$1,840', churnRisk: 'Низкий (4%)', lastVisit: '10 дней назад', status: 'VIP Клиент' },
    { name: 'Михаил Ковалев', visits: 4, ltv: '$620', churnRisk: 'Средний (18%)', lastVisit: 'Вчера', status: 'Активный' },
    { name: 'Ольга Прохорова', visits: 8, ltv: '$1,150', churnRisk: 'Высокий (65%)', lastVisit: '45 дней назад', status: 'Требует внимания' },
    { name: 'Дмитрий Иванов', visits: 1, ltv: '$120', churnRisk: 'Низкий (8%)', lastVisit: '3 дня назад', status: 'Новый' }
  ];

  // Send Message in Active Chat
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setConversations(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [
            ...c.messages,
            { sender: 'ai', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ],
          lastMessage: chatInput
        };
      }
      return c;
    }));
    setChatInput('');
  };

  const currentChat = conversations.find(c => c.id === activeChatId) || conversations[0];

  return (
    <div className="space-y-6">
      {/* Top Banner: Hermes Connect OS Command Center */}
      <div className="glass-panel p-6 bg-gradient-to-r from-[#0B0D12] via-slate-900 to-indigo-950/60 border-indigo-500/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>WEB V1.1 OPERATING SYSTEM COMMAND CENTER</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white font-heading">
              Операционный Центр Hermes Connect
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Единый интерфейс управления продажами, клиентами, расписанием, маркетингом и финансовым потоком.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Автоматизация ОС</p>
              <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 94% процессов без участия человека
              </p>
            </div>
          </div>
        </div>

        {/* Core 7 Modules Navigation Tabs */}
        <div className="mt-6 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-white/10 pt-4">
          {[
            { id: 'inbox', label: 'Inbox & Лиды', icon: <MessageSquare className="w-3.5 h-3.5" />, count: '3 новых' },
            { id: 'customers', label: 'Клиенты & CRM', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'calendar', label: 'Календарь & Слоты', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'sales', label: 'Продажи & Пайплайн', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: 'marketing', label: 'Маркетинг & Отзывы', icon: <Megaphone className="w-3.5 h-3.5" /> },
            { id: 'finance', label: 'Финансы & P&L', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: 'operations', label: 'Agent Swarm (ИИ)', icon: <Bot className="w-3.5 h-3.5" />, badge: '4 Агента' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as OSModuleTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border border-indigo-400/30'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/10 hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MODULE 1: INBOX & COMMUNICATION HUB */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Conversation List */}
          <div className="lg:col-span-5 glass-panel p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Входящие Сообщения</span>
              </h2>
              <span className="badge badge-primary text-[10px]">LIVE STREAM</span>
            </div>

            <div className="space-y-2">
              {conversations.map(c => (
                <div
                  key={c.id}
                  onClick={() => setActiveChatId(c.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    activeChatId === c.id
                      ? 'bg-indigo-950/60 border-indigo-500/50 shadow-md'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img src={c.avatar} alt={c.clientName} className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20" />
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{c.clientName}</p>
                        <p className="text-[10px] text-indigo-300 font-medium">{c.channel}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{c.time}</span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1 mt-2">{c.lastMessage}</p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                      <Sparkles className="w-2.5 h-3" /> {c.status}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Chat Thread */}
          <div className="lg:col-span-7 glass-panel p-4 flex flex-col justify-between min-h-[420px]">
            <div>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <img src={currentChat.avatar} alt={currentChat.clientName} className="w-9 h-8 rounded-full object-cover ring-2 ring-indigo-500/40" />
                  <div>
                    <h3 className="text-xs font-bold text-white">{currentChat.clientName}</h3>
                    <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> ИИ-Рецепционист ответил за 1.2 сек
                    </p>
                  </div>
                </div>

                <span className="badge badge-secondary text-[10px]">{currentChat.channel}</span>
              </div>

              {/* Messages History */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {currentChat.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'client' ? 'items-start' : 'items-end'}`}
                  >
                    <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      m.sender === 'client'
                        ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/10'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none shadow'
                    }`}>
                      <p>{m.text}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-3 border-t border-white/10 mt-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Отправить сообщение от имени ИИ-Ассистента..."
                className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="btn-primary text-xs py-2 px-3">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODULE 2: CUSTOMERS & CRM */}
      {activeTab === 'customers' && (
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-heading">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>База Клиентов & LTV Аналитика</span>
              </h2>
              <p className="text-xs text-slate-300">Автоматический учет посещений, предиктивный анализ оттока и VIP-сегментация</p>
            </div>

            <button className="btn-primary text-xs py-2 px-3">
              <Plus className="w-3.5 h-3.5" /> Добавить Клиента
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Имя Клиента</th>
                  <th className="py-2.5 px-3">Посещений</th>
                  <th className="py-2.5 px-3">LTV (Выручка)</th>
                  <th className="py-2.5 px-3">Риск Оттока (ИИ)</th>
                  <th className="py-2.5 px-3">Последний Визит</th>
                  <th className="py-2.5 px-3">Статус</th>
                  <th className="py-2.5 px-3">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {customers.map((c, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{c.name}</td>
                    <td className="py-3 px-3">{c.visits} визитов</td>
                    <td className="py-3 px-3 font-semibold text-emerald-400">{c.ltv}</td>
                    <td className="py-3 px-3 font-medium">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.churnRisk.includes('Высокий') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        c.churnRisk.includes('Средний') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {c.churnRisk}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{c.lastVisit}</td>
                    <td className="py-3 px-3">
                      <span className="badge badge-secondary text-[10px]">{c.status}</span>
                    </td>
                    <td className="py-3 px-3">
                      <button className="text-indigo-400 hover:text-white font-semibold text-[11px] underline">
                        Записать
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 3: CALENDAR & SCHEDULER */}
      {activeTab === 'calendar' && (
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-heading">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Умный Календарь & Слоты Мастеров</span>
              </h2>
              <p className="text-xs text-slate-300">ИИ автоматически заполняет окна и предотвращает накладки</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge badge-emerald">ОПТИМИЗИРОВАНО ИИ</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {['10:00 AM', '12:00 PM', '02:30 PM', '05:00 PM'].map((time, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-300">{time}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Забронировано</span>
                </div>
                <p className="text-xs font-bold text-white">Елена Смирнова — Окрашивание</p>
                <p className="text-[10px] text-slate-400">Мастер: Анна Ростова</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 4: SALES & PIPELINE */}
      {activeTab === 'sales' && (
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-heading">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Воронка Продаж & Счета</span>
              </h2>
              <p className="text-xs text-slate-300">Автоматическое выставление счетов Stripe и отслеживание конверсии</p>
            </div>
            <span className="badge badge-primary">Конверсия 38%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
              <p className="text-xs text-slate-400 uppercase font-bold">Новые Лиды</p>
              <p className="text-2xl font-black text-white">$4,200</p>
              <p className="text-[11px] text-slate-300">18 обращений за 24 часа</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
              <p className="text-xs text-slate-400 uppercase font-bold">Выставленные счета</p>
              <p className="text-2xl font-black text-amber-300">$8,600</p>
              <p className="text-[11px] text-amber-200/80">Ожидают оплаты (Stripe link)</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
              <p className="text-xs text-slate-400 uppercase font-bold">Полученная Выручка</p>
              <p className="text-2xl font-black text-emerald-400">$18,420</p>
              <p className="text-[11px] text-emerald-300/80">+22% к прошлому месяцу</p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: MARKETING & REVIEWS */}
      {activeTab === 'marketing' && (
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-heading">
                <Megaphone className="w-4 h-4 text-purple-400" />
                <span>Авто-Маркетинг & Отзывы 5★</span>
              </h2>
              <p className="text-xs text-slate-300">ИИ автоматически запрашивает отзывы после визита и публикует посты в соцсети</p>
            </div>
            <span className="badge badge-emerald">4.9 ★ Средний рейтинг</span>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Автоматический сбор отзывов Google / Yelp</p>
              <p className="text-[11px] text-slate-300">Каждому клиенту через 1 час после услуги приходит сообщение с вежливой просьбой оставить отзыв.</p>
            </div>
            <button className="btn-primary text-xs py-2 px-3 shrink-0">
              Настроить шаблон
            </button>
          </div>
        </div>
      )}

      {/* MODULE 6: FINANCE & P&L */}
      {activeTab === 'finance' && (
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-heading">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Финансовый Поток & P&L</span>
              </h2>
              <p className="text-xs text-slate-300">Отслеживание чистой прибыли, маржинальности и ИИ-оптимизация расходов</p>
            </div>
            <span className="badge badge-emerald">Маржа 68%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
              <p className="text-xs text-slate-400 font-bold">Выручка за месяц:</p>
              <p className="text-2xl font-black text-emerald-400">$18,420</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
              <p className="text-xs text-slate-400 font-bold">Операционные расходы:</p>
              <p className="text-2xl font-black text-rose-400">$5,890</p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 7: OPERATIONS & AGENT SWARM */}
      {activeTab === 'operations' && (
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-heading">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Оркестратор ИИ-Агентов Hermes Swarm</span>
              </h2>
              <p className="text-xs text-slate-300">4 автономных субагента, координирующих операции вашего бизнеса</p>
            </div>
            <span className="badge badge-emerald">АКТИВНЫ ВСЕ 4 АГЕНТА</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Receptionist Agent', role: 'Обработка Instagram/WhatsApp лидов', status: 'Активен (1.2с отклик)', handled: '142 диалога сегодня' },
              { name: 'Sales Copilot', role: 'Расчет смет и отправка Stripe счетов', status: 'Активен', handled: '$8,600 счетов создано' },
              { name: 'Smart Dispatcher', role: 'Заполнение свободных слотов календаря', status: 'Активен', handled: '32 записи подтверждено' },
              { name: 'Financial Accountant', role: 'Учет P&L и оптимизация расходов', status: 'Активен', handled: 'Сэкономлено $420/мес' }
            ].map((a, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-white">{a.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    {a.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{a.role}</p>
                <p className="text-[10px] text-indigo-300 font-semibold pt-1 border-t border-white/5">{a.handled}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
