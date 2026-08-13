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

  const verticals = {
    beauty: {
      name: 'Aurelia Studio', label: 'Beauty & wellness', revenue: '$2,840', leads: '18', bookings: '24', actions: '43',
      summary: 'Hermes handled 43 actions, recovered 4 opportunities and found 3 decisions that need your approval.',
      activity: [
        ['✦','Replied to 9 client conversations','Inbox · 42 seconds average response','2 min ago'],
        ['▣','Filled a Friday scheduling gap','Calendar · rebooking opportunity','8 min ago'],
        ['↗','Qualified 4 new leads','Sales · 2 moved to high intent','14 min ago'],
        ['$','Flagged one overdue invoice','Finance · follow-up prepared','29 min ago']
      ],
      conversations: [
        ['AM','Anna Martinez','Friday appointment · ready to confirm','1m','active'],
        ['JR','Jessica Reed','Balayage & styling inquiry · deposit link sent','4m',''],
        ['SK','Sofia Kim','Rebooking reminder sent · 82% match','9m',''],
        ['DM','Diana Miller','VIP client · annual membership renewal','14m',''],
        ['EL','Emma Lewis','Hydrafacial package inquiry','22m',''],
        ['NB','Natalie Brown','New Instagram DM lead · requested consultation','31m','']
      ],
      customers: [
        ['AM','Anna Martinez','High intent','Today · Instagram','$1,240','Confirm Friday booking'],
        ['DM','Diana Miller','VIP Member','Today · Email','$4,880','Annual renewal offer'],
        ['EL','Emma Lewis','Rebooking','Yesterday · SMS','$2,120','Send preferred time slot'],
        ['JR','Jessica Reed','Warm lead','Yesterday · Web','$780','Send package comparison'],
        ['SK','Sofia Kim','Active','2 days ago · Instagram','$1,960','Request Google review'],
        ['NB','Natalie Brown','New lead','12 min ago · Instagram','$0','Qualify consultation need']
      ],
      week: [
        ['MON','13',[['09:00','Team sync','blue'],['11:30','Maria K.',''],['15:00','Consultation','mint']]],
        ['TUE','14',[['10:00','VIP client',''],['13:30','Styling slot','blue'],['17:00','Follow-up block','mint']]],
        ['WED','15',[['09:30','Consultation','mint'],['12:00','Anna M.',''],['16:00','Content shoot','blue']]],
        ['THU','16',[['10:30','New client',''],['14:30','Review call','blue'],['18:00','Open slot','mint']]],
        ['FRI','17',[['11:30','AI suggested gap','mint'],['14:30','Anna Martinez',''],['16:00','Available','blue']]]
      ],
      kanban: {
        'New': [['Anna Martinez','$180','82%'],['Natalie Brown','$420','65%'],['Mia Clark','$260','58%']],
        'Qualified': [['Jessica Reed','$780','74%'],['Olivia Hall','$1,200','69%'],['Liam Green','$640','67%']],
        'Proposal': [['Diana Miller','$4,880','88%'],['Sophia White','$2,400','73%']],
        'Closing': [['Emma Lewis','$1,960','91%'],['Daniel King','$3,100','84%']]
      },
      ops: [
        ['✦','Rebooking automation','Sent personalized slots to 14 client profiles','Running'],
        ['↗','Instagram lead capture','Qualified 8 consultation requests via DM','Running'],
        ['▣','Staff schedule balancing','Optimized 3 Friday stylist gaps','Running'],
        ['$','Deposit follow-up','Preparing reminder for 2 open invoices','Review']
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
      ],
      conversations: [
        ['TC','Triple C Auto Transport','Rate negotiation: Chicago → Dallas 3-car haul ($2.85/mi)','2m','active'],
        ['FL','Fleetline Express','Carrier setup packet sent · FMCSA SAFER clear','5m',''],
        ['BL','Blue Ridge Logistics','5-car enclosed load inquiry ($3,400)','11m',''],
        ['MJ','Midwest Auto Logistics','Lumper fee dispute resolved · POD uploaded','18m',''],
        ['SK','SunState Transport','Driver location update: ETA Atlanta 14:00','29m',''],
        ['AH','Apex Hauling','New load board match: 9-car wedge open','40m','']
      ],
      customers: [
        ['TC','Triple C Auto Transport','Carrier - Active','Today · DAT Board','$14,200','Assign Chicago → Dallas load'],
        ['FL','Fleetline Express','Verified Carrier','Today · Email','$9,800','Request signed rate confirmation'],
        ['BL','Blue Ridge Logistics','Direct Shipper','Yesterday · Phone','$24,500','Send contract renewal terms'],
        ['MJ','Midwest Auto Logistics','Broker Partner','Yesterday · Web','$18,400','Upload inspection report'],
        ['SK','SunState Transport','Owner Operator','3 days ago · App','$8,900','Offer Florida backhaul load'],
        ['AH','Apex Hauling','New Carrier','15 min ago · SAFER','$0','Verify MC# authority & insurance']
      ],
      week: [
        ['MON','13',[['08:00','Dispatch sync','blue'],['11:00','Chicago load',''],['14:30','Dallas delivery','mint']]],
        ['TUE','14',[['09:30','Enclosed haul',''],['13:00','Carrier check','blue'],['16:30','Lane review','mint']]],
        ['WED','15',[['08:30','Rate negotiation','mint'],['12:00','Fleetline EX',''],['15:00','RPM audit','blue']]],
        ['THU','16',[['10:00','Broker dispatch',''],['14:00','POD verify','blue'],['17:30','Available carrier','mint']]],
        ['FRI','17',[['11:00','AI lane suggestion','mint'],['14:30','Triple C Auto',''],['16:30','Weekend loads','blue']]]
      ],
      kanban: {
        'New': [['Apex Hauling','$3,200','88%'],['SunState Transport','$1,800','72%'],['Vanguard Express','$2,400','64%']],
        'Qualified': [['Fleetline Express','$4,800','81%'],['Midwest Auto','$6,200','76%'],['Eagle Haulers','$3,900','70%']],
        'Proposal': [['Triple C Transport','$8,500','92%'],['Blue Ridge Shipper','$12,400','85%']],
        'Closing': [['National Car Hauler','$16,800','95%'],['Apex Dispatch','$5,400','89%']]
      },
      ops: [
        ['⌁','FMCSA Safety Verification','Scored 26 carrier MC# authorities on SAFER','Running'],
        ['↗','Load Board Dispatch Match','Matched 7 open loads with nearby 3-car haulers','Running'],
        ['!','Low-RPM Lane Alert','Flagged 4 routes under $2.20/mile threshold','Review'],
        ['$','Detention Fee Calculator','Calculated $350 detention payout for Load #4082','Running']
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
      ],
      conversations: [
        ['MK','Marcus Vance','Personal training trial booked · Wants 6:30 AM block','3m','active'],
        ['SL','Sarah Long','Membership pause request · Retention sequence triggered','7m',''],
        ['DR','David Rossi','Nutrition assessment form completed','15m',''],
        ['EL','Elena Lopez','Semi-private strength class inquiry','24m',''],
        ['TB','Tom Baker','30-day progress check-in confirmation','38m',''],
        ['CH','Chris Howard','New website trial lead','45m','']
      ],
      customers: [
        ['MK','Marcus Vance','Trial Member','Today · Web','$1,800','Confirm 6:30 AM trial session'],
        ['SL','Sarah Long','At Risk','Today · App','$2,400','Send retention offer & coach call'],
        ['DR','David Rossi','Active Elite','Yesterday · Form','$3,600','Review macro plan draft'],
        ['EL','Elena Lopez','Warm Lead','Yesterday · Instagram','$950','Send group schedule'],
        ['TB','Tom Baker','VIP Member','2 days ago · SMS','$4,200','Schedule quarterly review'],
        ['CH','Chris Howard','New Lead','20 min ago · Web','$0','Qualify fitness goals']
      ],
      week: [
        ['MON','13',[['06:30','Marcus trial','mint'],['09:00','Strength group','blue'],['17:00','Personal training','']]],
        ['TUE','14',[['07:00','Elite session',''],['11:30','Coach review','blue'],['18:00','Group class','mint']]],
        ['WED','15',[['06:30','HIIT morning','mint'],['10:00','David R. macro',''],['16:30','Member check-in','blue']]],
        ['THU','16',[['08:00','Trial consult',''],['14:00','App audit','blue'],['18:30','Evening strength','mint']]],
        ['FRI','17',[['06:30','Available slot','mint'],['11:30','Sarah L. call',''],['15:00','Weekend prep','blue']]]
      ],
      kanban: {
        'New': [['Marcus Vance','$1,200','85%'],['Chris Howard','$900','68%'],['Alex Rivera','$600','60%']],
        'Qualified': [['Elena Lopez','$1,800','78%'],['Rachel Adams','$2,100','72%'],['Ben Scott','$1,500','69%']],
        'Proposal': [['Sarah Long','$2,400','82%'],['David Rossi','$3,600','89%']],
        'Closing': [['Tom Baker','$4,200','94%'],['Karen Cole','$2,800','88%']]
      },
      ops: [
        ['◎','Member Churn Risk Model','Identified 5 inactive members for outreach','Running'],
        ['▣','Peak Hours Trainer Allocation','Optimized Tuesday 17:00 trainer slots','Running'],
        ['✦','Automated Check-in Follow-up','Sent 12 weekly progress surveys','Running'],
        ['$','Recurring Billing Watch','Processed 31 monthly membership auto-renews','Running']
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
      ],
      conversations: [
        ['VC','Vanguard Corp','SEO retainer proposal review · Requested Q3 target CAC','2m','active'],
        ['HL','Highland Auto Group','Inbound audit lead: 42 dealer sites needs local SEO','6m',''],
        ['SB','Summit Biotech','Ad creative approval: Variant B 3.8x CTR winner','12m',''],
        ['MW','Metro Wellness','Monthly performance report draft ready','20m',''],
        ['KP','Kramer & Partners','Content distribution plan for LinkedIn','32m',''],
        ['JL','John Lawson','New lead from web audit tool','50m','']
      ],
      customers: [
        ['VC','Vanguard Corp','Proposal Sent','Today · Email','$8,500/mo','Send Q3 ROI forecast'],
        ['HL','Highland Auto Group','Qualified Opportunity','Today · Form','$14,000/mo','Schedule technical audit presentation'],
        ['SB','Summit Biotech','Active Retainer','Yesterday · Slack','$6,200/mo','Launch winning ad set B'],
        ['MW','Metro Wellness','Active Retainer','Yesterday · Portal','$4,500/mo','Approve monthly KPI summary'],
        ['KP','Kramer & Partners','Onboarding','2 days ago · Call','$5,000/mo','Complete technical SEO checklist'],
        ['JL','John Lawson','New Audit Lead','10 min ago · Web','$0','Generate automated SEO scorecard']
      ],
      week: [
        ['MON','13',[['09:30','Agency standup','blue'],['11:00','Highland audit',''],['15:30','Strategy pitch','mint']]],
        ['TUE','14',[['10:00','Vanguard call',''],['13:00','Ad creative review','blue'],['16:30','Client Q&A','mint']]],
        ['WED','15',[['09:00','SEO crawl audit','mint'],['12:30','Summit Biotech',''],['15:00','Content pipeline','blue']]],
        ['THU','16',[['10:30','New business',''],['14:00','Reporting review','blue'],['17:00','Lead review','mint']]],
        ['FRI','17',[['11:00','Growth gap check','mint'],['14:00','Kramer sync',''],['16:00','Weekly recap','blue']]]
      ],
      kanban: {
        'New': [['Highland Auto Group','$14,000','76%'],['John Lawson','$3,500','62%'],['Cascade Tech','$5,000','55%']],
        'Qualified': [['Kramer & Partners','$5,000','82%'],['Summit Biotech','$6,200','85%'],['Beacon Health','$4,200','71%']],
        'Proposal': [['Vanguard Corp','$8,500','90%'],['Atlas Logistics','$11,000','83%']],
        'Closing': [['Metro Wellness','$4,500','96%'],['Apex Retail','$7,800','88%']]
      },
      ops: [
        ['↗','Ad Creative Performance Scoring','Analyzed 18 ad variations across Meta & Google','Running'],
        ['✦','Automated Technical SEO Audit','Crawled 42 dealer landing pages for LCP & meta','Running'],
        ['▣','Client Quarterly Strategy Call','Scheduled 6 Q3 review meetings','Running'],
        ['$','Agency Profitability Audit','Recalculated team hours vs monthly retainer revenue','Running']
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
      ],
      conversations: [
        ['EH','Ethan Hunt','Property tour request: 420 North Shore Dr ($1.25M)','4m','active'],
        ['CL','Claire Lumley','Pre-approval letter uploaded · Searching 3BR homes','8m',''],
        ['RB','Robert Bennett','Seller listing consultation follow-up','16m',''],
        ['MS','Maria Santos','Open House attendance confirmation for Saturday','25m',''],
        ['GT','Greg Taylor','Buyer agent agreement review','35m',''],
        ['AL','Amanda Lee','New Zillow lead inquiry','52m','']
      ],
      customers: [
        ['EH','Ethan Hunt','High Intent Buyer','Today · Zillow','$1,250,000','Confirm Saturday 14:00 tour'],
        ['CL','Claire Lumley','Pre-Approved','Today · Portal','$850,000','Send 3 matched lakefront listings'],
        ['RB','Robert Bennett','Potential Seller','Yesterday · Phone','$1,400,000','Send Comparative Market Analysis (CMA)'],
        ['MS','Maria Santos','Open House Guest','Yesterday · Form','$620,000','Send tour feedback survey'],
        ['GT','Greg Taylor','Active Buyer','3 days ago · Web','$920,000','Review draft purchase offer'],
        ['AL','Amanda Lee','New Lead','25 min ago · Web','$0','Qualify timeline & budget']
      ],
      week: [
        ['MON','13',[['09:00','Brokerage sync','blue'],['11:30','Listing consult',''],['15:00','Ethan Hunt tour','mint']]],
        ['TUE','14',[['10:00','Open house prep',''],['13:30','Buyer consult','blue'],['17:00','Offer review','mint']]],
        ['WED','15',[['09:30','MLS property match','mint'],['12:00','Claire L. meeting',''],['16:00','Contract draft','blue']]],
        ['THU','16',[['10:30','New buyer lead',''],['14:30','Inspection walkthrough','blue'],['18:00','Open slot','mint']]],
        ['FRI','17',[['11:30','Saturday tour route','mint'],['14:30','Robert B. CMA',''],['16:30','Escrow check','blue']]]
      ],
      kanban: {
        'New': [['Amanda Lee','$650,000','65%'],['David Park','$820,000','58%'],['Lisa Chen','$550,000','52%']],
        'Qualified': [['Ethan Hunt','$1,250,000','84%'],['Claire Lumley','$850,000','80%'],['Maria Santos','$620,000','73%']],
        'Proposal': [['Robert Bennett','$1,400,000','88%'],['Greg Taylor','$920,000','86%']],
        'Closing': [['Victor Stone','$1,100,000','95%'],['Hannah Wright','$780,000','92%']]
      },
      ops: [
        ['⌂','AI Listing Matcher','Matched 5 new MLS listings to pre-approved buyers','Running'],
        ['▣','Agent Tour Route Optimization','Optimized Saturday 4-property tour sequence','Running'],
        ['✦','Lead Qualification Engine','Scored 16 inbound buyer inquiries on budget & timing','Running'],
        ['$','Escrow Milestone Tracker','Verified earnest deposit for 142 Elm Street','Running']
      ]
    }
  };

  const integrations = [
    ['G','Gmail','Email conversations, context and follow-up','Simulated'],
    ['▣','Google Calendar','Bookings, meetings and availability','Simulated'],
    ['GH','GitHub','Issues, code, releases and evidence','Simulated'],
    ['S','Slack','Team messages and operational signals','Demo'],
    ['N','Notion','Knowledge, SOPs and documentation','Demo'],
    ['L','Linear','Issue-to-outcome workflow','Demo'],
    ['WA','WhatsApp','Customer messaging and follow-up','Connector not configured'],
    ['☎','Telephony','Calls, transcripts and coaching','Connector not configured'],
    ['P','Payments','Payment events and receivables','Demo'],
    ['A','Analytics','Product and campaign intelligence','Demo'],
    ['CD','Carrier Data','Logistics matching and scoring','Connector not configured'],
    ['+','1000+ tools','Expansion through approved connectors','Explore']
  ];

  let currentVertical = 'beauty';
  let currentView = 'home';

  function showToast(message) {
    let container = $('.hermes-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'hermes-toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'hermes-toast';
    toast.innerHTML = `<span>✦</span><p>${message}</p>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  function renderActivity() {
    const target = $('[data-activity-list]');
    if (!target) return;
    target.innerHTML = verticals[currentVertical].activity.map(([icon,title,meta,time]) => `
      <div class="activity-item"><span class="activity-icon">${icon}</span><div><b>${title}</b><small>${meta}</small></div><em>${time}</em></div>`).join('');
  }

  function renderConversations() {
    const target = $('[data-conversation-list]');
    if (!target) return;
    const items = verticals[currentVertical].conversations || [];
    target.innerHTML = items.map(([initials,name,preview,time,state]) => `
      <button class="conversation-card ${state}" type="button"><span class="conversation-avatar">${initials}</span><div><b>${name}</b><small>${preview}</small></div><em>${time}</em></button>`).join('');
  }

  function renderCustomers() {
    const target = $('[data-customer-table]');
    if (!target) return;
    const items = verticals[currentVertical].customers || [];
    target.innerHTML = items.map(([initials,name,stage,last,value,next]) => `
      <tr><td><div class="table-person"><span>${initials}</span><b>${name}</b></div></td><td><span class="stage">${stage}</span></td><td>${last}</td><td><b>${value}</b></td><td class="next-action">✦ ${next}</td><td>•••</td></tr>`).join('');
  }

  function renderWeek() {
    const target = $('[data-week-grid]');
    if (!target) return;
    const items = verticals[currentVertical].week || [];
    target.innerHTML = items.map(([day,date,events]) => `<div class="day"><div class="day-head"><b>${day}</b><span>${date}</span></div>${events.map(([time,title,color]) => `<div class="booking ${color}"><small>${time}</small><b>${title}</b></div>`).join('')}</div>`).join('');
  }

  function renderKanban() {
    const target = $('[data-sales-kanban]');
    if (!target) return;
    const kanbanData = verticals[currentVertical].kanban || {};
    target.innerHTML = Object.entries(kanbanData).map(([stage,deals]) => `<div class="kanban-col"><div class="kanban-title"><b>${stage}</b><span>${deals.length}</span></div>${deals.map(([name,value,confidence]) => `<div class="deal-card"><span>AI confidence ${confidence}</span><b>${name}</b><small>${verticals[currentVertical].label}</small><div class="deal-footer"><strong>${value}</strong><span>✦ Next step ready</span></div></div>`).join('')}</div>`).join('');
  }

  function renderOps() {
    const target = $('[data-ops-list]');
    if (!target) return;
    const items = verticals[currentVertical].ops || [];
    target.innerHTML = items.map(([icon,title,meta,state]) => `<div class="ops-item"><span class="ops-icon">${icon}</span><div><b>${title}</b><small>${meta}</small></div><span class="ops-state">${state}</span></div>`).join('');
  }

  function renderIntegrations() {
    const target = $('[data-integration-grid]');
    if (!target) return;
    target.innerHTML = integrations.map(([logo,name,desc,status]) => {
      const simulated = status === 'Simulated';
      const action = simulated ? 'Simulated ✓' : (status === 'Connector not configured' ? 'Configure' : status === 'Explore' ? 'Explore layer' : 'Test Demo');
      return `<article class="integration-card ${simulated ? 'connected' : ''}"><div class="integration-top"><span class="integration-logo">${logo}</span><span class="integration-status">${status}</span></div><h4>${name}</h4><p>${desc}</p><button type="button" data-integration-action>${action}</button></article>`;
    }).join('');
    $$('[data-integration-action]', target).forEach(button => button.addEventListener('click', () => {
      const card = button.closest('.integration-card');
      if (card.classList.contains('connected')) return;
      button.textContent = 'Simulated action';
      card.querySelector('.integration-status').textContent = 'Demo Mode';
      showToast('Simulated integration request saved in demo session');
    }));
  }

  function setVertical(id) {
    if (!verticals[id]) return;
    currentVertical = id;
    const data = verticals[id];
    $$('[data-workspace-name]').forEach(el => el.textContent = data.name);
    $$('[data-workspace-label]').forEach(el => el.textContent = data.label);
    $('[data-kpi="revenue"]') && ($('[data-kpi="revenue"]').textContent = data.revenue);
    $('[data-kpi="leads"]') && ($('[data-kpi="leads"]').textContent = data.leads);
    $('[data-kpi="bookings"]') && ($('[data-kpi="bookings"]').textContent = data.bookings);
    $('[data-kpi="actions"]') && ($('[data-kpi="actions"]').textContent = data.actions);
    $('[data-ai-summary-text]') && ($('[data-ai-summary-text]').textContent = data.summary);
    renderActivity();
    renderConversations();
    renderCustomers();
    renderWeek();
    renderKanban();
    renderOps();
    $('[data-workspace-popover]')?.classList.remove('open');
    $('[data-workspace-popover]')?.setAttribute('aria-hidden','true');
    showToast(`Switched workspace to ${data.name} (${data.label})`);
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
    showToast('Theme toggled');
  });

  // Action feedback buttons
  document.addEventListener('click', event => {
    const btn = event.target.closest('button');
    if (!btn) return;
    const txt = btn.textContent.trim();
    if (['Review', 'Open', 'Send', 'Recover', 'Approve', 'Offer slot', 'Draft', 'Generate', 'Launch', 'Practice →', 'Decline'].includes(txt)) {
      showToast(`Simulated action: ${txt} executed`);
    }
  });

  $$('[data-demo-form]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    const input = $('input', form);
    if (!input?.value.trim()) return;
    const sentText = input.value.trim();
    input.value = '';
    const button = $('button', form);
    const previous = button.textContent;
    button.textContent = 'Sent ✓';
    showToast(`Message simulated: "${sentText.slice(0, 32)}..."`);
    setTimeout(() => button.textContent = previous, 1200);
  }));

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
    const answer = document.createElement('div');
    answer.className = 'hermes-message';
    answer.innerHTML = `<small>✦ Hermes (Simulated AI)</small><p>Simulated AI response for ${verticals[currentVertical].name}: Analyzed ${verticals[currentVertical].label} context across Inbox, CRM, Calendar, Sales and Operations. Recommended action ready for owner approval.</p>`;
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

  renderActivity();
  renderConversations();
  renderCustomers();
  renderWeek();
  renderKanban();
  renderOps();
  renderIntegrations();
  setVertical(currentVertical);
  setView(currentView);
})();
