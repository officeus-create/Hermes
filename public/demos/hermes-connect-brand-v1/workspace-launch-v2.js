(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const data = {
    beauty: {
      name: 'Aurelia Studio', label: 'Beauty & wellness', revenue: '$2,840', leads: '18', bookings: '24', actions: '43',
      summary: 'Demo: Hermes identifies booking gaps, warm leads, retention opportunities and owner approvals across a beauty studio.',
      primary: ['AM','Anna Martinez','Instagram · Beauty consultation','Hi! Do you have anything available Friday afternoon?','Demo response: I can prepare 2:30 PM or 4:00 PM as candidate slots for owner confirmation.','Prepare booking + deposit request'],
      conversations: [['AM','Anna Martinez','Friday appointment · ready to review','1m'],['JR','Jessica Reed','Balayage package inquiry','4m'],['SK','Sofia Kim','Rebooking candidate · 82% demo match','9m'],['DM','Diana Miller','Membership renewal opportunity','14m'],['EL','Emma Lewis','Hydrafacial package inquiry','22m'],['NB','Natalie Brown','Instagram consultation lead','31m']],
      customers: [['AM','Anna Martinez','High intent','Today · Instagram','$1,240','Review Friday booking'],['DM','Diana Miller','VIP demo','Today · Email','$4,880','Prepare renewal offer'],['EL','Emma Lewis','Rebooking','Yesterday · SMS','$2,120','Prepare preferred slots'],['JR','Jessica Reed','Warm lead','Yesterday · Web','$780','Prepare package comparison'],['SK','Sofia Kim','Active demo','2 days ago · Instagram','$1,960','Prepare review request'],['NB','Natalie Brown','New lead','12 min ago · Instagram','$0','Qualify consultation']],
      week: [['MON','13',[['09:00','Team sync','blue'],['11:30','Maria K.',''],['15:00','Consultation','mint']]],['TUE','14',[['10:00','VIP client',''],['13:30','Styling slot','blue'],['17:00','Follow-up block','mint']]],['WED','15',[['09:30','Consultation','mint'],['12:00','Anna M.',''],['16:00','Content shoot','blue']]],['THU','16',[['10:30','New client',''],['14:30','Review call','blue'],['18:00','Open slot','mint']]],['FRI','17',[['11:30','Suggested gap','mint'],['14:30','Anna Martinez',''],['16:00','Available','blue']]]],
      kanban: {'New':[['Anna Martinez','$180','82%'],['Natalie Brown','$420','65%']], 'Qualified':[['Jessica Reed','$780','74%'],['Olivia Hall','$1,200','69%']], 'Proposal':[['Diana Miller','$4,880','88%']], 'Closing':[['Emma Lewis','$1,960','91%']]},
      ops: [['✦','Rebooking simulation','Prepare personalized slots for 14 demo profiles'],['↗','Lead qualification simulation','Score 8 consultation requests'],['▣','Schedule balancing','Identify 3 Friday gaps'],['$','Deposit follow-up','Prepare 2 reminder drafts']]
    },
    logistics: {
      name: 'Hermes Logistics Ops', label: 'US logistics', revenue: '$14,620', leads: '11', bookings: '7 demo loads', actions: '58',
      summary: 'Demo: Hermes scores load opportunities, prepares carrier follow-ups, highlights route economics and keeps human approval in the loop.',
      primary: ['TC','Triple C Auto Transport','Demo lane · Chicago → Dallas','Can you review this 3-car lane and tell me what we should do next?','Demo response: I can compare the lane, equipment fit and target RPM, then prepare a next-action package. No carrier assignment or external message is sent.','Review lane package'],
      conversations: [['TC','Triple C Auto Transport','Demo rate negotiation · Chicago → Dallas','2m'],['FL','Fleetline Express','Carrier review demo · authority data not live','5m'],['BL','Blue Ridge Logistics','Enclosed-load inquiry example','11m'],['MJ','Midwest Auto Logistics','POD workflow example','18m'],['SK','SunState Transport','Driver ETA example','29m'],['AH','Apex Hauling','Load-board match example','40m']],
      customers: [['TC','Triple C Auto Transport','Carrier demo','Today · Demo board','$14,200','Review lane fit'],['FL','Fleetline Express','Review candidate','Today · Email demo','$9,800','Prepare rate-confirmation draft'],['BL','Blue Ridge Logistics','Shipper demo','Yesterday · Demo','$24,500','Prepare renewal terms'],['MJ','Midwest Auto Logistics','Broker demo','Yesterday · Web','$18,400','Review inspection workflow'],['SK','SunState Transport','Owner-operator demo','3 days ago · App','$8,900','Prepare backhaul option'],['AH','Apex Hauling','New carrier demo','15 min ago · Demo','$0','Prepare authority review']],
      week: [['MON','13',[['08:00','Dispatch sync','blue'],['11:00','Chicago load',''],['14:30','Dallas delivery','mint']]],['TUE','14',[['09:30','Enclosed haul',''],['13:00','Carrier review','blue'],['16:30','Lane review','mint']]],['WED','15',[['08:30','Rate review','mint'],['12:00','Fleetline EX',''],['15:00','RPM audit','blue']]],['THU','16',[['10:00','Broker workflow',''],['14:00','POD review','blue'],['17:30','Capacity demo','mint']]],['FRI','17',[['11:00','Lane suggestion','mint'],['14:30','Triple C Auto',''],['16:30','Weekend planning','blue']]]],
      kanban: {'New':[['Apex Hauling','$3,200','88%'],['SunState Transport','$1,800','72%']], 'Qualified':[['Fleetline Express','$4,800','81%'],['Midwest Auto','$6,200','76%']], 'Proposal':[['Triple C Transport','$8,500','92%']], 'Closing':[['National Car Hauler','$16,800','95%']]},
      ops: [['⌁','Carrier review simulation','Prepare authority and equipment review'],['↗','Load-match simulation','Compare 7 demo loads with nearby capacity'],['!','Low-RPM demo alert','Flag 4 routes below demo threshold'],['$','Detention calculator demo','Calculate example detention scenario']]
    },
    fitness: {
      name: 'Northline Performance', label: 'Fitness & coaching', revenue: '$1,960', leads: '13', bookings: '31', actions: '37',
      summary: 'Demo: Hermes highlights member retention risk, coaching slots, check-ins and recurring-revenue opportunities.',
      primary: ['MK','Marcus Vance','Web · Training trial','I want to try personal training before work. Do you have an early slot?','Demo response: I found a 6:30 AM candidate slot and prepared the trial workflow for coach approval.','Review trial booking'],
      conversations: [['MK','Marcus Vance','Training trial · 6:30 AM candidate','3m'],['SL','Sarah Long','Membership pause · retention review','7m'],['DR','David Rossi','Nutrition assessment example','15m'],['EL','Elena Lopez','Semi-private class inquiry','24m'],['TB','Tom Baker','Progress check-in example','38m'],['CH','Chris Howard','Website trial lead','45m']],
      customers: [['MK','Marcus Vance','Trial member','Today · Web','$1,800','Review trial slot'],['SL','Sarah Long','At-risk demo','Today · App','$2,400','Prepare retention option'],['DR','David Rossi','Active demo','Yesterday · Form','$3,600','Review plan draft'],['EL','Elena Lopez','Warm lead','Yesterday · Instagram','$950','Prepare group schedule'],['TB','Tom Baker','VIP demo','2 days ago · SMS','$4,200','Prepare quarterly review'],['CH','Chris Howard','New lead','20 min ago · Web','$0','Qualify goals']],
      week: [['MON','13',[['06:30','Marcus trial','mint'],['09:00','Strength group','blue'],['17:00','Personal training','']]],['TUE','14',[['07:00','Elite session',''],['11:30','Coach review','blue'],['18:00','Group class','mint']]],['WED','15',[['06:30','HIIT morning','mint'],['10:00','Nutrition review',''],['16:30','Member check-in','blue']]],['THU','16',[['08:00','Trial consult',''],['14:00','App review','blue'],['18:30','Evening strength','mint']]],['FRI','17',[['06:30','Available slot','mint'],['11:30','Retention call',''],['15:00','Weekend prep','blue']]]],
      kanban: {'New':[['Marcus Vance','$1,200','85%'],['Chris Howard','$900','68%']], 'Qualified':[['Elena Lopez','$1,800','78%'],['Rachel Adams','$2,100','72%']], 'Proposal':[['Sarah Long','$2,400','82%']], 'Closing':[['Tom Baker','$4,200','94%']]},
      ops: [['◎','Churn-risk simulation','Identify 5 inactive demo members'],['▣','Trainer allocation','Model peak-hour scheduling'],['✦','Check-in workflow','Prepare 12 progress surveys'],['$','Billing watch demo','Model 31 membership renewals']]
    },
    agency: {
      name: 'Progresso Growth Lab', label: 'Marketing agency', revenue: '$4,780', leads: '22', bookings: '9 calls', actions: '61',
      summary: 'Demo: Hermes ranks opportunities, organizes campaigns, prepares follow-ups and surfaces content patterns worth testing.',
      primary: ['VC','Vanguard Corp','Email · SEO proposal','Can you show what the next 30 days would look like before we decide?','Demo response: I prepared a 30-day review-and-release plan with audit, URL ownership, implementation and measurement checkpoints.','Review proposal plan'],
      conversations: [['VC','Vanguard Corp','SEO proposal review','2m'],['HL','Highland Auto Group','Inbound audit lead example','6m'],['SB','Summit Biotech','Creative-review example','12m'],['MW','Metro Wellness','Performance-report draft','20m'],['KP','Kramer & Partners','Content distribution plan','32m'],['JL','John Lawson','Web audit lead','50m']],
      customers: [['VC','Vanguard Corp','Proposal demo','Today · Email','$8,500/mo','Review 30-day plan'],['HL','Highland Auto Group','Qualified demo','Today · Form','$14,000/mo','Prepare audit presentation'],['SB','Summit Biotech','Retainer demo','Yesterday · Slack','$6,200/mo','Review creative test'],['MW','Metro Wellness','Retainer demo','Yesterday · Portal','$4,500/mo','Review KPI summary'],['KP','Kramer & Partners','Onboarding demo','2 days ago · Call','$5,000/mo','Prepare SEO checklist'],['JL','John Lawson','Audit lead','10 min ago · Web','$0','Prepare scorecard']],
      week: [['MON','13',[['09:30','Agency standup','blue'],['11:00','Audit review',''],['15:30','Strategy pitch','mint']]],['TUE','14',[['10:00','Vanguard call',''],['13:00','Creative review','blue'],['16:30','Client Q&A','mint']]],['WED','15',[['09:00','SEO crawl','mint'],['12:30','Client sync',''],['15:00','Content pipeline','blue']]],['THU','16',[['10:30','New business',''],['14:00','Reporting review','blue'],['17:00','Lead review','mint']]],['FRI','17',[['11:00','Growth gap check','mint'],['14:00','Client sync',''],['16:00','Weekly recap','blue']]]],
      kanban: {'New':[['Highland Auto Group','$14,000','76%'],['John Lawson','$3,500','62%']], 'Qualified':[['Kramer & Partners','$5,000','82%'],['Summit Biotech','$6,200','85%']], 'Proposal':[['Vanguard Corp','$8,500','90%']], 'Closing':[['Metro Wellness','$4,500','96%']]},
      ops: [['↗','Creative scoring demo','Compare 18 example variations'],['✦','Technical SEO demo','Model audit results across 42 pages'],['▣','Client review planning','Prepare 6 Q3 review slots'],['$','Profitability demo','Model hours versus retainer revenue']]
    },
    realestate: {
      name: 'Meridian Property Group', label: 'Real estate', revenue: '$8,400', leads: '16', bookings: '12 tours', actions: '46',
      summary: 'Demo: Hermes qualifies buyer inquiries, organizes listing matches, tour requests and seller follow-up workflows.',
      primary: ['EH','Ethan Hunt','Web · Property inquiry','Can I tour the North Shore property this weekend?','Demo response: I prepared candidate tour windows and buyer-qualification questions for agent review. No showing is booked automatically.','Review tour request'],
      conversations: [['EH','Ethan Hunt','Property-tour request example','4m'],['CL','Claire Lumley','Pre-approval workflow example','8m'],['RB','Robert Bennett','Seller consultation follow-up','16m'],['MS','Maria Santos','Open-house confirmation example','25m'],['GT','Greg Taylor','Buyer agreement review','35m'],['AL','Amanda Lee','New portal lead example','52m']],
      customers: [['EH','Ethan Hunt','High-intent demo','Today · Portal','$1.25M','Review tour request'],['CL','Claire Lumley','Pre-approved demo','Today · Portal','$850k','Prepare listing shortlist'],['RB','Robert Bennett','Seller demo','Yesterday · Phone','$1.4M','Prepare CMA workflow'],['MS','Maria Santos','Open-house demo','Yesterday · Form','$620k','Prepare feedback survey'],['GT','Greg Taylor','Buyer demo','3 days ago · Web','$920k','Review offer draft'],['AL','Amanda Lee','New lead','25 min ago · Web','$0','Qualify timing & budget']],
      week: [['MON','13',[['09:00','Brokerage sync','blue'],['11:30','Listing consult',''],['15:00','Property tour','mint']]],['TUE','14',[['10:00','Open-house prep',''],['13:30','Buyer consult','blue'],['17:00','Offer review','mint']]],['WED','15',[['09:30','Listing match','mint'],['12:00','Buyer meeting',''],['16:00','Contract draft','blue']]],['THU','16',[['10:30','New buyer lead',''],['14:30','Inspection demo','blue'],['18:00','Open slot','mint']]],['FRI','17',[['11:30','Tour route','mint'],['14:30','Seller review',''],['16:30','Escrow check','blue']]]],
      kanban: {'New':[['Amanda Lee','$650k','65%'],['David Park','$820k','58%']], 'Qualified':[['Ethan Hunt','$1.25M','84%'],['Claire Lumley','$850k','80%']], 'Proposal':[['Robert Bennett','$1.4M','88%']], 'Closing':[['Victor Stone','$1.1M','95%']]},
      ops: [['⌂','Listing-match simulation','Compare 5 demo listings with buyer needs'],['▣','Tour route demo','Model a four-property tour sequence'],['✦','Lead qualification demo','Score 16 synthetic inquiries'],['$','Escrow milestone demo','Model a deposit milestone']]
    }
  };

  const toast = message => {
    let container = $('.hermes-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'hermes-toast-container';
      document.body.appendChild(container);
    }
    const item = document.createElement('div');
    item.className = 'hermes-toast';
    item.innerHTML = `<span>◇</span><p>${message}</p>`;
    container.appendChild(item);
    setTimeout(() => { item.classList.add('fade-out'); setTimeout(() => item.remove(), 350); }, 2300);
  };

  const render = id => {
    const d = data[id];
    if (!d) return;
    $$('[data-workspace-name]').forEach(el => el.textContent = d.name);
    $$('[data-workspace-label]').forEach(el => el.textContent = d.label);
    const setKpi = (key, value) => { const el = $(`[data-kpi="${key}"]`); if (el) el.textContent = value; };
    setKpi('revenue', d.revenue); setKpi('leads', d.leads); setKpi('bookings', d.bookings); setKpi('actions', d.actions);
    const summary = $('[data-ai-summary-text]'); if (summary) summary.textContent = d.summary;

    const conversations = $('[data-conversation-list]');
    if (conversations) conversations.innerHTML = d.conversations.map(([initials,name,preview,time],i) => `<button class="conversation-card ${i === 0 ? 'active' : ''}" type="button"><span class="conversation-avatar">${initials}</span><div><b>${name}</b><small>${preview}</small></div><em>${time}</em></button>`).join('');

    const customers = $('[data-customer-table]');
    if (customers) customers.innerHTML = d.customers.map(([initials,name,stage,last,value,next]) => `<tr><td><div class="table-person"><span>${initials}</span><b>${name}</b></div></td><td><span class="stage">${stage}</span></td><td>${last}</td><td><b>${value}</b></td><td class="next-action">◇ ${next}</td><td>•••</td></tr>`).join('');

    const week = $('[data-week-grid]');
    if (week) week.innerHTML = d.week.map(([day,date,events]) => `<div class="day"><div class="day-head"><b>${day}</b><span>${date}</span></div>${events.map(([time,title,color]) => `<div class="booking ${color}"><small>${time}</small><b>${title}</b></div>`).join('')}</div>`).join('');

    const kanban = $('[data-sales-kanban]');
    if (kanban) kanban.innerHTML = Object.entries(d.kanban).map(([stage,deals]) => `<div class="kanban-col"><div class="kanban-title"><b>${stage}</b><span>${deals.length}</span></div>${deals.map(([name,value,confidence]) => `<div class="deal-card"><span>DEMO AI CONFIDENCE ${confidence}</span><b>${name}</b><small>${d.label}</small><div class="deal-footer"><strong>${value}</strong><span>◇ Next step ready</span></div></div>`).join('')}</div>`).join('');

    const ops = $('[data-ops-list]');
    if (ops) ops.innerHTML = d.ops.map(([icon,title,meta]) => `<div class="ops-item"><span class="ops-icon">${icon}</span><div><b>${title}</b><small>${meta}</small></div><span class="ops-state">Simulated</span></div>`).join('');

    const [initials,name,meta,customerText,aiText,nextAction] = d.primary;
    const header = $('.conversation-header');
    if (header) header.innerHTML = `<div><span class="contact-avatar">${initials}</span><div><b>${name}</b><small>${meta}</small></div></div><button type="button">•••</button>`;
    const thread = $('.conversation-thread');
    if (thread) thread.innerHTML = `<div class="message customer">${customerText}</div><div class="message ai"><small>◇ Hermes · Simulated AI</small>${aiText}</div>`;
    const suggested = $('.suggested-action div');
    if (suggested) suggested.innerHTML = `<b>Suggested next action</b><small>Demo: ${nextAction}</small>`;

    $$('[data-vertical]').forEach(button => button.classList.toggle('selected', button.dataset.vertical === id));
    toast(`Demo workspace switched to ${d.name}`);
  };

  $$('[data-vertical]').forEach(button => button.addEventListener('click', () => setTimeout(() => render(button.dataset.vertical), 0)));

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.closest('[data-vertical]')) return;
    const label = button.textContent.trim();
    if (['Review','Open','Send','Recover','Approve','Offer slot','Draft','Generate','Launch','Practice →','Decline','Analyze','Edit','Create scenario','Request integration','+ Customer','+ Booking','+ Opportunity','+ Campaign','+ Scenario'].includes(label)) {
      toast(`Demo action prepared: ${label}. No external action was sent.`);
    }
  });

  $$('[data-demo-form]').forEach(form => form.addEventListener('submit', () => {
    const button = $('button', form);
    setTimeout(() => { if (button) button.textContent = 'Simulated ✓'; }, 0);
    setTimeout(() => { if (button) button.textContent = 'Send'; }, 1250);
  }));

  const verticalMapLaunch = {
    logistics: 'logistics',
    auto_repair: 'auto',
    agency: 'agency',
    beauty: 'beauty',
    fitness: 'fitness',
    real_estate: 'realestate',
    professional_services: 'agency',
    other: 'logistics'
  };
  const storedTypeLaunch = localStorage.getItem('hermes_business_type');
  const urlParamsLaunch = new URLSearchParams(window.location.search);
  const typeParamLaunch = urlParamsLaunch.get('business_type');
  const activeVerticalLaunch = verticalMapLaunch[typeParamLaunch] || verticalMapLaunch[storedTypeLaunch] || 'beauty';
  render(activeVerticalLaunch);
})();