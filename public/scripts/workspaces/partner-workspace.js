(() => {
const $=id=>document.getElementById(id);
const state=$("partner-state"),list=$("partner-posts"),form=$("partner-post"),company=$("partner-company");
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n};
const info=(s,error=false)=>{state.textContent=s;state.classList.toggle("wsp-error",error)};
async function api(url,init){
 const res=await fetch(url,{credentials:"same-origin",cache:"no-store",...init,
    headers:{"Accept":"application/json",...(init?.headers||{})}});
 const json=await res.json().catch(()=>({}));
 if(!res.ok)throw Error(json.error||json.errors?.join(", ")||"Request failed ("+res.status+")");
 return json;
}
function show(p){
 list.replaceChildren();company.textContent=p.company?.name||"Company not registered";
 const allowed=["dealer","shipper"].includes(p.company?.company_type);
 form.hidden=!allowed;
 if(!allowed){
  info("A verified dealer or shipper company account is required for this workspace.",true);
  list.append(el("p","Sign in with your own dealer/shipper company. Broker users cannot view private carrier loads.","wsp-muted"));return;
 }
 info("Company workspace: "+p.company.name+" · "+p.posts.filter(x=>x.status==="active"&&x.type==="load").length+" active submission(s).");
 const rows=p.posts.filter(x=>x.type==="load");
 if(!rows.length){list.append(el("p","No transport requests posted by your company yet.","wsp-muted"));return}
 for(const x of rows){
  const c=el("article",undefined,"wsp-load");
  c.append(el("span",(x.status||"pending").toUpperCase(),"wsp-chip"));
  c.append(el("h3",(x.origin||"Origin pending")+" → "+(x.destination||"Destination pending")));
  c.append(el("p",["Pickup: "+(x.pickup_window||"Review"),"Vehicles: "+(x.vehicle_count??"Review"),
    "Equipment: "+(x.equipment||"Review"),"Rate: "+(x.rate_amount??"Negotiable")].join(" · "),"wsp-muted"));
  c.append(el("p","This submission does not confirm a booking, carrier assignment or human review.","wsp-muted"));
  if(x.status==="active"){
    const b=el("button","Withdraw from Hermes board","wsp-btn warning");b.type="button";
    b.onclick=async()=>{b.disabled=true;try{await api("/api/load-board/posts/"+encodeURIComponent(x.id),{method:"DELETE"});await refresh();}
      catch(e){info(e.message,true);b.disabled=false}};
    c.append(b);
  }
  list.append(c);
 }
}
async function refresh(){
 try{const payload=await api("/api/load-board/posts");show(payload)}
 catch(e){form.hidden=true;list.replaceChildren(el("p","No approved company session. Sign in or register your business first.","wsp-muted"));info(e.message,true)}
}
form.addEventListener("submit",async(e)=>{
 e.preventDefault();const submit=form.querySelector('button[type="submit"]');submit.disabled=true;
 try{
  const f=new FormData(form);
  if(!f.has("rights_attested"))throw Error("Rights attestation required");
  const price=String(f.get("rate_amount")||"").trim();
  const payload={type:"load",origin:String(f.get("origin")||""),destination:String(f.get("destination")||""),
    pickup_window:String(f.get("pickup_window")||""),vehicle_count:Number(f.get("vehicle_count")||1),
    equipment:String(f.get("equipment")||"car_hauler"),
    notes:String(f.get("notes")||""),rights_attested:true,expires_in_hours:24};
  if(price)payload.rate_amount=Number(price);
  await api("/api/load-board/posts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  form.reset();info("Internal transport opportunity submitted. No booking or outside contact occurred.");await refresh();
 }catch(e){info(e.message,true)}finally{submit.disabled=false}
});
refresh();
})();