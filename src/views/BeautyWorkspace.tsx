import React, { useState } from 'react';
import { 
  Scissors, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { Service, Appointment, UserRole } from '../types';
import { BeautyBentoDashboard } from '../components/BeautyBentoDashboard';

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
      staffName: 'Елена Ростова',
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

  const totalRevenue = appointments.reduce((sum, a) => sum + (a.status === 'confirmed' || a.status === 'completed' ? (a.priceUSD || a.price || 0) : 0), 0);
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;

  return (
    <div className="space-y-8">
      {/* 8-in-1 Bento Studio Dashboard */}
      <BeautyBentoDashboard />

      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 border border-indigo-500/30 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Подтверждено записей</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-heading">{confirmedCount}</div>
          <span className="text-[11px] text-emerald-400 font-medium">↑ 100% за сегодня</span>
        </div>

        <div className="glass-card p-4 border border-emerald-500/30 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Выручка (записи)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-heading">${totalRevenue} USD</div>
          <span className="text-[11px] text-slate-400">Из {appointments.length} активных клиентов</span>
        </div>

        <div className="glass-card p-4 border border-purple-500/30 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Услуг в каталоге</span>
            <Scissors className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-heading">{services.length}</div>
          <span className="text-[11px] text-indigo-300">Aura Luxe Premier Line</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Booking Widget / Service List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white font-heading flex items-center gap-2">
                <Scissors className="w-4 h-4 text-indigo-400" /> Меню услуг и онлайн-запись
              </h3>
              <span className="badge badge-primary text-[10px]">Живое бронирование</span>
            </div>

            <div className="space-y-3">
              {services.map(srv => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedService(srv)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    selectedService?.id === srv.id
                      ? 'bg-indigo-950/70 border-indigo-500 shadow-lg ring-1 ring-indigo-500/40'
                      : 'bg-slate-900/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-white">{srv.name}</h4>
                      <span className="badge badge-cyan text-[10px]">{srv.category}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">{srv.description}</p>
                    <div className="flex items-center gap-4 text-xs font-semibold pt-1">
                      <span className="flex items-center gap-1 text-indigo-300">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> {srv.durationMinutes} мин
                      </span>
                      <span className="text-emerald-400">${srv.priceUSD} USD</span>
                    </div>
                  </div>

                  <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                    {selectedService?.id === srv.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Booking Form */}
            <form onSubmit={handleBooking} className="mt-6 pt-5 border-t border-white/10 space-y-4">
              <h4 className="font-bold text-sm text-white font-heading">Забронировать выбранную услугу</h4>
              
              {bookingSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Запись успешно оформлена! Запись добавлена в журнал мастера.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium mb-1 block">Ваше имя</label>
                  <input
                    type="text"
                    required
                    placeholder="Например, София"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium mb-1 block">Instagram / Telegram</label>
                  <input
                    type="text"
                    placeholder="@your_handle"
                    value={clientHandle}
                    onChange={(e) => setClientHandle(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium mb-1 block">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="client@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium mb-1 block">Удобное время</label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="04:30 PM - 05:30 PM">04:30 PM - 05:30 PM</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs">
                <Sparkles className="w-4 h-4" /> 
                <span>Подтвердить запись — ${selectedService?.priceUSD || 0} USD</span>
              </button>
            </form>
          </div>
        </div>

        {/* Appointments Feed & Specialist Dashboard */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white font-heading">Журнал записей мастера</h3>
              <span className="badge badge-primary text-[10px]">{appointments.length} записей</span>
            </div>

            <div className="space-y-3">
              {appointments.map(apt => (
                <div key={apt.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{apt.clientName}</span>
                    <span className={`badge ${
                      apt.status === 'confirmed' ? 'badge-emerald' : 
                      apt.status === 'pending' ? 'badge-amber' : 'badge-rose'
                    }`}>
                      {apt.status === 'confirmed' ? 'подтвержденный' : apt.status === 'pending' ? 'в ожидании' : 'отменен'}
                    </span>
                  </div>

                  <p className="text-xs text-indigo-300 font-medium">{apt.serviceName}</p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{apt.timeSlot}</span>
                    <span className="font-bold text-emerald-400">${apt.priceUSD} USD</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-slate-400">
                    <span>Контакт: {apt.clientHandle}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'confirmed')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors text-[10px] font-semibold"
                      >
                        Принять
                      </button>
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'cancelled')}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 transition-colors text-[10px] font-semibold"
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
