import { sortByLaneFit } from "./carrier-lane-fit.mjs";
(() => {
const $=id=>document.getElementById(id);
const list=$("carrier-loads"),state=$("carrier-state"),person=$("carrier-dispatcher");
let model=null,tab="all",lanePreferences={},preferencesLoaded=false;
const laneForm=$("carrier-lane-preferences"),laneFeedback=$("carrier-lane-feedback");
async function loadLanePreferences(){
  const r=await fetch("/api/load-board/carrier-lane-preferences",{credentials:"same-origin",cache:"no-store"});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(data.error||"Route preferences not available");
  lanePreferences=data.preferences||{};
  for(const name of ["originState","destinationState","equipment","availableSlots"]){
    const input=laneForm.elements.namedItem(name);
    if(input)input.value=lanePreferences[name]??"";
  }
  preferencesLoaded=true;
  laneFeedback.textContent=lanePreferences.updatedAt?"Saved route preferences loaded.":"No route preferences saved yet.";
}
laneForm.addEventListener("submit",async event=>{
  event.preventDefault();
  const save=laneForm.querySelector('button[type="submit"]');
  save.disabled=true;
  const values=new FormData(laneForm);
  const slotValue=String(values.get("availableSlots")||"").trim();
  const payload={
    originState:String(values.get("originState")||"").trim().toUpperCase()||null,
    destinationState:String(values.get("destinationState")||"").trim().toUpperCase()||null,
    equipment:String(values.get("equipment")||"")||null,
    availableSlots:slotValue?Number(slotValue):null,
  };
  try {
    const response=await fetch("/api/load-board/carrier-lane-preferences",{
      method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(result.error||"Unable to save preferences");
    lanePreferences=result.preferences;preferencesLoaded=true;
    laneFeedback.textContent="Saved. Eligible loads are now sorted by preference compatibility. Your dispatcher must still confirm every load.";
    render();
  }catch(error){laneFeedback.textContent=error.message;}
  finally{save.disabled=false;}
});
const el=(tag,value,cls)=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=String(value);if(cls)n.className=cls;return n};
const status=(msg,error=false)=>{state.textContent=msg;state.classList.toggle("wsp-error",error)};
async function send(action,loadId){
 const r=await fetch("/api/load-board/carrier-workspace",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,loadId})});
 const p=await r.json().catch(()=>({}));if(!r.ok)throw Error(p.error||"Request failed");return p;
}
function article(l,fit){
 const a=el("article",undefined,"wsp-load");a.append(el("span","AVAILABLE FOR DISPATCH REVIEW · NOT BOOKED","wsp-chip"));
 a.append(el("h3",l.origin+" → "+l.destination));
 const fields=el("div",undefined,"wsp-meta");
 const bits=["Equipment: "+l.equipment,"Vehicles: "+(l.vehicleCount??"Review"),"Pickup: "+(l.pickupWindow||"Review"),
   "Rate: "+(l.rate?"$"+Number(l.rate.amount).toLocaleString("en-US")+" indicative":"On review")];
 for(const bit of bits)fields.append(el("span",bit));a.append(fields);
 if(fit?.configured){
   const fitLabel=fit.matching+" preference match(es)"+(fit.mismatched?" · "+fit.mismatched+" outside preference(s)":"")+
     (fit.unknown?" · "+fit.unknown+" unconfirmed":"")+". Dispatcher confirmation required.";
   a.append(el("p",fitLabel,"wsp-muted"));
 }
 const actions=el("div",undefined,"wsp-actions"),save=el("button",model.savedLoadIds.includes(l.id)?"Unsave":"Save","wsp-btn secondary");
 save.type="button";save.onclick=async()=>{save.disabled=true;try{await send(model.savedLoadIds.includes(l.id)?"unsave":"save",l.id);await refresh()}catch(e){status(e.message,true);save.disabled=false}};
 const request=el("button","Request this load","wsp-btn");request.type="button";
 if(model.interests.some(x=>x.loadId===l.id)){request.disabled=true;request.textContent="Already requested";}
 request.onclick=async()=>{request.disabled=true;try{await send("interest",l.id);status("Request queued internally. No freight has been booked.");await refresh()}catch(e){status(e.message,true);request.disabled=false}};
 actions.append(save,request);a.append(actions);return a;
}
function render(){
 list.replaceChildren();if(!model)return;
 if(tab==="requests"){
   if(!model.interests.length){list.append(el("p","No requests yet.","wsp-muted"));return}
   for(const r of model.interests){const a=el("article",undefined,"wsp-load");a.append(el("h3","Request "+r.id));
      a.append(el("p","Status: "+r.status,"wsp-muted"));if(r.statusNote)a.append(el("p",r.statusNote,"wsp-muted"));list.append(a)}
   return;
 }
 const search=$("carrier-location").value.toLowerCase().trim(),equip=$("carrier-equipment").value;
 const records=model.loads.filter(x=>(tab!=="saved"||model.savedLoadIds.includes(x.id))&&
  (!equip||x.equipment===equip)&&(!search||(x.origin+" "+x.destination).toLowerCase().includes(search)));
 if(!records.length){list.append(el("p","No current eligible loads match these filters.","wsp-muted"));return}
 for(const ranked of sortByLaneFit(records,lanePreferences))list.append(article(ranked.load,ranked.fit));
}
async function refresh(){
 const r=await fetch("/api/load-board/carrier-workspace",{cache:"no-store",credentials:"same-origin"});
 const p=await r.json().catch(()=>({}));
 if(!r.ok){model=null;list.replaceChildren(el("p","Sign in and complete Hermes carrier verification to open the private load list.","wsp-muted"));
   person.textContent="Dispatcher assignment unavailable.";laneForm.hidden=true;status(p.error||"Access not approved",true);return}
 model=p;status("Approved carrier · "+model.loads.length+" current permitted loads");
 if(!preferencesLoaded)await loadLanePreferences().catch(e=>{laneFeedback.textContent=e.message;});
 person.replaceChildren();
 if(model.dispatcher){
  person.append(el("strong",model.dispatcher.name));person.append(el("p",model.dispatcher.businessPhone,"wsp-muted"));
  const a=el("a","Call assigned dispatcher","wsp-btn");a.href="tel:"+model.dispatcher.businessPhone.replace(/[^+0-9]/g,"");person.append(a);
 }else person.append(el("p","No verified dispatcher assignment. Load requests cannot be submitted.","wsp-muted"));
 render();
}
for(const b of document.querySelectorAll("[data-carrier-tab]"))b.addEventListener("click",()=>{
 tab=b.dataset.carrierTab;for(const x of document.querySelectorAll("[data-carrier-tab]"))x.setAttribute("aria-selected",String(x===b));render();
});
$("carrier-location").addEventListener("input",render);$("carrier-equipment").addEventListener("change",render);
refresh().catch(e=>status(e.message,true));
})();