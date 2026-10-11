(() => {
const $=id=>document.getElementById(id),form=$("ops-assignment"),list=$("ops-companies"),state=$("ops-state");
const el=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=String(text);if(cls)x.className=cls;return x};
const info=(t,err=false)=>{state.textContent=t;state.classList.toggle("wsp-error",err)};
async function api(method,body){
 const r=await fetch("/api/load-board/dispatch-admin",{method,credentials:"same-origin",cache:"no-store",
 headers:{"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
 const p=await r.json().catch(()=>({}));if(!r.ok)throw Error(p.error||"Request failed");return p;
}
async function mutate(companyId,action){
 try{await api("POST",{companyId,action,note:"Reviewed by internal Hermes owner"});await refresh();info("Internal "+action+" saved. No external notification sent.")}
 catch(e){info(e.message,true)}
}
async function refresh(){
 const data=await api("GET");list.replaceChildren();
 info("Internal access verified · "+data.companies.length+" carrier company record(s)");
 for(const c of data.companies){
  const box=el("article",undefined,"wsp-load");
  box.append(el("h3",c.name+" · "+c.type));
  box.append(el("p","ID: "+c.id,"wsp-code"));
  box.append(el("p","Entitlement: "+c.entitlement+(c.assignment?" · Dispatcher: "+c.assignment.name:" · Dispatcher pending"),"wsp-muted"));
  const a=el("div",undefined,"wsp-actions");
  const b=el("button",c.entitlement==="active"?"Revoke access":"Grant after review","wsp-btn secondary");
  b.type="button";b.onclick=()=>mutate(c.id,c.entitlement==="active"?"revoke":"grant");a.append(b);
  if(c.assignment){const revoke=el("button","Revoke assignment","wsp-btn warning");
    revoke.type="button";revoke.onclick=()=>mutate(c.id,"unassign");a.append(revoke)}
  const assign=el("button","Assign this carrier","wsp-btn secondary");assign.type="button";
  assign.onclick=()=>{form.elements.namedItem("companyId").value=c.id;form.scrollIntoView({behavior:"smooth"})};a.append(assign);
  box.append(a);list.append(box);
 }
}
form.addEventListener("submit",async(event)=>{
 event.preventDefault();const submit=form.querySelector('button[type="submit"]');submit.disabled=true;
 const values=new FormData(form);
 try{await api("POST",{action:"assign",companyId:values.get("companyId"),dispatcherId:values.get("dispatcherId"),
  businessPhone:values.get("businessPhone"),identityVerified:values.has("identityVerified"),
  businessPhoneVerified:values.has("businessPhoneVerified")});
  form.reset();await refresh();info("Verified dispatcher assignment recorded.")}
 catch(e){info(e.message,true)}finally{submit.disabled=false}
});
refresh().catch(e=>{list.replaceChildren(el("p","Internal owner access required.","wsp-muted"));info(e.message,true)});
})();