import React, { useState } from 'react';
import { 
  Dumbbell, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  User, 
  Activity, 
  Sparkles, 
  Flame, 
  HeartPulse,
  Award
} from 'lucide-react';
import { FitnessClient, UserRole } from '../types';
import { SCIENTIFIC_CLAIMS } from '../data/mockData';

interface FitnessWorkspaceProps {
  fitnessClients: FitnessClient[];
  activeRole: UserRole;
}

export const FitnessWorkspace: React.FC<FitnessWorkspaceProps> = ({
  fitnessClients,
  activeRole
}) => {
  const [selectedClient, setSelectedClient] = useState<FitnessClient>(fitnessClients[0] || null);
  const [activeTab, setActiveRoleTab] = useState<'trainer' | 'client_today'>('trainer');

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Активных подопечных</span>
            <User className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-heading">{fitnessClients.length}</div>
          <span className="text-[11px] text-emerald-400 mt-1 inline-block">100% PAR-Q+ верифицировано</span>
        </div>

        <div className="glass-card p-4 border border-rose-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Требуют внимания (At-Risk)</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-heading">
            {fitnessClients.filter(c => c.stage === 'At Risk').length}
          </div>
          <span className="text-[11px] text-rose-400 mt-1 inline-block">Пропущен отчет за неделю</span>
        </div>

        <div className="glass-card p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Средняя дисциплина (Compliance)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-heading">88.5%</div>
          <span className="text-[11px] text-emerald-400 mt-1 inline-block">Выполнение тренировочного плана</span>
        </div>
      </div>

      {/* Role Toggle for Trainer vs Client View */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 rounded-xl w-fit border border-white/10 text-xs">
        <button
          onClick={() => setActiveRoleTab('trainer')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'trainer' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Командный центр Тренера
        </button>
        <button
          onClick={() => setActiveRoleTab('client_today')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'client_today' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Экран клиента «Что мне делать сегодня?»
        </button>
      </div>

      {activeTab === 'trainer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Client Roster */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-5">
              <h3 className="font-bold text-lg text-white font-heading mb-4 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-purple-400" /> Список атлетов & Программы
              </h3>

              <div className="space-y-3">
                {fitnessClients.map(client => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      selectedClient?.id === client.id
                        ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/40'
                        : 'bg-slate-900/40 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{client.name}</span>
                        <span className="badge badge-primary text-[10px]">{client.primaryGoal}</span>
                      </div>
                      <span className={`badge ${
                        client.stage === 'Active' ? 'badge-emerald' : 'badge-rose'
                      }`}>
                        {client.stage}
                      </span>
                    </div>

                    <p className="text-xs text-indigo-300">{client.currentProgram}</p>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                      <span>Собственный вес: <strong className="text-white">{client.weightLbs} lbs</strong></span>
                      <span>Соблюдение плана: <strong className="text-emerald-400">{client.weeklyCompliance}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Science Copilot & Evidence Engine */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-5 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-white font-heading flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" /> Science & Research Copilot
                </h3>
                <span className="badge badge-emerald text-[10px]">EVIDENCE-BASED</span>
              </div>

              <p className="text-xs text-slate-300 mb-4">
                Автоматическая проверка научно обоснованных протоколов гипертрофии и восстановления:
              </p>

              <div className="space-y-3">
                {SCIENTIFIC_CLAIMS.map(claim => (
                  <div key={claim.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{claim.title}</span>
                      <span className="badge badge-emerald text-[9px]">{claim.evidenceTier}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{claim.summary}</p>
                    <p className="text-[10px] text-indigo-300 font-mono italic">Источник: {claim.citation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Client "Today's Plan" Screen */
        <div className="glass-panel p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Сегодняшний план</span>
              <h3 className="text-xl font-bold text-white font-heading mt-0.5">День 3: Вершина Усилий (Upper Body)</h3>
            </div>
            <span className="badge badge-emerald">В процессе</span>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Основные упражнения
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm">Жим штанги лежа (Incline Bench Press)</span>
                  <p className="text-slate-400 mt-0.5">4 подхода × 8-10 повторений | RPE 8.5</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm">Тяга верхнего блока к груди (Lat Pulldown)</span>
                  <p className="text-slate-400 mt-0.5">3 подхода × 10-12 повторений | Пауза 1 сек внизу</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm">Махи гантелями в стороны (Lateral Raises)</span>
                  <p className="text-slate-400 mt-0.5">4 подхода × 12-15 повторений | Изолированная работа</p>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
              </div>
            </div>
          </div>

          <button className="btn-primary w-full justify-center py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-sm">
            <CheckCircle2 className="w-5 h-5" /> Завершить тренировку и отправить отчет тренеру
          </button>
        </div>
      )}
    </div>
  );
};
