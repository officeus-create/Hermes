const API_URL = '/api/hr/reviewer/candidates';
const REVIEW_OUTCOMES = Object.freeze({
  ACADEMY: 'Academy practice',
  MORE_EVIDENCE: 'Request more evidence',
  SUPERVISED_TEST: 'Authorize supervised test'
});

const queueEl = document.querySelector('[data-review-queue]');
const detailEl = document.querySelector('[data-review-detail]');
const sourceTable = document.querySelector('[data-source-table]');
const toast = document.querySelector('[data-toast]');
const modeBadge = document.querySelector('[data-admin-mode]');
const modeNote = document.querySelector('[data-admin-mode-note]');
const actionButton = document.querySelector('[data-clear-queue]');
const kpiTotal = document.querySelector('[data-kpi-total]');
const kpiPending = document.querySelector('[data-kpi-pending]');
const kpiAcademy = document.querySelector('[data-kpi-academy]');
const kpiTest = document.querySelector('[data-kpi-test]');

let candidates = [];
let selectedId = null;
let reviewer = null;
let serverMode = false;

function showToast(text) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatDate(value) {
  if (!value) return '—';
  try { return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)); }
  catch { return String(value); }
}

function shortId(value='') { return value.length > 18 ? `${value.slice(0,10)}…${value.slice(-6)}` : value; }
function reviewLabel(value) { return REVIEW_OUTCOMES[value] || 'Awaiting review'; }

function setMode(kind, note='') {
  if (kind === 'server') {
    serverMode = true;
    if (modeBadge) modeBadge.textContent = 'Private D1';
    if (modeNote) modeNote.textContent = note || 'Authenticated private HR queue.';
    if (actionButton) actionButton.textContent = 'Refresh queue';
    return;
  }
  serverMode = false;
  if (modeBadge) modeBadge.textContent = kind === 'auth' ? 'Access required' : 'Preview fallback';
  if (modeNote) modeNote.textContent = note;
}

function renderKpis() {
  kpiTotal.textContent = String(candidates.length);
  kpiPending.textContent = String(candidates.filter(x=>!x.latest_outcome).length);
  kpiAcademy.textContent = String(candidates.filter(x=>x.latest_outcome==='ACADEMY').length);
  kpiTest.textContent = String(candidates.filter(x=>x.latest_outcome==='SUPERVISED_TEST').length);
}

function renderQueue() {
  queueEl.replaceChildren();
  if (!candidates.length) {
    queueEl.append(el('div','hr-queue-empty',serverMode
      ? 'No completed candidates are currently waiting in the private HR queue.'
      : 'No preview candidate records are available.'));
    return;
  }
  for (const item of candidates) {
    const button = el('button',`hr-queue-item${item.id===selectedId?' active':''}`);
    button.type='button';
    const top=el('div','hr-queue-top');
    top.append(el('b','',item.name || shortId(item.id)),el('small','',formatDate(item.completed_at || item.created_at)));
    const meta=el('div','hr-queue-meta');
    for (const value of [item.track || 'unknown', item.source || 'unknown', reviewLabel(item.latest_outcome)]) meta.append(el('span','',value));
    button.append(top,meta);
    button.addEventListener('click',()=>selectCandidate(item.id));
    queueEl.append(button);
  }
}

function renderSources() {
  const map=new Map();
  for (const item of candidates) {
    const source=item.source || 'unknown';
    const row=map.get(source) || {total:0,academy:0,test:0,pending:0};
    row.total++;
    if (!item.latest_outcome) row.pending++;
    if (item.latest_outcome==='ACADEMY') row.academy++;
    if (item.latest_outcome==='SUPERVISED_TEST') row.test++;
    map.set(source,row);
  }
  sourceTable.replaceChildren();
  if (!map.size) {
    const tr=document.createElement('tr'); const td=el('td','hr-source-empty','No attribution data yet.'); td.colSpan=5; tr.append(td); sourceTable.append(tr); return;
  }
  for (const [source,row] of [...map.entries()].sort((a,b)=>b[1].total-a[1].total)) {
    const tr=document.createElement('tr');
    for (const value of [source,row.total,row.academy,row.test,row.pending]) tr.append(el('td','',String(value)));
    sourceTable.append(tr);
  }
}

