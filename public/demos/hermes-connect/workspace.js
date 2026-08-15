(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const viewMeta = {
    home: ['BUSINESS OVERVIEW', 'Good morning, Vladimir.'],
    inbox: ['UNIFIED INBOX', 'Conversations'],
    crm: ['CUSTOMER INTELLIGENCE', 'Customers'],
    calendar: ['SCHEDULING', 'Calendar'],
    sales: ['REVENUE ENGINE', 'Sales'],
    marketing: ['GROWTH ENGINE', 'Marketing'],
    finance: ['FINANCIAL CONTROL', 'Finance'],
    operations: ['AI ORCHESTRATION', 'Operations'],
    integrations: ['CONNECTED ECOSYSTEM', 'Integrations'],
    academy: ['TRAINING & ENABLEMENT', 'Hermes Academy']
  };

  const i18n = {
    en: {
      kicker_home: 'BUSINESS OVERVIEW', title_home: 'Good morning, Vladimir.',
      kicker_inbox: 'UNIFIED INBOX', title_inbox: 'Conversations',
      kicker_crm: 'CUSTOMER INTELLIGENCE', title_crm: 'Customers',
      kicker_calendar: 'SCHEDULING', title_calendar: 'Calendar',
      kicker_sales: 'REVENUE ENGINE', title_sales: 'Sales',
      kicker_marketing: 'GROWTH ENGINE', title_marketing: 'Marketing',
      kicker_finance: 'FINANCIAL CONTROL', title_finance: 'Finance',
      kicker_operations: 'AI ORCHESTRATION', title_operations: 'Operations',
      kicker_integrations: 'CONNECTED ECOSYSTEM', title_integrations: 'Integrations',
      kicker_academy: 'TRAINING & ENABLEMENT', title_academy: 'Hermes Academy',
      tour_btn: '▶ 5-Min Tour', roi_btn: '📊 ROI Calculator', request_access: 'Request Access / Schedule Demo',
      rev_today: 'Revenue today', new_leads: 'New leads', bookings: 'Bookings / deals', ai_actions: 'AI actions',
      ask_hermes: '✦ Ask Hermes', prototype: 'Prototype', view_all: 'View all',
      things_today: '3 things need you today'
    },
    uk: {
      kicker_home: 'ОГЛЯД БІЗНЕСУ', title_home: 'Доброго ранку, Володимир.',
      kicker_inbox: 'ЄДИНИЙ ВХІДНИЙ', title_inbox: 'Діалоги',
      kicker_crm: 'КЛІЄНТСЬКА АНАЛІТИКА', title_crm: 'Клієнти',
      kicker_calendar: 'РОЗКЛАД', title_calendar: 'Календар',
      kicker_sales: 'ДВИГУН ДОХОДІВ', title_sales: 'Продажі',
      kicker_marketing: 'МАРКЕТИНГ ТА РІСТ', title_marketing: 'Маркетинг',
      kicker_finance: 'ФІНАНСОВИЙ КОНТРОЛЬ', title_finance: 'Фінанси',
      kicker_operations: 'ШІ ОРКЕСТРАЦІЯ', title_operations: 'Операції',
      kicker_integrations: 'ЕКОСИСТЕМА ИНТЕГРАЦІЙ', title_integrations: 'Інтеграції',
      kicker_academy: 'НАВЧАННЯ ТА РОЗВИТОК', title_academy: 'Академія Hermes',
      tour_btn: '▶ 5-хв Тур', roi_btn: '📊 Калькулятор ROI', request_access: 'Запити доступ / Демо',
      rev_today: 'Дохід за сьогодні', new_leads: 'Нові ліди', bookings: 'Бронювання / угоди', ai_actions: 'Дії ШІ',
      ask_hermes: '✦ Запитати Hermes', prototype: 'Прототип', view_all: 'Дивитися все',
      things_today: '3 завдання вимагають вашої уваги'
    },
    ru: {
      kicker_home: 'ОБЗОР БИЗНЕСА', title_home: 'Доброе утро, Владимир.',
      kicker_inbox: 'ЕДИНЫЙ ВХОДЯЩИЙ', title_inbox: 'Диалоги',
      kicker_crm: 'КЛИЕНТСКАЯ АНАЛИТИКА', title_crm: 'Клиенты',
      kicker_calendar: 'РАСПИСАНИЕ', title_calendar: 'Календарь',
      kicker_sales: 'ДВИГАТЕЛЬ ДОХОДОВ', title_sales: 'Продажи',
      kicker_marketing: 'МАРКЕТИНГ И РОСТ', title_marketing: 'Маркетинг',
      kicker_finance: 'ФИНАНСОВЫЙ КОНТРОЛЬ', title_finance: 'Финансы',
      kicker_operations: 'ИИ ОРКЕСТРАЦИЯ', title_operations: 'Операции',
      kicker_integrations: 'ЭКОСИСТЕМА ИНТЕГРАЦИЙ', title_integrations: 'Интеграции',
      kicker_academy: 'ОБУЧЕНИЕ И РАЗВИТИЕ', title_academy: 'Академия Hermes',
      tour_btn: '▶ 5-мин Тур', roi_btn: '📊 Калькулятор ROI', request_access: 'Запросить доступ / Демо',
      rev_today: 'Выручка сегодня', new_leads: 'Новые лиды', bookings: 'Брони / сделки', ai_actions: 'Действия ИИ',
      ask_hermes: '✦ Спросить Hermes', prototype: 'Прототип', view_all: 'Смотреть все',
      things_today: '3 задачи требуют вашего внимания'
    },
    es: {
      kicker_home: 'RESUMEN DEL NEGOCIO', title_home: 'Buenos días, Vladimir.',
      kicker_inbox: 'BANDEJA UNIFICADA', title_inbox: 'Conversaciones',
      kicker_crm: 'INTELIGENCIA DE CLIENTES', title_crm: 'Clientes',
      kicker_calendar: 'PROGRAMACIÓN', title_calendar: 'Calendario',
      kicker_sales: 'MOTOR DE INGRESOS', title_sales: 'Ventas',
      kicker_marketing: 'MOTOR DE CRECIMIENTO', title_marketing: 'Marketing',
      kicker_finance: 'CONTROL FINANCIERO', title_finance: 'Finanzas',
      kicker_operations: 'ORQUESTACIÓN DE IA', title_operations: 'Operaciones',
      kicker_integrations: 'ECOSISTEMA CONECTADO', title_integrations: 'Integraciones',
      kicker_academy: 'CAPACITACIÓN Y DESARROLLO', title_academy: 'Academia Hermes',
      tour_btn: '▶ Tour 5 Min', roi_btn: '📊 Calculadora ROI', request_access: 'Solicitar Acceso / Demo',
      rev_today: 'Ingresos hoy', new_leads: 'Nuevos clientes', bookings: 'Reservas / ofertas', ai_actions: 'Acciones de IA',
      ask_hermes: '✦ Preguntar a Hermes', prototype: 'Prototipo', view_all: 'Ver todo',
      things_today: '3 asuntos requieren su atención hoy'
    },
    fr: {
      kicker_home: 'APERÇU DE L’ENTREPRISE', title_home: 'Bonjour, Vladimir.',
      kicker_inbox: 'BOÎTE UNIFIÉE', title_inbox: 'Conversations',
      kicker_crm: 'INTELLIGENCE CLIENTS', title_crm: 'Clients',
      kicker_calendar: 'PLANIFICATION', title_calendar: 'Calendrier',
      kicker_sales: 'MOTEUR DE REVENUS', title_sales: 'Ventes',
      kicker_marketing: 'MOTEUR DE CROISSANCE', title_marketing: 'Marketing',
      kicker_finance: 'CONTRÔLE FINANCIER', title_finance: 'Finances',
      kicker_operations: 'ORCHESTRATION IA', title_operations: 'Opérations',
      kicker_integrations: 'ÉCOSYSTÈME CONNECTÉ', title_integrations: 'Intégrations',
      kicker_academy: 'FORMATION ET DÉVELOPPEMENT', title_academy: 'Académie Hermes',
      tour_btn: '▶ Tour de 5 Min', roi_btn: '📊 Calculateur ROI', request_access: 'Demander un Accès / Démo',
      rev_today: 'Revenu aujourd’hui', new_leads: 'Nouveaux prospects', bookings: 'Réservations / ventes', ai_actions: 'Actions IA',
      ask_hermes: '✦ Demander à Hermes', prototype: 'Prototype', view_all: 'Voir tout',
      things_today: '3 choses nécessitent votre attention'
    },
    vi: {
      kicker_home: 'TỔNG QUAN DOANH NGHIỆP', title_home: 'Chào buổi sáng, Vladimir.',
      kicker_inbox: 'HỘP THƯ HỢP NHẤT', title_inbox: 'Cuộc trò chuyện',
      kicker_crm: 'THÔNG TIN KHÁCH HÀNG', title_crm: 'Khách hàng',
      kicker_calendar: 'LỊCH TRÌNH', title_calendar: 'Lịch làm việc',
      kicker_sales: 'ĐỘNG CƠ DOANH THU', title_sales: 'Bán hàng',
      kicker_marketing: 'ĐỘNG CƠ TĂNG TRƯỞNG', title_marketing: 'Tiếp thị',
      kicker_finance: 'QUẢN LÝ TÀI CHÍNH', title_finance: 'Tài chính',
      kicker_operations: 'ĐIỀU PHỐI AI', title_operations: 'Vận hành',
      kicker_integrations: 'HỆ THỐNG KẾT NỐI', title_integrations: 'Tích hợp',
      kicker_academy: 'ĐÀO TẠO & PHÁT TRIỂN', title_academy: 'Học viện Hermes',
      tour_btn: '▶ Tour 5 Phút', roi_btn: '📊 Máy Tính ROI', request_access: 'Yêu Cầu Truy Cập / Demo',
      rev_today: 'Doanh thu hôm nay', new_leads: 'Khách hàng mới', bookings: 'Lịch đặt / hợp đồng', ai_actions: 'Hành động AI',
      ask_hermes: '✦ Hỏi Hermes', prototype: 'Bản thử nghiệm', view_all: 'Xem tất cả',
      things_today: '3 công việc cần bạn duyệt hôm nay'
    },
    fil: {
      kicker_home: 'PANGKALAHATANG TINGIN', title_home: 'Magandang umaga, Vladimir.',
      kicker_inbox: 'PINAG-ISANG INBOX', title_inbox: 'Mga Usapan',
      kicker_crm: 'IMPORMASYON NG KLIYENTE', title_crm: 'Mga Kliyente',
      kicker_calendar: 'ISKEDYUL', title_calendar: 'Kalendaryo',
      kicker_sales: 'KITA AT BENTA', title_sales: 'Mga Benta',
      kicker_marketing: 'PAGPAPALAGO', title_marketing: 'Pemasar / Marketing',
      kicker_finance: 'KONTROL SA PINANSYAL', title_finance: 'Pondo at Pinansyal',
      kicker_operations: 'AI ORKESTRAYON', title_operations: 'Mga Operasyon',
      kicker_integrations: 'KONEKTADONG SISTEMA', title_integrations: 'Mga Integrasyon',
      kicker_academy: 'PAGSASSANAY AT PAG-AARAL', title_academy: 'Akademiya ng Hermes',
      tour_btn: '▶ 5-Minutong Tour', roi_btn: '📊 ROI Karkulador', request_access: 'Humiling ng Access / Demo',
      rev_today: 'Kinakita ngayong araw', new_leads: 'Bagong leads', bookings: 'Mga booking / kontrata', ai_actions: 'Mga aksyon ng AI',
      ask_hermes: '✦ Magtanong kay Hermes', prototype: 'Prototipo', view_all: 'Tingnan lahat',
      things_today: '3 bagay ang kailangan ng pansin mo ngayon'
    },
    id: {
      kicker_home: 'RINGKASAN BISNIS', title_home: 'Selamat pagi, Vladimir.',
      kicker_inbox: 'INBOX TERPADU', title_inbox: 'Percakapan',
      kicker_crm: 'INTELIJEN PELANGGAN', title_crm: 'Pelanggan',
      kicker_calendar: 'JADWAL', title_calendar: 'Kalender',
      kicker_sales: 'MESIN PENDAPATAN', title_sales: 'Penjualan',
      kicker_marketing: 'MESIN PERTUMBUHAN', title_marketing: 'Pemasaran',
      kicker_finance: 'KONTROL KEUANGAN', title_finance: 'Keuangan',
      kicker_operations: 'ORCHESTRASI AI', title_operations: 'Operasional',
      kicker_integrations: 'EKOSISTEM TERHUBUNG', title_integrations: 'Integrasi',
      kicker_academy: 'PELATIHAN & PENGEMBANGAN', title_academy: 'Akademi Hermes',
      tour_btn: '▶ Tur 5 Menit', roi_btn: '📊 Kalkulator ROI', request_access: 'Minta Akses / Demo',
      rev_today: 'Pendapatan hari ini', new_leads: 'Prospek baru', bookings: 'Pemesanan / transaksi', ai_actions: 'Tindakan AI',
      ask_hermes: '✦ Tanya Hermes', prototype: 'Prototip', view_all: 'Lihat semua',
      things_today: '3 hal membutuhkan perhatian Anda hari ini'
    }
  };

  let currentLang = 'en';

  function applyLanguage(lang) {
    if (!i18n[lang]) return;
    currentLang = lang;
    const t = i18n[lang];

    // Update ViewMeta kickers & titles
    viewMeta.home = [t.kicker_home, t.title_home];
    viewMeta.inbox = [t.kicker_inbox, t.title_inbox];
    viewMeta.crm = [t.kicker_crm, t.title_crm];
    viewMeta.calendar = [t.kicker_calendar, t.title_calendar];
    viewMeta.sales = [t.kicker_sales, t.title_sales];
    viewMeta.marketing = [t.kicker_marketing, t.title_marketing];
    viewMeta.finance = [t.kicker_finance, t.title_finance];
    viewMeta.operations = [t.kicker_operations, t.title_operations];
    viewMeta.integrations = [t.kicker_integrations, t.title_integrations];
    viewMeta.academy = [t.kicker_academy, t.title_academy];

    // Refresh active view title/kicker
    if (typeof currentView !== 'undefined' && viewMeta[currentView]) {
      $('[data-view-kicker]') && ($('[data-view-kicker]').textContent = viewMeta[currentView][0]);
      $('[data-view-title]') && ($('[data-view-title]').textContent = viewMeta[currentView][1]);
    }

    // Topbar Action Buttons
    $$('[data-demo-tour]').forEach(el => el.textContent = t.tour_btn);
    $$('[data-open-roi-modal]').forEach(el => el.textContent = t.roi_btn);
    $$('[data-request-access]').forEach(el => el.textContent = t.request_access);
    $$('[data-hermes-open]').forEach(el => el.textContent = t.ask_hermes);

    // KPI Metrics Labels
    const metricSpans = $$('.metric-grid article span');
    if (metricSpans.length >= 4) {
      metricSpans[0].textContent = t.rev_today;
      metricSpans[1].textContent = t.new_leads;
      metricSpans[2].textContent = t.bookings;
      metricSpans[3].textContent = t.ai_actions;
    }

    // Focus Card Title
    const focusCardH3 = $('.focus-card h3');
    if (focusCardH3) focusCardH3.textContent = t.things_today;
  }

  const verticals = {
    beauty: {
      name: 'Aurelia Studio', label: 'Beauty & wellness', revenue: '$2,840', leads: '18', bookings: '24', actions: '43',
      summary: 'Hermes handled 43 actions, recovered 4 opportunities and found 3 decisions that need your approval.',
      activity: [
        ['✦','Replied to 9 client conversations','Inbox · 42 seconds average response','2 min ago'],
        ['▣','Filled a Friday scheduling gap','Calendar · rebooking opportunity','8 min ago'],
        ['↗','Qualified 4 new leads','Sales · 2 moved to high intent','14 min ago'],
        ['$','Flagged one overdue invoice','Finance · follow-up prepared','29 min ago']
      ]
    },
    logistics: {
      name: 'Hermes Logistics Ops', label: 'US logistics', revenue: '$14,620', leads: '11', bookings: '7 loads', actions: '58',
      summary: 'Hermes scored 26 load opportunities, prepared 6 carrier follow-ups and flagged 4 routes below target margin.',
      activity: [
        ['⌁','Scored 26 load opportunities','Operations · lane fit + margin','1 min ago'],
        ['↗','Prepared 6 carrier follow-ups','Sales · personalized by equipment','6 min ago'],
        ['!','Flagged 4 low-margin routes','Finance · below target threshold','12 min ago'],
        ['◎','Matched 3 carriers to open loads','CRM · readiness checked','21 min ago']
      ]
    },
    fitness: {
      name: 'Northline Performance', label: 'Fitness & coaching', revenue: '$1,960', leads: '13', bookings: '31', actions: '37',
      summary: 'Hermes recovered 5 inactive members, filled 3 coaching slots and prepared a retention sequence.',
      activity: [
        ['◎','Recovered 5 inactive members','CRM · retention sequence','3 min ago'],
        ['▣','Filled 3 coaching slots','Calendar · schedule optimization','11 min ago'],
        ['✦','Prepared member retention outreach','Marketing · personalized cadence','18 min ago'],
        ['$','Updated projected recurring revenue','Finance · membership forecast','31 min ago']
      ]
    },
    agency: {
      name: 'Progresso Growth Lab', label: 'Marketing agency', revenue: '$4,780', leads: '22', bookings: '9 calls', actions: '61',
      summary: 'Hermes ranked 12 warm opportunities, drafted 4 follow-up sequences and found 3 content winners worth reusing.',
      activity: [
        ['↗','Ranked 12 warm opportunities','Sales · intent scoring updated','1 min ago'],
        ['✦','Found 3 winning content patterns','Marketing · cross-platform reuse','5 min ago'],
        ['◉','Drafted 4 founder follow-ups','Inbox · personalized outreach','16 min ago'],
        ['$','Recalculated campaign margin','Finance · CAC vs revenue','24 min ago']
      ]
    },
    realestate: {
      name: 'Meridian Property Group', label: 'Real estate', revenue: '$8,400', leads: '16', bookings: '12 tours', actions: '46',
      summary: 'Hermes qualified 8 buyer inquiries, matched 5 listings and scheduled 4 property tours automatically.',
      activity: [
        ['◎','Qualified 8 buyer inquiries','CRM · budget + intent','2 min ago'],
        ['⌂','Matched 5 relevant listings','Operations · preference fit','9 min ago'],
        ['▣','Scheduled 4 property tours','Calendar · agent availability','17 min ago'],
        ['◉','Followed up with 6 warm buyers','Inbox · personalized listing context','27 min ago']
      ]
    },
    auto: {
      name: 'Apex Auto Care', label: 'Auto repair & detailing', revenue: '$6,920', leads: '19', bookings: '15 cars', actions: '52',
      summary: 'Hermes scheduled 5 service diagnostics, dispatched 2 detailing slots, and prepared 3 quote approvals.',
      activity: [
        ['⌁','Scheduled 5 diagnostic sessions','Operations · bay availability matched','2 min ago'],
        ['↗','Sent 3 brake & repair estimates','Sales · instant quote approval sent','8 min ago'],
        ['◎','Matched 2 detailing bays','Calendar · ceramic coat package','15 min ago'],
        ['$','Calculated parts & labor margin','Finance · auto parts API sync','28 min ago']
      ]
    }
  };

  const conversations = [
    ['AM','Anna Martinez','Friday appointment · ready to confirm','1m','active'],
    ['JR','James Reed','Asked about pricing and package options','4m',''],
    ['SK','Sofia Kim','Hermes answered · waiting for customer','9m',''],
    ['DM','David Miller','VIP · needs owner reply','14m',''],
    ['EL','Emma Lewis','Rebooking follow-up sent','22m',''],
    ['NB','Noah Brown','New Instagram lead','31m','']
  ];

  const customers = [
    ['AM','Anna Martinez','High intent','Today · Instagram','$1,240','Confirm Friday booking'],
    ['DM','David Miller','VIP','Today · Email','$4,880','Owner reply prepared'],
    ['EL','Emma Lewis','Rebooking','Yesterday · SMS','$2,120','Offer preferred time'],
    ['JR','James Reed','Warm lead','Yesterday · Web','$780','Send package comparison'],
    ['SK','Sofia Kim','Active','2 days ago · Instagram','$1,960','Ask for review'],
    ['NB','Noah Brown','New lead','12 min ago · Instagram','$0','Qualify service need']
  ];

  const week = [
    ['MON','13',[['09:00','Team sync','blue'],['11:30','Maria K.',''],['15:00','Consultation','mint']]],
    ['TUE','14',[['10:00','VIP client',''],['13:30','New booking','blue'],['17:00','Follow-up block','mint']]],
    ['WED','15',[['09:30','Consultation','mint'],['12:00','Anna M.',''],['16:00','Content shoot','blue']]],
    ['THU','16',[['10:30','New client',''],['14:30','Review call','blue'],['18:00','Open slot','mint']]],
    ['FRI','17',[['11:30','AI suggested gap','mint'],['14:30','Anna Martinez',''],['16:00','Available','blue']]]
  ];

  const kanban = {
    'New': [['Anna Martinez','$180','82%'],['Noah Brown','$420','65%'],['Mia Clark','$260','58%']],
    'Qualified': [['James Reed','$780','74%'],['Olivia Hall','$1,200','69%'],['Liam Green','$640','67%']],
    'Proposal': [['David Miller','$4,880','88%'],['Sophia White','$2,400','73%']],
    'Closing': [['Emma Lewis','$1,960','91%'],['Daniel King','$3,100','84%']]
  };

  const ops = [
    ['✦','Warm lead recovery','Following up with 7 stalled conversations','Running'],
    ['↗','Campaign optimization','Comparing 4 creatives and 3 audiences','Running'],
    ['▣','Schedule optimization','Looking for high-value rebooking gaps','Running'],
    ['$','Invoice follow-up','Preparing overdue reminder sequence','Review'],
    ['◎','Customer health scoring','Updating churn and LTV signals','Running'],
    ['⌁','Data quality check','Merging 6 possible duplicate records','Running']
  ];

  const integrations = [
    ['G','Gmail','Email conversations, context and follow-up','Connected'],
    ['▣','Google Calendar','Bookings, meetings and availability','Connected'],
    ['GH','GitHub','Issues, code, releases and evidence','Connected'],
    ['S','Slack','Team messages and operational signals','Available'],
    ['N','Notion','Knowledge, SOPs and documentation','Available'],
    ['L','Linear','Issue-to-outcome workflow','Available'],
    ['WA','WhatsApp','Customer messaging and follow-up','Planned'],
    ['☎','Telephony','Calls, transcripts and coaching','Planned'],
    ['P','Payments','Payment events and receivables','Available'],
    ['A','Analytics','Product and campaign intelligence','Available'],
    ['CD','Carrier Data','Logistics matching and scoring','Planned'],
    ['+','1000+ tools','Expansion through approved connectors','Explore']
  ];

  const verticalMapStartup = {
    logistics: 'logistics',
    auto_repair: 'auto',
    auto_service: 'auto',
    agency: 'agency',
    beauty: 'beauty',
    fitness: 'fitness',
    real_estate: 'realestate',
    professional_services: 'agency',
    other: 'logistics'
  };
  const startupStoredType = localStorage.getItem('hermes_business_type');
  const urlParamsStartup = new URLSearchParams(window.location.search);
  const startupTypeParam = urlParamsStartup.get('business_type');
  let currentVertical = verticalMapStartup[startupTypeParam] || verticalMapStartup[startupStoredType] || 'beauty';
  let currentView = 'home';

  function renderActivity() {
    const target = $('[data-activity-list]');
    if (!target) return;
    target.innerHTML = verticals[currentVertical].activity.map(([icon,title,meta,time]) => `
      <div class="activity-item"><span class="activity-icon">${icon}</span><div><b>${title}</b><small>${meta}</small></div><em>${time}</em></div>`).join('');
  }

  function renderConversations() {
    const target = $('[data-conversation-list]');
    if (!target) return;
    target.innerHTML = conversations.map(([initials,name,preview,time,state]) => `
      <button class="conversation-card ${state}" type="button"><span class="conversation-avatar">${initials}</span><div><b>${name}</b><small>${preview}</small></div><em>${time}</em></button>`).join('');
  }

  function renderCustomers() {
    const target = $('[data-customer-table]');
    if (!target) return;
    
    let list = customers.map(c => [...c, '']); // Pad demo customers with empty vehicle string
    if (currentVertical === 'auto') {
      try {
        const stored = localStorage.getItem('hermes_connect_bookings');
        if (stored) {
          const bookings = JSON.parse(stored);
          const mappedBookings = bookings.map(b => {
            const initials = b.customer_name ? b.customer_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'BC';
            const stageText = b.status === 'NEW' ? 'Booked' : b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'IN_SERVICE' ? 'In Service' : 'Completed';
            const valueOnly = b.price.split(' ')[0];
            const nextText = b.status === 'NEW' ? 'Review & confirm time slot' : b.status === 'CONFIRMED' ? 'Prepare bay for check-in' : b.status === 'IN_SERVICE' ? 'Execute service checklist' : 'Archive to service history';
            const vehicleName = b.vehicle ? `${b.vehicle.year} ${b.vehicle.make} ${b.vehicle.model}` : '';
            return [initials, b.customer_name, stageText, `${b.date.split(',')[0]} · ${b.time_slot}`, valueOnly, nextText, vehicleName];
          });
          list = [...mappedBookings, ...list];
        }
      } catch (e) {
        // fail safe
      }
    }

    target.innerHTML = list.map(([initials,name,stage,last,value,next,vehicle]) => `
      <tr><td><div class="table-person"><span>${initials}</span><b>${name}</b>${vehicle ? `<small style="display:block; font-size:11px; opacity:0.75; font-weight:normal; margin-top:2px;">${vehicle}</small>` : ''}</div></td><td><span class="stage">${stage}</span></td><td>${last}</td><td><b>${value}</b></td><td class="next-action">✦ ${next}</td><td>•••</td></tr>`).join('');
  }

  function renderWeek() {
    const target = $('[data-week-grid]');
    if (!target) return;
    
    let currentWeek = JSON.parse(JSON.stringify(week)); // deep clone
    if (currentVertical === 'auto') {
      try {
        const stored = localStorage.getItem('hermes_connect_bookings');
        if (stored) {
          const bookings = JSON.parse(stored);
          bookings.forEach(b => {
            if (b.status !== 'CANCELLED') {
              const dayItem = currentWeek.find(d => d[0] === b.date_id);
              if (dayItem) {
                const color = b.status === 'NEW' ? 'mint' : b.status === 'CONFIRMED' ? 'blue' : b.status === 'IN_SERVICE' ? 'purple' : 'completed';
                const titleText = `${b.customer_name} (${b.service.split(' ').slice(0, 2).join(' ')})`;
                dayItem[2].push([b.time_slot, titleText, color]);
                // Sort items by time slot
                dayItem[2].sort((x, y) => x[0].localeCompare(y[0]));
              }
            }
          });
        }
      } catch (e) {
        // fail safe
      }
    }

    target.innerHTML = currentWeek.map(([day,date,items]) => `<div class="day"><div class="day-head"><b>${day}</b><span>${date}</span></div>${items.map(([time,title,color]) => `<div class="booking ${color}"><small>${time}</small><b>${title}</b></div>`).join('')}</div>`).join('');
  }

  function renderKanban() {
    const target = $('[data-sales-kanban]');
    if (!target) return;
    
    let currentKanban = JSON.parse(JSON.stringify(kanban)); // deep clone
    if (currentVertical === 'auto') {
      try {
        const stored = localStorage.getItem('hermes_connect_bookings');
        if (stored) {
          const bookings = JSON.parse(stored);
          bookings.forEach(b => {
            if (b.status !== 'CANCELLED') {
              const nameText = `${b.customer_name} (${b.service.split(' ').slice(0, 2).join(' ')})`;
              const valueText = b.price.split(' ')[0];
              const confidenceText = '99%';
              if (b.status === 'NEW') {
                currentKanban['New'].unshift([nameText, valueText, confidenceText]);
              } else if (b.status === 'CONFIRMED') {
                currentKanban['Qualified'].unshift([nameText, valueText, confidenceText]);
              } else if (b.status === 'IN_SERVICE') {
                currentKanban['Proposal'].unshift([nameText, valueText, confidenceText]);
              } else if (b.status === 'COMPLETED') {
                currentKanban['Closing'].unshift([nameText, valueText, confidenceText]);
              }
            }
          });
        }
      } catch (e) {
        // fail safe
      }
    }

    target.innerHTML = Object.entries(currentKanban).map(([stage,deals]) => `<div class="kanban-col"><div class="kanban-title"><b>${stage}</b><span>${deals.length}</span></div>${deals.map(([name,value,confidence]) => `<div class="deal-card"><span>AI confidence ${confidence}</span><b>${name}</b><small>${verticals[currentVertical].label}</small><div class="deal-footer"><strong>${value}</strong><span>✦ Next step ready</span></div></div>`).join('')}</div>`).join('');
  }

  function renderOps() {
    const target = $('[data-ops-list]');
    if (!target) return;
    target.innerHTML = ops.map(([icon,title,meta,state]) => `<div class="ops-item"><span class="ops-icon">${icon}</span><div><b>${title}</b><small>${meta}</small></div><span class="ops-state">${state}</span></div>`).join('');
  }

  function renderIntegrations() {
    const target = $('[data-integration-grid]');
    if (!target) return;
    target.innerHTML = integrations.map(([logo,name,desc,status]) => {
      const connected = status === 'Connected';
      const action = connected ? 'Connected ✓' : (status === 'Planned' ? 'Join waitlist' : status === 'Explore' ? 'Explore layer' : 'Connect');
      return `<article class="integration-card ${connected ? 'connected' : ''}"><div class="integration-top"><span class="integration-logo">${logo}</span><span class="integration-status">${status}</span></div><h4>${name}</h4><p>${desc}</p><button type="button" data-integration-action>${action}</button></article>`;
    }).join('');
    $$('[data-integration-action]', target).forEach(button => button.addEventListener('click', () => {
      const card = button.closest('.integration-card');
      if (card.classList.contains('connected')) return;
      button.textContent = 'Prototype request saved';
      card.querySelector('.integration-status').textContent = 'Requested';
    }));
  }

  function updateKPIs() {
    const id = currentVertical;
    const data = verticals[id];
    if (!data) return;
    let revenueVal = data.revenue;
    let leadsVal = data.leads;
    let bookingsVal = data.bookings;
    let actionsVal = data.actions;
    
    if (id === 'auto') {
      const dynamic = getAutoKPIs();
      revenueVal = dynamic.revenue;
      leadsVal = dynamic.leads;
      bookingsVal = dynamic.bookings;
      actionsVal = dynamic.actions;
    }
    
    $('[data-kpi="revenue"]') && ($('[data-kpi="revenue"]').textContent = revenueVal);
    $('[data-kpi="leads"]') && ($('[data-kpi="leads"]').textContent = leadsVal);
    $('[data-kpi="bookings"]') && ($('[data-kpi="bookings"]').textContent = bookingsVal);
    $('[data-kpi="actions"]') && ($('[data-kpi="actions"]').textContent = actionsVal);
  }

  function setVertical(id) {
    if (!verticals[id]) return;
    currentVertical = id;
    const data = verticals[id];
    $$('[data-workspace-name]').forEach(el => el.textContent = data.name);
    $$('[data-workspace-label]').forEach(el => el.textContent = data.label);
    updateKPIs();
    $('[data-ai-summary-text]') && ($('[data-ai-summary-text]').textContent = data.summary);
    renderActivity();
    renderKanban();
    
    // Toggle Corporate Offer Panel for Apex Auto & Truck Repair (auto)
    const offerPanel = $('[data-corporate-offer-panel]');
    if (offerPanel) {
      offerPanel.style.display = (id === 'auto') ? 'block' : 'none';
    }

    $('[data-workspace-popover]')?.classList.remove('open');
    $('[data-workspace-popover]')?.setAttribute('aria-hidden','true');
  }

  function setView(id) {
    if (!viewMeta[id]) return;
    currentView = id;
    $$('[data-view-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.viewPanel === id));
    $$('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === id));
    $$('[data-mobile-view]').forEach(button => button.classList.toggle('active', button.dataset.mobileView === id));
    $('[data-view-kicker]').textContent = viewMeta[id][0];
    $('[data-view-title]').textContent = viewMeta[id][1];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setDrawer(open) {
    $('[data-hermes-drawer]')?.classList.toggle('open', open);
    $('[data-hermes-drawer]')?.setAttribute('aria-hidden', String(!open));
    $('[data-scrim]')?.classList.toggle('open', open);
  }

  $$('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  $$('[data-view-jump]').forEach(button => button.addEventListener('click', () => setView(button.dataset.viewJump)));
  $$('[data-mobile-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.mobileView)));
  $$('[data-hermes-open]').forEach(button => button.addEventListener('click', () => setDrawer(true)));
  $$('[data-hermes-close]').forEach(button => button.addEventListener('click', () => setDrawer(false)));
  $('[data-scrim]')?.addEventListener('click', () => setDrawer(false));

  $('[data-workspace-menu]')?.addEventListener('click', event => {
    event.stopPropagation();
    const menu = $('[data-workspace-popover]');
    const open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
  });
  $$('[data-vertical]').forEach(button => button.addEventListener('click', () => setVertical(button.dataset.vertical)));
  document.addEventListener('click', event => {
    const menu = $('[data-workspace-popover]');
    if (menu && !menu.contains(event.target) && !event.target.closest('[data-workspace-menu]')) {
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden','true');
    }
  });

  $('[data-theme-toggle]')?.addEventListener('click', () => {
    document.body.classList.toggle('theme-pearl');
  });

  $$('[data-demo-form]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    const input = $('input', form);
    if (!input?.value.trim()) return;
    input.value = '';
    const button = $('button', form);
    const previous = button.textContent;
    button.textContent = 'Sent ✓';
    setTimeout(() => button.textContent = previous, 1200);
  }));

  // Apex Auto Care Estimation Engine
  const APEX_AUTO_SERVICES = {
    brakes: {
      name: 'Brake Pad & Rotor Service',
      duration: '1.5 Hours',
      costRange: '$280 - $380',
      bay: 'Bay 2 · Brake & Suspension Specialist',
      slot: 'Today at 2:00 PM',
      summary: 'Includes OEM ceramic brake pads, rotor inspection/resurfacing, and hydraulic fluid check.'
    },
    diagnostic: {
      name: 'Full Vehicle Diagnostic & Inspection',
      duration: '1.0 Hour',
      costRange: '$120 - $180',
      bay: 'Bay 1 · Master Diagnostic Tech',
      slot: 'Today at 11:30 AM',
      summary: 'OBD-II computer scan, battery/alternator load test, and 50-point safety inspection.'
    },
    oil: {
      name: 'Synthetic Oil & Filter Service',
      duration: '35 Mins',
      costRange: '$65 - $95',
      bay: 'Bay 3 · Express Lube Bay',
      slot: 'Today at 3:15 PM',
      summary: 'Full synthetic OEM oil replacement, filter swap, tire pressure & fluid top-off.'
    },
    detailing: {
      name: 'Full Ceramic Coat & Detailing',
      duration: '3.5 Hours',
      costRange: '$350 - $550',
      bay: 'Detail Bay A · Master Detailer',
      slot: 'Tomorrow at 9:00 AM',
      summary: 'Exterior paint correction, 2-year ceramic coating application, interior steam cleaning.'
    },
    engine: {
      name: 'Engine & Transmission Check',
      duration: '2.5 Hours',
      costRange: '$450 - $850',
      bay: 'Bay 4 · Heavy Mechanical Tech',
      slot: 'Tomorrow at 1:00 PM',
      summary: 'Compression testing, transmission pressure analysis, and mechanical fault diagnosis.'
    },
    truck_diesel: {
      name: 'Truck & Diesel Heavy Repair',
      duration: '2.5 Hours',
      costRange: '$350 - $650',
      bay: 'Diesel Bay 4 · Heavy Equipment Specialist',
      slot: 'Today at 4:30 PM',
      summary: 'Heavy-duty diesel computer scan, exhaust aftertreatment (DEF/DPF) test, and engine health check.'
    },
    trailer_repair: {
      name: 'Commercial Trailer & Alignment',
      duration: '2.0 Hours',
      costRange: '$240 - $480',
      bay: 'Trailer Bay 6 · Alignment & Structural Bay',
      slot: 'Tomorrow at 10:00 AM',
      summary: 'Multi-axle trailer alignment inspection, brake chamber check, and structural safety audit.'
    },
    mobile_roadside: {
      name: 'Mobile Roadside Emergency Dispatch',
      duration: '1.0 Hour (Dispatch)',
      costRange: '$150 Service Call + Parts',
      bay: 'Mobile Service Truck #2 (On-Call)',
      slot: 'Dispatched within 25 Mins',
      summary: 'Emergency roadside truck dispatch with fully equipped mobile tool chest and diagnostic systems.'
    },
    parts_supplier: {
      name: 'Heavy Parts Sourcing & Delivery',
      duration: '45 Mins',
      costRange: '$180 - $950 (Varies)',
      bay: 'Parts Counter · Logistics Coordinator',
      slot: 'Ready for pickup or hotshot delivery',
      summary: 'Live local inventory search, fleet pricing verification, and immediate courier dispatch.'
    },
    fleet_maintenance: {
      name: 'PM Fleet Maintenance Program',
      duration: '1.5 Hours',
      costRange: 'Contract Rate / $120/hr',
      bay: 'Bay 5 · Fleet Inspection Bay',
      slot: 'Tomorrow at 8:30 AM',
      summary: 'Comprehensive preventative maintenance (PM) audit, oil analysis, and DOT compliance checklist.'
    }
  };

  function getApexEstimate(serviceKey, vehicleName) {
    const service = APEX_AUTO_SERVICES[serviceKey] || APEX_AUTO_SERVICES.brakes;
    return {
      serviceKey,
      serviceName: service.name,
      vehicle: vehicleName || '2022 Ford F-150',
      duration: service.duration,
      costRange: service.costRange,
      bay: service.bay,
      slot: service.slot,
      summary: service.summary
    };
  }

  // Command Center Lead Store & Status Workflow
  let activeStatusFilter = 'ALL';
  let selectedLeadId = 'lead-101';

  const leadStore = [
    {
      id: 'lead-101',
      name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      phone: '(555) 839-2041',
      company: 'Apex Client Fleet',
      initials: 'AM',
      verticalKey: 'auto',
      verticalName: 'Apex Auto Care',
      message: 'I need brake pad and rotor replacement for my 2022 Ford F-150 as soon as possible.',
      status: 'NEW',
      confidenceNum: 0.94,
      confidence: '94%',
      priority: 'HIGH',
      timestamp: '2m ago',
      autoBooking: {
        serviceKey: 'brakes',
        serviceName: 'Brake Pad & Rotor Service',
        vehicle: '2022 Ford F-150',
        duration: '1.5 Hours',
        costRange: '$280 - $380',
        bay: 'Bay 2 · Brake & Suspension Specialist',
        slot: 'Today at 2:00 PM',
        summary: 'Includes OEM ceramic brake pads, rotor inspection/resurfacing, and hydraulic fluid check.'
      },
      aiSuggestedAction: 'Generate digital repair estimate ($330) & reserve Bay 2 slot.'
    },
    {
      id: 'lead-102',
      name: 'James Reed',
      email: 'james.reed@example.com',
      phone: '(555) 492-1180',
      company: 'Reed & Co',
      initials: 'JR',
      verticalKey: 'beauty',
      verticalName: 'Aurelia Studio',
      message: 'Interested in full balayage styling package for Friday afternoon.',
      status: 'QUALIFIED',
      confidenceNum: 0.88,
      confidence: '88%',
      priority: 'MEDIUM',
      timestamp: '15m ago',
      autoBooking: null,
      aiSuggestedAction: 'Send Friday 2:30 PM appointment booking link + $25 deposit request.'
    },
    {
      id: 'lead-103',
      name: 'David Miller',
      email: 'david.miller@example.com',
      phone: '(555) 771-9923',
      company: 'Meridian Real Estate',
      initials: 'DM',
      verticalKey: 'realestate',
      verticalName: 'Meridian Property Group',
      message: 'Looking for 3-bedroom property tour in North Shore this weekend. Budget $1.2M.',
      status: 'PROPOSAL_READY',
      confidenceNum: 0.92,
      confidence: '92%',
      priority: 'HIGH',
      timestamp: '1h ago',
      autoBooking: null,
      aiSuggestedAction: 'Send property tour schedule & pre-approval buyer package.'
    }
  ];

  function saveLeadStoreToLocalStorage() {
    try {
      localStorage.setItem('hermes_lead_store', JSON.stringify(leadStore));
    } catch (e) {
      // safe fallback
    }
  }

  function loadLeadStoreFromLocalStorage() {
    try {
      const stored = localStorage.getItem('hermes_lead_store');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          leadStore.length = 0;
          parsed.forEach(item => leadStore.push(item));
        }
      }
    } catch (e) {
      // safe fallback
    }
  }

  function saveStatusToBooking(bookingId, status) {
    try {
      const stored = localStorage.getItem('hermes_connect_bookings');
      if (stored) {
        const bookings = JSON.parse(stored);
        const booking = bookings.find(b => b.booking_id === bookingId);
        if (booking) {
          booking.status = status;
          localStorage.setItem('hermes_connect_bookings', JSON.stringify(bookings));
        }
      }
    } catch (e) {
      console.error('Error saving status to booking in localStorage:', e);
    }
  }

  function getAutoKPIs() {
    let baseRevenue = 6920;
    let baseLeads = 19;
    let baseBookings = 15;
    let baseActions = 52;
    
    try {
      const stored = localStorage.getItem('hermes_connect_bookings');
      if (stored) {
        const bookings = JSON.parse(stored);
        bookings.forEach(b => {
          if (b.status !== 'CANCELLED') {
            const priceVal = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
            baseRevenue += priceVal;
            baseLeads += 1;
            baseBookings += 1;
            baseActions += 1;
          }
        });
      }
    } catch (e) {
      // fail safe
    }
    
    return {
      revenue: `$${baseRevenue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`,
      leads: String(baseLeads),
      bookings: `${baseBookings} cars`,
      actions: String(baseActions)
    };
  }

  function syncBookingsToLeadStore() {
    try {
      const storedBookings = localStorage.getItem('hermes_connect_bookings');
      if (storedBookings) {
        const bookings = JSON.parse(storedBookings);
        bookings.forEach(b => {
          const exists = leadStore.some(l => l.id === b.booking_id);
          if (!exists) {
            const initials = b.customer_name ? b.customer_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'BC';
            const serviceKey = b.service.toLowerCase().replace(/\s+/g, '_');
            const newLead = {
              id: b.booking_id,
              name: b.customer_name,
              email: b.customer_email,
              phone: b.customer_phone,
              company: `${b.vehicle.year} ${b.vehicle.make} ${b.vehicle.model}`,
              initials: initials,
              verticalKey: 'auto',
              verticalName: 'Apex Auto Care',
              message: b.notes || `Booked a ${b.service} for my ${b.vehicle.year} ${b.vehicle.make} ${b.vehicle.model} on ${b.date} at ${b.time_slot}.`,
              status: b.status,
              confidenceNum: 0.99,
              confidence: '99%',
              priority: 'HIGH',
              timestamp: 'Just now',
              autoBooking: {
                serviceKey: serviceKey,
                serviceName: b.service,
                vehicle: `${b.vehicle.year} ${b.vehicle.make} ${b.vehicle.model} (Mileage: ${b.vehicle.mileage})`,
                duration: b.service === 'Full Synthetic Oil Change' ? '45 mins' : b.service === 'Premium Brake Pad Replacement' ? '1.5 Hours' : '30 mins',
                costRange: b.price,
                bay: "Bay 1 · Live Booking",
                slot: `${b.date} at ${b.time_slot}`,
                summary: `Live booked appointment via public customer booking link.`
              },
              aiSuggestedAction: b.status === 'NEW' ? 'Review booking slot & click Confirm Booking.' : b.status === 'CONFIRMED' ? 'Move appointment to IN SERVICE once vehicle arrives.' : b.status === 'IN_SERVICE' ? 'Complete service and log vehicle maintenance history.' : 'Service successfully completed.'
            };
            leadStore.unshift(newLead);
          } else {
            const lead = leadStore.find(l => l.id === b.booking_id);
            if (lead && lead.status !== b.status) {
              lead.status = b.status;
              lead.aiSuggestedAction = b.status === 'NEW' ? 'Review booking slot & click Confirm Booking.' : b.status === 'CONFIRMED' ? 'Move appointment to IN SERVICE once vehicle arrives.' : b.status === 'IN_SERVICE' ? 'Complete service and log vehicle maintenance history.' : 'Service successfully completed.';
            }
          }
        });
        saveLeadStoreToLocalStorage();
      }
    } catch (e) {
      console.error('Error syncing bookings to leadStore:', e);
    }
  }

  function renderLeadInbox() {
    const list = $('[data-conversation-list]');
    if (!list) return;

    const filtered = leadStore.filter(lead => {
      if (activeStatusFilter === 'ALL') return true;
      return lead.status === activeStatusFilter;
    });

    if (filtered.length === 0) {
      list.innerHTML = `<div style="padding:20px;text-align:center;color:#858A97;font-size:9px;">No leads found in status: <strong>${activeStatusFilter}</strong></div>`;
      return;
    }

    list.innerHTML = filtered.map(lead => {
      const activeClass = lead.id === selectedLeadId ? 'active' : '';
      const statusClass = lead.status === 'NEW' ? 'status-new' : (lead.status === 'QUALIFIED' ? 'status-qualified' : 'status-proposal');
      const statusLabel = lead.status === 'PROPOSAL_READY' ? 'PROPOSAL READY' : lead.status;
      return `
        <button class="conversation-card ${activeClass}" type="button" data-lead-card-id="${lead.id}" data-lead-item="${lead.id}">
          <span class="conversation-avatar">${lead.initials}</span>
          <div>
            <b>${lead.name} <span class="status-badge ${statusClass}">${statusLabel}</span></b>
            <small>${lead.verticalName} · ${lead.message}</small>
          </div>
          <em>${lead.timestamp}</em>
        </button>
      `;
    }).join('');

    $$('[data-lead-card-id]', list).forEach(btn => {
      btn.addEventListener('click', () => {
        selectedLeadId = btn.dataset.leadCardId;
        renderLeadInbox();
        renderLeadDetail(selectedLeadId);
      });
    });
  }

  function renderLeadDetail(leadId) {
    const header = $('[data-inbox-header]');
    const thread = $('[data-inbox-thread]');
    const suggested = $('[data-inbox-suggested]');

    const lead = leadStore.find(l => l.id === leadId) || leadStore[0];
    if (!lead) return;

    selectedLeadId = lead.id;
    const isBooking = lead.id.toString().startsWith('booking-');

    if (header) {
      let statusControlsHTML = '';
      if (isBooking) {
        statusControlsHTML = `
          <button class="status-btn ${lead.status==='NEW'?'active':''}" data-set-status="NEW" data-lead-id="${lead.id}">NEW</button>
          <button class="status-btn ${lead.status==='CONFIRMED'?'active':''}" data-set-status="CONFIRMED" data-lead-id="${lead.id}">CONFIRMED</button>
          <button class="status-btn ${lead.status==='IN_SERVICE'?'active':''}" data-set-status="IN_SERVICE" data-lead-id="${lead.id}">IN SERVICE</button>
          <button class="status-btn ${lead.status==='COMPLETED'?'active':''}" data-set-status="COMPLETED" data-lead-id="${lead.id}">COMPLETED</button>
        `;
      } else {
        statusControlsHTML = `
          <button class="status-btn ${lead.status==='NEW'?'active':''}" data-set-status="NEW" data-lead-id="${lead.id}">NEW</button>
          <button class="status-btn ${lead.status==='QUALIFIED'?'active':''}" data-set-status="QUALIFIED" data-lead-id="${lead.id}">QUALIFIED</button>
          <button class="status-btn ${lead.status==='PROPOSAL_READY'?'active':''}" data-set-status="PROPOSAL_READY" data-lead-id="${lead.id}">PROPOSAL READY</button>
          <button class="proposal-gen-btn" type="button" data-trigger-proposal="${lead.id}">⚡ Instant Proposal</button>
        `;
      }

      header.innerHTML = `
        <div>
          <span class="contact-avatar">${lead.initials}</span>
          <div>
            <b>${lead.name} <small>(${lead.email} · ${lead.phone})</small></b>
            <small>${lead.company} · Target Vertical: <strong>${lead.verticalName}</strong></small>
          </div>
        </div>
        <div class="lead-status-control">
          <small>STATUS:</small>
          ${statusControlsHTML}
        </div>
      `;

      $$('[data-set-status]', header).forEach(btn => {
        btn.addEventListener('click', () => {
          const newStatus = btn.dataset.setStatus;
          lead.status = newStatus;
          if (isBooking) {
            saveStatusToBooking(lead.id, newStatus);
            lead.aiSuggestedAction = newStatus === 'NEW' ? 'Review booking slot & click Confirm Booking.' : newStatus === 'CONFIRMED' ? 'Move appointment to IN SERVICE once vehicle arrives.' : newStatus === 'IN_SERVICE' ? 'Complete service and log vehicle maintenance history.' : 'Service successfully completed.';
          }
          saveLeadStoreToLocalStorage();
          renderLeadInbox();
          renderLeadDetail(lead.id);
          renderCustomers();
          renderWeek();
          renderKanban();
          updateKPIs();
        });
      });

      $$('[data-trigger-proposal]', header).forEach(btn => {
        btn.addEventListener('click', () => {
          const leadId = btn.dataset.triggerProposal;
          const targetLead = leadStore.find(l => l.id === leadId) || lead;
          setProposalModal(true, targetLead);
        });
      });
    }

    if (thread) {
      let bookingHTML = '';
      if (lead.autoBooking) {
        bookingHTML = `
          <div class="hc-load-card" style="border-color: rgba(90, 200, 250, 0.4); background: linear-gradient(135deg, rgba(90, 200, 250, 0.05), rgba(124, 92, 255, 0.05));">
            <div class="hc-load-card-head">
              <b>🚗 APEX AUTO CARE · INSTANT BOOKING ESTIMATE</b>
              <span>STATUS: ${lead.status}</span>
            </div>
            <div class="hc-load-details">
              <div><b>Vehicle:</b> ${lead.autoBooking.vehicle}</div>
              <div><b>Service:</b> ${lead.autoBooking.serviceName}</div>
              <div><b>Duration:</b> ${lead.autoBooking.duration}</div>
              <div><b>Price Estimate:</b> ${lead.autoBooking.costRange}</div>
              <div><b>Assigned Bay:</b> ${lead.autoBooking.bay}</div>
              <div><b>Available Slot:</b> ${lead.autoBooking.slot}</div>
            </div>
            <div class="hc-driver-match" style="margin-top:8px;">
              <small><strong>Service Summary:</strong> ${lead.autoBooking.summary}</small>
            </div>
          </div>
        `;
      }

      thread.innerHTML = `
        <div class="message customer">
          <small style="display:block;color:#64748B;font-size:7px;margin-bottom:3px;">INCOMING INQUIRY (${lead.timestamp})</small>
          <p style="margin:0;">${lead.message}</p>
        </div>
        ${bookingHTML}
        <div class="message ai">
          <small>✦ Hermes Front-Door AI Brain [Confidence: ${lead.confidence} · Priority: ${lead.priority}]</small>
          <p style="margin:0 0 4px;">Intent classified for <strong>${lead.verticalName}</strong>.</p>
          <p style="margin:0;"><em>Automated Next Step:</em> ${lead.aiSuggestedAction}</p>
        </div>
      `;
    }

    if (suggested) {
      suggested.innerHTML = `
        <span>✦</span>
        <div>
          <b>Hermes AI Next Action</b>
          <small>${lead.aiSuggestedAction}</small>
        </div>
        <button type="button" data-approve-action>Approve & Record</button>
      `;
      $('[data-approve-action]', suggested)?.addEventListener('click', () => {
        const nextStatus = isBooking ? 'CONFIRMED' : 'PROPOSAL_READY';
        lead.status = nextStatus;
        if (isBooking) {
          saveStatusToBooking(lead.id, nextStatus);
          lead.aiSuggestedAction = 'Move appointment to IN SERVICE once vehicle arrives.';
        }
        saveLeadStoreToLocalStorage();
        renderLeadInbox();
        renderLeadDetail(lead.id);
        renderCustomers();
        renderWeek();
        renderKanban();
        updateKPIs();
      });
    }
  }

  // Filter chips in Command Center Inbox
  $$('[data-status-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('[data-status-filter]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeStatusFilter = chip.dataset.statusFilter;
      renderLeadInbox();
    });
  });

  // Lead Intake Modal Management
  function setLeadModal(open) {
    const modal = $('[data-lead-modal]');
    if (!modal) return;
    modal.classList.toggle('open', open);
    modal.setAttribute('aria-hidden', String(!open));
    if (open) {
      updateModalPreview();
    }
  }

  function updateModalPreview() {
    const verticalSelect = $('[data-lead-vertical-select]');
    const messageInput = $('[data-lead-message-input]');
    const vehicleInput = $('[data-vehicle-input]');
    const autoServiceSelect = $('[data-auto-service-select]');
    const autoPanel = $('[data-auto-booking-panel]');
    const autoEstimateCard = $('[data-auto-estimate-card]');
    const aiPreview = $('[data-ai-intent-preview]');

    const verticalKey = verticalSelect?.value || 'auto';
    const messageText = messageInput?.value || '';

    // Show Apex Auto Panel when vertical is auto or message mentions auto repair
    const isAuto = verticalKey === 'auto' || /brake|rotor|oil|repair|vehicle|car|ford|diagnostic/i.test(messageText);
    if (autoPanel) {
      autoPanel.style.display = isAuto ? 'grid' : 'none';
    }

    if (isAuto && autoEstimateCard) {
      const estimate = getApexEstimate(autoServiceSelect?.value || 'brakes', vehicleInput?.value || '2022 Ford F-150');
      autoEstimateCard.innerHTML = `
        <div class="estimate-stat">
          <span>Est. Duration</span>
          <b>${estimate.duration}</b>
          <small>Standard Bay Time</small>
        </div>
        <div class="estimate-stat">
          <span>Cost Range</span>
          <b>${estimate.costRange}</b>
          <small>Parts + Labor</small>
        </div>
        <div class="estimate-stat">
          <span>Recommended Bay</span>
          <b>${estimate.bay}</b>
          <small>Certified Tech</small>
        </div>
        <div class="estimate-stat">
          <span>Next Slot</span>
          <b>${estimate.slot}</b>
          <small>Instant Reservation</small>
        </div>
      `;
    }

    // Process with window.HermesAIBrain
    if (aiPreview) {
      let brainResult = null;
      if (window.HermesAIBrain && typeof window.HermesAIBrain.classifyIntent === 'function') {
        brainResult = window.HermesAIBrain.classifyIntent(messageText || 'Inquiry', verticalKey);
      }

      const confPct = brainResult ? Math.round(brainResult.confidence * 100) : 92;
      const priority = confPct >= 90 ? 'HIGH' : (confPct >= 75 ? 'MEDIUM' : 'NORMAL');
      const priorityClass = priority.toLowerCase();
      const actionText = brainResult ? brainResult.actionText : 'Routing inquiry to workspace intake pipeline.';

      aiPreview.innerHTML = `
        <div class="ai-intent-info">
          <b>✦ HERMES AI FRONT-DOOR INTENT CLASSIFICATION</b>
          <p>${actionText}</p>
        </div>
        <div class="ai-badges">
          <span class="confidence-chip">${confPct}% Confidence</span>
          <span class="priority-pill ${priorityClass}">${priority} PRIORITY</span>
        </div>
      `;
    }
  }

  // Bind live form listeners
  $('[data-lead-vertical-select]')?.addEventListener('change', updateModalPreview);
  $('[data-lead-message-input]')?.addEventListener('input', updateModalPreview);
  $('[data-vehicle-input]')?.addEventListener('input', updateModalPreview);
  $('[data-auto-service-select]')?.addEventListener('change', updateModalPreview);

  // CTA Click handlers
  $$('[data-request-access]').forEach(btn => btn.addEventListener('click', () => {
    setLeadModal(true);
  }));

  $$('[data-open-lead-modal]').forEach(btn => btn.addEventListener('click', () => {
    setLeadModal(true);
  }));

  $$('[data-demo-tour]').forEach(btn => btn.addEventListener('click', () => {
    const msgInput = $('[data-lead-message-input]');
    if (msgInput) msgInput.value = 'Requesting interactive 5-minute product tour for Hermes Connect AI platform.';
    setLeadModal(true);
  }));

  $$('[data-modal-close]').forEach(btn => btn.addEventListener('click', () => {
    setLeadModal(false);
  }));

  // Submit Lead Form
  $('[data-lead-intake-form]')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim() || '(555) 234-5678';
    const company = form.company.value.trim() || 'Direct Client';
    const verticalKey = form.vertical.value;
    const message = form.message.value.trim();

    if (!name || !email || !message) return;

    let brainResult = null;
    if (window.HermesAIBrain && typeof window.HermesAIBrain.classifyIntent === 'function') {
      brainResult = window.HermesAIBrain.classifyIntent(message, verticalKey);
    }

    const confNum = brainResult ? brainResult.confidence : 0.92;
    const confPct = Math.round(confNum * 100) + '%';
    const priority = confNum >= 0.90 ? 'HIGH' : (confNum >= 0.75 ? 'MEDIUM' : 'NORMAL');

    const verticalNames = {
      auto: 'Apex Auto Care',
      beauty: 'Aurelia Studio',
      logistics: 'Hermes Logistics Ops',
      fitness: 'Northline Performance',
      agency: 'Progresso Growth Lab',
      realestate: 'Meridian Property Group'
    };

    const autoBookingData = verticalKey === 'auto' ? getApexEstimate(form.autoService?.value || 'brakes', form.vehicle?.value || '2022 Ford F-150') : null;

    const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'LD';

    const newLead = {
      id: 'lead-' + Date.now(),
      name,
      email,
      phone,
      company,
      initials,
      verticalKey,
      verticalName: verticalNames[verticalKey] || 'Hermes Workspace',
      message,
      status: 'NEW',
      confidenceNum: confNum,
      confidence: confPct,
      priority,
      timestamp: 'Just now',
      autoBooking: autoBookingData,
      aiSuggestedAction: brainResult ? brainResult.actionText : 'Direct lead captured & queued for Command Center processing.'
    };

    leadStore.unshift(newLead);
    saveLeadStoreToLocalStorage();
    selectedLeadId = newLead.id;

    // Update KPI counters
    const leadsKpi = $('[data-kpi="leads"]');
    if (leadsKpi) {
      const current = parseInt(leadsKpi.textContent, 10) || 18;
      leadsKpi.textContent = String(current + 1);
    }

    setLeadModal(false);
    setView('inbox');
    renderLeadInbox();
    renderLeadDetail(newLead.id);
  });

  // Role & Language Switchers
  $('[data-role-select]')?.addEventListener('change', (e) => {
    const role = e.target.value;
    const title = $('[data-view-title]');
    if (title) title.textContent = `Good morning, Vladimir. (${role.toUpperCase()} View)`;
  });

  $('[data-lang-select]')?.addEventListener('change', (e) => {
    const lang = e.target.value;
    const titleMap = {
      en: 'Good morning, Vladimir.',
      uk: 'Доброго ранку, Володимир.',
      ru: 'Доброе утро, Владимир.',
      es: 'Buenos días, Vladimir.',
      it: 'Buongiorno, Vladimir.',
      fr: 'Bonjour, Vladimir.'
    };
    if (titleMap[lang]) {
      $('[data-view-title]').textContent = titleMap[lang];
    }
  });

  const hermesForm = $('[data-hermes-form]');
  hermesForm?.addEventListener('submit', event => {
    event.preventDefault();
    const textarea = $('textarea', hermesForm);
    const question = textarea.value.trim();
    if (!question) return;
    const thread = $('[data-hermes-thread]');
    const user = document.createElement('div');
    user.className = 'user-message';
    user.textContent = question;
    
    let brainResult = null;
    if (window.HermesAIBrain && typeof window.HermesAIBrain.classifyIntent === 'function') {
      brainResult = window.HermesAIBrain.classifyIntent(question, currentVertical);
    }

    const answer = document.createElement('div');
    answer.className = 'hermes-message';
    if (brainResult) {
      answer.innerHTML = `<small>✦ Hermes Front-Door Brain [Match: ${(brainResult.confidence * 100).toFixed(0)}%]</small>
        <p><strong>Vertical:</strong> ${brainResult.verticalLabel} | <strong>Intent:</strong> ${brainResult.intent}</p>
        <p>${brainResult.recommendation}</p>
        <p><em>Suggested Action:</em> ${brainResult.actionText}</p>`;
    } else {
      answer.innerHTML = `<small>✦ Hermes</small><p>I would combine ${verticals[currentVertical].label.toLowerCase()} context with Inbox, CRM, Calendar, Sales, Finance and Operations, then show the recommended action, expected impact and what evidence I used.</p>`;
    }

    thread.append(user, answer);
    textarea.value = '';
    thread.scrollTop = thread.scrollHeight;
  });

  $$('.quick-prompts button').forEach(button => button.addEventListener('click', () => {
    const textarea = $('[data-hermes-form] textarea');
    textarea.value = button.textContent;
    textarea.focus();
  }));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setDrawer(false);
  });

  // ==========================================
  // MODULE 1: B2B Load Analyzer & AI Rate Negotiator
  // ==========================================
  const LOAD_PRESETS = {
    chicago: { miles: 850, rate: 2200, fuel: 3.85, mpg: 6.5, driver: 0.65, tolls: 150, targetMargin: 20 },
    milwaukee: { miles: 780, rate: 2100, fuel: 3.90, mpg: 6.2, driver: 0.68, tolls: 120, targetMargin: 22 },
    indy: { miles: 1150, rate: 3200, fuel: 3.80, mpg: 6.6, driver: 0.65, tolls: 180, targetMargin: 20 },
    email: { miles: 1020, rate: 2450, fuel: 3.85, mpg: 6.4, driver: 0.65, tolls: 160, targetMargin: 20 }
  };

  function initLoadAnalyzer() {
    const panel = $('[data-load-analyzer-panel]');
    if (!panel) return;

    const milesInput = $('[data-la-input="miles"]');
    const rateInput = $('[data-la-input="rate"]');
    const fuelInput = $('[data-la-input="fuel"]');
    const mpgInput = $('[data-la-input="mpg"]');
    const driverInput = $('[data-la-input="driver"]');
    const tollsInput = $('[data-la-input="tolls"]');
    const marginInput = $('[data-la-input="targetMargin"]');
    const strategySelect = $('[data-la-strategy]');
    const counterMsg = $('[data-la-counter-msg]');

    function recalculate() {
      const miles = parseFloat(milesInput?.value) || 1;
      const rate = parseFloat(rateInput?.value) || 0;
      const fuel = parseFloat(fuelInput?.value) || 0;
      const mpg = parseFloat(mpgInput?.value) || 1;
      const driver = parseFloat(driverInput?.value) || 0;
      const tolls = parseFloat(tollsInput?.value) || 0;
      const targetMargin = parseFloat(marginInput?.value) || 20;

      const offeredRpm = rate / miles;
      const fuelCost = (miles / mpg) * fuel;
      const driverPay = miles * driver;
      const totalCost = fuelCost + driverPay + tolls;
      const netProfit = rate - totalCost;
      const marginPct = rate > 0 ? (netProfit / rate) * 100 : 0;
      const targetRate = totalCost / (1 - (targetMargin / 100));
      const targetRpm = targetRate / miles;

      // Update UI outputs
      const offeredRpmEl = $('[data-la-out="offeredRpm"]');
      const rpmStatusEl = $('[data-la-out="rpmStatus"]');
      const fuelCostEl = $('[data-la-out="fuelCost"]');
      const driverPayEl = $('[data-la-out="driverPay"]');
      const netProfitEl = $('[data-la-out="netProfit"]');
      const marginPctEl = $('[data-la-out="marginPct"]');
      const targetRateEl = $('[data-la-out="targetRate"]');
      const targetRpmEl = $('[data-la-out="targetRpm"]');

      if (offeredRpmEl) offeredRpmEl.textContent = `$${offeredRpm.toFixed(2)}/mi`;
      if (fuelCostEl) fuelCostEl.textContent = `$${fuelCost.toFixed(2)}`;
      if (driverPayEl) driverPayEl.textContent = `$${driverPay.toFixed(2)}`;
      if (netProfitEl) netProfitEl.textContent = `$${netProfit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      if (marginPctEl) marginPctEl.textContent = `Margin: ${marginPct.toFixed(1)}%`;
      if (targetRateEl) targetRateEl.textContent = `$${Math.ceil(targetRate).toLocaleString('en-US')}.00`;
      if (targetRpmEl) targetRpmEl.textContent = `$${targetRpm.toFixed(2)}/mi required`;

      if (rpmStatusEl) {
        if (marginPct >= targetMargin) {
          rpmStatusEl.textContent = '✓ Margin Target Met';
          rpmStatusEl.className = 'positive';
          rpmStatusEl.style.color = '#16A34A';
        } else {
          rpmStatusEl.textContent = `Below ${targetMargin}% Margin Target`;
          rpmStatusEl.className = 'warning';
          rpmStatusEl.style.color = '#DC2626';
        }
      }

      // Generate Counter Offer Message
      const strategy = strategySelect?.value || 'operating';
      let message = '';
      if (strategy === 'scarcity') {
        message = `Attention Dispatch,\n\nWe have a staged team driver within 12 miles of origin for this ${miles}-mile lane. To secure immediate dispatch today, our target counter rate is $${Math.ceil(targetRate).toLocaleString()} ($${targetRpm.toFixed(2)}/mi vs offered $${offeredRpm.toFixed(2)}/mi). Please update rate confirmation to lock in dispatch.`;
      } else if (strategy === 'firm') {
        message = `Broker Dispatch Team,\n\nRe: ${miles}-mile load offer of $${rate.toLocaleString()} ($${offeredRpm.toFixed(2)}/mi). This rate falls below our floor carrier margin. Our firm floor counter for this lane is $${Math.ceil(targetRate).toLocaleString()} ($${targetRpm.toFixed(2)}/mi). Let us know if rate sheet can be revised by 2:00 PM.`;
      } else {
        message = `Hello Broker Team,\n\nThank you for the $${rate.toLocaleString()} offer on this ${miles}-mile load ($${offeredRpm.toFixed(2)}/mi). Based on current diesel overhead ($${fuel.toFixed(2)}/gal) and driver operating costs ($${totalCost.toFixed(2)} total trip cost), our minimum rate to maintain target margin is $${Math.ceil(targetRate).toLocaleString()} ($${targetRpm.toFixed(2)}/mi).\n\nWe have equipment staged and ready for immediate dispatch if we can lock in $${Math.ceil(targetRate).toLocaleString()}.\n\nBest regards,\nHermes Logistics Ops Team`;
      }

      if (counterMsg) counterMsg.value = message;
    }

    // Attach input listeners
    $$('[data-la-input]', panel).forEach(input => input.addEventListener('input', recalculate));
    strategySelect?.addEventListener('change', recalculate);

    // Preset buttons
    $$('[data-load-preset]', panel).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-load-preset]', panel).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.dataset.loadPreset;
        const preset = LOAD_PRESETS[key] || LOAD_PRESETS.chicago;

        if (key === 'email' && window.HermesEmailLoadParser && HermesEmailLoadParser.SAMPLE_EMAILS) {
          const sample = HermesEmailLoadParser.SAMPLE_EMAILS[0];
          const parsed = HermesEmailLoadParser.parseEmail(sample);
          if (parsed && parsed.miles && parsed.rate) {
            preset.miles = parsed.miles;
            preset.rate = parsed.rate;
          }
        }

        if (milesInput) milesInput.value = preset.miles;
        if (rateInput) rateInput.value = preset.rate;
        if (fuelInput) fuelInput.value = preset.fuel;
        if (mpgInput) mpgInput.value = preset.mpg;
        if (driverInput) driverInput.value = preset.driver;
        if (tollsInput) tollsInput.value = preset.tolls;
        if (marginInput) marginInput.value = preset.targetMargin;

        recalculate();
      });
    });

    // Copy & Send buttons
    $('[data-la-copy-btn]', panel)?.addEventListener('click', () => {
      if (counterMsg) {
        navigator.clipboard?.writeText(counterMsg.value);
        const btn = $('[data-la-copy-btn]', panel);
        const orig = btn.textContent;
        btn.textContent = '✓ Copied to Clipboard!';
        setTimeout(() => btn.textContent = orig, 1500);
      }
    });

    $('[data-la-send-btn]', panel)?.addEventListener('click', () => {
      const btn = $('[data-la-send-btn]', panel);
      const orig = btn.textContent;
      btn.textContent = '✦ Counter Offer Prepared ✓';
      setTimeout(() => btn.textContent = orig, 1800);

      // Add to ops queue
      ops.unshift([
        '✦',
        'B2B Rate Counter-Offer Prepared',
        `Counter rate: ${$('[data-la-out="targetRate"]')?.textContent || '$2,450'}`,
        'Prepared'
      ]);
      renderOps();
    });

    recalculate();
  }

  // ==========================================
  // MODULE 2: Instant Proposal Generator Modal
  // ==========================================
  let currentProposalLead = null;
  let selectedBilling = 'monthly';
  let selectedTierKey = 'pro';
  let proposalAddons = {
    custom_workflow: true,
    staff_onboarding: false,
    sla_support: false
  };

  const PROPOSAL_ADDON_DEFINITIONS = [
    { key: 'custom_workflow', name: 'Custom AI Agent Workflows & Webhooks Integration', type: 'One-Time', price: 450 },
    { key: 'staff_onboarding', name: 'Interactive Team & Staff Roleplay Onboarding', type: 'One-Time', price: 300 },
    { key: 'sla_support', name: '24/7 Priority SLA & Dedicated Account Manager', type: 'Monthly Recurring', price: 250 },
    { key: 'multi_location', name: 'Multi-Location / Franchise Workspace Sync', type: 'Monthly Recurring', price: 500 }
  ];

  const TIER_PRICES = {
    starter: { name: 'Starter', monthly: 99, annual: 79 },
    pro: { name: 'Professional', monthly: 299, annual: 249 },
    enterprise: { name: 'Enterprise', monthly: 799, annual: 699 }
  };

  function setProposalModal(open, lead = null) {
    const modal = $('[data-proposal-modal]');
    if (!modal) return;
    if (lead) currentProposalLead = lead;
    if (!currentProposalLead && leadStore.length > 0) currentProposalLead = leadStore[0];

    modal.classList.toggle('open', open);
    modal.setAttribute('aria-hidden', String(!open));

    if (open) {
      renderProposalModal();
    }
  }

  function renderProposalModal() {
    const lead = currentProposalLead || {
      name: 'Client Partner',
      email: 'client@company.com',
      company: 'Enterprise Partner',
      verticalName: 'Business Operations'
    };

    // Client Banner
    const banner = $('[data-proposal-client-banner]');
    if (banner) {
      banner.innerHTML = `
        <div>
          <b>Prepared for: ${lead.name} (${lead.company || 'Business Partner'})</b>
          <small>Target Industry: ${lead.verticalName || 'Hermes AI OS'} · Email: ${lead.email}</small>
        </div>
        <span class="active-chip">● Live Draft</span>
      `;
    }

    // Billing toggle
    $$('[data-billing]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.billing === selectedBilling);
    });

    // Update tier prices displayed
    $('[data-price-starter]').textContent = selectedBilling === 'annual' ? '$79' : '$99';
    $('[data-price-pro]').textContent = selectedBilling === 'annual' ? '$249' : '$299';
    $('[data-price-enterprise]').textContent = selectedBilling === 'annual' ? '$699' : '$799';

    // Tier Cards Active state
    $$('[data-tier]').forEach(card => {
      const isSelected = card.dataset.tier === selectedTierKey;
      card.classList.toggle('active', isSelected);
      const btn = $('button', card);
      if (btn) {
        btn.textContent = isSelected ? 'Selected ✓' : 'Select Tier';
        btn.className = isSelected ? 'tier-select-btn primary' : 'tier-select-btn';
      }
    });

    // Add-ons table body
    const tableBody = $('[data-proposal-items-body]');
    if (tableBody) {
      tableBody.innerHTML = PROPOSAL_ADDON_DEFINITIONS.map(addon => {
        const isChecked = !!proposalAddons[addon.key];
        return `
          <tr>
            <td><input type="checkbox" data-addon-key="${addon.key}" ${isChecked ? 'checked' : ''}></td>
            <td><strong>${addon.name}</strong></td>
            <td><span class="active-chip" style="font-size:6px;">${addon.type}</span></td>
            <td><strong>$${addon.price}.00</strong></td>
          </tr>
        `;
      }).join('');

      $$('[data-addon-key]', tableBody).forEach(cb => {
        cb.addEventListener('change', (e) => {
          proposalAddons[e.target.dataset.addonKey] = e.target.checked;
          updateProposalSummary();
        });
      });
    }

    updateProposalSummary();
  }

  function updateProposalSummary() {
    const tierData = TIER_PRICES[selectedTierKey] || TIER_PRICES.pro;
    const tierPrice = selectedBilling === 'annual' ? tierData.annual : tierData.monthly;

    let addonsPrice = 0;
    PROPOSAL_ADDON_DEFINITIONS.forEach(addon => {
      if (proposalAddons[addon.key]) {
        addonsPrice += addon.price;
      }
    });

    const totalPrice = tierPrice + addonsPrice;

    const tierNameEl = $('[data-summary-tier-name]');
    const tierPriceEl = $('[data-summary-tier-price]');
    const addonsPriceEl = $('[data-summary-addons-price]');
    const totalPriceEl = $('[data-summary-total-price]');

    if (tierNameEl) tierNameEl.textContent = tierData.name;
    if (tierPriceEl) tierPriceEl.textContent = `$${tierPrice}.00/mo (${selectedBilling})`;
    if (addonsPriceEl) addonsPriceEl.textContent = `$${addonsPrice}.00`;
    if (totalPriceEl) totalPriceEl.textContent = `$${totalPrice.toLocaleString()}.00`;
  }

  function initProposalGenerator() {
    $('[data-proposal-close]')?.addEventListener('click', () => setProposalModal(false));

    $$('[data-billing]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedBilling = btn.dataset.billing;
        renderProposalModal();
      });
    });

    $$('[data-select-tier]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedTierKey = btn.dataset.selectTier;
        renderProposalModal();
      });
    });

    $('[data-export-html-btn]')?.addEventListener('click', () => {
      const lead = currentProposalLead || { name: 'Client' };
      const tierData = TIER_PRICES[selectedTierKey];
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Hermes Connect Business Proposal - ${lead.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0B0D12; color: #F7F6F3; padding: 40px; margin: 0; }
    .card { max-width: 700px; margin: 0 auto; background: #131722; border: 1px solid #7C5CFF; border-radius: 20px; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
    h1 { color: #5AC8FA; font-size: 24px; margin-top: 0; }
    .badge { background: #7C5CFF; color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th { text-align: left; padding: 10px; background: #1E2433; color: #A995FF; }
    td { padding: 10px; border-bottom: 1px solid #232A3B; }
    .total-box { background: #0B0D12; border-radius: 12px; padding: 16px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">✦ HERMES CONNECT AI OS PROPOSAL</span>
    <h1>Custom Business Automation Proposal</h1>
    <p><strong>Prepared for:</strong> ${lead.name} (${lead.email})</p>
    <p><strong>Company / Vertical:</strong> ${lead.company || 'Business Partner'} · ${lead.verticalName || 'Operations'}</p>
    <hr style="border-color:#232A3B; margin: 20px 0;">
    <h3>Selected Subscription Tier: ${tierData.name} ($${selectedBilling === 'annual' ? tierData.annual : tierData.monthly}/mo)</h3>
    <table>
      <thead><tr><th>Included Service / Implementation</th><th>Type</th><th>Price</th></tr></thead>
      <tbody>
        ${PROPOSAL_ADDON_DEFINITIONS.filter(a => proposalAddons[a.key]).map(a => `<tr><td>${a.name}</td><td>${a.type}</td><td>$${a.price}.00</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="total-box">
      <h2 style="margin:0; color:#5AC8FA;">Total First Month Investment: ${$('[data-summary-total-price]')?.textContent || ''}</h2>
      <p style="margin:6px 0 0; font-size:12px; color:#94A3B8;">Approved by Hermes Revenue Engine · Zero-dependency deployment ready.</p>
    </div>
  </div>
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Hermes_Proposal_${(lead.name || 'Client').replace(/\s+/g, '_')}.html`;
      a.click();
      URL.revokeObjectURL(url);
    });

    $('[data-export-pdf-btn]')?.addEventListener('click', () => {
      window.print();
    });

    $('[data-send-approval-btn]')?.addEventListener('click', () => {
      if (currentProposalLead) {
        currentProposalLead.status = 'PROPOSAL_READY';
        saveLeadStoreToLocalStorage();
        renderLeadInbox();
        renderLeadDetail(currentProposalLead.id);
      }
      setProposalModal(false);

      // Toast feedback
      const suggested = $('[data-inbox-suggested]');
      if (suggested) {
        suggested.innerHTML = `
          <span>✦</span>
          <div>
            <b>Proposal Generated & Recorded in Client Record</b>
            <small>Proposal generated & recorded in Command Center CRM.</small>
          </div>
          <span class="active-chip">PROPOSAL_READY</span>
        `;
      }
    });
  }

  // ==========================================
  // MODULE 3: Interactive ROI Calculator Widget
  // ==========================================
  const ROI_VERTICAL_PRESETS = {
    beauty: { leads: 50, ltv: 180, missed: 20, wage: 30 },
    auto: { leads: 70, ltv: 450, missed: 25, wage: 45 },
    logistics: { leads: 40, ltv: 2200, missed: 15, wage: 55 },
    fitness: { leads: 60, ltv: 250, missed: 30, wage: 25 },
    agency: { leads: 30, ltv: 1800, missed: 20, wage: 65 },
    realestate: { leads: 25, ltv: 3500, missed: 35, wage: 75 }
  };

  let currentRoiState = { ...ROI_VERTICAL_PRESETS.beauty, vertKey: 'beauty' };

  function setRoiModal(open) {
    const modal = $('[data-roi-modal]');
    if (!modal) return;
    modal.classList.toggle('open', open);
    modal.setAttribute('aria-hidden', String(!open));
    if (open) {
      calculateRoi();
    }
  }

  function calculateRoi() {
    const leads = currentRoiState.leads;
    const ltv = currentRoiState.ltv;
    const missed = currentRoiState.missed;
    const wage = currentRoiState.wage;

    // Formulas
    const manualMinsPerLead = 15;
    const weeklyHoursSaved = ((leads * 12 / 52) * (manualMinsPerLead / 60)).toFixed(1);
    const monthlyHoursSaved = ((leads * manualMinsPerLead) / 60).toFixed(1);
    const recoveredLeads = leads * (missed / 100) * 0.60;
    const monthlyRecovered = Math.round(recoveredLeads * ltv);
    const monthlyLaborSavings = Math.round(parseFloat(monthlyHoursSaved) * wage);
    const totalMonthlyValue = monthlyRecovered + monthlyLaborSavings;
    const hermesProCost = 799;
    const netRoi = totalMonthlyValue - hermesProCost;
    const roiMultiplier = (totalMonthlyValue / hermesProCost).toFixed(1);
    const annualBoost = Math.round(monthlyRecovered * 12);

    // Update Slider Value Displays
    $('[data-roi-val="leads"]').textContent = `${leads} leads/mo`;
    $('[data-roi-val="ltv"]').textContent = `$${ltv.toLocaleString()}`;
    $('[data-roi-val="missed"]').textContent = `${missed}%`;
    $('[data-roi-val="wage"]').textContent = `$${wage}/hr`;

    // Update Output Elements in Modal
    const weeklyHoursEl = $('[data-roi-out="weeklyHours"]');
    const monthlyHoursEl = $('[data-roi-out="monthlyHours"]');
    const monthlyRecoveredEl = $('[data-roi-out="monthlyRecovered"]');
    const netRoiEl = $('[data-roi-out="netRoi"]');
    const roiMultiplierEl = $('[data-roi-out="roiMultiplier"]');
    const annualBoostEl = $('[data-roi-out="annualBoost"]');

    if (weeklyHoursEl) weeklyHoursEl.textContent = `${weeklyHoursSaved} hrs/wk`;
    if (monthlyHoursEl) monthlyHoursEl.textContent = `${monthlyHoursSaved} hrs/mo automated`;
    if (monthlyRecoveredEl) monthlyRecoveredEl.textContent = `$${monthlyRecovered.toLocaleString()}`;
    if (netRoiEl) netRoiEl.textContent = `$${netRoi.toLocaleString()}/mo`;
    if (roiMultiplierEl) roiMultiplierEl.textContent = `${roiMultiplier}x ROI on Hermes Pro ($799)`;
    if (annualBoostEl) annualBoostEl.textContent = `$${annualBoost.toLocaleString()}/yr`;

    // Also update Embedded ROI Calculator in Sales View
    renderEmbeddedRoi(weeklyHoursSaved, monthlyRecovered, netRoi, roiMultiplier, annualBoost);
  }

  function renderEmbeddedRoi(weeklyHoursSaved, monthlyRecovered, netRoi, roiMultiplier, annualBoost) {
    const container = $('[data-embedded-roi-container]');
    if (!container) return;

    container.innerHTML = `
      <div class="roi-vertical-selector" style="margin-bottom:12px;">
        <small>SELECT INDUSTRY PRESET:</small>
        <div class="roi-vertical-chips" data-roi-embedded-chips>
          <button type="button" class="${currentRoiState.vertKey==='beauty'?'active':''}" data-roi-emb-vert="beauty">Beauty</button>
          <button type="button" class="${currentRoiState.vertKey==='auto'?'active':''}" data-roi-emb-vert="auto">Auto Repair</button>
          <button type="button" class="${currentRoiState.vertKey==='logistics'?'active':''}" data-roi-emb-vert="logistics">Logistics</button>
          <button type="button" class="${currentRoiState.vertKey==='fitness'?'active':''}" data-roi-emb-vert="fitness">Fitness</button>
          <button type="button" class="${currentRoiState.vertKey==='agency'?'active':''}" data-roi-emb-vert="agency">Agency</button>
          <button type="button" class="${currentRoiState.vertKey==='realestate'?'active':''}" data-roi-emb-vert="realestate">Real Estate</button>
        </div>
      </div>
      <div class="analyzer-metrics" style="grid-template-columns: repeat(4, 1fr);">
        <div class="metric-card">
          <span>Weekly Hours Saved</span>
          <strong>${weeklyHoursSaved} hrs/wk</strong>
          <small>Automated response</small>
        </div>
        <div class="metric-card">
          <span>Recovered Revenue</span>
          <strong style="color:#16A34A;">+$${monthlyRecovered.toLocaleString()}/mo</strong>
          <small>From missed leads</small>
        </div>
        <div class="metric-card highlight">
          <span>Est. Net ROI Ratio</span>
          <strong style="color:#7C5CFF;">${roiMultiplier}x Net Return</strong>
          <small>Net Gain: $${netRoi.toLocaleString()}/mo</small>
        </div>
        <div class="metric-card">
          <span>Annual Revenue Boost</span>
          <strong>+$${annualBoost.toLocaleString()}/yr</strong>
          <small>Top-line growth</small>
        </div>
      </div>
    `;

    $$('[data-roi-emb-vert]', container).forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.roiEmbVert;
        currentRoiState = { ...ROI_VERTICAL_PRESETS[key], vertKey: key };
        calculateRoi();
      });
    });
  }

  function initRoiCalculator() {
    // Open modal triggers
    $$('[data-open-roi-modal]').forEach(btn => btn.addEventListener('click', () => setRoiModal(true)));
    $('[data-roi-close]')?.addEventListener('click', () => setRoiModal(false));

    // Vertical chips
    $$('[data-roi-vert]').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-roi-vert]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.dataset.roiVert;
        currentRoiState = { ...ROI_VERTICAL_PRESETS[key], vertKey: key };

        // Sync slider positions
        const leadsSlider = $('[data-roi-slider="leads"]');
        const ltvSlider = $('[data-roi-slider="ltv"]');
        const missedSlider = $('[data-roi-slider="missed"]');
        const wageSlider = $('[data-roi-slider="wage"]');

        if (leadsSlider) leadsSlider.value = currentRoiState.leads;
        if (ltvSlider) ltvSlider.value = currentRoiState.ltv;
        if (missedSlider) missedSlider.value = currentRoiState.missed;
        if (wageSlider) wageSlider.value = currentRoiState.wage;

        calculateRoi();
      });
    });

    // Sliders
    const leadsSlider = $('[data-roi-slider="leads"]');
    const ltvSlider = $('[data-roi-slider="ltv"]');
    const missedSlider = $('[data-roi-slider="missed"]');
    const wageSlider = $('[data-roi-slider="wage"]');

    [leadsSlider, ltvSlider, missedSlider, wageSlider].forEach(slider => {
      slider?.addEventListener('input', () => {
        currentRoiState.leads = parseInt(leadsSlider?.value || 60, 10);
        currentRoiState.ltv = parseInt(ltvSlider?.value || 350, 10);
        currentRoiState.missed = parseInt(missedSlider?.value || 25, 10);
        currentRoiState.wage = parseInt(wageSlider?.value || 35, 10);
        calculateRoi();
      });
    });

    // Download HTML Summary
    $('[data-roi-export-btn]')?.addEventListener('click', () => {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Hermes Connect Business ROI Report</title>
  <style>
    body { font-family: sans-serif; background: #0B0D12; color: #fff; padding: 40px; }
    .card { max-width: 600px; margin: 0 auto; background: #131722; border: 1px solid #5AC8FA; border-radius: 20px; padding: 28px; }
    h1 { color: #5AC8FA; }
    .kpi { background: #1E2433; padding: 14px; border-radius: 12px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>✦ Hermes Connect Business ROI Analysis</h1>
    <p>Projected return for inbound automation and instant response:</p>
    <div class="kpi"><strong>Weekly Hours Saved:</strong> ${$('[data-roi-out="weeklyHours"]')?.textContent || ''}</div>
    <div class="kpi"><strong>Monthly Recovered Revenue:</strong> ${$('[data-roi-out="monthlyRecovered"]')?.textContent || ''}</div>
    <div class="kpi"><strong>Net ROI Ratio:</strong> ${$('[data-roi-out="roiMultiplier"]')?.textContent || ''}</div>
    <div class="kpi"><strong>Annual Boost:</strong> ${$('[data-roi-out="annualBoost"]')?.textContent || ''}</div>
  </div>
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Hermes_ROI_Analysis.html`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Attach ROI to Proposal
    $('[data-roi-attach-proposal-btn]')?.addEventListener('click', () => {
      setRoiModal(false);
      setProposalModal(true);
    });

    calculateRoi();
  }

  // Track DataLayer Telemetry Helper (Privacy-Safe, No PII)
  function trackConnectEvent(eventName, params = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params,
      timestamp: new Date().toISOString()
    });
  }

  // Onboarding Business Type Selector & Beta Feedback Loop
  function initOnboardingAndFeedback() {
    const onboardingModal = $('[data-onboarding-modal]');
    const feedbackWidget = $('[data-feedback-widget]');
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if business type is already selected in URL or localStorage via controlled context
    const hasControlledContext = urlParams.has('source_direction') && urlParams.has('business_type') && urlParams.has('business_subtype') && urlParams.has('module');
    const storedType = localStorage.getItem('hermes_business_type');
    
    if (!storedType && !hasControlledContext && onboardingModal) {
      // Show Onboarding Modal
      onboardingModal.classList.add('open');
      onboardingModal.setAttribute('aria-hidden', 'false');
    }
    
    // Onboarding Cards selection click listeners
    const typeCards = $$('.business-type-card');
    let selectedType = storedType || 'logistics';
    
    // If a type is stored, ensure its card is selected inside the modal
    if (storedType) {
      typeCards.forEach(card => {
        const type = card.getAttribute('data-onboarding-type');
        card.classList.toggle('active', type === storedType);
      });
    }
    
    typeCards.forEach(card => {
      card.addEventListener('click', () => {
        typeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedType = card.getAttribute('data-onboarding-type');
      });
    });
    
    // Launch Workspace listener
    const launchBtn = $('[data-launch-workspace-btn]');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        // Save choice
        localStorage.setItem('hermes_business_type', selectedType);
        
        // Map types to workspace verticals
        const verticalMap = {
          logistics: 'logistics',
          auto_repair: 'auto',
          agency: 'agency',
          beauty: 'beauty',
          fitness: 'fitness',
          real_estate: 'realestate',
          professional_services: 'agency',
          other: 'logistics'
        };
        
        const targetVertical = verticalMap[selectedType] || 'logistics';
        
        // Track completed onboarding in dataLayer (privacy-safe telemetry)
        trackConnectEvent('connect_onboarding_completed', {
          business_type: selectedType,
          mapped_vertical: targetVertical
        });
        
        // Apply vertical setting
        const switcherBtn = document.querySelector(`[data-vertical="${targetVertical}"]`);
        if (switcherBtn) {
          switcherBtn.click();
        } else {
          setVertical(targetVertical);
        }
        
        // Show success toast notification
        const msg = `✨ Workspace configured for ${selectedType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}!`;
        const container = $('.hermes-toast-container') || document.createElement('div');
        if (!container.parentElement) {
          container.className = 'hermes-toast-container';
          document.body.appendChild(container);
        }
        const item = document.createElement('div');
        item.className = 'hermes-toast';
        item.innerHTML = `<span>✦</span><p>${msg}</p>`;
        container.appendChild(item);
        setTimeout(() => {
          item.classList.add('fade-out');
          setTimeout(() => item.remove(), 400);
        }, 4000);
        
        // Close modal
        if (onboardingModal) {
          onboardingModal.classList.remove('open');
          onboardingModal.setAttribute('aria-hidden', 'true');
        }
      });
    }
    
    // Beta Feedback Widget logic
    const feedbackYes = $('[data-feedback-btn="yes"]');
    const feedbackNo = $('[data-feedback-btn="no"]');
    const questionRow = $('[data-feedback-question]');
    const thanksMsg = $('[data-feedback-thanks]');
    
    // Hide feedback widget if feedback has already been submitted in this session
    if (localStorage.getItem('hermes_beta_feedback_submitted') === 'true' && feedbackWidget) {
      feedbackWidget.classList.add('hidden');
    }
    
    const handleFeedback = (isUseful) => {
      localStorage.setItem('hermes_beta_feedback_submitted', 'true');
      localStorage.setItem('hermes_beta_feedback_useful', String(isUseful));
      
      // Track event in analytics dataLayer
      trackConnectEvent('connect_beta_feedback', {
        useful: isUseful,
        active_vertical: currentVertical
      });
      
      // Switch UI to thank you message
      if (questionRow && thanksMsg) {
        questionRow.style.display = 'none';
        thanksMsg.style.display = 'block';
      }
      
      // Auto-slide out feedback widget after 4 seconds
      setTimeout(() => {
        if (feedbackWidget) {
          feedbackWidget.classList.add('hidden');
        }
      }, 4000);
    };
    
    if (feedbackYes) feedbackYes.addEventListener('click', () => handleFeedback(true));
    if (feedbackNo) feedbackNo.addEventListener('click', () => handleFeedback(false));
  }

  // Handle URL Deep-Linking State (?tool= or ?module=)
  function handleDeepLinkState() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const targetTool = urlParams.get('tool') || urlParams.get('module') || urlParams.get('tab');
      const businessType = urlParams.get('business_type') || localStorage.getItem('hermes_business_type') || 'logistics';

      trackConnectEvent('connect_workspace_open', {
        source_page: document.referrer || 'direct',
        deep_link_tool: targetTool || 'home',
        business_type: businessType
      });

      if (targetTool) {
        if (targetTool === 'load-analyzer' || targetTool === 'load_analyzer') {
          setView('operations');
          trackConnectEvent('connect_load_analyzer_open', { business_type: businessType });
        } else if (targetTool === 'rate-negotiator' || targetTool === 'rate_negotiator') {
          setView('operations');
          trackConnectEvent('connect_rate_negotiator_open', { business_type: businessType });
        } else if (targetTool === 'proposal-builder' || targetTool === 'proposal_builder') {
          setProposalModal(true);
          trackConnectEvent('connect_proposal_open', { business_type: businessType });
        } else if (targetTool === 'roi-calculator' || targetTool === 'roi_calculator') {
          setRoiModal(true);
          trackConnectEvent('connect_roi_open', { business_type: businessType });
        } else if (targetTool === 'inbox' || targetTool === 'unified-inbox') {
          setView('inbox');
          trackConnectEvent('connect_inbox_open', { business_type: businessType });
        } else if (viewMeta[targetTool]) {
          setView(targetTool);
          trackConnectEvent('connect_module_open', { module: targetTool, business_type: businessType });
        }
      }
    } catch (e) {
      console.warn('Deep link parsing safely handled:', e);
    }
  }

  function showToast(msg) {
    const container = $('.hermes-toast-container') || document.createElement('div');
    if (!container.parentElement) {
      container.className = 'hermes-toast-container';
      document.body.appendChild(container);
    }
    const item = document.createElement('div');
    item.className = 'hermes-toast';
    item.innerHTML = `<span>✦</span><p>${msg}</p>`;
    container.appendChild(item);
    setTimeout(() => {
      item.classList.add('fade-out');
      setTimeout(() => item.remove(), 400);
    }, 4000);
  }

  function updateLifecycleTracker(status) {
    const steps = ['REGISTERED', 'OFFER_DRAFT', 'OFFER_SUBMITTED', 'UNDER_REVIEW', 'APPROVED_PARTNER'];
    const statusIndex = steps.indexOf(status);
    
    steps.forEach((step, index) => {
      const stepEl = $(`.lifecycle-step[data-step="${step}"]`);
      const dotEl = stepEl?.querySelector('.step-dot');
      const textEl = stepEl?.querySelector('b');
      const lineEl = $(`[data-line="${step}"]`);
      
      if (!stepEl) return;
      
      if (index < statusIndex) {
        // Completed steps
        if (dotEl) {
          dotEl.style.background = 'var(--mint)';
          dotEl.style.boxShadow = '0 0 0 2px var(--mint)';
        }
        if (textEl) textEl.style.color = '#15803d'; // Green
        if (lineEl) lineEl.style.background = 'var(--mint)';
      } else if (index === statusIndex) {
        // Current active step
        if (dotEl) {
          if (status === 'APPROVED_PARTNER') {
            dotEl.style.background = 'var(--mint)';
            dotEl.style.boxShadow = '0 0 12px 4px rgba(127,209,182,0.4)';
          } else if (status === 'UNDER_REVIEW') {
            dotEl.style.background = 'var(--amber)';
            dotEl.style.boxShadow = '0 0 12px 4px rgba(217,154,61,0.4)';
          } else {
            dotEl.style.background = 'var(--violet)';
            dotEl.style.boxShadow = '0 0 12px 4px rgba(124,92,255,0.4)';
          }
        }
        if (textEl) {
          textEl.style.color = 'var(--ink)';
          textEl.style.fontWeight = '800';
        }
        if (lineEl) lineEl.style.background = 'var(--line)';
      } else {
        // Pending steps
        if (dotEl) {
          dotEl.style.background = '#AFB2BA';
          dotEl.style.boxShadow = '0 0 0 2px #AFB2BA';
        }
        if (textEl) {
          textEl.style.color = 'var(--muted-2)';
          textEl.style.fontWeight = 'normal';
        }
        if (lineEl) lineEl.style.background = 'var(--line)';
      }
    });
  }

  function initCorporateOfferWorkflow() {
    const form = $('#corporate-offer-form');
    if (!form) return;

    const saveDraftBtn = $('#save-offer-draft');
    const submitBtn = $('#submit-corporate-offer');

    // Load from local storage if exists
    let savedState = null;
    try {
      savedState = JSON.parse(localStorage.getItem('hermes_corporate_offer_state'));
    } catch(e) {}

    if (savedState) {
      $('#offer-discount').value = savedState.discount || '10';
      if ($('#offer-terms')) $('#offer-terms').value = savedState.terms || 'Net 30';
      if ($('#offer-radius')) $('#offer-radius').value = savedState.radius || '50';
      
      const equipmentCheckboxes = $$('input[name="equipment"]');
      equipmentCheckboxes.forEach(cb => {
        cb.checked = (savedState.equipment || []).includes(cb.value);
      });
      
      updateLifecycleTracker(savedState.status || 'REGISTERED');
    }

    // Save draft handler
    saveDraftBtn?.addEventListener('click', () => {
      const discount = $('#offer-discount').value;
      const terms = $('#offer-terms')?.value || 'Net 30';
      const radius = $('#offer-radius')?.value || '50';
      const equipment = $$('input[name="equipment"]:checked').map(cb => cb.value);

      const newState = {
        status: 'OFFER_DRAFT',
        discount,
        terms,
        radius,
        equipment
      };

      localStorage.setItem('hermes_corporate_offer_state', JSON.stringify(newState));
      updateLifecycleTracker('OFFER_DRAFT');
      showToast('✨ Simulated Corporate Offer saved as Draft.');
      trackConnectEvent('connect_corporate_offer_draft_save', { discount, terms });
    });

    // Form submit handler
    submitBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      
      const discount = $('#offer-discount').value;
      const terms = $('#offer-terms')?.value || 'Net 30';
      const radius = $('#offer-radius')?.value || '50';
      const equipment = $$('input[name="equipment"]:checked').map(cb => cb.value);

      // Save initial submission state
      let newState = {
        status: 'OFFER_SUBMITTED',
        discount,
        terms,
        radius,
        equipment
      };
      localStorage.setItem('hermes_corporate_offer_state', JSON.stringify(newState));
      updateLifecycleTracker('OFFER_SUBMITTED');
      showToast('✦ Demo Corporate Offer submitted to Load Planning queue.');
      trackConnectEvent('connect_corporate_offer_submit', { discount, terms });

      // Simulate load planner AI review after 2 seconds
      setTimeout(() => {
        newState.status = 'UNDER_REVIEW';
        localStorage.setItem('hermes_corporate_offer_state', JSON.stringify(newState));
        updateLifecycleTracker('UNDER_REVIEW');
        showToast('⚙️ Load Planning AI: Simulated offer terms are now UNDER_REVIEW.');
        trackConnectEvent('connect_corporate_offer_review', { discount, terms });

        // Simulate approval after 4 seconds
        setTimeout(() => {
          newState.status = 'APPROVED_PARTNER';
          localStorage.setItem('hermes_corporate_offer_state', JSON.stringify(newState));
          updateLifecycleTracker('APPROVED_PARTNER');
          showToast('🎉 Congratulations! Simulated Corporate Offer APPROVED_PARTNER!');
          trackConnectEvent('connect_corporate_offer_approved', { discount, terms });
        }, 4000);

      }, 2000);
    });
  }

  function initIosInstallBanner() {
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    const banner = $('#ios-pwa-drawer');
    const closeBtn = $('#close-ios-pwa');

    if (!banner) return;

    if (isIOS && !isStandalone) {
      const dismissed = sessionStorage.getItem('pwa-ios-helper-dismissed');
      if (!dismissed) {
        setTimeout(() => {
          banner.classList.add('open');
          banner.setAttribute('aria-hidden', 'false');
          trackConnectEvent('pwa_ios_install_prompt_show', {});
        }, 2500);
      }
    }

    closeBtn?.addEventListener('click', () => {
      banner.classList.remove('open');
      banner.setAttribute('aria-hidden', 'true');
      sessionStorage.setItem('pwa-ios-helper-dismissed', 'true');
      trackConnectEvent('pwa_ios_install_prompt_dismiss', {});
    });
  }

  // Initialize Modules
  initLoadAnalyzer();
  initProposalGenerator();
  initRoiCalculator();
  initOnboardingAndFeedback();
  initCorporateOfferWorkflow();
  initIosInstallBanner();

  renderActivity();
  loadLeadStoreFromLocalStorage();
  syncBookingsToLeadStore();
  renderLeadInbox();
  renderLeadDetail(selectedLeadId);
  renderCustomers();
  renderWeek();
  renderKanban();
  renderOps();
  renderIntegrations();
  // Language selector listener
  const langSelect = $('[data-lang-select]');
  if (langSelect) {
    langSelect.addEventListener('change', () => applyLanguage(langSelect.value));
  }

  setVertical(currentVertical);
  setView(currentView);
  handleDeepLinkState();
})();

