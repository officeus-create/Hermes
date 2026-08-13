import { useState, useEffect } from 'react';
import { 
  VerticalCategory, 
  UserRole, 
  Workspace, 
  Service, 
  Appointment, 
  VehicleJob, 
  FreightLoad, 
  FitnessClient, 
  AIMessage 
} from '../types';
import { 
  INITIAL_WORKSPACES, 
  INITIAL_SERVICES, 
  INITIAL_APPOINTMENTS, 
  INITIAL_VEHICLE_JOBS, 
  INITIAL_FREIGHT_LOADS, 
  INITIAL_FITNESS_CLIENTS,
  INITIAL_AI_MESSAGES 
} from '../data/mockData';

export function useConnectStore() {
  const [activeVertical, setActiveVertical] = useState<VerticalCategory>('beauty');
  const [activeRole, setActiveRole] = useState<UserRole>('owner');
  
  const [workspaces] = useState<Record<string, Workspace>>(INITIAL_WORKSPACES);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [vehicleJobs, setVehicleJobs] = useState<VehicleJob[]>(INITIAL_VEHICLE_JOBS);
  const [freightLoads, setFreightLoads] = useState<FreightLoad[]>(INITIAL_FREIGHT_LOADS);
  const [fitnessClients, setFitnessClients] = useState<FitnessClient[]>(INITIAL_FITNESS_CLIENTS);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>(INITIAL_AI_MESSAGES);

  // Current active workspace metadata
  const currentWorkspace = workspaces[activeVertical] || workspaces.beauty;

  // Actions
  const addAppointment = (newApt: Omit<Appointment, 'id'>) => {
    const created: Appointment = {
      ...newApt,
      id: `apt_${Date.now()}`
    };
    setAppointments(prev => [created, ...prev]);
    return created;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const addVehicleJob = (job: Omit<VehicleJob, 'id'>) => {
    const created: VehicleJob = {
      ...job,
      id: `job_${Date.now()}`
    };
    setVehicleJobs(prev => [created, ...prev]);
    return created;
  };

  const updateVehicleJobStatus = (id: string, status: VehicleJob['status']) => {
    setVehicleJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  };

  const submitFreightBid = (loadId: string, rateUSD: number, carrierName: string) => {
    setFreightLoads(prev => prev.map(l => {
      if (l.id === loadId) {
        return {
          ...l,
          offerRateUSD: rateUSD,
          ratePerMile: Number((rateUSD / l.miles).toFixed(2)),
          status: 'bid_submitted',
          carrierName
        };
      }
      return l;
    }));
  };

  const updateFreightLoadStatus = (id: string, status: FreightLoad['status'], driverName?: string) => {
    setFreightLoads(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status,
          ...(driverName ? { assignedDriver: driverName } : {})
        };
      }
      return l;
    }));
  };

  // AI Brain Intelligent Intent Router
  const sendAIMessage = (userInput: string) => {
    const userMsg: AIMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);

    // Simple Rule-based Intent Engine
    setTimeout(() => {
      const lower = userInput.toLowerCase();
      let replyContent = '';
      let routed: VerticalCategory = 'beauty';
      let badge: AIMessage['evidenceBadge'] = undefined;

      if (lower.includes('груз') || lower.includes('load') || lower.includes('фура') || lower.includes('рейс') || lower.includes('диспетч')) {
        routed = 'logistics';
        replyContent = `Отлично! Маршрутизирую ваш запрос в **Hermes Freight & Dispatch Network**. У нас доступно ${freightLoads.filter(l => l.status === 'available').length} активных грузов на Load Board. Желаете подать ставку или запросить авто-диспетчер?`;
      } else if (lower.includes('машин') || lower.includes('авто') || lower.includes('сервис') || lower.includes('ремонт') || lower.includes('двигател')) {
        routed = 'auto_repair';
        replyContent = `Переправляю запрос в **Apex Precision Auto & Service**. Наш бот-приемщик может мгновенно рассчитать предварительную смету или записать ваше авто на удобный временной слот.`;
      } else if (lower.includes('тренер') || lower.includes('фитнес') || lower.includes('мышц') || lower.includes('протеин') || lower.includes('белок')) {
        routed = 'fitness';
        badge = 'FACT';
        replyContent = `Маршрутизирую в **Alex Morgan Performance & Science**. Согласно доказательной науке (Morton et al., BJSM), оптимальная норма белка составляет 1.6–2.2 г/кг массы тела. Желаете открыть дневник тренера?`;
      } else if (lower.includes('сайт') || lower.includes('seo') || lower.includes('маркетинг') || lower.includes('лид') || lower.includes('реклам')) {
        routed = 'marketing';
        replyContent = `Запрос передан в **ProgressoPro Digital & SEO Agency**. Мы проводим экспресс-аудит видимости вашего бизнеса и подготавливаем стратегию роста конверсии.`;
      } else if (lower.includes('салон') || lower.includes('маникюр') || lower.includes('стриж') || lower.includes('волос') || lower.includes('услуг')) {
        routed = 'beauty';
        replyContent = `Добро пожаловать в **Aura Luxe Beauty Studio**. Вы можете прямо сейчас записаться на любую услугу или посмотреть свободные слоты мастеров.`;
      } else {
        routed = 'global_network';
        replyContent = `Я классифицировал ваш запрос через **Global Intent & Demand Network**. Hermes Connect моментально соединяет клиента с нужным специалистом или инструментом в нашей экосистеме.`;
      }

      const botReply: AIMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        routedVertical: routed,
        evidenceBadge: badge,
        suggestedActions: [`Перейти в раздел ${routed.toUpperCase()}`, 'Задать еще вопрос']
      };

      setAiMessages(prev => [...prev, botReply]);
    }, 600);
  };

  return {
    activeVertical,
    setActiveVertical,
    activeRole,
    setActiveRole,
    currentWorkspace,
    workspaces,
    services,
    appointments,
    vehicleJobs,
    freightLoads,
    fitnessClients,
    aiMessages,
    addAppointment,
    updateAppointmentStatus,
    addVehicleJob,
    updateVehicleJobStatus,
    submitFreightBid,
    updateFreightLoadStatus,
    sendAIMessage
  };
}
