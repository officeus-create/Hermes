const STORAGE_KEY = 'hermes-connect-hr-pilot-v1';

export const NON_SCORING_CONTEXT_FIELDS = Object.freeze([
  'country', 'language', 'source', 'attribution'
]);
export const PROTECTED_FIELDS_NOT_COLLECTED = Object.freeze([
  'age','date_of_birth','gender','sex','race','ethnicity','religion','disability','family_status','political_affiliation'
]);

const ATTRIBUTION_KEYS = Object.freeze([
  'utm_source','utm_medium','utm_campaign','utm_content','utm_term','vacancy','creative','market','placement'
]);

const TRACKS = {
  logistics: {
    label: 'Logistics · Carrier Acquisition',
    brief: 'Hermes works with U.S. carriers. The job is not to read a script at people. The goal is to understand the carrier’s current operation, ask useful questions, discover whether there is a real problem or opportunity, explain relevant value, and agree on a concrete next step. Trust, listening and disciplined follow-up matter as much as speaking.',
    scenario: 'A carrier owner says: “I already have a dispatcher and I am not looking to change anything.” What would you say next? Write the conversation as you would actually handle it.'
  },
  sales: {
    label: 'U.S. Sales · Web / SEO-GEO / SMM',
    brief: 'Hermes digital sales starts with the business problem, not with a generic pitch. A salesperson researches the company, asks questions, discovers the cost of weak visibility or an ineffective website, connects the right service to that need, and earns a next step. The first objective is understanding and qualification; closing comes later.',
    scenario: 'A U.S. business owner says: “We already have a website and we tried marketing before. It did not work.” What would you say and what would you ask next?'
  },
  marketing: {
    label: 'Marketing · Training',
    brief: 'Hermes marketing training is built around understanding the audience, identifying the business problem, researching demand, turning insight into useful content or an offer, measuring the result, and improving from evidence. The learner must be able to explain why an action should work, not only repeat instructions.',
    scenario: 'A local business has an Instagram account but almost no inquiries. Before suggesting content or ads, what would you investigate and why?'
  }
};

const BASE_QUESTIONS = [
  {
    id: 'why_now',
    phase: 'CONTEXT',
    title: 'Why are you looking for a new direction now?',
    help: 'Tell us what changed, what you want to improve, and what would make the next opportunity meaningful to you.',
    signal: 'clarity'
  },
  {
    id: 'future_goal',
    phase: 'DIRECTION',
    title: 'What would a meaningful professional result look like 12–24 months from now?',
    help: 'Be specific about skills, responsibility, work you want to be able to do, or measurable progress. Avoid promises about guaranteed income.',
    signal: 'clarity'
  },
  {
    id: 'evidence',
    phase: 'EVIDENCE',
    title: 'Tell us about one skill you had to learn from zero.',
    help: 'What did you do, where did you struggle, what feedback did you receive, and what changed because of your actions?',
    signal: 'evidence'
  },
  {
    id: 'understanding',
    phase: 'UNDERSTANDING',
    title: 'Explain the role in your own words.',
    help: 'Read the short brief below. Do not copy it. Explain what creates value, what the person must understand, and what good performance would look like.',
    signal: 'learning',
    brief: true
  },
  {
    id: 'application',
    phase: 'APPLICATION',
    title: 'Apply the idea to a real situation.',
    help: 'There is no multiple choice. Show how you think, what you would ask, and what next step you would try to earn.',
    signal: 'application',
    scenario: true
  }
];

const FOLLOW_UPS = {
  concrete: {
    id: 'followup_concrete',
    phase: 'FOLLOW-UP',
    title: 'Make that answer concrete.',
    help: 'Give one specific example: what happened, what you personally did, and what the observable result was.',
    signal: 'evidence'
  },
  discovery: {
    id: 'followup_discovery',
    phase: 'FOLLOW-UP',
    title: 'What would you ask before offering a solution?',
    help: 'Write 2–4 discovery questions that would help you understand the other person before you pitch.',
    signal: 'discovery'
  }
};

function uid(prefix='hr') {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
}

function normalizeText(value='') {
  return String(value).replace(/\s+/g,' ').trim();
}

