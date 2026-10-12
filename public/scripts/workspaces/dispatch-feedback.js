(()=>{const form=document.getElementById("load-board-staff-feedback-form"),status=document.getElementById("load-board-staff-feedback-status"),list=document.getElementById("load-board-staff-feedback-list");if(!form||!list)return;
const make=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=String(text);if(cls)x.className=cls;return x};
async function api(init){const response=await fetch("/api/load-board/staff-feedback",{credentials:"same-origin",cache:"no-store",...init});const result=await response.json().catch(()=>({}));if(!response.ok)throw Error(result.error||"Unable to save feedback");return result}
async function refresh(){const data=await api();list.replaceChildren();
 if(!data.feedback.length)list.append(make("p","No internal feedback has been submitted.","wsp-muted"));
 for(const item of data.feedback){const card=make("article",undefined,"wsp-load");card.append(make("strong",item.area+" · "+item.authorName));card.append(make("p",item.note,"wsp-muted"));card.append(make("small",item.createdAt,"wsp-code"));list.append(card)}
}
form.addEventListener("submit",async event=>{event.preventDefault();const button=form.querySelector("button[type=submit]");button.disabled=true;
try{const d=new FormData(form);await api({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({area:d.get("area"),note:d.get("note")})});form.reset();status.textContent="Feedback saved to Hermes internal workspace; no external messages were sent.";await refresh()}
catch(e){status.textContent=e.message}finally{button.disabled=false}});
refresh().catch(e=>{status.textContent=e.message});
})();