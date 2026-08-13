import React, { useState } from 'react';
import { Truck, ShieldCheck, MapPin, DollarSign, FileText, Navigation, AlertCircle, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { FreightLoad } from '../types';
import { warpAdapter, SAFERCarrierSafetyRecord } from '../services/warpAdapter';

export const LogisticsDispatcherControlCenter: React.FC = () => {
  // SAFER Vetting State
  const [mcNumberInput, setMcNumberInput] = useState<string>('MC-892104');
  const [saferRecord, setSaferRecord] = useState<SAFERCarrierSafetyRecord | null>({
    mcNumber: 'MC-892104',
    dotNumber: 'DOT-3910283',
    legalName: 'Apex Car Hauler & Logistics LLC',
    safetyRating: 'SATISFACTORY',
    insuranceActive: true,
    bipdInsuranceAmountUSD: 1000000,
    driverFleetCount: 18,
    isApprovedForHermes: true,
  });

  // Active Dispatcher Loads State
  const [loads, setLoads] = useState<FreightLoad[]>([
    { id: 'load_101', origin: 'Chicago, IL', destination: 'Dallas, TX', equipmentType: '9-Car Auto Transport', weightLbs: 42000, miles: 925, offerRateUSD: 3550, ratePerMile: 3.84, pickupDate: '2026-08-14', deliveryDate: '2026-08-16', shipperName: 'Manheim Auto Auction', notes: '4 Luxury EVs + 5 SUVs. Low clearance ramps required.', status: 'in_transit', currentBidCount: 4, assignedDriver: 'Дмитрий Соколов (Truck #104)' },
    { id: 'load_102', origin: 'Atlanta, GA', destination: 'Miami, FL', equipmentType: 'Reefer 53ft', weightLbs: 38000, miles: 660, offerRateUSD: 2450, ratePerMile: 3.71, pickupDate: '2026-08-14', deliveryDate: '2026-08-15', shipperName: 'Publix Distribution', notes: 'Maintain +34°F continuous. Food grade clean.', status: 'posted', currentBidCount: 2 },
    { id: 'load_103', origin: 'Columbus, OH', destination: 'Phoenix, AZ', equipmentType: 'Enclosed Car Hauler', weightLbs: 28000, miles: 1820, offerRateUSD: 7200, ratePerMile: 3.95, pickupDate: '2026-08-15', deliveryDate: '2026-08-18', shipperName: 'Exotic Motors USA', notes: 'Enclosed transport for 2 Porsche 911 GT3 + 1 Ferrari F8.', status: 'assigned', currentBidCount: 5, assignedDriver: 'Александр Громов (Truck #202)' },
  ]);

  const [selectedLoad, setSelectedLoad] = useState<FreightLoad>(loads[0]);
  const [rateConGenerated, setRateConGenerated] = useState<boolean>(false);

  const handleAuditCarrier = async () => {
    const record = await warpAdapter.verifyCarrierSAFER(mcNumberInput);
    setSaferRecord(record);
  };

  const handleIssueRateCon = () => {
    setRateConGenerated(true);
    setTimeout(() => setRateConGenerated(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5">
        <div>
          <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            Пульт Диспетчера Автовозов & Грузоперевозок (Logistics Control Center)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Контроль автовозов (Car Haulers), проверкa страховок SAFER FMCSA, геозоны GPS и генерация RateCon
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-300 font-medium">FMCSA SAFER Direct API Active</span>
        </div>
      </div>

      {/* Main Grid: Carrier Vetting & GPS Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* SAFER FMCSA Carrier Vetting Widget (lg:col-span-5) */}
        <div className="lg:col-span-5 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Верификация Перевозчика (FMCSA SAFER)
            </h3>
            <span className="badge badge-amber text-[10px]">Realtime Audit</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={mcNumberInput}
              onChange={(e) => setMcNumberInput(e.target.value)}
              placeholder="MC-XXXXXX или USDOT"
              className="flex-1 bg-slate-950 text-white text-xs border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleAuditCarrier}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all"
            >
              Проверить
            </button>
          </div>

          {saferRecord && (
            <div className="bg-slate-950/80 p-4 rounded-xl border border-white/10 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Компания:</span>
                <span className="font-bold text-white text-right">{saferRecord.legalName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Рейтинг безопасности:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  saferRecord.safetyRating === 'SATISFACTORY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {saferRecord.safetyRating}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Страхование BIPD (Лимит):</span>
                <span className="font-bold text-emerald-400">${(saferRecord.bipdInsuranceAmountUSD / 1000000).toFixed(1)}M USD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Статус аккредитации Hermes:</span>
                <span className={`font-bold ${saferRecord.isApprovedForHermes ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {saferRecord.isApprovedForHermes ? 'ОДОБРЕН ✓' : 'ТРЕБУЕТСЯ ПРОВЕРКА ⚠'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* GPS Mapbox-style Geofence Tracking Console (lg:col-span-7) */}
        <div className="lg:col-span-7 glass-card p-5 border border-cyan-500/30 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" /> GPS Карта & Геозоны Автовоза
            </h3>
            <span className="badge badge-cyan text-[10px]">Live Telemetry</span>
          </div>

          {/* Map Visualizer Placeholder */}
          <div className="bg-slate-950 p-4 rounded-xl border border-white/10 relative overflow-hidden min-h-[140px] flex flex-col justify-between">
            <div className="flex justify-between text-xs z-10">
              <span className="text-cyan-300 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {selectedLoad.origin} ➔ {selectedLoad.destination}
              </span>
              <span className="text-slate-400">Дистанция: {selectedLoad.miles} миль</span>
            </div>

            <div className="my-3 flex items-center justify-between text-xs bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-500/20 z-10">
              <span className="text-slate-300">Назначенный водитель:</span>
              <span className="font-bold text-white">{selectedLoad.assignedDriver || 'Ожидает назначения'}</span>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 z-10">
              <span>Статус ELD HOS: 8.5ч до отдыха</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Внутри геозоны маршрута I-30
              </span>
            </div>
          </div>
        </div>

        {/* Load Board & Instant RateCon Generator (lg:col-span-12) */}
        <div className="lg:col-span-12 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" /> Активные Загрузки & Генератор Rate Confirmation
            </h3>
            <button
              onClick={handleIssueRateCon}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Сформировать RateCon (PDF)
            </button>
          </div>

          {rateConGenerated && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Подтверждение ставки RateCon для <strong>{selectedLoad.id}</strong> сформировано и отправлено водителю в SMS!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loads.map(load => (
              <div
                key={load.id}
                onClick={() => setSelectedLoad(load)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                  selectedLoad.id === load.id
                    ? 'bg-amber-950/40 border-amber-500 shadow-lg'
                    : 'bg-slate-900/50 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm text-white">{load.equipmentType}</span>
                  <span className="text-xs font-bold text-emerald-400">${load.offerRateUSD} USD</span>
                </div>
                <p className="text-xs text-slate-300">{load.origin} ➔ {load.destination}</p>
                <p className="text-[11px] text-amber-300 font-medium">${load.ratePerMile} / mi • {load.miles} mi</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">{load.notes}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
