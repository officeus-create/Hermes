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
    target.innerHTML = customers.map(([initials,name,stage,last,value,next]) => `
      <tr><td><div class="table-person"><span>${initials}</span><b>${name}</b></div></td><td><span class="stage">${stage}</span></td><td>${last}</td><td><b>${value}</b></td><td class="next-action">✦ ${next}</td><td>•••</td></tr>`).join('');
  }

  function renderWeek() {
    const target = $('[data-week-grid]');
    if (!target) return;
    target.innerHTML = week.map(([day,date,items]) => `<div class="day"><div class="day-head"><b>${day}</b><span>${date}</span></div>${items.map(([time,title,color]) => `<div class="booking ${color}"><small>${time}</small><b>${title}</b></div>`).join('')}</div>`).join('');
  }

  function renderKanban() {
    const target = $('[data-sales-kanban]');
    if (!target) return;
    target.innerHTML = Object.entries(kanban).map(([stage,deals]) => `<div class="kanban-col"><div class="kanban-title"><b>${stage}</b><span>${deals.length}</span></div>${deals.map(([name,value,confidence]) => `<div class="deal-card"><span>AI confidence ${confidence}</span><b>${name}</b><small>${verticals[currentVertical].label}</small><div class="deal-footer"><strong>${value}</strong><span>✦ Next step ready</span></div></div>`).join('')}</div>`).join('');
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
      const simulated = status === 'Simulated';
      const action = simulated ? 'Simulated ✓' : (status === 'Connector not configured' ? 'Configure' : status === 'Explore' ? 'Explore layer' : 'Test Demo');
      return `<article class="integration-card ${simulated ? 'connected' : ''}"><div class="integration-top"><span class="integration-logo">${logo}</span><span class="integration-status">${status}</span></div><h4>${name}</h4><p>${desc}</p><button type="button" data-integration-action>${action}</button></article>`;
    }).join('');
    $$('[data-integration-action]', target).forEach(button => button.addEventListener('click', () => {
      const card = button.closest('.integration-card');
      if (card.classList.contains('connected')) return;
      button.textContent = 'Simulated action';
      card.querySelector('.integration-status').textContent = 'Demo Mode';
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
    renderKanban();
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
    answer.innerHTML = `<small>✦ Hermes</small><p>Prototype answer: I would combine ${verticals[currentVertical].label.toLowerCase()} context with Inbox, CRM, Calendar, Sales, Finance and Operations, then show the recommended action, expected impact and what evidence I used.</p>`;
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
