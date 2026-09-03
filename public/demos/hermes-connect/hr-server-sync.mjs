const STATE_KEY = 'hermes-connect-hr-pilot-v1';
const TOKEN_KEY = 'hermes-connect-hr-candidate-token-v1';
const CONTACT_KEY = 'hermes-connect-hr-contact-v1';
const SYNC_KEY = 'hermes-connect-hr-server-sync-v1';
const API_URL = '/api/hr/candidate';
const CLAIM_URL = '/api/hr/claim';

const nativeSetItem = Storage.prototype.setItem;
const nativeRemoveItem = Storage.prototype.removeItem;
let syncInFlight = false;
let queuedState = null;

function readJson(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

function writeJson(key, value) {
  nativeSetItem.call(localStorage, key, JSON.stringify(value));
}

function setStatus(text) {
  document.querySelectorAll('[data-server-sync-status]').forEach((node) => { node.textContent = text; });
}

function showToast(text) {
  const toast = document.querySelector('[data-toast]');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function createCandidateToken() {
  if (globalThis.crypto?.randomUUID) return `hrtok_${crypto.randomUUID()}_${crypto.randomUUID()}`;
  const bytes = new Uint8Array(48);
  globalThis.crypto?.getRandomValues?.(bytes);
  return `hrtok_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

function ensureToken() {
  let token = localStorage.getItem(TOKEN_KEY) || '';
  if (token.length < 48) {
    token = createCandidateToken();
    nativeSetItem.call(localStorage, TOKEN_KEY, token);
  }
  return token;
}

function captureContactFromForm() {
  const form = document.querySelector('[data-intake-form]');
  if (!form) return null;
  const data = new FormData(form);
  const contact = {
    name: String(data.get('name') || '').trim().slice(0, 120),
    email: String(data.get('email') || '').trim().toLowerCase().slice(0, 160),
    telegram_handle: String(data.get('telegram_handle') || '').trim().slice(0, 120),
    consent: data.get('consent') === 'on'
  };
  if (contact.name.length < 2 || !contact.email.includes('@') || !contact.consent) return null;
  writeJson(CONTACT_KEY, contact);
  return contact;
}

function getContact() {
  return readJson(CONTACT_KEY) || captureContactFromForm();
}

function syncMeta() {
  return readJson(SYNC_KEY, {}) || {};
}

function updateSyncMeta(patch) {
  writeJson(SYNC_KEY, { ...syncMeta(), ...patch, updated_at: new Date().toISOString() });
}

async function responseJson(response) {
  try { return await response.json(); }
  catch { return {}; }
}

async function startServerCandidate(state, token) {
  const meta = syncMeta();
  if (meta.candidate_id === state.candidate_id && meta.started === true) return true;
  const contact = getContact();
  if (!contact) {
    setStatus('Local fallback only — restart this pilot to add contact details before server sync.');
    updateSyncMeta({ candidate_id: state.candidate_id, started: false, last_error: 'contact_missing' });
    return false;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': state.candidate_id,
      'X-HR-Candidate-Token': token
    },
    body: JSON.stringify({
      candidate_id: state.candidate_id,
      name: contact.name,
      email: contact.email,
      telegram_handle: contact.telegram_handle || null,
      country: state.context?.country,
      language: state.context?.language,
      source: state.context?.source,
      track: state.context?.track,
      attribution: state.context?.attribution || {},
      consent: contact.consent === true,
      submitted_at: state.created_at
    })
  });
  const payload = await responseJson(response);
  if (!response.ok || payload.success !== true) {
    const reason = payload.error || `http_${response.status}`;
    updateSyncMeta({ candidate_id: state.candidate_id, started: false, last_error: reason });
    if (response.status === 403 || response.status === 404) {
      setStatus('Local fallback active — private HR endpoint is not available on this preview origin.');
    } else {
      setStatus('Local fallback active — Hermes HR server sync will retry when available.');
    }
    return false;
  }

  updateSyncMeta({
    candidate_id: state.candidate_id,
    started: true,
    session_id: payload.session_id || meta.session_id || null,
    last_error: null,
    last_server_status: payload.status || 'interviewing'
  });
  setStatus('Private Hermes HR persistence active · local fallback also retained.');
  return true;
}

async function putServerSnapshot(state, token) {
  const response = await fetch(API_URL, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-HR-Candidate-Token': token
    },
    body: JSON.stringify({
      candidate_id: state.candidate_id,
      answers: Array.isArray(state.answers) ? state.answers : [],
      events: Array.isArray(state.events) ? state.events : [],
      completed_at: state.completed_at || null,
      practice_signals: state.practice_signals || null,
      development_recommendation: state.development_recommendation || null
    })
  });
  const payload = await responseJson(response);
  if (!response.ok || payload.success !== true) {
    updateSyncMeta({ last_error: payload.error || `http_${response.status}` });
    setStatus('Local fallback active — unsent HR evidence will retry automatically.');
    return false;
  }
  updateSyncMeta({
    last_error: null,
    last_synced_answers: Array.isArray(state.answers) ? state.answers.length : 0,
    last_synced_events: Array.isArray(state.events) ? state.events.length : 0,
    completed: Boolean(state.completed_at),
    last_server_status: payload.status || null
  });
  setStatus(state.completed_at
    ? 'Interview evidence is privately persisted in Hermes HR · human review required.'
    : 'Private Hermes HR persistence active · local fallback also retained.');
  return true;
}

async function syncState(state) {
  if (!state?.candidate_id || !state?.context) return;
  const token = ensureToken();
  try {
    const started = await startServerCandidate(state, token);
    if (!started) return;
    await putServerSnapshot(state, token);
  } catch (error) {
    updateSyncMeta({ last_error: error instanceof Error ? error.message : 'network_error' });
    setStatus('Local fallback active — Hermes HR server sync will retry when the connection is available.');
  }
}

async function drainSyncQueue() {
  if (syncInFlight) return;
  syncInFlight = true;
  try {
    while (queuedState) {
      const next = queuedState;
      queuedState = null;
      await syncState(next);
    }
  } finally {
    syncInFlight = false;
  }
}

function queueSync(state) {
  queuedState = state;
  queueMicrotask(drainSyncQueue);
}

Storage.prototype.setItem = function(key, value) {
  nativeSetItem.call(this, key, value);
  if (this !== localStorage || key !== STATE_KEY) return;
  try {
    const state = JSON.parse(String(value));
    if (state?.candidate_id) {
      ensureToken();
      getContact();
      queueSync(state);
    }
  } catch {
    // The HR interview module owns local-state validation.
  }
};

Storage.prototype.removeItem = function(key) {
  nativeRemoveItem.call(this, key);
  if (this !== localStorage || key !== STATE_KEY) return;
  nativeRemoveItem.call(localStorage, TOKEN_KEY);
  nativeRemoveItem.call(localStorage, CONTACT_KEY);
  nativeRemoveItem.call(localStorage, SYNC_KEY);
  setStatus('Pilot data removed from this browser. Server records, if already submitted, remain private for authorized HR review.');
};

async function claimCandidate() {
  const state = readJson(STATE_KEY);
  const token = localStorage.getItem(TOKEN_KEY) || '';
  if (!state?.candidate_id || token.length < 48) {
    showToast('No current HR candidate record is available to link.');
    return;
  }
  try {
    const response = await fetch(CLAIM_URL, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: state.candidate_id, candidate_token: token })
    });
    const payload = await responseJson(response);
    if (response.status === 401) {
      showToast('Sign in to your Hermes Connect account first, then use Link again.');
      return;
    }
    if (!response.ok || payload.success !== true) {
      showToast(`Account link not completed: ${payload.error || 'server error'}.`);
      return;
    }
    updateSyncMeta({ claimed: true, specialist_id: payload.specialist_id, academy_link: payload.academy_link || null });
    showToast(payload.academy_link?.state === 'enrollment_applied'
      ? 'Hermes account linked and Academy application connected.'
      : 'Hermes account linked to this HR record.');
  } catch {
    showToast('Account link could not reach Hermes right now.');
  }
}

document.querySelector('[data-claim-hr]')?.addEventListener('click', claimCandidate);
window.addEventListener('online', () => {
  const state = readJson(STATE_KEY);
  if (state?.candidate_id) queueSync(state);
});

const initialState = readJson(STATE_KEY);
if (initialState?.candidate_id) queueSync(initialState);
