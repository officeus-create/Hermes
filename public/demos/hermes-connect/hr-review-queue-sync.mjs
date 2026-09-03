const CANDIDATE_KEY = 'hermes-connect-hr-pilot-v1';
const QUEUE_KEY = 'hermes-connect-hr-review-queue-v1';
const PRODUCTION_HOSTS = new Set(['hermeslogisticsus.com', 'connect.hermeslogisticsus.com']);

function isProductionHost() {
  return typeof location !== 'undefined' && PRODUCTION_HOSTS.has(location.hostname);
}

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function toQueueRecord(state) {
  return {
    candidate_id: state.candidate_id,
    learner_id: state.learner_id,
    track: state.context?.track || 'unknown',
    source: state.context?.source || 'unknown',
    attribution: state.context?.attribution || {},
    completed_at: state.completed_at,
    practice_signals: state.practice_signals || {},
    development_recommendation: state.development_recommendation || null,
    evidence_count: Array.isArray(state.answers) ? state.answers.length : 0,
    answers: Array.isArray(state.answers)
      ? state.answers.map(({evidence_id,id,phase,answer,answered_at})=>({evidence_id,id,phase,answer,answered_at}))
      : [],
    interview_events: Array.isArray(state.events) ? state.events : [],
    review: null,
    queue_updated_at: new Date().toISOString()
  };
}

export function syncCompletedCandidateToReviewQueue() {
  // The browser-local reviewer queue exists only to make isolated preview demos usable.
  // Production candidate browsers keep the normal recovery copy but must not create
  // a second reviewer-oriented copy of private interview evidence.
  if (isProductionHost()) return false;

  const state = readJson(CANDIDATE_KEY, null);
  if (!state?.candidate_id || !state?.completed_at) return false;

  const queue = readJson(QUEUE_KEY, []);
  const index = queue.findIndex(item=>item.candidate_id===state.candidate_id);
  const current = index >= 0 ? queue[index] : null;
  const next = {...toQueueRecord(state), review: current?.review || null};
  if (index >= 0) queue[index] = next;
  else queue.unshift(next);
  writeJson(QUEUE_KEY, queue.slice(0, 250));
  return true;
}

const resultPanel = document.querySelector('[data-result-panel]');
if (resultPanel && !isProductionHost()) {
  const sync = () => {
    if (!resultPanel.hidden) syncCompletedCandidateToReviewQueue();
  };
  new MutationObserver(sync).observe(resultPanel, {attributes:true,attributeFilter:['hidden']});
  sync();
}