function signalBlock(signals={}) {
  const wrap=el('div','hr-signal-list');
  if (!signals || !Object.keys(signals).length) {
    wrap.append(el('div','hr-queue-empty','No advisory practice signals were persisted. Review raw evidence instead.'));
    return wrap;
  }
  for (const [key,value] of Object.entries(signals)) {
    const row=el('div','hr-signal-row');
    row.append(el('b','',key));
    const meter=el('div','hr-signal-meter');
    const fill=el('i'); fill.style.width=`${Math.max(0,Math.min(100,Number(value)||0))}%`; meter.append(fill);
    row.append(meter,el('span','',String(value))); wrap.append(row);
  }
  return wrap;
}

function evidenceBlock(answers=[]) {
  const wrap=el('div','hr-evidence-list');
  if (!answers.length) { wrap.append(el('div','hr-queue-empty','No answer evidence is available.')); return wrap; }
  for (const answer of answers) {
    const card=el('div','hr-evidence');
    card.append(el('small','',`${answer.phase || 'EVIDENCE'} · ${answer.question_id || 'question'} · ${answer.evidence_id || 'no evidence id'}`));
    card.append(el('p','',answer.answer || ''));
    wrap.append(card);
  }
  return wrap;
}

function renderAccessMessage(title, copy) {
  detailEl.replaceChildren();
  const head=el('div','panel-head'); const box=el('div'); box.append(el('small','','PRIVATE HR'),el('h3','',title),el('p','',copy)); head.append(box); detailEl.append(head);
  const callout=el('div','callout hr-safe'); callout.append(el('b','','Security boundary: '),document.createTextNode('Production HR evidence is not exposed through the browser-local fallback when authentication or reviewer authorization fails.'));
  detailEl.append(callout);
}

function renderSnapshot(snapshot) {
  const candidate=snapshot.candidate;
  detailEl.replaceChildren();
  const card=el('div','hr-review-card');
  const head=el('div','panel-head');
  const copy=el('div');
  copy.append(el('small','','HUMAN REVIEW'),el('h3','',`${candidate.name} · ${candidate.track}`),el('p','',`${candidate.email}${candidate.telegram_handle ? ` · ${candidate.telegram_handle}` : ''} · ${candidate.country} · ${candidate.language}`));
  const latest=snapshot.reviews?.at(-1);
  head.append(copy,el('span',latest?'stage':'stage warn',reviewLabel(latest?.outcome)));
  card.append(head,el('div','hr-review-id',candidate.id));

  const source=el('div','hr-review-banner');
  source.append(el('b','','Funnel context only: '),document.createTextNode(`source ${candidate.source || 'unknown'} · ${JSON.stringify(candidate.attribution || {})}`));
  card.append(source);

  if (snapshot.session?.recommendation_code) {
    const advisory=el('div','hr-review-banner');
    advisory.append(el('b','','System development suggestion: '),document.createTextNode(snapshot.session.recommendation_code));
    card.append(advisory);
  }

  if (candidate.specialist_id) {
    const identity=el('div','callout hr-safe');
    identity.append(el('b','','Identity linked: '),document.createTextNode(`Hermes specialist ${candidate.specialist_id}. Academy bridge: ${snapshot.academy_link?.state || 'not active'}.`));
    card.append(identity);
  } else {
    const identity=el('div','callout');
    identity.append(el('b','','Account not linked yet: '),document.createTextNode('an Academy review decision may be recorded now, but enrollment is created only after the candidate authenticates and claims this HR record.'));
    card.append(identity);
  }

  card.append(el('h4','','Practice signals (advisory, never the employment decision)'),signalBlock(snapshot.session?.practice_signals));
  card.append(el('h4','','Job-relevant answer evidence'),evidenceBlock(snapshot.answers));

  if (snapshot.reviews?.length) {
    card.append(el('h4','','Review history'));
    const history=el('div','hr-evidence-list');
    for (const review of snapshot.reviews) {
      const item=el('div','hr-evidence');
      item.append(el('small','',`${review.outcome} · ${formatDate(review.created_at)} · reviewer ${shortId(review.reviewer_specialist_id)}`),el('p','',review.reason));
      history.append(item);
    }
    card.append(history);
  }

  const form=el('form','hr-review-form');
  const outcomeLabel=el('label','','Next controlled step');
  const select=document.createElement('select'); select.name='outcome'; select.required=true;
  const empty=document.createElement('option'); empty.value=''; empty.textContent='Select'; select.append(empty);
  for (const [value,label] of Object.entries(REVIEW_OUTCOMES)) { const option=document.createElement('option'); option.value=value; option.textContent=label; select.append(option); }
  if (latest?.outcome) select.value=latest.outcome;
  outcomeLabel.append(select);

  const reasonLabel=el('label','','Reviewer reason / evidence references');
  const reason=document.createElement('textarea'); reason.name='reason'; reason.required=true; reason.maxLength=4000; reason.placeholder='Reference the job-relevant evidence and explain why this is the appropriate next controlled step.';
  reasonLabel.append(reason);
  const save=el('button','btn primary','Record authenticated human review'); save.type='submit';
  form.append(outcomeLabel,reasonLabel,save);
  form.addEventListener('submit',async(event)=>{
    event.preventDefault(); save.disabled=true;
    try {
      const response=await fetch(API_URL,{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({candidate_id:candidate.id,outcome:select.value,reason:reason.value.trim()})});
      const payload=await response.json().catch(()=>({}));
      if (!response.ok || payload.success!==true) throw new Error(payload.error || `HTTP ${response.status}`);
      showToast('Authenticated human review recorded in Hermes HR.');
      await loadServerQueue();
      await selectCandidate(candidate.id);
    } catch(error) {
      showToast(`Review not saved: ${error instanceof Error ? error.message : 'server error'}`);
    } finally { save.disabled=false; }
  });
  card.append(form); detailEl.append(card);
}

