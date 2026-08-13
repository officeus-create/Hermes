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
  AIMessage,
  BrandTheme
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
  
  const [workspaces, setWorkspaces] = useState<Record<string, Workspace>>(INITIAL_WORKSPACES);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [vehicleJobs, setVehicleJobs] = useState<VehicleJob[]>(INITIAL_VEHICLE_JOBS);
  const [freightLoads, setFreightLoads] = useState<FreightLoad[]>(INITIAL_FREIGHT_LOADS);
  const [fitnessClients, setFitnessClients] = useState<FitnessClient[]>(INITIAL_FITNESS_CLIENTS);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>(INITIAL_AI_MESSAGES);

  const [activeBrandTheme, setActiveBrandTheme] = useState<BrandTheme | null>(null);

  // Current active workspace metadata
  const currentWorkspace = workspaces[activeVertical] || workspaces.beauty;

  // Apply CSS background whenever brandTheme changes
  useEffect(() => {
    if (activeBrandTheme && activeBrandTheme.active) {
      document.body.classList.add('brand-theme-active');
      document.documentElement.style.setProperty('--dynamic-bg-gradient', activeBrandTheme.bgGradient);
    } else {
      document.body.classList.remove('brand-theme-active');
      document.documentElement.style.removeProperty('--dynamic-bg-gradient');
    }
  }, [activeBrandTheme]);

  // Brand Analysis & Auto-Theme Generator Engine
  const analyzeAndApplyBrandTheme = (sourceUrl: string) => {
    const input = sourceUrl.trim().toLowerCase();
    let theme: BrandTheme;

    if (input.includes('instagram') || input.includes('beauty') || input.includes('salon') || input.includes('@')) {
      theme = {
        brandName: sourceUrl.includes('/') ? sourceUrl.split('/').pop() || 'Aura Luxe Instagram' : sourceUrl,
        sourceUrl,
        primaryColor: '#ec4899',
        accentColor: '#f472b6',
        bgGradient: `radial-gradient(circle at 10% 20%, rgba(236, 72, 153, 0.22) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(244, 114, 182, 0.22) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 60%)`,
        moodDescription: 'Glamour Luxe & Rose Gold aesthetic extracted from social profile',
        active: true
      };
    } else if (input.includes('auto') || input.includes('repair') || input.includes('garage')) {
      theme = {
        brandName: 'Apex Precision Garage',
        sourceUrl,
        primaryColor: '#06b6d4',
        accentColor: '#38bdf8',
        bgGradient: `radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.25) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.8) 0%, transparent 60%)`,
        moodDescription: 'Cyber Technical Carbon & Cyan Neon precision styling',
        active: true
      };
    } else if (input.includes('fit') || input.includes('gym') || input.includes('coach')) {
      theme = {
        brandName: 'Morgan Performance',
        sourceUrl,
        primaryColor: '#a855f7',
        accentColor: '#c084fc',
        bgGradient: `radial-gradient(circle at 10% 20%, rgba(168, 85, 247, 0.25) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)`,
        moodDescription: 'High Energy Athletic Purple & Crimson Glass theme',
        active: true
      };
    } else {
      theme = {
        brandName: sourceUrl || 'Custom Brand',
        sourceUrl,
        primaryColor: '#10b981',
        accentColor: '#34d399',
        bgGradient: `radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.25) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)`,
        moodDescription: 'Emerald Enterprise Growth & Modern Glassmorphism theme',
        active: true
      };
    }

    setActiveBrandTheme(theme);
    return theme;
  };

  const clearBrandTheme = () => {
    setActiveBrandTheme(null);
  };

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
    activeBrandTheme,
    analyzeAndApplyBrandTheme,
    clearBrandTheme,
    addAppointment,
    updateAppointmentStatus,
    addVehicleJob,
    updateVehicleJobStatus,
    submitFreightBid,
    updateFreightLoadStatus,
    sendAIMessage
  };
}