function tokens(value='') {
  return normalizeText(value).toLowerCase().split(/[^\p{L}\p{N}']+/u).filter(Boolean);
}

function clamp(n, min=0, max=100) { return Math.max(min, Math.min(max, n)); }

function safeHostname(value='') {
  try { return new URL(value).hostname || ''; }
  catch { return ''; }
}

export function captureAttribution(locationLike=window.location, documentLike=document) {
  const params = new URLSearchParams(locationLike.search || '');
  const attribution = {
    landing_path: locationLike.pathname || '/hr.html',
    referrer_host: safeHostname(documentLike.referrer || '')
  };
  for (const key of ATTRIBUTION_KEYS) {
    const value = normalizeText(params.get(key) || '');
    if (value) attribution[key] = value.slice(0, 240);
  }
  return attribution;
}

function textSignals(answer='') {
  const clean = normalizeText(answer);
  const words = tokens(clean);
  const sentences = clean.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);
  const hasNumber = /\b\d+(?:[.,]\d+)?\b/.test(clean);
  const hasTime = /\b(day|week|month|year|today|yesterday|час|день|недел|месяц|рік|тижд|дні|дня)\w*/iu.test(clean);
  const hasAction = /\b(asked|called|built|created|changed|tested|reviewed|learned|practiced|recorded|measured|sold|wrote|analyzed|звонил|спросил|сделал|создал|проверил|изучил|практиковал|записал|проанализировал|дзвонив|запитав|зробив|створив|перевірив|вивчив|практикував|проаналізував)\w*/iu.test(clean);
  const hasReflection = /\b(learn|understand|realiz|mistake|feedback|improv|change|review|понял|понима|осознал|ошиб|обратн|улучш|зрозум|усвідом|помил|відгук|покращ)\w*/iu.test(clean);
  const questionCount = (clean.match(/\?/g) || []).length;
  const discoveryWords = words.filter(w => /^(why|what|how|when|where|which|who|почему|что|как|когда|где|какой|зачем|чому|що|як|коли|де|який)$/.test(w)).length;

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    questionCount,
    hasNumber,
    hasTime,
    hasAction,
    hasReflection,
    discoveryWords
  };
}

export function buildPracticeSignals(answers=[]) {
  const all = answers.map(a => ({...a, stats:textSignals(a.answer)}));
  const totalWords = all.reduce((sum,a)=>sum+a.stats.wordCount,0);
  const concrete = all.filter(a=>a.stats.hasAction && (a.stats.hasNumber || a.stats.hasTime)).length;
  const reflective = all.filter(a=>a.stats.hasReflection).length;
  const questions = all.reduce((sum,a)=>sum+a.stats.questionCount+a.stats.discoveryWords,0);
  const applicationAnswer = all.find(a=>a.id==='application')?.stats;
  const understandingAnswer = all.find(a=>a.id==='understanding')?.stats;

  return {
    clarity: clamp(Math.round(30 + Math.min(totalWords,650)/650*55 + Math.min(all.length,6)*2.5)),
    evidence: clamp(Math.round(25 + concrete*18 + (all.find(a=>a.id==='evidence')?.stats.wordCount || 0)/5)),
    learning: clamp(Math.round(25 + reflective*14 + (understandingAnswer?.wordCount || 0)/4)),
    discovery: clamp(Math.round(20 + Math.min(questions,8)*9 + (applicationAnswer?.questionCount || 0)*5)),
    application: clamp(Math.round(25 + (applicationAnswer?.wordCount || 0)/3 + (applicationAnswer?.hasAction ? 18 : 0) + (applicationAnswer?.questionCount ? 12 : 0)))
  };
}

function recommendedDevelopment(signals) {
  const values = Object.values(signals);
  const lowest = Object.entries(signals).sort((a,b)=>a[1]-b[1])[0];
  const strongCount = values.filter(v=>v>=72).length;
  if (strongCount >= 4) {
    return {
      code: 'REVIEW_FOR_SUPERVISED_TEST',
      title: 'Human review for a supervised test',
      copy: 'The practice signals contain enough concrete evidence to justify a reviewer checking the full answers and deciding whether a supervised roleplay or test call is appropriate.',
      meta: ['No auto-hire', 'Reviewer required', `Development watch: ${lowest[0]}`]
    };
  }
  return {
    code: 'ACADEMY_PRACTICE_RECOMMENDED',
    title: 'Academy practice before the next readiness gate',
    copy: `The current answers suggest more structured practice would be useful before a live-work test. The reviewer should inspect the answers and can change this suggestion. The weakest practice signal is ${lowest[0]}.`,
    meta: ['No auto-reject', 'Academy', 'Reviewer required']
  };
}

function stateFromStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
  catch { return null; }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function appendEvent(state, type, payload={}) {
  state.events ||= [];
  state.events.push({
    event_id: uid('evt'),
    type,
    occurred_at: new Date().toISOString(),
    candidate_id: state.candidate_id,
    payload
  });
}

function freshState(context) {
  const id = uid();
  const state = {
    version: 2,
    candidate_id: id,
    learner_id: id,
    created_at: new Date().toISOString(),
    context,
    answers: [],
    queue: BASE_QUESTIONS.map(q=>({...q})),
    index: 0,
    events: [],
    completed_at: null
  };
  appendEvent(state, 'candidate_started', {
    track: context.track,
    source: context.source,
    attribution: context.attribution
  });
  return state;
}

const intakePanel = document.querySelector('[data-intake-panel]');
const intakeForm = document.querySelector('[data-intake-form]');
const interviewPanel = document.querySelector('[data-interview-panel]');
const resultPanel = document.querySelector('[data-result-panel]');
const phaseLabel = document.querySelector('[data-phase-label]');
const questionTitle = document.querySelector('[data-question-title]');
const questionHelp = document.querySelector('[data-question-help]');
const progressLabel = document.querySelector('[data-progress-label]');
const progressBar = document.querySelector('[data-progress-bar]');
const brief = document.querySelector('[data-brief]');
const answerForm = document.querySelector('[data-answer-form]');
const answerBox = document.querySelector('[data-answer]');
const answerCounter = document.querySelector('[data-answer-counter]');
const signalGrid = document.querySelector('[data-signal-grid]');
const routeTitle = document.querySelector('[data-route-title]');
const routeCopy = document.querySelector('[data-route-copy]');
const routeMeta = document.querySelector('[data-route-meta]');
const candidateId = document.querySelector('[data-candidate-id]');
const toast = document.querySelector('[data-toast]');

let state = stateFromStorage();

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2200);
}

function currentQuestion() { return state?.queue?.[state.index]; }

function prefillIntakeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const track = params.get('track');
  const source = params.get('source') || params.get('utm_source');
  const country = params.get('country');
  const language = params.get('lang') || params.get('language');

  if (track && TRACKS[track]) {
    const input = intakeForm.querySelector(`input[name="track"][value="${CSS.escape(track)}"]`);
    if (input) input.checked = true;
  }
  for (const [name,value] of [['source',source],['country',country],['language',language]]) {
    if (!value) continue;
    const select = intakeForm.elements.namedItem(name);
    if (select && [...select.options].some(option=>option.value===value || option.text===value)) select.value = value;
  }
}

function renderQuestion() {
  const q = currentQuestion();
  if (!q) return finishInterview();
  intakePanel.hidden = true;
  resultPanel.hidden = true;
  interviewPanel.hidden = false;
  const track = TRACKS[state.context.track];
  phaseLabel.textContent = q.phase;
  questionTitle.textContent = q.title;
  questionHelp.textContent = q.help;
  progressLabel.textContent = `${state.index + 1} / ${state.queue.length}`;
  progressBar.style.width = `${((state.index) / state.queue.length) * 100}%`;
  if (q.brief) {
    brief.hidden = false;
    brief.innerHTML = `<b>${track.label}</b><br>${track.brief}`;
  } else if (q.scenario) {
    brief.hidden = false;
    brief.innerHTML = `<b>Scenario</b><br>${track.scenario}`;
  } else {
    brief.hidden = true;
    brief.textContent = '';
  }
  answerBox.value = '';
  answerCounter.textContent = '0 / 4000';
  answerBox.focus({preventScroll:true});
  interviewPanel.scrollIntoView({behavior:'smooth',block:'start'});
}

function maybeAddFollowup(q, answer) {
  const stats = textSignals(answer);
  if ((q.id === 'evidence' || q.id === 'understanding') && stats.wordCount < 45) {
    state.queue.splice(state.index + 1, 0, {...FOLLOW_UPS.concrete, parent:q.id});
    appendEvent(state, 'adaptive_followup_added', {parent_question_id:q.id, followup_id:FOLLOW_UPS.concrete.id, reason:'insufficient_concrete_evidence'});
    return;
  }
  if (q.id === 'application' && stats.questionCount === 0 && stats.discoveryWords === 0) {
    state.queue.splice(state.index + 1, 0, {...FOLLOW_UPS.discovery, parent:q.id});
    appendEvent(state, 'adaptive_followup_added', {parent_question_id:q.id, followup_id:FOLLOW_UPS.discovery.id, reason:'no_discovery_question_observed'});
  }
}

