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

const TRACK_COPY = {
  ru: {
    logistics: {
      label: 'Логистика · Привлечение перевозчиков',
      brief: 'Hermes работает с перевозчиками в США. Задача — не читать человеку скрипт, а понять его текущую работу, задать полезные вопросы, определить реальную проблему или возможность, объяснить релевантную ценность и договориться о конкретном следующем шаге. Доверие, умение слушать и дисциплина follow-up важны не меньше речи.',
      scenario: 'Владелец carrier говорит: «У меня уже есть диспетчер, и я ничего не хочу менять». Что вы скажете дальше? Напишите разговор так, как реально его бы продолжили.'
    },
    sales: {
      label: 'Продажи в США · Web / SEO-GEO / SMM',
      brief: 'Продажи цифровых услуг Hermes начинаются с проблемы бизнеса, а не с универсального питча. Продавец изучает компанию, задаёт вопросы, понимает цену слабой видимости или неэффективного сайта, связывает подходящую услугу с этой потребностью и получает согласие на следующий шаг. Сначала — понимание и квалификация, закрытие сделки позже.',
      scenario: 'Владелец бизнеса в США говорит: «У нас уже есть сайт, и мы раньше пробовали маркетинг. Это не сработало». Что вы ответите и что спросите дальше?'
    },
    marketing: {
      label: 'Маркетинг · Обучение',
      brief: 'Обучение маркетингу Hermes строится вокруг понимания аудитории, определения бизнес-проблемы, исследования спроса, превращения инсайта в полезный контент или предложение, измерения результата и улучшения на основе evidence. Ученик должен уметь объяснить, почему действие должно сработать, а не только повторить инструкцию.',
      scenario: 'У локального бизнеса есть Instagram, но почти нет обращений. Что вы исследуете до предложения контента или рекламы и почему?'
    }
  },
  uk: {
    logistics: {
      label: 'Логістика · Залучення перевізників',
      brief: 'Hermes працює з перевізниками у США. Завдання — не читати людині скрипт, а зрозуміти її поточну роботу, поставити корисні запитання, визначити реальну проблему або можливість, пояснити релевантну цінність і домовитися про конкретний наступний крок. Довіра, уміння слухати та дисципліна follow-up важливі не менше за мовлення.',
      scenario: 'Власник carrier каже: «У мене вже є диспетчер, і я нічого не хочу змінювати». Що ви скажете далі? Напишіть розмову так, як реально її продовжили б.'
    },
    sales: {
      label: 'Продажі у США · Web / SEO-GEO / SMM',
      brief: 'Продажі цифрових послуг Hermes починаються з проблеми бізнесу, а не з універсального пітчу. Продавець досліджує компанію, ставить запитання, розуміє ціну слабкої видимості або неефективного сайту, пов’язує потрібну послугу з цією потребою та отримує згоду на наступний крок. Спочатку — розуміння і кваліфікація, закриття угоди пізніше.',
      scenario: 'Власник бізнесу у США каже: «У нас уже є сайт, і ми раніше пробували маркетинг. Це не спрацювало». Що ви відповісте і що запитаєте далі?'
    },
    marketing: {
      label: 'Маркетинг · Навчання',
      brief: 'Навчання маркетингу Hermes будується навколо розуміння аудиторії, визначення бізнес-проблеми, дослідження попиту, перетворення інсайту на корисний контент або пропозицію, вимірювання результату та покращення на основі evidence. Учень має вміти пояснити, чому дія повинна спрацювати, а не лише повторити інструкцію.',
      scenario: 'У локального бізнесу є Instagram, але майже немає звернень. Що ви дослідите до пропозиції контенту або реклами і чому?'
    }
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

const QUESTION_COPY = {
  ru: {
    why_now: { phase: 'КОНТЕКСТ', title: 'Почему вы ищете новое направление именно сейчас?', help: 'Расскажите, что изменилось, что вы хотите улучшить и что сделало бы следующую возможность действительно значимой для вас.' },
    future_goal: { phase: 'НАПРАВЛЕНИЕ', title: 'Какой профессиональный результат через 12–24 месяца вы считали бы значимым?', help: 'Конкретно опишите навыки, ответственность, работу, которую хотите уметь выполнять, или измеримый прогресс. Не опирайтесь на обещания гарантированного дохода.' },
    evidence: { phase: 'EVIDENCE', title: 'Расскажите об одном навыке, который вам пришлось освоить с нуля.', help: 'Что вы делали, где было сложно, какую обратную связь получили и что изменилось благодаря вашим действиям?' },
    understanding: { phase: 'ПОНИМАНИЕ', title: 'Объясните роль своими словами.', help: 'Прочитайте короткое описание ниже. Не копируйте его. Объясните, что создаёт ценность, что человек должен понимать и как выглядит хорошая работа.' },
    application: { phase: 'ПРИМЕНЕНИЕ', title: 'Примените идею к реальной ситуации.', help: 'Здесь нет выбора A/B/C. Покажите ход мыслей, какие вопросы вы зададите и какой следующий шаг постараетесь получить.' },
    followup_concrete: { phase: 'УТОЧНЕНИЕ', title: 'Сделайте ответ конкретнее.', help: 'Дайте один конкретный пример: что произошло, что лично сделали вы и какой наблюдаемый результат получили.' },
    followup_discovery: { phase: 'УТОЧНЕНИЕ', title: 'Что вы спросите до предложения решения?', help: 'Напишите 2–4 discovery-вопроса, которые помогут понять человека до питча.' }
  },
  uk: {
    why_now: { phase: 'КОНТЕКСТ', title: 'Чому ви шукаєте новий напрям саме зараз?', help: 'Розкажіть, що змінилося, що ви хочете покращити і що зробило б наступну можливість справді значущою для вас.' },
    future_goal: { phase: 'НАПРЯМ', title: 'Який професійний результат через 12–24 місяці ви вважали б значущим?', help: 'Конкретно опишіть навички, відповідальність, роботу, яку хочете вміти виконувати, або вимірюваний прогрес. Не спирайтеся на обіцянки гарантованого доходу.' },
    evidence: { phase: 'EVIDENCE', title: 'Розкажіть про одну навичку, яку вам довелося опанувати з нуля.', help: 'Що ви робили, де було складно, який відгук отримали і що змінилося завдяки вашим діям?' },
    understanding: { phase: 'РОЗУМІННЯ', title: 'Поясніть роль своїми словами.', help: 'Прочитайте короткий опис нижче. Не копіюйте його. Поясніть, що створює цінність, що людина має розуміти і як виглядає хороша робота.' },
    application: { phase: 'ЗАСТОСУВАННЯ', title: 'Застосуйте ідею до реальної ситуації.', help: 'Тут немає вибору A/B/C. Покажіть хід думок, які запитання поставите і який наступний крок спробуєте отримати.' },
    followup_concrete: { phase: 'УТОЧНЕННЯ', title: 'Зробіть відповідь конкретнішою.', help: 'Дайте один конкретний приклад: що сталося, що особисто зробили ви і який спостережуваний результат отримали.' },
    followup_discovery: { phase: 'УТОЧНЕННЯ', title: 'Що ви запитаєте до пропозиції рішення?', help: 'Напишіть 2–4 discovery-запитання, які допоможуть зрозуміти людину до пітчу.' }
  }
};

const UI_COPY = {
  en: {
    scenario: 'Scenario',
    answerPlaceholder: 'Answer in your own words. Concrete examples are more useful than perfect wording.',
    moreDetail: 'Please add a little more detail.',
    exported: 'Sanitized pilot summary exported.',
    signals: {
      clarity: ['Clarity','Specific, understandable answers'],
      evidence: ['Evidence','Concrete actions and observable examples'],
      learning: ['Learning','Reflection, feedback and understanding'],
      discovery: ['Discovery','Questions before pitching'],
      application: ['Application','Turning ideas into next actions']
    },
    recommendations: {
      REVIEW_FOR_SUPERVISED_TEST: {
        title: 'Human review for a supervised test',
        copy: 'The practice signals contain enough concrete evidence to justify a reviewer checking the full answers and deciding whether a supervised roleplay or test call is appropriate.',
        meta: ['No auto-hire','Reviewer required','Supervised evidence still required']
      },
      ACADEMY_PRACTICE_RECOMMENDED: {
        title: 'Academy practice before the next readiness gate',
        copy: 'The current answers suggest more structured practice would be useful before a live-work test. The reviewer should inspect the answers and can change this suggestion.',
        meta: ['No auto-reject','Academy is reviewer-routed','Reviewer required']
      }
    }
  },
  ru: {
    scenario: 'Ситуация',
    answerPlaceholder: 'Ответьте своими словами. Конкретные примеры полезнее идеальной формулировки.',
    moreDetail: 'Добавьте, пожалуйста, немного больше конкретики.',
    exported: 'Очищенная сводка интервью экспортирована.',
    signals: {
      clarity: ['Ясность','Конкретные и понятные ответы'],
      evidence: ['Evidence','Конкретные действия и наблюдаемые примеры'],
      learning: ['Обучение','Рефлексия, обратная связь и понимание'],
      discovery: ['Discovery','Вопросы до предложения решения'],
      application: ['Применение','Переход от идеи к следующему действию']
    },
    recommendations: {
      REVIEW_FOR_SUPERVISED_TEST: {
        title: 'Human review перед supervised test',
        copy: 'В письменных ответах достаточно конкретного evidence, чтобы reviewer изучил ответы полностью и решил, уместен ли supervised roleplay или тестовый звонок.',
        meta: ['Без auto-hire','Нужен reviewer','Живое evidence ещё требуется']
      },
      ACADEMY_PRACTICE_RECOMMENDED: {
        title: 'Практика Academy перед следующим readiness gate',
        copy: 'Текущие ответы показывают, что перед live-work test полезна более структурированная практика. Reviewer должен изучить ответы и может изменить эту рекомендацию.',
        meta: ['Без auto-reject','Academy назначает reviewer','Нужен reviewer']
      }
    }
  },
  uk: {
    scenario: 'Ситуація',
    answerPlaceholder: 'Відповідайте своїми словами. Конкретні приклади корисніші за ідеальне формулювання.',
    moreDetail: 'Додайте, будь ласка, трохи більше конкретики.',
    exported: 'Очищену підсумкову інформацію інтерв’ю експортовано.',
    signals: {
      clarity: ['Ясність','Конкретні та зрозумілі відповіді'],
      evidence: ['Evidence','Конкретні дії та спостережувані приклади'],
      learning: ['Навчання','Рефлексія, відгук і розуміння'],
      discovery: ['Discovery','Запитання до пропозиції рішення'],
      application: ['Застосування','Перехід від ідеї до наступної дії']
    },
    recommendations: {
      REVIEW_FOR_SUPERVISED_TEST: {
        title: 'Human review перед supervised test',
        copy: 'У письмових відповідях достатньо конкретного evidence, щоб reviewer повністю переглянув відповіді та вирішив, чи доречний supervised roleplay або тестовий дзвінок.',
        meta: ['Без auto-hire','Потрібен reviewer','Живе evidence ще потрібне']
      },
      ACADEMY_PRACTICE_RECOMMENDED: {
        title: 'Практика Academy перед наступним readiness gate',
        copy: 'Поточні відповіді показують, що перед live-work test корисна більш структурована практика. Reviewer має переглянути відповіді та може змінити цю рекомендацію.',
        meta: ['Без auto-reject','Academy призначає reviewer','Потрібен reviewer']
      }
    }
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

function activeLanguage() {
  const language = String(state?.context?.language || 'en').toLowerCase();
  return language === 'ru' || language === 'uk' ? language : 'en';
}

function uiCopy() { return UI_COPY[activeLanguage()] || UI_COPY.en; }

function localizedTrack(trackKey) {
  return TRACK_COPY[activeLanguage()]?.[trackKey] || TRACKS[trackKey] || TRACKS.logistics;
}

function localizedQuestion(question) {
  return QUESTION_COPY[activeLanguage()]?.[question?.id] || question;
}

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

function setBrief(label, text) {
  brief.replaceChildren();
  const strong = document.createElement('b');
  strong.textContent = label;
  brief.append(strong, document.createElement('br'), document.createTextNode(text));
}

function renderQuestion() {
  const q = currentQuestion();
  if (!q) return finishInterview();
  intakePanel.hidden = true;
  resultPanel.hidden = true;
  interviewPanel.hidden = false;
  const track = localizedTrack(state.context.track);
  const copy = localizedQuestion(q);
  const ui = uiCopy();
  phaseLabel.textContent = copy.phase || q.phase;
  questionTitle.textContent = copy.title || q.title;
  questionHelp.textContent = copy.help || q.help;
  progressLabel.textContent = `${state.index + 1} / ${state.queue.length}`;
  progressBar.style.width = `${((state.index) / state.queue.length) * 100}%`;
  if (q.brief) {
    brief.hidden = false;
    setBrief(track.label, track.brief);
  } else if (q.scenario) {
    brief.hidden = false;
    setBrief(ui.scenario, track.scenario);
  } else {
    brief.hidden = true;
    brief.textContent = '';
  }
  answerBox.value = '';
  answerBox.placeholder = ui.answerPlaceholder;
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

function renderSignalCards(signals, labels) {
  signalGrid.replaceChildren();
  for (const [key, value] of Object.entries(signals)) {
    const label = labels[key] || [key, ''];
    const card = document.createElement('article');
    card.className = 'kpi';
    const span = document.createElement('span');
    span.textContent = label[0];
    const strong = document.createElement('strong');
    strong.textContent = String(value);
    const small = document.createElement('small');
    small.textContent = label[1];
    card.append(span, strong, small);
    signalGrid.append(card);
  }
}

function renderRecommendationMeta(items) {
  routeMeta.replaceChildren();
  for (const item of items) {
    const span = document.createElement('span');
    span.textContent = item;
    routeMeta.append(span);
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
  const ui = uiCopy();
  const localizedRecommendation = ui.recommendations[recommendation.code] || recommendation;
  renderSignalCards(signals, ui.signals);
  routeTitle.textContent = localizedRecommendation.title || recommendation.title;
  routeCopy.textContent = localizedRecommendation.copy || recommendation.copy;
  renderRecommendationMeta(localizedRecommendation.meta || recommendation.meta || []);
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
  if (answer.length < 15) { showToast(uiCopy().moreDetail); return; }
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
  showToast(uiCopy().exported);
});

prefillIntakeFromUrl();
if (state?.completed_at) finishInterview();
else if (state?.queue?.length) renderQuestion();
