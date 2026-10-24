(() => {
const $=id=>document.getElementById(id);
const state=$("dispatcher-state"),queue=$("dispatcher-queue"),companies=$("dispatcher-carriers"),loads=$("dispatcher-loads");
const loadSearch=$("dispatcher-load-search");
const metrics={
 loads:$("dispatcher-metric-loads"),carriers:$("dispatcher-metric-carriers"),requested:$("dispatcher-metric-requested"),
 reviewing:$("dispatcher-metric-reviewing"),active:$("dispatcher-metric-active"),stale:$("dispatcher-metric-stale")
};
let data=null,filter="open";
const el=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=String(text);if(cls)x.className=cls;return x};
function info(msg,error=false){state.textContent=msg;state.classList.toggle("wsp-error",error)}
async function mutate(requestId,status){
 const r=await fetch("/api/load-board/dispatcher-workspace",{method:"POST",credentials:"same-origin",
  headers:{"Content-Type":"application/json"},body:JSON.stringify({requestId,status})});
 const p=await r.json().catch(()=>({}));if(!r.ok)throw Error(p.error||"Status was not updated");return p;
}
function requestCard(r){
 const card=el("article",undefined,"wsp-load");
 card.append(el("span",r.status.toUpperCase(),"wsp-chip"));
 card.append(el("h3",r.carrierName+" · "+r.origin+" → "+r.destination));
 const meta=el("p",["Equipment: "+(r.equipment||"Review"),"Vehicles: "+(r.vehicleCount??"Review"),
  "Pickup: "+(r.pickupWindow||"Review"),"Posted rate: "+(r.offeredRate??"Review")].join(" · "),"wsp-muted");
 card.append(meta);
 if(r.message)card.append(el("p","Carrier note: "+r.message,"wsp-muted"));
 if(!r.loadStillActive)card.append(el("p","The original load may be expired or withdrawn. Verify before any action.","wsp-status wsp-error"));
 if(r.statusNote)card.append(el("p","Dispatch note: "+r.statusNote,"wsp-muted"));
 const actions=el("div",undefined,"wsp-actions");
 const transitions=r.status==="requested"?["seen","reviewing","unavailable","declined"]:
  r.status==="seen"?["reviewing","unavailable","declined"]:
  r.status==="reviewing"?["unavailable","declined"]:[];
 for(const target of transitions){
  const b=el("button",target==="seen"?"Mark seen":target==="reviewing"?"Start review":target==="unavailable"?"Unavailable":"Decline",
    target==="declined"?"wsp-btn warning":"wsp-btn secondary");
  b.type="button";b.addEventListener("click",async()=>{b.disabled=true;try{await mutate(r.id,target);await refresh();info("Internal status updated. No source contacted or load booked.");}
    catch(e){info(e.message,true);b.disabled=false}});
  actions.append(b);
 }
 card.append(actions);return card;
}
function loadCard(r){
 const card=el("article",undefined,"wsp-load");
 card.append(el("span","AVAILABLE FOR DISPATCH REVIEW","wsp-chip"));
 card.append(el("h3",(r.origin||"Origin under review")+" → "+(r.destination||"Destination under review")));
 const rate=r.rate&&Number.isFinite(Number(r.rate.amount))?"$"+Number(r.rate.amount).toLocaleString("en-US"):"Rate under review";
 const meta=[
  r.equipment||"Equipment under review",
  r.vehicleCount==null?"Units under review":r.vehicleCount+" unit(s)",
  r.miles==null?"Miles under review":r.miles+" mi",
  rate
 ].join(" · ");
 card.append(el("p",meta,"wsp-muted"));
 if(r.pickupWindow)card.append(el("p","Pickup: "+r.pickupWindow,"wsp-muted"));
 if(r.expiresAt)card.append(el("p","Expires: "+new Date(r.expiresAt).toLocaleString(),"wsp-muted"));
 card.append(el("p","Source identity and direct contact stay hidden. Verify the load, authority, carrier fit and current availability before any outside action.","wsp-notice"));
 return card;
}
function renderSummary(){
 const s=data?.summary||{};
 if(metrics.loads)metrics.loads.textContent=String(s.availableLoads??data?.loads?.length??0);
 if(metrics.carriers)metrics.carriers.textContent=String(s.assignedCarriers??0);
 if(metrics.requested)metrics.requested.textContent=String(s.requested??0);
 if(metrics.reviewing)metrics.reviewing.textContent=String((s.seen??0)+(s.reviewing??0));
 if(metrics.active)metrics.active.textContent=String(s.activeOpen??0);
 if(metrics.stale)metrics.stale.textContent=String(s.staleOpen??0);
}
function renderLoads(){
 if(!loads)return;
 loads.replaceChildren();
 if(!data)return;
 const q=String(loadSearch?.value||"").trim().toLowerCase();
 const rows=(data.loads||[]).filter(r=>!q||[r.origin,r.destination,r.equipment,r.pickupWindow]
   .filter(Boolean).join(" ").toLowerCase().includes(q));
 if(!rows.length){
  loads.append(el("p",q?"No current permissioned loads match this filter.":"No current permissioned loads are available for this dispatcher view.","wsp-muted"));
  return;
 }
 for(const r of rows)loads.append(loadCard(r));
}
function render(){
 queue.replaceChildren();companies.replaceChildren();if(!data)return;renderSummary();renderLoads();
 if(!data.assignments.length)companies.append(el("p","No active carrier assignments.","wsp-muted"));
 for(const a of data.assignments){const box=el("div",undefined,"wsp-assignment");box.append(el("strong",a.name));
   box.append(el("p",a.location||"Location pending","wsp-muted"));companies.append(box)}
 const rows=data.requests.filter(r=>filter==="all"||!["declined","unavailable"].includes(r.status));
 if(!rows.length){queue.append(el("p","No requests in this view.","wsp-muted"));return}
 for(const r of rows)queue.append(requestCard(r));
}
async function refresh(){
 const r=await fetch("/api/load-board/dispatcher-workspace",{credentials:"same-origin",cache:"no-store"});
 const p=await r.json().catch(()=>({}));
 if(!r.ok){
  data=null;queue.replaceChildren(el("p","Dispatcher access is restricted to verified Hermes staff assignments.","wsp-muted"));
  if(loads)loads.replaceChildren(el("p","No dispatcher load access.","wsp-muted"));
  info(p.error||"No dispatcher access",true);return
 }
 data=p;
 info((data.summary?.availableLoads??data.loads?.length??0)+" permissioned load(s) · "+(data.summary?.requested??0)+" waiting carrier request(s) · "+(data.summary?.assignedCarriers??data.assignments.length)+" assigned carrier(s)");
 render();
}
for(const b of document.querySelectorAll("[data-status-filter]"))b.addEventListener("click",()=>{
 filter=b.dataset.statusFilter;for(const x of document.querySelectorAll("[data-status-filter]"))x.setAttribute("aria-selected",String(x===b));render();
});
if(loadSearch)loadSearch.addEventListener("input",renderLoads);
refresh().catch(e=>info(e.message,true));
})();