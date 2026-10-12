(() => {
  const root=document.getElementById("owner-role-content");
  const gate=document.getElementById("owner-role-gate");
  const status=document.getElementById("owner-role-status");
  const panel=document.getElementById("owner-preview-panel");
  const meta=document.getElementById("owner-role-meta");
  const link=document.getElementById("owner-preview-real-link");
  const buttons=[...document.querySelectorAll("[data-preview-role]")];
  let snapshot=null;
  let selectedRole="carrier";
  const feedbackForm=document.getElementById("role-review-form");
  const feedbackStatus=document.getElementById("role-review-message");
  const feedbackList=document.getElementById("role-review-list");
  const reviewerAdmin=document.getElementById("role-reviewer-admin");
  const reviewerForm=document.getElementById("role-reviewer-access-form");
  const reviewerAccessStatus=document.getElementById("role-reviewer-access-message");
  const reviewerRoster=document.getElementById("role-reviewer-roster");
  const send=async(url,body)=>{
    const response=await fetch(url,{method:"POST",credentials:"same-origin",cache:"no-store",
      headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(body)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(result.error||"Request failed");
    return result;
  };
  async function loadFeedback(role){
    feedbackStatus.textContent="Loading feedback for "+role+"…";
    feedbackList.replaceChildren();
    try{
      const response=await fetch("/api/load-board/role-review?role="+encodeURIComponent(role),
        {credentials:"same-origin",cache:"no-store"});
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw Error(result.error||"Feedback unavailable");
      if(selectedRole!==role)return;
      feedbackStatus.textContent=result.feedback.length+" feedback note(s) for "+role+" · Saved internally only";
      if(!result.feedback.length){append(feedbackList,"p","No feedback for this view yet.","wsp-muted");return;}
      for(const item of result.feedback){
        const entry=document.createElement("article");entry.className="wsp-load";
        append(entry,"span",item.kind.toUpperCase()+" · "+new Date(item.createdAt).toLocaleString(),"wsp-chip");
        append(entry,"h3",item.accountEmail ? item.authorLabel+" · "+item.accountEmail : item.authorLabel);
        append(entry,"p",item.note,"wsp-muted");
        feedbackList.append(entry);
      }
    }catch(error){feedbackStatus.textContent=error instanceof Error?error.message:"Feedback unavailable";}
  }
  async function loadReviewers(){
    const response=await fetch("/api/load-board/reviewer-access",
      {credentials:"same-origin",cache:"no-store"});
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(result.error||"Reviewer roster unavailable");
    reviewerRoster.replaceChildren();
    if(!result.reviewers.length)append(reviewerRoster,"p","No additional reviewer accounts approved.","wsp-muted");
    for(const reviewer of result.reviewers){
      const card=document.createElement("article");card.className="wsp-load";
      append(card,"strong",reviewer.name+" · "+reviewer.email);
      append(card,"span",reviewer.status+" · "+(reviewer.mailboxOwnershipVerified?"mailbox checked":"unverified"),"wsp-chip");
      reviewerRoster.append(card);
    }
  }
  const text=(tag,value,cls)=>{
    const node=document.createElement(tag);
    node.textContent=String(value??"");
    if(cls)node.className=cls;
    return node;
  };
  const append=(target,tag,value,cls)=>{const node=text(tag,value,cls);target.append(node);return node;};
  const actions=(target,items)=>{
    const row=document.createElement("div");row.className="wsp-actions";
    for(const label of items){
      const button=text("button",label,"wsp-btn secondary");
      button.type="button";button.disabled=true;
      button.title="Illustration only: this preview never changes real records.";
      row.append(button);
    }
    target.append(row);
  };
  const example=(label,headline,details,buttonsList=[])=>{
    const card=document.createElement("article");card.className="wsp-load";
    append(card,"span",label+" · ILLUSTRATIVE / NOT LIVE","wsp-chip");
    append(card,"h3",headline);
    const caption=append(card,"p",details,"wsp-muted");
    caption.style.margin="0";
    if(buttonsList.length)actions(card,buttonsList);
    panel.append(card);
  };
  const specs={
    carrier:{
      heading:"Carrier workspace",lead:"Review permitted freight, filter routes, save opportunities and request dispatcher review. Carrier never directly receives private shipper or broker contacts.",
      href:"/services/hermes-connect/load-board/carrier/",
      scope:"Real use: separately approved carrier company, active freight source rights and verified assigned dispatcher.",
      rows:[
        ["Load opportunity","Sample: Chicago, IL → Dallas, TX","Car hauler · 2 vehicles · illustrative rate only",["Save for planning","Request through dispatcher"]],
        ["Dispatcher assignment","Assigned Hermes dispatcher appears after verification","Phone is shown only for the verified assignment and is never fabricated.",[]]
      ]
    },
    dispatcher:{
      heading:"Dispatcher workspace",lead:"Assigned-carrier request queue and manual processing. A stored request does not establish booking, availability or human receipt.",
      href:"/services/hermes-connect/load-board/dispatcher/",
      scope:"Real use: logged-in Hermes dispatcher with active carrier assignments.",
      rows:[
        ["Carrier request","Sample: Carrier requests Chicago → Dallas","Status: REQUESTED · no freight acceptance or outside contact",["Mark seen","Start review","Decline"]],
        ["Assigned carriers","Only carriers assigned to this dispatcher","Other dispatchers’ queues and company records remain unavailable.",[]]
      ]
    },
    dealer:{
      heading:"Dealer / Shipper workspace",lead:"A verified business can submit a permitted transport opportunity, review its own entries and withdraw an active post. Full Dealer CRM remains a separate existing workspace.",
      href:"/services/hermes-connect/load-board/partners/",
      scope:"Real use: dealer or shipper company membership and explicit rights attestation for each post.",
      rows:[
        ["New transport request","Sample: Dealer → customer vehicle shipment","Origin, destination, vehicle count, pickup window, equipment and budget",["Submit request (disabled)"]],
        ["Own submissions","Sample: 1 illustrative request · not a real record","Private VIN, phone and notes are not sent to the carrier feed.",["Withdraw (disabled)"]]
      ]
    },
    broker:{
      heading:"Broker view — design preview only",lead:"A dedicated self-service Broker Workspace is not yet implemented. Hermes distinguishes a broker's authorized freight posting from carrier-only load consumption.",
      href:"/load-board/",
      scope:"Current real capability: broker company posting permissions via existing Hermes market-post API; no broker access to restricted carrier inventory.",
      rows:[
        ["Posting permission","Proposed broker home screen","Post freight only with documented rights, ownership, and a Hermes account.",["Create permitted freight offer (disabled)"]],
        ["Restricted inventory","Carrier-only freight remains hidden","No private dealer, source, carrier or dispatcher contacts exposed to brokers.",[]]
      ]
    }
  };
  function choose(role){
    if(!snapshot)return;
    selectedRole=role;
    document.getElementById("role-review-selection").textContent=role;
    void loadFeedback(role);
    panel.replaceChildren();
    for(const button of buttons){
      const active=button.dataset.previewRole===role;
      button.setAttribute("aria-pressed",String(active));
      button.classList.toggle("secondary",!active);
    }
    if(role==="sources"){
      append(panel,"h2","External Load Board sources");
      append(panel,"p","This section reads current Hermes source-registry metadata, not accounts at third-party boards. A configured record is not proof of live integration, authorized API access, or available freight.","wsp-muted");
      meta.textContent="Owner only · source registry metadata · read-only";
      link.href="/load-board/";link.textContent="Open public Load Board";
      if(!snapshot.sources.length){
        append(panel,"p","No source entries were returned from the current Hermes registry.","wsp-status");
        return;
      }
      const summary=append(panel,"p",snapshot.sources.length+" source record(s) returned; up to 60 recent entries. Connection verification must be established separately.","wsp-status");
      summary.style.marginBottom="16px";
      for(const src of snapshot.sources){
        const card=document.createElement("article");card.className="wsp-load";
        append(card,"span",src.type+" · "+src.sourceStatus,"wsp-chip");
        append(card,"h3",src.label);
        append(card,"p","Provider: "+src.provider+" · Read: "+(src.readEnabled?"enabled":"disabled")+" · Ingest: "+(src.ingestEnabled?"enabled":"disabled"),"wsp-muted");
        append(card,"p","Redistribution rights: "+src.redistributionPermission+" · Last recorded successful sync: "+(src.lastSuccessfulSync||"not recorded"),"wsp-muted");
        append(card,"p","External connection status is NOT independently verified by this preview.","wsp-muted");
        panel.append(card);
      }
      return;
    }
    const view=specs[role];if(!view)return;
    append(panel,"h2",view.heading);
    append(panel,"p",view.lead,"wsp-muted");
    append(panel,"p","DEMONSTRATION ONLY — no real freight, contacts or operational changes.","wsp-status");
    const records=document.createElement("div");records.className="wsp-list";panel.append(records);
    const contentNode=panel;
    for(const [tag,heading,details,actionNames] of view.rows)example(tag,heading,details,actionNames);
    meta.textContent=view.scope;
    link.href=view.href;
    link.textContent=role==="broker"?"Open public freight discovery":"Open real "+view.heading;
  }
  buttons.forEach(button=>button.addEventListener("click",()=>choose(button.dataset.previewRole)));
  feedbackForm.addEventListener("submit",async(event)=>{
    event.preventDefault();const button=feedbackForm.querySelector('button[type="submit"]');
    button.disabled=true;
    const form=new FormData(feedbackForm);
    const role=selectedRole;
    try{
      await send("/api/load-board/role-review",{
        role,kind:form.get("kind"),authorLabel:form.get("authorLabel"),note:form.get("note")
      });
      feedbackForm.querySelector('textarea[name="note"]').value="";
      await loadFeedback(role);
      feedbackStatus.textContent="Saved to the internal review log. No external message sent.";
    }catch(error){feedbackStatus.textContent=error instanceof Error?error.message:"Could not save feedback";}
    finally{button.disabled=false;}
  });
  reviewerForm.addEventListener("submit",async(event)=>{
    event.preventDefault();const button=reviewerForm.querySelector('button[type="submit"]');
    button.disabled=true;
    const form=new FormData(reviewerForm);
    try{
      await send("/api/load-board/reviewer-access",{
        action:"grant",email:form.get("email"),
        mailboxOwnershipVerified:form.has("mailboxOwnershipVerified")
      });
      reviewerAccessStatus.textContent="Reviewer approved. Access is limited to role previews and feedback.";
      await loadReviewers();
    }catch(error){reviewerAccessStatus.textContent=error instanceof Error?error.message:"Reviewer grant failed";}
    finally{button.disabled=false;}
  });
  document.getElementById("role-reviewer-revoke").addEventListener("click",async()=>{
    const email=reviewerForm.querySelector('[name="email"]').value;
    if(!email)return reviewerAccessStatus.textContent="Enter the reviewer email first.";
    try{
      await send("/api/load-board/reviewer-access",{action:"revoke",email});
      reviewerAccessStatus.textContent="Reviewer access revoked.";await loadReviewers();
    }catch(error){reviewerAccessStatus.textContent=error instanceof Error?error.message:"Revocation failed";}
  });
  (async()=>{
    try{
      const response=await fetch("/api/load-board/owner-role-preview",{
        method:"GET",credentials:"same-origin",cache:"no-store",headers:{"Accept":"application/json"}
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok){
        status.textContent=response.status===401?"Sign in required to view owner role previews.":
          response.status===403?"Account signed in, but owner approval for Load Board review is still pending.":
          "Role preview is temporarily unavailable ("+response.status+").";
        status.classList.add("wsp-error");
        gate.hidden=false;
        if(response.status===403) {
          const loginLink=gate.querySelector('a[href*="mode=login"]');
          if(loginLink)loginLink.hidden=true;
        }
        return;
      }
      if(!["OWNER_READ_ONLY_ROLE_PREVIEW","REVIEWER_READ_ONLY_ROLE_PREVIEW"].includes(data.mode)||data.roleSwitchGrantsPermissions!==false){
        throw Error("Unexpected role-preview authorization response");
      }
      snapshot=data;
      status.textContent=(data.ownerAccess?"Owner":"Reviewer")+" preview authorized · "+
        (data.actor?.email||"Hermes account")+" · No external messages or bookings";
      root.hidden=false;
      document.getElementById("role-review-author").value=data.actor?.name||"";
      const sourceButton=buttons.find(button=>button.dataset.previewRole==="sources");
      if(sourceButton)sourceButton.hidden=!data.ownerAccess;
      const approvalLink=document.querySelector('a[href="/services/hermes-connect/load-board/operations/"]');
      if(approvalLink)approvalLink.hidden=!data.ownerAccess;
      reviewerAdmin.hidden=!data.ownerAccess;
      if(data.ownerAccess)void loadReviewers().catch(error=>{reviewerAccessStatus.textContent=error.message;});
      choose("carrier");
    }catch(error){
      status.classList.add("wsp-error");
      status.textContent="Could not verify owner preview: "+(error instanceof Error?error.message:"connection error");
      gate.hidden=false;
    }
  })();
})();