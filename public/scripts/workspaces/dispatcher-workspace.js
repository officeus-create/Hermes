(() => {
const $=id=>document.getElementById(id);
const state=$("dispatcher-state"),queue=$("dispatcher-queue"),companies=$("dispatcher-carriers");
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
function render(){
 queue.replaceChildren();companies.replaceChildren();if(!data)return;
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
 if(!r.ok){data=null;queue.replaceChildren(el("p","Dispatcher access is restricted to verified Hermes staff assignments.","wsp-muted"));info(p.error||"No dispatcher access",true);return}
 data=p;info(data.requests.filter(r=>r.status==="requested").length+" waiting carrier request(s) · "+data.assignments.length+" assigned carrier(s)");
 render();
}
for(const b of document.querySelectorAll("[data-status-filter]"))b.addEventListener("click",()=>{
 filter=b.dataset.statusFilter;for(const x of document.querySelectorAll("[data-status-filter]"))x.setAttribute("aria-selected",String(x===b));render();
});
refresh().catch(e=>info(e.message,true));
})();