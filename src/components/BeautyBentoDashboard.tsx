import React, { useState } from 'react';
import { Calendar, ShieldAlert, Sparkles, DollarSign, Package, Users, Clock, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';
import { Appointment, ServiceItem } from '../types';

export const BeautyBentoDashboard: React.FC = () => {
  // RBAC State
  const [userRole, setUserRole] = useState<'admin' | 'senior_stylist' | 'junior_stylist'>('admin');
  
  // Interactive Appointment State
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', clientName: 'Екатерина Смирнова', clientPhone: '+1 (555) 234-5678', serviceName: 'Стрижка & Окрашивание Balayage', staffName: 'Анна Сергеева', date: '2026-08-13', time: '10:00', timeSlot: '10:00', status: 'confirmed', priceUSD: 180 },
    { id: '2', clientName: 'Ольга Кузнецова', clientPhone: '+1 (555) 876-5432', serviceName: 'Маникюр с гелевым покрытием', staffName: 'Мария Пак', date: '2026-08-13', time: '11:30', timeSlot: '11:30', status: 'pending', priceUSD: 75 },
    { id: '3', clientName: 'Алена Попова', clientPhone: '+1 (555) 345-6789', serviceName: 'Уход за кожей лица HydraFacial', staffName: 'Елена Воронина', date: '2026-08-13', time: '14:00', timeSlot: '14:00', status: 'confirmed', priceUSD: 140 },
  ]);

  // Inventory Ledger State
  const [inventory, setInventory] = useState([
    { id: '1', name: 'Краска L\'Oreal Majirel 5.0', stock: 3, minLimit: 5, alert: true },
    { id: '2', name: 'Шампунь Kerastase Nutritive 1L', stock: 12, minLimit: 4, alert: false },
    { id: '3', name: 'Осветляющая пудра Blond Studio', stock: 2, minLimit: 4, alert: true },
  ]);

  // POS & Tip Calculator State
  const [checkAmount, setCheckAmount] = useState<number>(180);
  const [selectedTipPercent, setSelectedTipPercent] = useState<number>(15);

  // AI Re-booking Predictor State
  const [aiOfferSent, setAiOfferSent] = useState<boolean>(false);

  // Financial Calculations
  const totalShiftRevenue = appointments.reduce((sum, a) => sum + (a.status === 'confirmed' || a.status === 'completed' ? (a.priceUSD || 0) : 0), 0);
  const calculatedTipUSD = Number(((checkAmount * selectedTipPercent) / 100).toFixed(2));
  const masterCommissionUSD = Number((totalShiftRevenue * 0.35).toFixed(2));

  const handleStatusChange = (id: string, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="space-y-6">
      {/* Header & RBAC Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5">
        <div>
          <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Beauty & Wellness Bento Studio Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Управляйте бронированиями, защитой от неявок, POS-кассой, складом и комиссиями в одном окне
          </p>
        </div>

        {/* RBAC Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-white/10">
          <span className="text-xs text-slate-400 px-2 font-medium">Роль:</span>
          {(['admin', 'senior_stylist', 'junior_stylist'] as const).map(role => (
            <button
              key={role}
              onClick={() => setUserRole(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                userRole === role
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {role === 'admin' ? 'Администратор' : role === 'senior_stylist' ? 'Топ-Мастер' : 'Стажер'}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid Layout (8 Core Business Functions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        
        {/* Card 1 & 2: Interactive Booking Grid & 24/7 Schedule (lg:col-span-8) */}
        <div className="lg:col-span-8 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm font-heading">
                Сетка бронирований & Календарь за смену
              </h3>
            </div>
            <span className="badge badge-amber text-[10px]">24/7 Sync Active</span>
          </div>

          <div className="space-y-3">
            {appointments.map(app => (
              <div
                key={app.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-white/20 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{app.clientName}</span>
                    <span className="text-xs text-slate-400">({app.clientPhone})</span>
                  </div>
                  <p className="text-xs text-amber-300 font-medium">{app.serviceName} • {app.staffName}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {app.time} (${app.priceUSD} USD)
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value as Appointment['status'])}
                    className="bg-slate-950 text-xs text-white border border-white/20 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                  >
                    <option value="pending">Ожидает</option>
                    <option value="confirmed">Подтвержден</option>
                    <option value="completed">Завершен</option>
                    <option value="cancelled">Отменен</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: No-Show Protection & Stripe Deposits (lg:col-span-4) */}
        <div className="lg:col-span-4 glass-card p-5 border border-emerald-500/30 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-400" /> Защита от неявок (Stripe)
              </span>
              <span className="badge badge-emerald text-[10px]">-68% No-Shows</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-heading">$54.00 USD</p>
            <p className="text-xs text-slate-300 mt-1">
              Удержание штрафа 30% за позднюю отмену визита клиента
            </p>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-white/10 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span>Авто-депозит (Stripe):</span>
              <span className="font-semibold text-white">Включен ($25)</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>SMS-напоминания:</span>
              <span className="font-semibold text-emerald-400">WhatsApp Live</span>
            </div>
          </div>
        </div>

        {/* Card 4: AI Re-booking Predictor (lg:col-span-6) */}
        <div className="lg:col-span-6 glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> ИИ-Прогнозист повторных визитов
            </h3>
            <span className="text-xs text-indigo-300 font-medium">Smart Re-booking</span>
          </div>

          <p className="text-xs text-slate-300">
            Клиент <strong>Ольга Кузнецова</strong> делала окрашивание 24 дня назад. Истекает идеальный цикл (28 дней).
          </p>

          <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/30 flex items-center justify-between gap-3">
            <div className="text-xs text-indigo-200">
              «Ольга, здравствуйте! Прошло 3 недели с окрашивания. Забронировать ваш мастер Анна на субботу со скидкой 10%?»
            </div>
            <button
              onClick={() => setAiOfferSent(true)}
              disabled={aiOfferSent}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                aiOfferSent
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-indigo-500 hover:bg-indigo-400 text-white'
              }`}
            >
              {aiOfferSent ? 'Отправлено ✓' : 'Отправить в WhatsApp'}
            </button>
          </div>
        </div>

        {/* Card 5: POS & Tip Distribution Calculator (lg:col-span-6) */}
        <div className="lg:col-span-6 glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" /> POS-Касса & Расчет чаевых
            </h3>
            <span className="text-xs text-amber-400 font-medium">Instant Split</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Сумма чека ($ USD):</label>
              <input
                type="number"
                value={checkAmount}
                onChange={(e) => setCheckAmount(Number(e.target.value))}
                className="w-full bg-slate-950 text-white text-sm border border-white/20 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Чаевые мастеру:</label>
              <div className="flex gap-1">
                {[10, 15, 20].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setSelectedTipPercent(pct)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedTipPercent === pct
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-white/10 flex justify-between items-center text-xs">
            <span className="text-slate-400">Чаевые на баланс мастера:</span>
            <span className="text-amber-400 font-bold text-sm">${calculatedTipUSD} USD</span>
          </div>
        </div>

        {/* Card 6: Automatic Inventory Ledger with Restock Alerts (lg:col-span-6) */}
        <div className="lg:col-span-6 glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" /> Автоматический склад расходников
            </h3>
            <span className="badge badge-cyan text-[10px]">Restock Sentinel</span>
          </div>

          <div className="space-y-2">
            {inventory.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 text-xs">
                <span className="text-slate-300 font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${item.alert ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {item.stock} шт. (лимит {item.minLimit})
                  </span>
                  {item.alert && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Restock
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 7 & 8: Payroll, Commissions & Confidential Financial Block (RBAC Protected) (lg:col-span-6) */}
        <div className="lg:col-span-6 glass-panel p-5 space-y-3 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" /> Финансы & Комиссии (RBAC)
            </h3>
            <span className={`badge ${userRole === 'admin' ? 'badge-amber' : 'badge-slate'} text-[10px]`}>
              {userRole === 'admin' ? 'Полный доступ' : 'Ограниченный доступ'}
            </span>
          </div>

          {userRole === 'admin' ? (
            <div className="space-y-2">
              <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-500/20 space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Выручка за смену:</span>
                  <span className="font-bold text-white">${totalShiftRevenue} USD</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Комиссия мастеров (35%):</span>
                  <span className="font-bold text-purple-300">${masterCommissionUSD} USD</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Чистая прибыль салона:</span>
                  <span className="font-bold text-emerald-400">${(totalShiftRevenue - masterCommissionUSD).toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-950/80 rounded-xl border border-white/10 text-center space-y-2">
              <ShieldAlert className="w-6 h-6 text-amber-400 mx-auto" />
              <p className="text-xs text-slate-300">
                Конфиденциальные финансовые отчеты и оклады скрыты для роли <strong>{userRole === 'senior_stylist' ? 'Топ-Мастер' : 'Стажер'}</strong>.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
