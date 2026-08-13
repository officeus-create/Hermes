import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  DollarSign, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { FreightLoad, UserRole } from '../types';
import { LogisticsDispatcherControlCenter } from '../components/LogisticsDispatcherControlCenter';

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
  const totalValue = loads.reduce((sum, l) => sum + (l.offerRateUSD || l.rateUsd || 0), 0);

  const statusLabelMap: Record<FreightLoad['status'], string> = {
    posted: 'доступен',
    bidded: 'ставка отправлена',
    available: 'доступен',
    bid_submitted: 'ставка отправлена',
    assigned: 'назначен',
    in_transit: 'в пути',
    delivered: 'доставлен'
  };

  return (
    <div className="space-y-8">
      {/* Car Hauler & Logistics Dispatcher Control Center */}
      <LogisticsDispatcherControlCenter />

      {/* Logistics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-amber-500/30 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Доступно грузов</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-heading">{availableLoads.length}</div>
          <span className="text-[11px] text-amber-400 font-medium">Hermes Live Board</span>
        </div>

        <div className="glass-card p-4 border border-emerald-500/30 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Ставка / миля</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-heading">$3.37 / mi</div>
          <span className="text-[11px] text-slate-400">выше рынка на 14%</span>
        </div>

        <div className="glass-card p-4 border border-indigo-500/30 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Общий фрахт</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-heading">${totalValue} USD</div>
          <span className="text-[11px] text-indigo-300">{loads.length} активных загрузки</span>
        </div>

        <div className="glass-card p-4 border border-cyan-500/30 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">В пути / Везем</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 mt-1 font-heading">
            {loads.filter(l => l.status === 'in_transit').length}
          </div>
          <span className="text-[11px] text-slate-400">GPS Контроль активен</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Load Board Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white font-heading flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" /> Интерактивный US Freight Load Board
              </h3>
              <span className="badge badge-amber text-[10px]">Live Rates</span>
            </div>

            <div className="space-y-3">
              {loads.map(load => (
                <div
                  key={load.id}
                  onClick={() => {
                    setSelectedLoad(load);
                    setBidRate(load.offerRateUSD || load.rateUsd || 2500);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    selectedLoad?.id === load.id
                      ? 'bg-amber-950/50 border-amber-500 shadow-lg ring-1 ring-amber-500/40'
                      : 'bg-slate-900/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" /> {load.origin}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {load.destination}
                    </div>

                    <span className={`badge ${
                      load.status === 'available' ? 'badge-amber' :
                      load.status === 'bid_submitted' ? 'badge-cyan' : 'badge-emerald'
                    }`}>
                      {statusLabelMap[load.status] || load.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-white/10">
                    <div>Тип: <strong className="text-white">{load.equipmentType}</strong></div>
                    <div>Вес: <strong className="text-white">{load.weightLbs.toLocaleString()} lbs</strong></div>
                    <div>Дистанция: <strong className="text-white">{load.miles} миль</strong></div>
                    <div>Ставка/миля: <strong className="text-emerald-400">${load.ratePerMile}/mi</strong></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Грузоотправитель: {load.shipperName}</span>
                    <span className="text-sm font-bold text-emerald-400">${load.offerRateUSD} USD</span>
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
              <Zap className="w-4 h-4 text-amber-400" /> Торги и отклик перевозчика
            </h3>

            {selectedLoad ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1.5 text-xs">
                  <div className="font-bold text-white text-sm">{selectedLoad.origin} → {selectedLoad.destination}</div>
                  <p className="text-slate-300">Тип: {selectedLoad.equipmentType} ({selectedLoad.miles} миль)</p>
                  <p className="text-slate-400">Ставка: <strong className="text-emerald-400">${selectedLoad.offerRateUSD} USD</strong></p>
                </div>

                {bidSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Ставка успешно отправлена диспетчеру!
                  </div>
                )}

                <form onSubmit={handleBidSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">Компания / MC Number</label>
                    <input
                      type="text"
                      required
                      value={carrierName}
                      onChange={(e) => setCarrierName(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">Ваша ставка ($ USD)</label>
                    <input
                      type="number"
                      required
                      value={bidRate}
                      onChange={(e) => setBidRate(Number(e.target.value))}
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold text-emerald-400"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs bg-gradient-to-r from-amber-500 to-orange-600">
                    <Send className="w-4 h-4" /> <span>Отправить ставку (${bidRate})</span>
                  </button>
                </form>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <p className="text-[11px] text-slate-400 font-medium">Диспетчеризация:</p>
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
                      Доставлен
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
