const QUEUE_KEY = 'hermes-connect-hr-review-queue-v1';
const ACADEMY_HANDOFF_KEY = 'hermes-connect-academy-hr-handoffs-v1';
const REVIEW_OUTCOMES = Object.freeze({
  ACADEMY: 'Academy practice',
  MORE_EVIDENCE: 'Request more evidence',
  SUPERVISED_TEST: 'Authorize supervised test'
});

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value ?? fallback;
  } catch { return fallback; }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readQueue() {
  const value = readJson(QUEUE_KEY, []);
  return Array.isArray(value) ? value : [];
}

function saveQueue(queue) {
  writeJson(QUEUE_KEY, queue);
}

function formatDate(value) {
  if (!value) return '—';
  try { return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)); }
  catch { return value; }
}

function shortId(value='') { return value.length > 18 ? `${value.slice(0,10)}…${value.slice(-6)}` : value; }

function capabilityGaps(signals={}) {
  return Object.entries(signals)
    .map(([capability,score])=>({capability,score:Number(score)||0}))
    .sort((a,b)=>a.score-b.score)
    .slice(0,3);
}

function syncAcademyHandoff(candidate) {
  const handoffs = readJson(ACADEMY_HANDOFF_KEY, []);
  const list = Array.isArray(handoffs) ? handoffs : [];
  const index = list.findIndex(row=>row.candidate_id===candidate.candidate_id);

  const record = {
    handoff_id: index >= 0 ? list[index].handoff_id : `handoff_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
    candidate_id: candidate.candidate_id,
    learner_id: candidate.learner_id || candidate.candidate_id,
    track: candidate.track,
    status: candidate.review?.outcome === 'ACADEMY' ? 'READY_FOR_ACADEMY_INTAKE' : 'NOT_ACTIVE',
    capability_gaps: capabilityGaps(candidate.practice_signals),
    evidence_ids: (candidate.answers || []).map(answer=>answer.evidence_id).filter(Boolean),
    source_review: {
      reviewer: candidate.review?.reviewer || null,
      reason: candidate.review?.reason || null,
      reviewed_at: candidate.review?.reviewed_at || null,
      automated: false
    },
    created_from: 'HERMES_CONNECT_HR',
    updated_at: new Date().toISOString()
  };

  if (index >= 0) list[index] = record;
  else list.unshift(record);
  writeJson(ACADEMY_HANDOFF_KEY, list.slice(0,250));
  return record;
}

const queueEl = document.querySelector('[data-review-queue]');
const detailEl = document.querySelector('[data-review-detail]');
const sourceTable = document.querySelector('[data-source-table]');
const toast = document.querySelector('[data-toast]');
const kpiTotal = document.querySelector('[data-kpi-total]');
const kpiPending = document.querySelector('[data-kpi-pending]');
const kpiAcademy = document.querySelector('[data-kpi-academy]');
const kpiTest = document.querySelector('[data-kpi-test]');
let selectedId = null;

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2200);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function reviewLabel(review) {
  return review?.outcome ? REVIEW_OUTCOMES[review.outcome] || review.outcome : 'Awaiting review';
}

function renderKpis(queue) {
  kpiTotal.textContent = String(queue.length);
  kpiPending.textContent = String(queue.filter(x=>!x.review?.outcome).length);
  kpiAcademy.textContent = String(queue.filter(x=>x.review?.outcome==='ACADEMY').length);
  kpiTest.textContent = String(queue.filter(x=>x.review?.outcome==='SUPERVISED_TEST').length);
}

function renderQueue(queue) {
  queueEl.replaceChildren();
  if (!queue.length) {
    queueEl.append(el('div','hr-queue-empty','No completed local pilot interviews yet. Complete the candidate flow in this browser and the record will appear here.'));
    return;
  }

  for (const item of queue) {
    const button = el('button',`hr-queue-item${item.candidate_id===selectedId?' active':''}`);
    button.type = 'button';
    const top = el('div','hr-queue-top');
    top.append(el('b','',shortId(item.candidate_id)), el('small','',formatDate(item.completed_at)));
    const meta = el('div','hr-queue-meta');
    for (const value of [item.track || 'unknown', item.source || 'unknown', reviewLabel(item.review)]) meta.append(el('span','',value));
    button.append(top, meta);
    button.addEventListener('click',()=>{ selectedId=item.candidate_id; renderAll(); });
    queueEl.append(button);
  }
}

function signalBlock(signals={}) {
  const wrap = el('div','hr-signal-list');
  for (const [key,value] of Object.entries(signals)) {
    const row = el('div','hr-signal-row');
    row.append(el('b','',key));
    const meter = el('div','hr-signal-meter');
    const fill = el('i');
    fill.style.width = `${Math.max(0,Math.min(100,Number(value)||0))}%`;
    meter.append(fill);
    row.append(meter,el('span','',String(value)));
    wrap.append(row);
  }
  return wrap;
}

function evidenceBlock(answers=[]) {
  const wrap = el('div','hr-evidence-list');
  if (!answers.length) {
    wrap.append(el('div','hr-queue-empty','No answer evidence is available in this local record.'));
    return wrap;
  }
  for (const answer of answers) {
    const card = el('div','hr-evidence');
    card.append(el('small','',`${answer.phase || 'EVIDENCE'} · ${answer.id || 'question'} · ${answer.evidence_id || 'no evidence id'}`));
    card.append(el('p','',answer.answer || ''));
    wrap.append(card);
  }
  return wrap;
}

function renderDetail(queue) {
  const item = queue.find(x=>x.candidate_id===selectedId);
  if (!item) {
    detailEl.replaceChildren();
    const head = el('div','panel-head');
    const copy = el('div'); copy.append(el('small','','REVIEW CARD'),el('h3','','Select a candidate'),el('p','','Open an item from the queue to inspect evidence and record the next controlled step.'));
    head.append(copy); detailEl.append(head);
    const callout = el('div','callout hr-safe');
    callout.append(el('b','','Allowed V0 outcomes: '),document.createTextNode('Academy practice, request more job-relevant evidence, or authorize a supervised test. This pilot intentionally does not implement automated rejection.'));
    detailEl.append(callout);
    return;
  }

  detailEl.replaceChildren();
  const card = el('div','hr-review-card');
  const head = el('div','panel-head');
  const copy = el('div');
  copy.append(el('small','','HUMAN REVIEW'),el('h3','',item.track || 'Candidate'),el('p','',`Completed ${formatDate(item.completed_at)} · source ${item.source || 'unknown'}`));
  const stage = el('span',item.review?.outcome ? 'stage' : 'stage warn',reviewLabel(item.review));
  head.append(copy,stage);
  card.append(head,el('div','hr-review-id',item.candidate_id));

  const advisory = el('div','hr-review-banner');
  advisory.append(el('b','','System development suggestion: '),document.createTextNode(item.development_recommendation?.title || 'No suggestion available.'));
  card.append(advisory);

  if (item.review?.outcome === 'ACADEMY') {
    const bridge = el('div','hr-review-banner');
    bridge.append(el('b','','Academy bridge: '),document.createTextNode('A human-approved handoff is prepared under the same learner ID. Capability gaps and evidence IDs are carried forward; protected/context fields are not used to decide readiness.'));
    card.append(bridge);
  }

  card.append(el('h4','','Practice signals (advisory, not an employment decision)'),signalBlock(item.practice_signals));
  card.append(el('h4','','Job-relevant answer evidence'),evidenceBlock(item.answers));

  const form = el('form','hr-review-form');
  const outcomeLabel = el('label','','Next controlled step');
  const select = document.createElement('select');
  select.name='outcome'; select.required=true;
  const empty = document.createElement('option'); empty.value=''; empty.textContent='Select'; select.append(empty);
  for (const [value,label] of Object.entries(REVIEW_OUTCOMES)) {
    const option=document.createElement('option'); option.value=value; option.textContent=label; select.append(option);
  }
  if (item.review?.outcome) select.value=item.review.outcome;
  outcomeLabel.append(select);

  const reasonLabel=el('label','','Reviewer reason / evidence reference');
  const reason=document.createElement('textarea'); reason.name='reason'; reason.required=true; reason.maxLength=1200; reason.placeholder='State the job-relevant evidence and why this next step is appropriate.'; reason.value=item.review?.reason || '';
  reasonLabel.append(reason);

  const reviewerLabel=el('label','','Reviewer identifier');
  const reviewer=document.createElement('input'); reviewer.name='reviewer'; reviewer.required=true; reviewer.maxLength=120; reviewer.placeholder='Authorized reviewer name or internal ID'; reviewer.value=item.review?.reviewer || '';
  reviewerLabel.append(reviewer);

  const save=el('button','btn primary','Record human review'); save.type='submit';
  form.append(outcomeLabel,reasonLabel,reviewerLabel,save);
  form.addEventListener('submit',(event)=>{
    event.preventDefault();
    const current=readQueue();
    const index=current.findIndex(x=>x.candidate_id===item.candidate_id);
    if (index<0) return;
    const data=new FormData(form);
    current[index].review={
      outcome:data.get('outcome'),
      reason:String(data.get('reason')||'').trim(),
      reviewer:String(data.get('reviewer')||'').trim(),
      reviewed_at:new Date().toISOString(),
      automated:false
    };
    current[index].review_events ||= [];
    current[index].review_events.push({
      event_id:`review_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
      type:'human_review_recorded',
      occurred_at:current[index].review.reviewed_at,
      outcome:current[index].review.outcome,
      reviewer:current[index].review.reviewer
    });
    const handoff = syncAcademyHandoff(current[index]);
    current[index].review_events.push({
      event_id:`bridge_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
      type: current[index].review.outcome === 'ACADEMY' ? 'academy_handoff_prepared' : 'academy_handoff_inactive',
      occurred_at:handoff.updated_at,
      handoff_id:handoff.handoff_id,
      learner_id:handoff.learner_id,
      automated:false
    });
    saveQueue(current);
    showToast(current[index].review.outcome === 'ACADEMY' ? 'Human review saved. Academy handoff prepared.' : 'Human review recorded locally.');
    renderAll();
  });
  card.append(form);
  detailEl.append(card);
}

function renderSources(queue) {
  const map=new Map();
  for (const item of queue) {
    const source=item.source || item.attribution?.utm_source || 'unknown';
    const row=map.get(source) || {total:0,academy:0,test:0,pending:0};
    row.total++;
    if (!item.review?.outcome) row.pending++;
    if (item.review?.outcome==='ACADEMY') row.academy++;
    if (item.review?.outcome==='SUPERVISED_TEST') row.test++;
    map.set(source,row);
  }
  sourceTable.replaceChildren();
  if (!map.size) {
    const tr=document.createElement('tr'); const td=el('td','hr-source-empty','No local attribution data yet.'); td.colSpan=5; tr.append(td); sourceTable.append(tr); return;
  }
  for (const [source,row] of [...map.entries()].sort((a,b)=>b[1].total-a[1].total)) {
    const tr=document.createElement('tr');
    for (const value of [source,row.total,row.academy,row.test,row.pending]) tr.append(el('td','',String(value)));
    sourceTable.append(tr);
  }
}

function renderAll() {
  const queue=readQueue();
  if (selectedId && !queue.some(x=>x.candidate_id===selectedId)) selectedId=null;
  renderKpis(queue); renderQueue(queue); renderDetail(queue); renderSources(queue);
}

document.querySelector('[data-clear-queue]').addEventListener('click',()=>{
  localStorage.removeItem(QUEUE_KEY); selectedId=null; renderAll(); showToast('Local review queue cleared.');
});

window.addEventListener('storage',(event)=>{ if (event.key===QUEUE_KEY) renderAll(); });
renderAll();
