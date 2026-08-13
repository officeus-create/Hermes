(() => {
  const body = document.body;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const onboardingModal = document.querySelector('[data-onboarding-modal]');
  const intelligenceDrawer = document.querySelector('[data-intelligence-drawer]');
  const onboardingOpeners = [...document.querySelectorAll('[data-onboarding-open]')];
  const onboardingClosers = [...document.querySelectorAll('[data-onboarding-close]')];
  const intelligenceOpeners = [...document.querySelectorAll('[data-intelligence-open]')];
  const intelligenceClosers = [...document.querySelectorAll('[data-intelligence-close]')];
  const verticalTabs = [...document.querySelectorAll('[data-vertical]')];
  const setupVerticals = [...document.querySelectorAll('[data-setup-vertical]')];
  const aiForm = document.querySelector('[data-ai-form]');

  const verticals = {
    beauty: {
      label: 'Beauty & wellness',
      name: 'Aurelia Studio',
      revenue: '$2,840',
      leads: '18',
      bookings: '24',
      ai: ['Replied to 9 conversations', 'Qualified 4 new leads', 'Found 2 scheduling gaps'],
      metrics: ['43', '18', '$18.4k']
    },
    logistics: {
      label: 'US logistics',
      name: 'Hermes Logistics Ops',
      revenue: '$14,620',
      leads: '11',
      bookings: '7 loads',
      ai: ['Scored 26 load opportunities', 'Flagged 4 low-margin routes', 'Prepared 6 carrier follow-ups'],
      metrics: ['58', '11', '$64.2k']
    },
    fitness: {
      label: 'Fitness & coaching',
      name: 'Northline Performance',
      revenue: '$1,960',
      leads: '13',
      bookings: '31',
      ai: ['Recovered 5 inactive members', 'Filled 3 coaching slots', 'Prepared retention outreach'],
      metrics: ['37', '13', '$12.8k']
    },
    agency: {
      label: 'Marketing agency',
      name: 'Progresso Growth Lab',
      revenue: '$4,780',
      leads: '22',
      bookings: '9 calls',
      ai: ['Ranked 12 warm opportunities', 'Drafted 4 follow-up sequences', 'Found 3 content winners'],
      metrics: ['61', '22', '$31.5k']
    },
    realestate: {
      label: 'Real estate',
      name: 'Meridian Property Group',
      revenue: '$8,400',
      leads: '16',
      bookings: '12 tours',
      ai: ['Qualified 8 buyer inquiries', 'Matched 5 listings', 'Scheduled 4 property tours'],
      metrics: ['46', '16', '$42.7k']
    }
  };

  function setModalState(element, open) {
    if (!element) return;
    element.classList.toggle('is-open', open);
    element.setAttribute('aria-hidden', String(!open));
    body.style.overflow = open ? 'hidden' : '';
  }

  function setVertical(id) {
    const data = verticals[id];
    if (!data) return;

    document.querySelector('[data-workspace-label]').textContent = data.label;
    document.querySelector('[data-workspace-name]').textContent = data.name;
    document.querySelector('[data-kpi-revenue]').textContent = data.revenue;
    document.querySelector('[data-kpi-leads]').textContent = data.leads;
    document.querySelector('[data-kpi-bookings]').textContent = data.bookings;

    const aiSummary = document.querySelector('[data-ai-summary]');
    aiSummary.innerHTML = data.ai.map(item => `<li><i></i>${item}</li>`).join('');

    const handled = document.querySelector('[data-metric="handled"]');
    const leads = document.querySelector('[data-metric="leads"]');
    const revenue = document.querySelector('[data-metric="revenue"]');
    handled.textContent = data.metrics[0];
    leads.textContent = data.metrics[1];
    revenue.textContent = data.metrics[2];

    verticalTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.vertical === id));
  }

  themeToggle?.addEventListener('click', () => {
    const dark = body.classList.toggle('theme-obsidian');
    body.classList.toggle('theme-pearl', !dark);
    themeToggle.textContent = dark ? 'Pearl Light' : 'Obsidian';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0B0D12' : '#F7F6F3');
  });

  onboardingOpeners.forEach(button => button.addEventListener('click', () => setModalState(onboardingModal, true)));
  onboardingClosers.forEach(button => button.addEventListener('click', () => setModalState(onboardingModal, false)));
  intelligenceOpeners.forEach(button => button.addEventListener('click', () => setModalState(intelligenceDrawer, true)));
  intelligenceClosers.forEach(button => button.addEventListener('click', () => setModalState(intelligenceDrawer, false)));

  verticalTabs.forEach(tab => tab.addEventListener('click', () => setVertical(tab.dataset.vertical)));
  setupVerticals.forEach(button => button.addEventListener('click', () => {
    setVertical(button.dataset.setupVertical);
    setModalState(onboardingModal, false);
    document.querySelector('#product')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  document.querySelector('[data-scroll-product]')?.addEventListener('click', () => {
    document.querySelector('#product')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  aiForm?.addEventListener('submit', event => {
    event.preventDefault();
    const input = aiForm.elements.question;
    const value = input.value.trim();
    if (!value) return;
    const conversation = document.querySelector('.drawer-conversation');
    const user = document.createElement('div');
    user.className = 'user-message';
    user.textContent = value;
    const response = document.createElement('div');
    response.className = 'system-message';
    response.innerHTML = 'Visual prototype response: Hermes would combine the relevant business context, recommend the next action, and show what it used to reach the recommendation.';
    conversation.append(user, response);
    input.value = '';
    conversation.scrollTop = conversation.scrollHeight;
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    setModalState(onboardingModal, false);
    setModalState(intelligenceDrawer, false);
  });
})();