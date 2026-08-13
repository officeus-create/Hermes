import React, { useState } from 'react';
import { 
  Wrench, 
  Car, 
  DollarSign, 
  CheckCircle2
} from 'lucide-react';
import { VehicleJob, UserRole } from '../types';

interface AutoRepairWorkspaceProps {
  vehicleJobs: VehicleJob[];
  activeRole: UserRole;
  onAddJob: (job: Omit<VehicleJob, 'id'>) => void;
  onUpdateJobStatus: (id: string, status: VehicleJob['status']) => void;
}

export const AutoRepairWorkspace: React.FC<AutoRepairWorkspaceProps> = ({
  vehicleJobs,
  activeRole,
  onAddJob,
  onUpdateJobStatus
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [year, setYear] = useState(2023);
  const [issue, setIssue] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(350);
  const [success, setBookingSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !makeModel) return;

    onAddJob({
      clientName,
      clientPhone: clientPhone || '+1 (555) 019-9922',
      vehicleMakeModel: `${year} ${makeModel}`,
      year,
      issueDescription: issue || 'Запрос плановой диагностики и проверки узлов.',
      estimatedCostUSD: estimatedCost,
      status: 'intake',
      scheduledDate: new Date().toISOString().split('T')[0],
      assignedTechnician: 'Marcus Vance'
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setClientName('');
      setMakeModel('');
      setIssue('');
    }, 3000);
  };

  const statusLabelMap: Record<VehicleJob['status'], string> = {
    intake: 'прием',
    diagnosing: 'диагностика',
    diagnostics: 'диагностика',
    parts_ordered: 'заказ запчастей',
    repair: 'в ремонте',
    ready: 'готово',
    in_progress: 'в работе',
    ready_for_pickup: 'готово к выдаче',
    completed: 'завершен'
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 border border-cyan-500/30 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Авто на сервисе</span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-heading">{vehicleJobs.length}</div>
          <span className="text-[11px] text-cyan-400 font-medium">Apex Service Bay #1 & #2</span>
        </div>

        <div className="glass-card p-4 border border-amber-500/30 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">В процессе ремонта</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-heading">
            {vehicleJobs.filter(j => j.status === 'in_progress' || j.status === 'diagnosing').length}
          </div>
          <span className="text-[11px] text-amber-300">Диагностика & сметы</span>
        </div>

        <div className="glass-card p-4 border border-emerald-500/30 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Общий объем заказов</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-heading">
            ${vehicleJobs.reduce((sum, j) => sum + (j.estimatedCostUSD || j.estimatedCost || 0), 0)} USD
          </div>
          <span className="text-[11px] text-slate-400">Предварительный чек</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Intake & Quote Calculator */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-5">
            <h3 className="font-bold text-base text-white font-heading mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-cyan-400" /> Прием авто на сервис & Запись на диагностику
            </h3>

            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Автомобиль успешно добавлен в очередь сервиса!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">Имя владельца</label>
                  <input
                    type="text"
                    required
                    placeholder="Роберт Стерлинг"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">Телефон клиента</label>
                  <input
                    type="text"
                    placeholder="+1 (847) 555-0199"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">Марка & Модель авто</label>
                  <input
                    type="text"
                    required
                    placeholder="Audi Q7 / BMW X5"
                    value={makeModel}
                    onChange={(e) => setMakeModel(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">Год выпуска</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Симптомы / Описание неисправности</label>
                <textarea
                  rows={2}
                  placeholder="Горит Check Engine, шум при торможении, плановое ТО..."
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Предварительная смета ($ USD)</label>
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs bg-gradient-to-r from-cyan-600 to-indigo-600">
                <Car className="w-4 h-4" /> 
                <span>Принять авто на сервис — ${estimatedCost} USD</span>
              </button>
            </form>
          </div>
        </div>

        {/* Live Service Bay Queue */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white font-heading">Очередь автосервиса</h3>
              <span className="badge badge-primary text-[10px]">{vehicleJobs.length} авто</span>
            </div>

            <div className="space-y-3">
              {vehicleJobs.map(job => (
                <div key={job.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-cyan-400" />
                      {job.vehicleMakeModel}
                    </span>
                    <span className={`badge ${
                      job.status === 'in_progress' ? 'badge-amber' :
                      job.status === 'ready_for_pickup' ? 'badge-emerald' : 'badge-cyan'
                    }`}>
                      {statusLabelMap[job.status] || job.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">Владелец: {job.clientName} ({job.clientPhone})</p>
                  <p className="text-[11px] text-slate-400 italic">«{job.issueDescription}»</p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                    <span className="text-slate-400">Мастер: {job.assignedTechnician}</span>
                    <span className="font-bold text-emerald-400">${job.estimatedCostUSD} USD</span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2">
                    <button
                      onClick={() => onUpdateJobStatus(job.id, 'in_progress')}
                      className="px-2.5 py-1 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold hover:bg-amber-600/30"
                    >
                      В работу
                    </button>
                    <button
                      onClick={() => onUpdateJobStatus(job.id, 'ready_for_pickup')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold hover:bg-emerald-600/30"
                    >
                      Готово к выдаче
                    </button>
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