function finishInterview() {
  if (!state.completed_at) {
    state.completed_at = new Date().toISOString();
    const signals = buildPracticeSignals(state.answers);
    const recommendation = recommendedDevelopment(signals);
    state.practice_signals = signals;
    state.development_recommendation = recommendation;
    appendEvent(state, 'interview_completed', {
      answer_count: state.answers.length,
      recommendation_code: recommendation.code
    });
    saveState(state);
  }

  interviewPanel.hidden = true;
  intakePanel.hidden = true;
  resultPanel.hidden = false;
  progressBar.style.width = '100%';

  const signals = state.practice_signals || buildPracticeSignals(state.answers);
  const recommendation = state.development_recommendation || recommendedDevelopment(signals);
  const labels = {
    clarity:['Clarity','Specific, understandable answers'],
    evidence:['Evidence','Concrete actions and observable examples'],
    learning:['Learning','Reflection, feedback and understanding'],
    discovery:['Discovery','Questions before pitching'],
    application:['Application','Turning ideas into next actions']
  };
  signalGrid.innerHTML = Object.entries(signals).map(([key,value])=>`<article class="kpi"><span>${labels[key][0]}</span><strong>${value}</strong><small>${labels[key][1]}</small></article>`).join('');
  routeTitle.textContent = recommendation.title;
  routeCopy.textContent = recommendation.copy;
  routeMeta.innerHTML = recommendation.meta.map(x=>`<span>${x}</span>`).join('');
  candidateId.textContent = state.candidate_id;
  resultPanel.scrollIntoView({behavior:'smooth',block:'start'});
}

function resetAll() {
  localStorage.removeItem(STORAGE_KEY);
  state = null;
  interviewPanel.hidden = true;
  resultPanel.hidden = true;
  intakePanel.hidden = false;
  intakeForm.reset();
  prefillIntakeFromUrl();
  intakePanel.scrollIntoView({behavior:'smooth',block:'start'});
}

intakeForm.addEventListener('submit', (event)=>{
  event.preventDefault();
  const data = new FormData(intakeForm);
  const context = {
    country: data.get('country'),
    language: data.get('language'),
    source: data.get('source'),
    track: data.get('track'),
    attribution: captureAttribution()
  };
  state = freshState(context);
  saveState(state);
  renderQuestion();
});

answerBox.addEventListener('input', ()=>{ answerCounter.textContent = `${answerBox.value.length} / 4000`; });

answerForm.addEventListener('submit', (event)=>{
  event.preventDefault();
  const q = currentQuestion();
  const answer = normalizeText(answerBox.value);
  if (answer.length < 15) { showToast('Please add a little more detail.'); return; }
  const evidenceId = uid('evidence');
  state.answers.push({evidence_id:evidenceId,id:q.id, phase:q.phase, track:state.context.track, answer, answered_at:new Date().toISOString()});
  appendEvent(state, 'answer_submitted', {
    question_id:q.id,
    evidence_id:evidenceId,
    phase:q.phase,
    word_count:textSignals(answer).wordCount
  });
  maybeAddFollowup(q, answer);
  state.index += 1;
  saveState(state);
  renderQuestion();
});

document.querySelectorAll('[data-reset]').forEach(btn=>btn.addEventListener('click',resetAll));
document.querySelector('[data-restart]').addEventListener('click',resetAll);

document.querySelector('[data-export]').addEventListener('click',()=>{
  if (!state?.completed_at) return;
  appendEvent(state, 'sanitized_summary_exported', {format:'json'});
  saveState(state);
  const safe = {
    version: state.version,
    candidate_id: state.candidate_id,
    learner_id: state.learner_id,
    track: state.context.track,
    context_for_funnel_analytics: state.context,
    practice_signals: state.practice_signals,
    development_recommendation: state.development_recommendation,
    answers: state.answers.map(a=>({evidence_id:a.evidence_id,id:a.id,phase:a.phase,answer:a.answer})),
    event_ledger: state.events,
    governance: {
      context_fields_excluded_from_readiness_signals: NON_SCORING_CONTEXT_FIELDS,
      protected_fields_not_collected: PROTECTED_FIELDS_NOT_COLLECTED,
      automated_employment_decision: false,
      human_review_required: true
    }
  };
  const blob = new Blob([JSON.stringify(safe,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.candidate_id}-hr-pilot.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Sanitized pilot summary exported.');
});

prefillIntakeFromUrl();
if (state?.completed_at) finishInterview();
else if (state?.queue?.length) renderQuestion();
