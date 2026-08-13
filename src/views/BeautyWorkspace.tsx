import React, { useState } from 'react';
import { 
  Scissors, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { Service, Appointment, UserRole } from '../types';

interface BeautyWorkspaceProps {
  services: Service[];
  appointments: Appointment[];
  activeRole: UserRole;
  onAddAppointment: (apt: Omit<Appointment, 'id'>) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
}

export const BeautyWorkspace: React.FC<BeautyWorkspaceProps> = ({
  services,
  appointments,
  activeRole,
  onAddAppointment,
  onUpdateStatus
}) => {
  const [selectedService, setSelectedService] = useState<Service>(services[0] || null);
  const [clientName, setClientName] = useState('');
  const [clientHandle, setClientHandle] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('11:00 AM - 12:00 PM');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !selectedService) return;

    onAddAppointment({
      clientName,
      clientHandle: clientHandle || '@client',
      clientEmail,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      staffName: 'Elena Rostova',
      date: new Date().toISOString().split('T')[0],
      timeSlot: selectedTimeSlot,
      status: 'confirmed',
      priceUSD: selectedService.priceUSD
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setClientName('');
      setClientHandle('');
      setClientEmail('');
    }, 3000);
  };

  const totalRevenue = appointments.reduce((sum, a) => sum + (a.status === 'confirmed' || a.status === 'completed' ? a.priceUSD : 0), 0);
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 border border-indigo-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Подтверждено записей</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-heading">{confirmedCount}</div>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-block">↑ 100% за сегодня</span>
        </div>

        <div className="glass-card p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Выручка (записи)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-heading">${totalRevenue}</div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Из 3 активных клиентов</span>
        </div>

        <div className="glass-card p-4 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Услуг в каталоге</span>
            <Scissors className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-heading">{services.length}</div>
          <span className="text-[11px] text-indigo-300 mt-1 inline-block">Aura Luxe Premier Line</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Booking Widget / Service List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-white font-heading flex items-center gap-2">
                <Scissors className="w-5 h-5 text-indigo-400" /> Меню услуг и онлайн-запись
              </h3>
              <span className="badge badge-primary">Живое бронирование</span>
            </div>

            <div className="space-y-3">
              {services.map(srv => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedService(srv)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedService?.id === srv.id
                      ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                      : 'bg-slate-900/40 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{srv.name}</h4>
                      <span className="badge badge-cyan text-[10px]">{srv.category}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{srv.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" /> {srv.durationMinutes} мин</span>
                      <span className="font-bold text-emerald-400">${srv.priceUSD}</span>
                    </div>
                  </div>

                  <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">
                    {selectedService?.id === srv.id && <div className="w-3 h-3 rounded-full bg-indigo-500" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Booking Form */}
            <form onSubmit={handleBooking} className="mt-6 pt-5 border-t border-white/10 space-y-4">
              <h4 className="font-semibold text-sm text-white font-heading">Записаться на выбранную услугу</h4>
              
              {bookingSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Запись успешно оформлена! Добавлена в журнал мастера.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Ваше Имя"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Никнейм Instagram / Telegram"
                  value={clientHandle}
                  onChange={(e) => setClientHandle(e.target.value)}
                  className="bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  required
                  placeholder="Ваш Email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  <option value="04:30 PM - 05:30 PM">04:30 PM - 05:30 PM</option>
                </select>
              </div>

              <button type="submit" className="btn-primary w-full justify-center">
                <Sparkles className="w-4 h-4" /> Записаться на {selectedService?.name || 'услугу'} (${selectedService?.priceUSD})
              </button>
            </form>
          </div>
        </div>

        {/* Appointments Feed & Specialist Dashboard */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-5">
            <h3 className="font-bold text-base text-white font-heading mb-4 flex items-center justify-between">
              <span>Журнал записей мастера</span>
              <span className="text-xs font-normal text-slate-400">{appointments.length} записей</span>
            </h3>

            <div className="space-y-3">
              {appointments.map(apt => (
                <div key={apt.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{apt.clientName}</span>
                    <span className={`badge ${
                      apt.status === 'confirmed' ? 'badge-emerald' : 
                      apt.status === 'pending' ? 'badge-amber' : 'badge-rose'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <p className="text-xs text-indigo-300 font-medium">{apt.serviceName}</p>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{apt.timeSlot}</span>
                    <span className="font-bold text-white">${apt.priceUSD}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-400">
                    <span>Контакт: {apt.clientHandle}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'confirmed')}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                      >
                        Принять
                      </button>
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'cancelled')}
                        className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