async function selectCandidate(candidateId) {
  selectedId=candidateId; renderQueue();
  try {
    const response=await fetch(`${API_URL}?candidate_id=${encodeURIComponent(candidateId)}`,{credentials:'same-origin',headers:{'Accept':'application/json'}});
    const payload=await response.json().catch(()=>({}));
    if (!response.ok || payload.success!==true) throw new Error(payload.error || `HTTP ${response.status}`);
    renderSnapshot(payload.snapshot);
  } catch(error) {
    renderAccessMessage('Candidate evidence unavailable',error instanceof Error ? error.message : 'Server error');
  }
}

async function loadServerQueue() {
  const response=await fetch(API_URL,{credentials:'same-origin',headers:{'Accept':'application/json'}});
  const payload=await response.json().catch(()=>({}));
  if (response.status===401) {
    setMode('auth','Sign in to Hermes Connect before opening the private HR queue.');
    candidates=[]; renderKpis(); renderQueue(); renderSources(); renderAccessMessage('Hermes sign-in required','This production HR queue is private. Sign in with an authorized Hermes account.');
    return { handled:true, authorized:false };
  }
  if (response.status===403) {
    setMode('auth','Your Hermes account does not have HR reviewer or internal owner access.');
    candidates=[]; renderKpis(); renderQueue(); renderSources(); renderAccessMessage('HR reviewer access required','Your authenticated account is not authorized to review candidate evidence.');
    return { handled:true, authorized:false };
  }
  if (response.status===404) return { handled:false, authorized:false };
  if (!response.ok || payload.success!==true) throw new Error(payload.error || `HTTP ${response.status}`);
  reviewer=payload.reviewer; candidates=Array.isArray(payload.candidates)?payload.candidates:[];
  setMode('server',`Authenticated as ${reviewer?.name || reviewer?.id || 'reviewer'} · access via ${reviewer?.access_source || 'HR capability'}.`);
  renderKpis(); renderQueue(); renderSources();
  if (selectedId && candidates.some(x=>x.id===selectedId)) await selectCandidate(selectedId);
  else if (candidates.length) await selectCandidate(candidates[0].id);
  else renderAccessMessage('Queue is clear','No completed HR interviews are waiting for review.');
  return { handled:true, authorized:true };
}

async function boot() {
  try {
    const result=await loadServerQueue();
    if (result.handled) return;
  } catch(error) {
    if (location.hostname === 'hermeslogisticsus.com' || location.hostname === 'connect.hermeslogisticsus.com') {
      setMode('auth','Private HR API is temporarily unavailable. Local fallback is intentionally disabled on production.');
      renderAccessMessage('HR API unavailable','The production HR queue could not be loaded. No private evidence has been exposed locally.');
      return;
    }
  }
  setMode('preview','Private HR API is not present on this preview origin; using browser-local prototype evidence only.');
  await import('./hr-admin.mjs');
}

actionButton?.addEventListener('click',async()=>{
  if (!serverMode) return;
  actionButton.disabled=true;
  try { await loadServerQueue(); showToast('Private HR queue refreshed.'); }
  catch { showToast('Private HR queue refresh failed.'); }
  finally { actionButton.disabled=false; }
});

boot();
