import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Zap,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { FreightLoad, UserRole } from '../types';

interface LoadBoardWorkspaceProps {
  loads: FreightLoad[];
  activeRole: UserRole;
  onSubmitBid: (loadId: string, rateUSD: number, carrierName: string) => void;
  onUpdateLoadStatus: (id: string, status: FreightLoad['status'], driverName?: string) => void;
}

export const LoadBoardWorkspace: React.FC<LoadBoardWorkspaceProps> = ({
  loads,
  activeRole,
  onSubmitBid,
  onUpdateLoadStatus
}) => {
  const [selectedLoad, setSelectedLoad] = useState<FreightLoad | null>(loads[0] || null);
  const [bidRate, setBidRate] = useState<number>(3000);
  const [carrierName, setCarrierName] = useState('Iron Express Fleet LLC');
  const [bidSuccess, setBidSuccess] = useState(false);

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoad) return;

    onSubmitBid(selectedLoad.id, bidRate, carrierName);
    setBidSuccess(true);
    setTimeout(() => setBidSuccess(false), 3000);
  };

  const availableLoads = loads.filter(l => l.status === 'available' || l.status === 'bid_submitted');
  const totalValue = loads.reduce((sum, l) => sum + l.offerRateUSD, 0);

  return (
    <div className="space-y-6">
      {/* Logistics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Доступно грузов</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-heading">{availableLoads.length}</div>
          <span className="text-[11px] text-amber-400 mt-1 inline-block">Hermes Live Board</span>
        </div>

        <div className="glass-card p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Средняя ставка / миля</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-heading">$3.37 / mi</div>
          <span className="text-[11px] text-emerald-400 mt-1 inline-block">выше рынка на 14%</span>
        </div>

        <div className="glass-card p-4 border border-indigo-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Общий фрахт</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-heading">${totalValue}</div>
          <span className="text-[11px] text-indigo-300 mt-1 inline-block">3 загрузки на планке</span>
        </div>

        <div className="glass-card p-4 border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">В пути / Везем</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-heading">
            {loads.filter(l => l.status === 'in_transit').length}
          </div>
          <span className="text-[11px] text-cyan-300 mt-1 inline-block">GPS Контроль active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Load Board Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-white font-heading flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" /> Интерактивный US Freight Load Board
              </h3>
              <span className="badge badge-amber">Live Rates</span>
            </div>

            <div className="space-y-3">
              {loads.map(load => (
                <div
                  key={load.id}
                  onClick={() => {
                    setSelectedLoad(load);
                    setBidRate(load.offerRateUSD);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    selectedLoad?.id === load.id
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                      : 'bg-slate-900/40 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <MapPin className="w-4 h-4 text-rose-400" /> {load.origin}
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                      <MapPin className="w-4 h-4 text-emerald-400" /> {load.destination}
                    </div>

                    <span className={`badge ${
                      load.status === 'available' ? 'badge-amber' :
                      load.status === 'bid_submitted' ? 'badge-cyan' : 'badge-emerald'
                    }`}>
                      {load.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-white/5">
                    <div>Тип: <strong className="text-white">{load.equipmentType}</strong></div>
                    <div>Вес: <strong className="text-white">{load.weightLbs.toLocaleString()} lbs</strong></div>
                    <div>Дистанция: <strong className="text-white">{load.miles} миль</strong></div>
                    <div>Ставка/миля: <strong className="text-emerald-400">${load.ratePerMile}/mi</strong></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Грузоотправитель: {load.shipperName}</span>
                    <span className="text-base font-bold text-emerald-400">${load.offerRateUSD}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Carrier Bidding & Dispatch Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5">
            <h3 className="font-bold text-base text-white font-heading mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Торги и Отклик Перевозчика
            </h3>

            {selectedLoad ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-2 text-xs">
                  <div className="font-bold text-white text-sm">{selectedLoad.origin} → {selectedLoad.destination}</div>
                  <p className="text-slate-300">Оборудование: {selectedLoad.equipmentType} ({selectedLoad.miles} миль)</p>
                  <p className="text-slate-400">Заявленная ставка: <strong className="text-emerald-400">${selectedLoad.offerRateUSD}</strong></p>
                </div>

                {bidSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Ставка успешно отправлена диспетчеру!
                  </div>
                )}

                <form onSubmit={handleBidSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Компания-Перевозчик / MC Number</label>
                    <input
                      type="text"
                      required
                      value={carrierName}
                      onChange={(e) => setCarrierName(e.target.value)}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Ваше предложение по ставке ($)</label>
                    <input
                      type="number"
                      required
                      value={bidRate}
                      onChange={(e) => setBidRate(Number(e.target.value))}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold text-emerald-400"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center bg-gradient-to-r from-amber-500 to-orange-600">
                    <Send className="w-4 h-4" /> Подать встречную ставку (${bidRate})
                  </button>
                </form>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <p className="text-[11px] text-slate-400 font-medium">Статус диспетчеризации:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdateLoadStatus(selectedLoad.id, 'in_transit', 'Виктор K. (Трак #104)')}
                      className="flex-1 btn-secondary text-xs justify-center py-2"
                    >
                      Назначить водителя
                    </button>
                    <button
                      onClick={() => onUpdateLoadStatus(selectedLoad.id, 'delivered')}
                      className="flex-1 btn-secondary text-xs justify-center py-2 text-emerald-400"
                    >
                      Отметить «Доставлен»
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Выберите груз из списка для участия в торгах.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
